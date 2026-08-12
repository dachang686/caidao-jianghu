import { evaluateCondition } from '../conditions/evaluate'
import { addItem, InventoryError } from '../inventory/inventory'
import type { EventSubscription } from '../events/event-bus'
import type { EventBus } from '../events/event-bus'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { GatheringAdvanceResult, GatheringCatalog, GatheringCollectRequest, GatheringCollectResult, GatheringNodeDefinition, GatheringSnapshot } from '../../types/gathering'
import type { GatheringNodeId } from '../../types/ids'
import type { ItemDefinition, InventoryState } from '../../types/item'

export const BATTLE_COMPLETED_EVENT = 'battle.completed'

export interface GatheringValidationIssue {
  readonly code: 'duplicate_id' | 'missing_location' | 'missing_item' | 'invalid_value'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface GatheringValidationResult {
  readonly valid: boolean
  readonly issues: readonly GatheringValidationIssue[]
}

export class GatheringEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GatheringEngineError'
  }
}

const EMPTY_STATE: GatheringSnapshot = {
  version: 1,
  battleTick: 0,
  collectedNodeIds: [],
  lastCollectedAtTick: {},
  processedBattleEventIds: [],
  processedActionIds: [],
}

const EMPTY_CONDITION_CONTEXT: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: {} }

function isItemArray(items: GatheringCatalog['items']): items is readonly ItemDefinition[] {
  return Array.isArray(items)
}

function findItem(items: GatheringCatalog['items'], itemId: string): ItemDefinition | undefined {
  if (isItemArray(items)) return items.find((item) => String(item.id) === itemId)
  return (items as ReadonlyMap<string, ItemDefinition>).get(itemId)
}

function cloneState(state: GatheringSnapshot): GatheringSnapshot {
  return {
    version: 1,
    battleTick: state.battleTick,
    collectedNodeIds: [...state.collectedNodeIds],
    lastCollectedAtTick: { ...state.lastCollectedAtTick },
    processedBattleEventIds: [...state.processedBattleEventIds],
    processedActionIds: [...state.processedActionIds],
  }
}

function hasValidBattlePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false
  const value = payload as { battleId?: unknown; outcome?: unknown; result?: unknown; isRetry?: unknown; isSimulation?: unknown; mode?: unknown }
  if (typeof value.battleId !== 'string' || !value.battleId.trim()) return false
  if (value.isRetry === true || value.isSimulation === true || value.mode === 'retry' || value.mode === 'simulation' || value.mode === 'preview') return false
  const outcome = value.outcome ?? value.result
  return outcome === undefined || outcome === 'won' || outcome === 'win' || outcome === 'completed'
}

export function isEligibleGatheringBattleEvent(event: Pick<DomainEvent, 'type' | 'payload'>): boolean {
  return event.type === BATTLE_COMPLETED_EVENT && hasValidBattlePayload(event.payload)
}

function hasItemId(items: GatheringCatalog['items'], id: string): boolean {
  return findItem(items, id) !== undefined
}

function hasStringId(values: readonly string[] | ReadonlySet<string>, id: string): boolean {
  return typeof (values as ReadonlySet<string>).has === 'function'
    ? (values as ReadonlySet<string>).has(id)
    : (values as readonly string[]).includes(id)
}

export function validateGatheringDefinitions(
  definitions: readonly GatheringNodeDefinition[],
  options: { readonly locationIds?: readonly string[]; readonly chapterId?: string; readonly itemIds?: readonly string[] | ReadonlySet<string> } = {},
): GatheringValidationResult {
  const issues: GatheringValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, index) => {
    const path = `gathering[${index}]`
    if (seen.has(String(definition.id))) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复采集节点 ID「${definition.id}」`, id: String(definition.id) })
    seen.add(String(definition.id))
    if (options.chapterId && String(definition.chapterId) !== options.chapterId) issues.push({ code: 'invalid_value', path: `${path}.chapterId`, message: '采集节点章节与内容章节不匹配', id: String(definition.id) })
    if (options.locationIds && !options.locationIds.includes(String(definition.locationId))) issues.push({ code: 'missing_location', path: `${path}.locationId`, message: `找不到采集地点「${definition.locationId}」`, id: String(definition.locationId) })
    if (!definition.label.trim() || !definition.description.trim()) issues.push({ code: 'invalid_value', path: `${path}.label`, message: '采集节点名称和说明不能为空', id: String(definition.id) })
    if (!Number.isInteger(definition.requiredChapter) || definition.requiredChapter < 1) issues.push({ code: 'invalid_value', path: `${path}.requiredChapter`, message: '开放章节必须是正整数', id: String(definition.id) })
    if (definition.availableFromBattleTick !== undefined && (!Number.isInteger(definition.availableFromBattleTick) || definition.availableFromBattleTick < 0)) issues.push({ code: 'invalid_value', path: `${path}.availableFromBattleTick`, message: '开放战斗场次必须是非负整数', id: String(definition.id) })
    if (definition.mode === 'repeat' && (!Number.isInteger(definition.refreshEveryBattleTicks) || (definition.refreshEveryBattleTicks ?? 0) < 1)) issues.push({ code: 'invalid_value', path: `${path}.refreshEveryBattleTicks`, message: '可重复节点必须配置正整数战斗场次刷新间隔', id: String(definition.id) })
    if (definition.mode === 'once' && definition.refreshEveryBattleTicks !== undefined) issues.push({ code: 'invalid_value', path: `${path}.refreshEveryBattleTicks`, message: '一次性节点不能配置刷新间隔', id: String(definition.id) })
    if (definition.rewards.length === 0) issues.push({ code: 'invalid_value', path: `${path}.rewards`, message: '采集节点至少要有一项材料奖励', id: String(definition.id) })
    definition.rewards.forEach((reward, rewardIndex) => {
      if (!Number.isInteger(reward.count) || reward.count <= 0) issues.push({ code: 'invalid_value', path: `${path}.rewards[${rewardIndex}].count`, message: '材料数量必须是正整数', id: String(definition.id) })
      if (options.itemIds) {
        const known = hasStringId(options.itemIds, String(reward.itemId))
        if (!known) issues.push({ code: 'missing_item', path: `${path}.rewards[${rewardIndex}].itemId`, message: `找不到材料「${reward.itemId}」`, id: String(reward.itemId) })
      }
    })
  })
  return { valid: issues.length === 0, issues }
}

function result(
  status: GatheringCollectResult['status'],
  nodeId: GatheringNodeId,
  inventory: InventoryState,
  state: GatheringSnapshot,
  message: string,
  extras: Partial<Pick<GatheringCollectResult, 'rewards' | 'events' | 'actionId'>> = {},
): GatheringCollectResult {
  return { status, nodeId, inventory, state, rewards: [], events: [], message, ...extras }
}

export class GatheringEngine {
  private readonly nodes: ReadonlyMap<GatheringNodeId, GatheringNodeDefinition>
  private readonly catalog: GatheringCatalog
  private readonly eventBus?: EventBus
  private state: GatheringSnapshot

  constructor(
    definitions: readonly GatheringNodeDefinition[],
    catalog: GatheringCatalog,
    initialState: GatheringSnapshot = EMPTY_STATE,
    eventBus?: EventBus,
  ) {
    const itemIds: readonly string[] | ReadonlySet<string> = isItemArray(catalog.items)
      ? catalog.items.map((item) => String(item.id))
      : new Set<string>((catalog.items as ReadonlyMap<string, ItemDefinition>).keys())
    const validation = validateGatheringDefinitions(definitions, { itemIds })
    if (!validation.valid) throw new GatheringEngineError(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
    if (initialState.version !== 1 || !Number.isInteger(initialState.battleTick) || initialState.battleTick < 0) throw new GatheringEngineError('采集快照无效。')
    this.nodes = new Map(definitions.map((definition) => [definition.id, definition]))
    this.catalog = catalog
    this.state = cloneState(initialState)
    this.eventBus = eventBus
  }

  getState(): GatheringSnapshot {
    return cloneState(this.state)
  }

  snapshot(): GatheringSnapshot {
    return this.getState()
  }

  advance(event: DomainEvent): GatheringAdvanceResult {
    if (!isEligibleGatheringBattleEvent(event)) return { status: 'ignored_event', state: this.getState(), message: '该事件不是可计入采集刷新场次的有效战斗完成。' }
    if (this.state.processedBattleEventIds.includes(event.id)) return { status: 'duplicate_event', state: this.getState(), message: '该战斗完成事件已经推进过采集场次。' }
    this.state = { ...this.state, battleTick: this.state.battleTick + 1, processedBattleEventIds: [...this.state.processedBattleEventIds, event.id] }
    return { status: 'advanced', state: this.getState(), message: '有效战斗完成，采集刷新场次 +1。' }
  }

  subscribe(eventBus: EventBus = this.eventBus!): EventSubscription {
    if (!eventBus) throw new GatheringEngineError('订阅采集事件需要 EventBus。')
    return eventBus.subscribe(BATTLE_COMPLETED_EVENT, (event) => { this.advance(event) })
  }

  collect(request: GatheringCollectRequest): GatheringCollectResult {
    const node = this.nodes.get(request.nodeId)
    if (!node) throw new GatheringEngineError(`未知采集节点「${request.nodeId}」`)
    const count = this.state.lastCollectedAtTick[String(node.id)] === undefined ? 0 : 1
    const actionId = request.actionId ?? `gather:${node.id}:${this.state.battleTick}:${count + this.state.collectedNodeIds.length + 1}`
    if (this.state.processedActionIds.includes(actionId)) return result('duplicate_action', node.id, request.inventory, this.getState(), '这次采集操作已经处理过。', { actionId })
    if (String(request.locationId) !== String(node.locationId)) return result('wrong_location', node.id, request.inventory, this.getState(), `请先到达「${node.locationId}」再采集。`, { actionId })
    if (!Number.isInteger(request.chapter) || request.chapter < node.requiredChapter) return result('chapter_locked', node.id, request.inventory, this.getState(), `第 ${node.requiredChapter} 章后才能采集这里。`, { actionId })
    if (node.availableFromBattleTick !== undefined && this.state.battleTick < node.availableFromBattleTick) return result('chapter_locked', node.id, request.inventory, this.getState(), `还需推进到第 ${node.availableFromBattleTick} 场有效战斗。`, { actionId })
    if (node.condition) {
      let met = false
      try { met = evaluateCondition(node.condition, request.conditionContext ?? EMPTY_CONDITION_CONTEXT) } catch { met = false }
      if (!met) return result('condition_locked', node.id, request.inventory, this.getState(), '当前条件尚未满足，暂时不能采集。', { actionId })
    }
    if (node.mode === 'once' && this.state.collectedNodeIds.includes(node.id)) return result('already_collected', node.id, request.inventory, this.getState(), '这处采集点已经采过了。', { actionId })
    const lastTick = this.state.lastCollectedAtTick[String(node.id)]
    if (node.mode === 'repeat' && lastTick !== undefined && this.state.battleTick - lastTick < (node.refreshEveryBattleTicks ?? 1)) {
      return result('refresh_pending', node.id, request.inventory, this.getState(), `还需 ${((node.refreshEveryBattleTicks ?? 1) - (this.state.battleTick - lastTick))} 场有效战斗后刷新。`, { actionId })
    }
    let inventory = request.inventory
    try {
      node.rewards.forEach((reward) => {
        const item = findItem(this.catalog.items, String(reward.itemId))
        if (!item) throw new GatheringEngineError(`采集节点引用未知材料「${reward.itemId}」`)
        inventory = addItem(inventory, item, reward.count)
      })
    } catch (error) {
      if (error instanceof InventoryError) return result('inventory_full', node.id, request.inventory, this.getState(), '背包空间不足，材料未领取；清理背包后可重新采集。', { actionId })
      throw error
    }
    const completedIds = node.mode === 'once' ? [...this.state.collectedNodeIds, node.id] : [...this.state.collectedNodeIds]
    this.state = {
      ...this.state,
      collectedNodeIds: completedIds,
      lastCollectedAtTick: { ...this.state.lastCollectedAtTick, [String(node.id)]: this.state.battleTick },
      processedActionIds: [...this.state.processedActionIds, actionId],
    }
    const event: DomainEvent = {
      id: `${actionId}:collected`,
      type: 'gathering.node_collected',
      occurredAtTick: this.state.battleTick,
      payload: { nodeId: node.id, locationId: node.locationId, rewards: node.rewards },
      sourceActionId: actionId,
    }
    this.eventBus?.dispatch(event)
    return result('collected', node.id, inventory, this.getState(), '采集成功，材料已放入背包。', { actionId, rewards: node.rewards, events: [event] })
  }
}

export function createGatheringEngine(definitions: readonly GatheringNodeDefinition[], catalog: GatheringCatalog, initialState?: GatheringSnapshot, eventBus?: EventBus): GatheringEngine {
  return new GatheringEngine(definitions, catalog, initialState, eventBus)
}

export function restoreGatheringSnapshot(definitions: readonly GatheringNodeDefinition[], catalog: GatheringCatalog, snapshot: GatheringSnapshot, eventBus?: EventBus): GatheringEngine {
  return createGatheringEngine(definitions, catalog, snapshot, eventBus)
}
