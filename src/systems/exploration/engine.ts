import { evaluateCondition } from '../conditions/evaluate'
import { executeEffects } from '../effects/execute'
import type { EventBus } from '../events/event-bus'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { EffectCatalog, EffectState } from '../../types/effects'
import { createEffectState } from '../../types/effects'
import type {
  ExplorationSnapshot,
  HotspotActivationResult,
  HotspotDefinition,
  HotspotState,
  HotspotView,
} from '../../types/hotspot'
import type { HotspotId } from '../../types/ids'

export interface HotspotValidationIssue {
  readonly code: 'duplicate_id' | 'missing_location' | 'invalid_value'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface HotspotValidationResult {
  readonly valid: boolean
  readonly issues: readonly HotspotValidationIssue[]
}

export interface ExplorationEngineOptions {
  readonly definitions: readonly HotspotDefinition[]
  readonly conditionContext?: ConditionContext
  readonly effectState?: EffectState
  readonly state?: HotspotState | ExplorationSnapshot
  readonly catalog?: EffectCatalog
  readonly eventBus?: EventBus
}

export interface HotspotActivationOptions {
  /** 重放或网络桥接场景可提供稳定 actionId；普通按钮调用留空即可。 */
  readonly actionId?: string
  readonly occurredAtTick?: number
  readonly conditionContext?: ConditionContext
}

const EMPTY_CONDITION_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

const EMPTY_HOTSPOT_STATE: HotspotState = {
  completedIds: [],
  activationCounts: {},
  processedActionIds: [],
}

function isSnapshot(value: HotspotState | ExplorationSnapshot): value is ExplorationSnapshot {
  return 'version' in value && 'hotspots' in value && 'effects' in value
}

function validNumber(value: number): boolean {
  return Number.isFinite(value)
}

function validatePlacement(value: { readonly x: number; readonly y: number }, path: string, issues: HotspotValidationIssue[]): void {
  if (!validNumber(value.x) || value.x < 0 || value.x > 1) {
    issues.push({ code: 'invalid_value', path: `${path}.x`, message: '热点横坐标必须是 0 到 1 之间的数字' })
  }
  if (!validNumber(value.y) || value.y < 0 || value.y > 1) {
    issues.push({ code: 'invalid_value', path: `${path}.y`, message: '热点纵坐标必须是 0 到 1 之间的数字' })
  }
}

export function validateHotspotDefinitions(
  definitions: readonly HotspotDefinition[],
  locationIds: readonly string[] = [],
): HotspotValidationResult {
  const issues: HotspotValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, index) => {
    const path = `hotspots[${index}]`
    if (seen.has(definition.id)) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复热点 ID「${definition.id}」`, id: definition.id })
    seen.add(definition.id)
    if (!definition.label.trim()) issues.push({ code: 'invalid_value', path: `${path}.label`, message: '热点名称不能为空', id: definition.id })
    if (!definition.description.trim()) issues.push({ code: 'invalid_value', path: `${path}.description`, message: '热点说明不能为空', id: definition.id })
    if (!Number.isInteger(definition.keyboardOrder) || definition.keyboardOrder < 0) {
      issues.push({ code: 'invalid_value', path: `${path}.keyboardOrder`, message: '键盘顺序必须是大于等于 0 的整数', id: definition.id })
    }
    if (locationIds.length > 0 && !locationIds.includes(definition.locationId)) {
      issues.push({ code: 'missing_location', path: `${path}.locationId`, message: `找不到热点所属地点「${definition.locationId}」`, id: definition.locationId })
    }
    if (!definition.layout || !definition.layout.desktop) {
      issues.push({ code: 'invalid_value', path: `${path}.layout.desktop`, message: '热点必须配置桌面布局', id: definition.id })
    } else {
      validatePlacement(definition.layout.desktop, `${path}.layout.desktop`, issues)
      if (definition.layout.mobile) validatePlacement(definition.layout.mobile, `${path}.layout.mobile`, issues)
    }
    if (!Array.isArray(definition.effects)) issues.push({ code: 'invalid_value', path: `${path}.effects`, message: '热点 Effect 必须是数组', id: definition.id })
    if (definition.mode !== 'once' && definition.mode !== 'repeat') {
      issues.push({ code: 'invalid_value', path: `${path}.mode`, message: '热点动作模式必须是 once 或 repeat', id: definition.id })
    }
  })
  return { valid: issues.length === 0, issues }
}

export class ExplorationEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExplorationEngineError'
  }
}

function cloneHotspotState(state: HotspotState): HotspotState {
  return {
    completedIds: [...state.completedIds],
    activationCounts: { ...state.activationCounts },
    processedActionIds: [...state.processedActionIds],
  }
}

function normalizeState(state: HotspotState | ExplorationSnapshot | undefined): { hotspots: HotspotState; effects: EffectState } {
  if (!state) return { hotspots: cloneHotspotState(EMPTY_HOTSPOT_STATE), effects: createEffectState() }
  if (isSnapshot(state)) {
    if (state.version !== 1) throw new ExplorationEngineError(`不支持的探索存档版本「${String(state.version)}」`)
    return { hotspots: cloneHotspotState(state.hotspots), effects: { ...state.effects, claimedGrantKeys: [...state.effects.claimedGrantKeys] } }
  }
  return { hotspots: cloneHotspotState(state), effects: createEffectState() }
}

function activationEvent(definition: HotspotDefinition, actionId: string, occurredAtTick: number): DomainEvent {
  return {
    id: `${actionId}:activated`,
    type: 'exploration.hotspot_activated',
    occurredAtTick,
    payload: { hotspotId: definition.id, locationId: definition.locationId, mode: definition.mode },
    sourceActionId: actionId,
  }
}

export class ExplorationEngine {
  private readonly definitions: ReadonlyMap<HotspotId, HotspotDefinition>
  private readonly catalog?: EffectCatalog
  private readonly eventBus?: EventBus
  private conditionContext: ConditionContext
  private hotspotState: HotspotState
  private effectState: EffectState

  constructor(options: ExplorationEngineOptions) {
    const validation = validateHotspotDefinitions(options.definitions)
    if (!validation.valid) throw new ExplorationEngineError(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
    this.definitions = new Map(options.definitions.map((definition) => [definition.id, definition]))
    const state = normalizeState(options.state)
    this.hotspotState = state.hotspots
    this.effectState = options.effectState ?? state.effects
    this.conditionContext = options.conditionContext ?? EMPTY_CONDITION_CONTEXT
    this.catalog = options.catalog
    this.eventBus = options.eventBus
  }

  setConditionContext(context: ConditionContext): void {
    this.conditionContext = context
  }

  getEffectState(): EffectState {
    return {
      ...this.effectState,
      inventory: { ...this.effectState.inventory },
      stats: { ...this.effectState.stats },
      flags: { ...this.effectState.flags },
      quests: { ...this.effectState.quests },
      claimedGrantKeys: [...this.effectState.claimedGrantKeys],
    }
  }

  getState(): HotspotState {
    return cloneHotspotState(this.hotspotState)
  }

  getSnapshot(): ExplorationSnapshot {
    return { version: 1, hotspots: this.getState(), effects: this.getEffectState() }
  }

  getView(hotspotId: HotspotId, conditionContext: ConditionContext = this.conditionContext): HotspotView {
    const definition = this.definitions.get(hotspotId)
    if (!definition) throw new ExplorationEngineError(`未知热点「${hotspotId}」`)
    const completed = this.hotspotState.completedIds.includes(hotspotId)
    const activationCount = this.hotspotState.activationCounts[String(hotspotId)] ?? 0
    let available = !completed || definition.mode === 'repeat'
    if (available && definition.conditions) {
      try {
        available = definition.conditions.every((condition) => evaluateCondition(condition, conditionContext))
      } catch {
        available = false
      }
    }
    return {
      definition,
      available,
      completed,
      activationCount,
      ...(!available ? { lockedReason: completed ? '这个热点已经处理过了。' : definition.lockedReason ?? '当前条件尚未满足。' } : {}),
    }
  }

  listViews(locationId?: string, conditionContext: ConditionContext = this.conditionContext): readonly HotspotView[] {
    return [...this.definitions.values()]
      .filter((definition) => locationId === undefined || definition.locationId === locationId)
      .sort((left, right) => left.keyboardOrder - right.keyboardOrder)
      .map((definition) => this.getView(definition.id, conditionContext))
  }

  activate(hotspotId: HotspotId, options: HotspotActivationOptions = {}): HotspotActivationResult {
    const definition = this.definitions.get(hotspotId)
    if (!definition) throw new ExplorationEngineError(`未知热点「${hotspotId}」`)
    const view = this.getView(hotspotId, options.conditionContext ?? this.conditionContext)
    const count = this.hotspotState.activationCounts[String(hotspotId)] ?? 0
    const actionId = options.actionId ?? `hotspot:${hotspotId}:${count + 1}`
    if (this.hotspotState.processedActionIds.includes(actionId)) {
      return { status: 'duplicate_action', view, state: this.getState(), actionId, effects: [], events: [] }
    }
    if (!view.available) {
      return { status: view.completed ? 'already_completed' : 'locked', view, state: this.getState(), effects: [], events: [] }
    }
    const occurredAtTick = options.occurredAtTick ?? 0
    if (!Number.isInteger(occurredAtTick) || occurredAtTick < 0) throw new ExplorationEngineError('occurredAtTick 必须是大于等于 0 的整数')
    const execution = executeEffects(definition.effects, this.effectState, {
      sourceActionId: actionId,
      occurredAtTick,
      catalog: this.catalog,
    })
    this.effectState = execution.state
    const nextCompleted = definition.mode === 'once' ? [...this.hotspotState.completedIds, hotspotId] : [...this.hotspotState.completedIds]
    this.hotspotState = {
      completedIds: nextCompleted,
      activationCounts: { ...this.hotspotState.activationCounts, [String(hotspotId)]: count + 1 },
      processedActionIds: [...this.hotspotState.processedActionIds, actionId],
    }
    const events = [activationEvent(definition, actionId, occurredAtTick), ...execution.events]
    events.forEach((event) => this.eventBus?.dispatch(event))
    return { status: 'activated', view: this.getView(hotspotId, options.conditionContext ?? this.conditionContext), state: this.getState(), actionId, effects: definition.effects, events }
  }
}

export const HotspotEngine = ExplorationEngine

export function createExplorationEngine(options: ExplorationEngineOptions): ExplorationEngine {
  return new ExplorationEngine(options)
}

export const createHotspotEngine = createExplorationEngine
