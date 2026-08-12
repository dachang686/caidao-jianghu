import type { Effect } from '../../types/effects'
import type { DomainEvent } from '../../types/events'
import type {
  InteractionChainDefinition,
  InteractionChainOutcome,
  InteractionChainSnapshot,
  InteractionChainStage,
  InteractionChainStatus,
  InteractionChainTriggerContext,
  InteractionChainValidationIssue,
  InteractionChainValidationResult,
} from '../../types/comedy'

const EMPTY_SNAPSHOT: InteractionChainSnapshot = {
  version: 1,
  progress: {},
  claimedStageKeys: [],
  processedEventIds: [],
  processedActionIds: [],
}

const ALLOWED_EFFECT_TYPES = new Set(['give_item', 'give_exp', 'set_flag', 'unlock_quest', 'change_stat', 'trigger_battle', 'narrate'])

export class InteractionChainEngineError extends Error {
  readonly issues?: readonly InteractionChainValidationIssue[]

  constructor(message: string, issues?: readonly InteractionChainValidationIssue[]) {
    super(message)
    this.name = 'InteractionChainEngineError'
    this.issues = issues
  }
}

export class InteractionChainSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InteractionChainSnapshotError'
  }
}

function makeIssue(
  code: InteractionChainValidationIssue['code'],
  path: string,
  message: string,
  id?: string,
): InteractionChainValidationIssue {
  return { code, path, message, ...(id ? { id } : {}) }
}

function requireText(value: unknown, path: string, issues: InteractionChainValidationIssue[], id?: string): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(makeIssue('invalid_value', path, '值不能为空', id))
}

function validateEffect(effect: Effect, path: string, issues: InteractionChainValidationIssue[], id: string): void {
  const value = effect as unknown as Record<string, unknown>
  if (typeof value.type !== 'string' || !ALLOWED_EFFECT_TYPES.has(value.type)) {
    issues.push(makeIssue('invalid_value', `${path}.type`, `不支持的 Effect 类型「${String(value.type)}」`, id))
    return
  }
  if (value.type === 'give_item' || value.type === 'unlock_quest' || value.type === 'trigger_battle' || value.type === 'narrate') {
    const field = value.type === 'give_item' ? 'itemId' : value.type === 'unlock_quest' ? 'questId' : value.type === 'trigger_battle' ? 'enemyId' : 'lineId'
    requireText(value[field], `${path}.${field}`, issues, id)
  }
  if (value.type === 'give_item' && value.count !== undefined && (!Number.isInteger(value.count) || Number(value.count) <= 0)) {
    issues.push(makeIssue('invalid_value', `${path}.count`, '物品数量必须是正整数', id))
  }
  if (value.type === 'give_exp' && (typeof value.amount !== 'number' || !Number.isFinite(value.amount) || value.amount < 0)) {
    issues.push(makeIssue('invalid_value', `${path}.amount`, '经验必须是非负有限数字', id))
  }
  if (value.type === 'change_stat' && (typeof value.delta !== 'number' || !Number.isFinite(value.delta))) {
    issues.push(makeIssue('invalid_value', `${path}.delta`, '属性变化必须是有限数字', id))
  }
  if (value.grantKey !== undefined) requireText(value.grantKey, `${path}.grantKey`, issues, id)
}

export function validateInteractionChainDefinitions(definitions: readonly InteractionChainDefinition[]): InteractionChainValidationResult {
  const issues: InteractionChainValidationIssue[] = []
  const seenIds = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    const path = `chains[${definitionIndex}]`
    if (seenIds.has(definition.id)) issues.push(makeIssue('duplicate_id', `${path}.id`, `重复互动链 ID「${definition.id}」`, definition.id))
    seenIds.add(definition.id)
    requireText(definition.id, `${path}.id`, issues, definition.id)
    requireText(definition.triggerEvent, `${path}.triggerEvent`, issues, definition.id)
    requireText(definition.stableRepeatCueId, `${path}.stableRepeatCueId`, issues, definition.id)
    if (definition.progressActionId !== undefined) requireText(definition.progressActionId, `${path}.progressActionId`, issues, definition.id)
    if (!Array.isArray(definition.stages) || definition.stages.length < 3 || definition.stages.length > 5) {
      issues.push(makeIssue('stage_count', `${path}.stages`, '互动链必须配置 3–5 级阶段', definition.id))
      return
    }
    let previousThreshold = 0
    definition.stages.forEach((stage: InteractionChainStage, stageIndex) => {
      const stagePath = `${path}.stages[${stageIndex}]`
      if (!Number.isInteger(stage.threshold) || stage.threshold < 1) issues.push(makeIssue('invalid_value', `${stagePath}.threshold`, '阶段阈值必须是正整数', definition.id))
      if (stage.threshold <= previousThreshold) issues.push(makeIssue('threshold_order', `${stagePath}.threshold`, '阶段阈值必须严格递增', definition.id))
      previousThreshold = stage.threshold
      requireText(stage.cueId, `${stagePath}.cueId`, issues, definition.id)
      if (!Array.isArray(stage.effects)) issues.push(makeIssue('invalid_value', `${stagePath}.effects`, '阶段 Effect 必须是数组', definition.id))
      else stage.effects.forEach((effect, effectIndex) => validateEffect(effect, `${stagePath}.effects[${effectIndex}]`, issues, definition.id))
    })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidInteractionChainDefinitions(definitions: readonly InteractionChainDefinition[]): void {
  const result = validateInteractionChainDefinitions(definitions)
  if (!result.valid) throw new InteractionChainEngineError(`互动链定义校验失败：${result.issues.map((item) => item.message).join('；')}`, result.issues)
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function cloneSnapshot(snapshot: InteractionChainSnapshot): InteractionChainSnapshot {
  return {
    version: 1,
    progress: { ...snapshot.progress },
    claimedStageKeys: [...snapshot.claimedStageKeys],
    processedEventIds: [...snapshot.processedEventIds],
    processedActionIds: [...snapshot.processedActionIds],
  }
}

function normalizeSnapshot(snapshot?: Partial<InteractionChainSnapshot>): InteractionChainSnapshot {
  if (snapshot?.version !== undefined && snapshot.version !== 1) throw new InteractionChainSnapshotError(`不支持的互动链存档版本「${String(snapshot.version)}」`)
  const progress = { ...(snapshot?.progress ?? {}) }
  Object.entries(progress).forEach(([id, value]) => {
    if (!Number.isInteger(value) || value < 0) throw new InteractionChainSnapshotError(`互动链「${id}」计数无效。`)
  })
  return {
    version: 1,
    progress,
    claimedStageKeys: unique(snapshot?.claimedStageKeys ?? []),
    processedEventIds: unique(snapshot?.processedEventIds ?? []),
    processedActionIds: unique(snapshot?.processedActionIds ?? []),
  }
}

function payloadChainId(event: DomainEvent): string | undefined {
  if (!event.payload || typeof event.payload !== 'object') return undefined
  const value = event.payload as Record<string, unknown>
  const chainId = value.interactionChainId ?? value.chainId
  return typeof chainId === 'string' && chainId.trim() ? chainId : undefined
}

function stageForProgress(stages: readonly InteractionChainStage[], progress: number): number {
  let index = -1
  stages.forEach((stage, stageIndex) => {
    if (progress >= stage.threshold) index = stageIndex
  })
  return index
}

function appendUnique(values: readonly string[], value: string): string[] {
  return values.includes(value) ? [...values] : [...values, value]
}

function outcome(
  status: InteractionChainStatus,
  chainId: string | null,
  progress: number,
  state: InteractionChainSnapshot,
  message: string,
  options: Partial<Pick<InteractionChainOutcome, 'stageIndex' | 'cueId' | 'repeat' | 'progressActionId' | 'progressPreserved' | 'effectRequests'>> = {},
): InteractionChainOutcome {
  return {
    status,
    chainId,
    progress,
    effectRequests: [],
    repeat: false,
    progressPreserved: false,
    ...options,
    state: cloneSnapshot(state),
    message,
  }
}

export class InteractionChainEngine {
  private readonly definitions: readonly InteractionChainDefinition[]
  private readonly definitionsById: ReadonlyMap<string, InteractionChainDefinition>
  private state: InteractionChainSnapshot

  constructor(definitions: readonly InteractionChainDefinition[], snapshot?: Partial<InteractionChainSnapshot>) {
    assertValidInteractionChainDefinitions(definitions)
    this.definitions = definitions.map((definition) => ({ ...definition, stages: definition.stages.map((stage) => ({ ...stage, effects: [...stage.effects] })) }))
    this.definitionsById = new Map(this.definitions.map((definition) => [definition.id, definition]))
    this.state = normalizeSnapshot(snapshot)
  }

  getState(): InteractionChainSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): InteractionChainSnapshot {
    return this.getState()
  }

  trigger(event: DomainEvent, context: InteractionChainTriggerContext = {}): InteractionChainOutcome {
    if (!event.id.trim() || !event.type.trim()) throw new InteractionChainEngineError('互动事件 ID 和类型不能为空。')
    const actionId = context.actionId ?? event.sourceActionId
    if (!actionId || !actionId.trim()) throw new InteractionChainEngineError('互动动作 ID 不能为空。')
    const occurredAtTick = context.occurredAtTick ?? event.occurredAtTick
    if (!Number.isInteger(occurredAtTick) || occurredAtTick < 0) throw new InteractionChainEngineError('互动事件 tick 必须是非负整数。')
    const selectedId = payloadChainId(event)
    const definition = selectedId
      ? this.definitionsById.get(selectedId)
      : this.definitions.find((candidate) => candidate.triggerEvent === event.type)
    if (definition && definition.triggerEvent !== event.type) throw new InteractionChainEngineError(`互动链「${definition.id}」与事件类型不匹配。`)
    const progress = definition ? this.state.progress[definition.id] ?? 0 : 0
    const commonOptions = definition
      ? { progressActionId: definition.progressActionId, progressPreserved: Boolean(definition.progressActionId) }
      : {}
    if (this.state.processedEventIds.includes(event.id)) return outcome('duplicate_event', definition?.id ?? null, progress, this.state, '该互动事件已经处理过。', commonOptions)
    if (this.state.processedActionIds.includes(actionId)) return outcome('duplicate_action', definition?.id ?? null, progress, this.state, '该互动动作已经处理过，快速重复输入不会越级。', commonOptions)

    const nextState: InteractionChainSnapshot = {
      ...this.state,
      processedEventIds: appendUnique(this.state.processedEventIds, event.id),
      processedActionIds: appendUnique(this.state.processedActionIds, actionId),
    }
    if (!definition) {
      this.state = nextState
      return outcome('none', null, 0, this.state, '没有匹配的互动链。')
    }

    const nextProgress = progress + 1
    const stageIndex = stageForProgress(definition.stages, nextProgress)
    const nextProgressMap = { ...nextState.progress, [definition.id]: nextProgress }
    if (stageIndex < 0) {
      this.state = { ...nextState, progress: nextProgressMap }
      return outcome('progressed', definition.id, nextProgress, this.state, '互动链已记录，等待下一阶段。', commonOptions)
    }
    if (nextProgress > definition.stages[definition.stages.length - 1].threshold) {
      this.state = { ...nextState, progress: nextProgressMap }
      return outcome('stable_repeat', definition.id, nextProgress, this.state, '互动链已达到稳定重复阶段。', { ...commonOptions, stageIndex, cueId: definition.stableRepeatCueId, repeat: true })
    }

    const stage = definition.stages[stageIndex]
    const stageKey = `${definition.id}:${stageIndex}`
    const alreadyClaimed = this.state.claimedStageKeys.includes(stageKey)
    const claimedStageKeys = alreadyClaimed ? [...this.state.claimedStageKeys] : appendUnique(this.state.claimedStageKeys, stageKey)
    this.state = { ...nextState, progress: nextProgressMap, claimedStageKeys }
    return outcome(
      alreadyClaimed ? 'progressed' : 'triggered',
      definition.id,
      nextProgress,
      this.state,
      alreadyClaimed ? '互动阶段重复触发，仅保留反馈。' : '互动链进入新阶段。',
      {
        ...commonOptions,
        stageIndex,
        cueId: stage.cueId,
        repeat: alreadyClaimed,
        effectRequests: alreadyClaimed ? [] : [...stage.effects],
      },
    )
  }

  select(event: DomainEvent, context: InteractionChainTriggerContext = {}): InteractionChainOutcome {
    return this.trigger(event, context)
  }
}

export function createInteractionChainEngine(definitions: readonly InteractionChainDefinition[], snapshot?: Partial<InteractionChainSnapshot>): InteractionChainEngine {
  return new InteractionChainEngine(definitions, snapshot)
}

export function triggerInteractionChain(engine: InteractionChainEngine, event: DomainEvent, context: InteractionChainTriggerContext = {}): InteractionChainOutcome {
  return engine.trigger(event, context)
}

export function serializeInteractionChainSnapshot(snapshot: InteractionChainSnapshot): string {
  try {
    const text = JSON.stringify(snapshot)
    if (text === undefined) throw new InteractionChainSnapshotError('互动链快照无法序列化。')
    return text
  } catch (error) {
    if (error instanceof InteractionChainSnapshotError) throw error
    throw new InteractionChainSnapshotError(`互动链快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseInteractionChainSnapshot(input: string): InteractionChainSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new InteractionChainSnapshotError('互动链快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new InteractionChainSnapshotError('互动链快照必须是对象。')
  const value = parsed as Partial<InteractionChainSnapshot>
  if (value.version !== 1 || !value.progress || typeof value.progress !== 'object' || !Array.isArray(value.claimedStageKeys) || !Array.isArray(value.processedEventIds) || !Array.isArray(value.processedActionIds)) {
    throw new InteractionChainSnapshotError('互动链快照缺少必要字段。')
  }
  return normalizeSnapshot(value)
}

export function restoreInteractionChainSnapshot(definitions: readonly InteractionChainDefinition[], snapshot: InteractionChainSnapshot): InteractionChainEngine {
  return createInteractionChainEngine(definitions, snapshot)
}

export const InteractionChainEngineSnapshotError = InteractionChainSnapshotError
