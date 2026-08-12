import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { Effect } from '../../types/effects'
import { createEffectState } from '../../types/effects'
import type {
  QuestActionOutcome,
  QuestDefinition,
  QuestDeliveryOutcome,
  QuestEngineDeliveryOptions,
  QuestEngineOptions,
  QuestEngineState,
  QuestEventOutcome,
  QuestObjective,
  QuestSnapshot,
  QuestTaskState,
  QuestValidationIssue,
  QuestValidationResult,
} from '../../types/quest'
import { evaluateCondition } from '../conditions/evaluate'
import { executeEffects } from '../effects/execute'
import { EventBus } from '../events/event-bus'

const MAX_SIDE_ACTIVE = 6
const MAX_COMMISSION_ACTIVE = 3
const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

export class QuestEngineError extends Error {
  readonly issues?: readonly QuestValidationIssue[]

  constructor(message: string, issues?: readonly QuestValidationIssue[]) {
    super(message)
    this.name = 'QuestEngineError'
    this.issues = issues
  }
}

export class QuestSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuestSnapshotError'
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0
}

export function validateQuestDefinitions(definitions: readonly QuestDefinition[]): QuestValidationResult {
  const issues: QuestValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    if (seen.has(definition.id)) {
      issues.push({ code: 'duplicate_id', path: `quests[${definitionIndex}].id`, message: `重复任务 ID「${definition.id}」`, id: definition.id })
    }
    seen.add(definition.id)
    if (!definition.title.trim()) issues.push({ code: 'invalid_value', path: `quests[${definitionIndex}].title`, message: '任务标题不能为空', id: definition.id })
    if (!definition.objective.trim()) issues.push({ code: 'invalid_value', path: `quests[${definitionIndex}].objective`, message: '任务目标说明不能为空', id: definition.id })
    const objectiveIds = new Set<string>()
    definition.objectives?.forEach((objective, objectiveIndex) => {
      if (objectiveIds.has(objective.id)) {
        issues.push({ code: 'duplicate_objective_id', path: `quests[${definitionIndex}].objectives[${objectiveIndex}].id`, message: `重复目标 ID「${objective.id}」`, id: definition.id })
      }
      objectiveIds.add(objective.id)
      if (!objective.id.trim() || !objective.label.trim() || !objective.eventType.trim() || !isPositiveInteger(objective.requiredCount)) {
        issues.push({ code: 'invalid_value', path: `quests[${definitionIndex}].objectives[${objectiveIndex}]`, message: '目标 ID、说明、事件类型和数量必须有效', id: definition.id })
      }
    })
    const rewards = definition.rewards ?? definition.effects ?? []
    if (rewards.length > 0 && !definition.rewardGrantKey?.trim()) {
      issues.push({ code: 'missing_reward_grant_key', path: `quests[${definitionIndex}].rewardGrantKey`, message: '奖励必须声明幂等 grantKey', id: definition.id })
    }
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidQuestDefinitions(definitions: readonly QuestDefinition[]): void {
  const result = validateQuestDefinitions(definitions)
  if (!result.valid) throw new QuestEngineError('任务定义校验失败。', result.issues)
}

function contextFrom(options: QuestEngineOptions): ConditionContext {
  return typeof options.conditionContext === 'function' ? options.conditionContext() : options.conditionContext ?? EMPTY_CONTEXT
}

function conditionsMet(definition: QuestDefinition, options: QuestEngineOptions): boolean {
  try {
    return (definition.conditions ?? []).every((condition) => evaluateCondition(condition, contextFrom(options)))
  } catch {
    return false
  }
}

function definitionKind(definition: QuestDefinition): NonNullable<QuestDefinition['kind']> {
  return definition.kind ?? 'side'
}

function objectiveProgress(definition: QuestDefinition, saved: QuestTaskState | undefined): Readonly<Record<string, number>> {
  const source = saved?.objectiveProgress ?? {}
  return Object.fromEntries((definition.objectives ?? []).map((objective) => [
    objective.id,
    Math.min(objective.requiredCount, Math.max(0, Number.isInteger(source[objective.id]) ? source[objective.id] : 0)),
  ]))
}

function totalProgress(definition: QuestDefinition, progress: Readonly<Record<string, number>>): number {
  return (definition.objectives ?? []).reduce((total, objective) => total + (progress[objective.id] ?? 0), 0)
}

function objectivesComplete(definition: QuestDefinition, progress: Readonly<Record<string, number>>): boolean {
  const objectives = definition.objectives ?? []
  return objectives.length > 0 && objectives.every((objective) => (progress[objective.id] ?? 0) >= objective.requiredCount)
}

function normalizeTask(definition: QuestDefinition, saved: QuestTaskState | undefined, options: QuestEngineOptions): QuestTaskState {
  const progress = objectiveProgress(definition, saved)
  const complete = objectivesComplete(definition, progress)
  const savedStatus = saved?.status
  let status: QuestTaskState['status']
  if (savedStatus === 'completed') status = 'completed'
  else if (savedStatus === 'ready' && complete) status = 'ready'
  else if (savedStatus === 'active') status = complete ? 'ready' : 'active'
  else if (savedStatus === 'available') status = 'available'
  else if (savedStatus === 'locked') status = 'locked'
  else status = definitionKind(definition) === 'main' && conditionsMet(definition, options) ? 'active' : conditionsMet(definition, options) ? 'available' : 'locked'
  return {
    questId: definition.id,
    status,
    progress: totalProgress(definition, progress),
    objectiveProgress: progress,
    appliedEventIds: unique(saved?.appliedEventIds ?? []),
  }
}

function normalizeState(definitions: readonly QuestDefinition[], snapshot: Partial<QuestEngineState> | undefined, options: QuestEngineOptions): QuestEngineState {
  const savedTasks = new Map((snapshot?.tasks ?? []).map((task) => [task.questId, task]))
  return {
    tasks: definitions.map((definition) => normalizeTask(definition, savedTasks.get(definition.id), options)),
    processedEventIds: unique(snapshot?.processedEventIds ?? []),
    pendingEvents: uniqueEvents(snapshot?.pendingEvents ?? []),
    claimedRewardGrantKeys: unique(snapshot?.claimedRewardGrantKeys ?? []),
  }
}

function uniqueEvents(events: readonly DomainEvent[]): DomainEvent[] {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}

function replaceTask(state: QuestEngineState, task: QuestTaskState): QuestEngineState {
  return { ...state, tasks: state.tasks.map((current) => current.questId === task.questId ? task : current) }
}

function taskFor(state: QuestEngineState, questId: QuestDefinition['id']): QuestTaskState | undefined {
  return state.tasks.find((task) => task.questId === questId)
}

function refreshAvailability(definitions: ReadonlyMap<string, QuestDefinition>, state: QuestEngineState, options: QuestEngineOptions): QuestEngineState {
  return {
    ...state,
    tasks: state.tasks.map((task) => {
      const definition = definitions.get(task.questId)
      if (!definition || task.status === 'completed' || task.status === 'active' || task.status === 'ready') return task
      if (!conditionsMet(definition, options)) return task.status === 'locked' ? task : { ...task, status: 'locked' }
      if (definitionKind(definition) === 'main') return { ...task, status: 'active' }
      return { ...task, status: 'available' }
    }),
  }
}

function eventPayloadMatches(event: DomainEvent, objective: QuestObjective): boolean {
  if (event.type !== objective.eventType) return false
  if (!objective.payloadMatch) return true
  if (!event.payload || typeof event.payload !== 'object') return false
  const payload = event.payload as Record<string, unknown>
  return Object.entries(objective.payloadMatch).every(([key, value]) => payload[key] === value)
}

function matchingObjectives(event: DomainEvent, definition: QuestDefinition): readonly QuestObjective[] {
  return (definition.objectives ?? []).filter((objective) => eventPayloadMatches(event, objective))
}

function pendingCandidate(event: DomainEvent, definition: QuestDefinition, task: QuestTaskState): boolean {
  return (task.status === 'locked' || task.status === 'available') && matchingObjectives(event, definition).length > 0
}

function activeCount(state: QuestEngineState, definitions: ReadonlyMap<string, QuestDefinition>, kind: 'side' | 'commission'): number {
  return state.tasks.filter((task) => {
    const definition = definitions.get(task.questId)
    return definition && definitionKind(definition) === kind && (task.status === 'active' || task.status === 'ready')
  }).length
}

function action(status: QuestActionOutcome['status'], questId: QuestDefinition['id'], state: QuestEngineState, message: string): QuestActionOutcome {
  return { status, questId, state, message }
}

function rewardEffects(definition: QuestDefinition): { effects: readonly Effect[]; grantKey: string } {
  const grantKey = definition.rewardGrantKey?.trim() || `quest:${definition.id}:reward`
  const declared = definition.rewards ?? definition.effects ?? []
  return {
    grantKey,
    effects: declared.map((effect, index) => {
      if ((effect.type === 'give_item' || effect.type === 'give_exp') && !effect.grantKey) {
        return { ...effect, grantKey: `${grantKey}:${index}` }
      }
      return effect
    }),
  }
}

function cloneState(state: QuestEngineState): QuestEngineState {
  return {
    tasks: state.tasks.map((task) => ({ ...task, objectiveProgress: { ...task.objectiveProgress }, appliedEventIds: [...task.appliedEventIds] })),
    processedEventIds: [...state.processedEventIds],
    pendingEvents: state.pendingEvents.map((event) => ({ ...event })),
    claimedRewardGrantKeys: [...state.claimedRewardGrantKeys],
  }
}

export class QuestEngine {
  private readonly definitions: ReadonlyMap<string, QuestDefinition>
  private readonly options: QuestEngineOptions
  private state: QuestEngineState
  private effectState: ReturnType<typeof createEffectState> | undefined

  constructor(definitions: readonly QuestDefinition[], snapshot?: Partial<QuestEngineState>, options: QuestEngineOptions = {}) {
    assertValidQuestDefinitions(definitions)
    const orderedDefinitions = [...definitions].sort((left, right) => {
      const leftMain = definitionKind(left) === 'main' ? 0 : 1
      const rightMain = definitionKind(right) === 'main' ? 0 : 1
      if (leftMain !== rightMain) return leftMain - rightMain
      return (right.priority ?? 0) - (left.priority ?? 0)
    })
    this.definitions = new Map(orderedDefinitions.map((definition) => [definition.id, definition]))
    this.options = options
    this.effectState = options.effectState
    this.state = refreshAvailability(this.definitions, normalizeState(orderedDefinitions, snapshot, options), options)
  }

  getState(): QuestEngineState {
    return cloneState(this.state)
  }

  snapshot(): QuestSnapshot {
    return cloneState(this.state)
  }

  refresh(): QuestEngineState {
    this.state = refreshAvailability(this.definitions, this.state, this.options)
    return this.getState()
  }

  activate(questId: QuestDefinition['id']): QuestActionOutcome {
    this.state = refreshAvailability(this.definitions, this.state, this.options)
    const definition = this.definitions.get(questId)
    if (!definition) return action('unknown_quest', questId, this.getState(), '任务不存在。')
    const task = taskFor(this.state, questId)!
    if (task.status === 'active' || task.status === 'ready') return action('already_active', questId, this.getState(), '任务已经在进行中。')
    if (task.status !== 'available') return action('not_available', questId, this.getState(), '任务当前不可接取。')
    const kind = definitionKind(definition)
    const limit = kind === 'commission' ? MAX_COMMISSION_ACTIVE : kind === 'side' ? MAX_SIDE_ACTIVE : Number.POSITIVE_INFINITY
    if (activeCount(this.state, this.definitions, kind as 'side' | 'commission') >= limit) {
      return action('limit_reached', questId, this.getState(), kind === 'commission' ? '同时进行的程序委托已达到 3 个上限。' : '同时进行的普通任务已达到 6 个上限。')
    }
    const activated: QuestTaskState = { ...task, status: objectivesComplete(definition, task.objectiveProgress) ? 'ready' : 'active' }
    this.state = replaceTask(this.state, activated)
    // 事件先到任务后接取时，激活动作会在领域层重放待处理事件。
    for (const event of [...this.state.pendingEvents]) this.applyEvent(event)
    return action('activated', questId, this.getState(), '任务已接取。')
  }

  applyEvent(event: DomainEvent): QuestEventOutcome {
    this.state = refreshAvailability(this.definitions, this.state, this.options)
    if (this.state.processedEventIds.includes(event.id)) {
      return { state: this.getState(), changedQuestIds: [], queuedEventIds: [] }
    }

    let next = this.state
    const changed = new Set<QuestDefinition['id']>()
    for (const definition of this.definitions.values()) {
      const task = taskFor(next, definition.id)
      if (!task) continue
      const objectives = matchingObjectives(event, definition)
      if (objectives.length === 0 || task.appliedEventIds.includes(event.id)) continue
      if (task.status === 'active') {
        const progress = { ...task.objectiveProgress }
        objectives.forEach((objective) => {
          progress[objective.id] = Math.min(objective.requiredCount, (progress[objective.id] ?? 0) + 1)
        })
        const complete = objectivesComplete(definition, progress)
        next = replaceTask(next, {
          ...task,
          status: complete ? 'ready' : 'active',
          progress: totalProgress(definition, progress),
          objectiveProgress: progress,
          appliedEventIds: [...task.appliedEventIds, event.id],
        })
        changed.add(definition.id)
      } else if (task.status === 'locked' || task.status === 'available') {
        if (!next.pendingEvents.some((pending) => pending.id === event.id)) next = { ...next, pendingEvents: [...next.pendingEvents, event] }
      }
    }

    const stillPending = next.pendingEvents.some((pending) => this.definitionsAsEntriesHavePendingCandidate(pending, next))
    if (stillPending) {
      this.state = next
      return { state: this.getState(), changedQuestIds: [...changed], queuedEventIds: next.pendingEvents.map((pending) => pending.id) }
    }
    this.state = {
      ...next,
      pendingEvents: next.pendingEvents.filter((pending) => pending.id !== event.id),
      processedEventIds: unique([...next.processedEventIds, event.id]),
    }
    return { state: this.getState(), changedQuestIds: [...changed], queuedEventIds: [] }
  }

  private definitionsAsEntriesHavePendingCandidate(event: DomainEvent, state: QuestEngineState): boolean {
    return [...this.definitions.values()].some((definition) => {
      const task = taskFor(state, definition.id)
      return task ? pendingCandidate(event, definition, task) && !task.appliedEventIds.includes(event.id) : false
    })
  }

  deliver(questId: QuestDefinition['id'], options: QuestEngineDeliveryOptions = {}): QuestDeliveryOutcome {
    const definition = this.definitions.get(questId)
    if (!definition) return { state: this.getState(), status: 'unknown_quest', questId, message: '任务不存在。' }
    const task = taskFor(this.state, questId)!
    const grantKey = rewardEffects(definition).grantKey
    if (task.status === 'completed' || this.state.claimedRewardGrantKeys.includes(grantKey)) {
      if (task.status !== 'completed') this.state = replaceTask(this.state, { ...task, status: 'completed' })
      return { state: this.getState(), status: 'already_completed', questId, grantKey, message: '任务奖励已经交付过。' }
    }
    if (task.status !== 'ready') return { state: this.getState(), status: 'not_ready', questId, grantKey, message: '任务目标尚未完成。' }

    const rewards = rewardEffects(definition)
    const effectState = options.effectState ?? this.effectState ?? createEffectState()
    const effectResult = executeEffects(rewards.effects, effectState, {
      sourceActionId: options.sourceActionId ?? `quest:${questId}:deliver`,
      occurredAtTick: options.occurredAtTick ?? 0,
      catalog: options.effectCatalog ?? this.options.effectCatalog,
    })
    this.effectState = effectResult.state
    this.state = {
      ...replaceTask(this.state, { ...task, status: 'completed' }),
      claimedRewardGrantKeys: [...this.state.claimedRewardGrantKeys, rewards.grantKey],
    }
    return { state: this.getState(), status: 'delivered', questId, grantKey: rewards.grantKey, effectResult, message: '任务奖励已交付。' }
  }

  subscribe(eventBus: EventBus): () => void {
    const eventTypes = new Set<string>()
    for (const definition of this.definitions.values()) definition.objectives?.forEach((objective) => eventTypes.add(objective.eventType))
    const unsubscribers = [...eventTypes].map((eventType) => eventBus.subscribe(eventType, (event) => { this.applyEvent(event) }))
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }
}

export function createQuestEngine(definitions: readonly QuestDefinition[], snapshot?: Partial<QuestEngineState>, options: QuestEngineOptions = {}): QuestEngine {
  return new QuestEngine(definitions, snapshot, options)
}

export function serializeQuestSnapshot(snapshot: QuestSnapshot): string {
  let serialized: string | undefined
  try {
    serialized = JSON.stringify(snapshot)
  } catch (error) {
    throw new QuestSnapshotError(`任务快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
  if (serialized === undefined) throw new QuestSnapshotError('任务快照无法序列化。')
  return serialized
}

export function parseQuestSnapshot(input: string): QuestSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new QuestSnapshotError('任务快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new QuestSnapshotError('任务快照必须是对象。')
  const value = parsed as Partial<QuestEngineState>
  if (!Array.isArray(value.tasks) || !Array.isArray(value.processedEventIds) || !Array.isArray(value.pendingEvents) || !Array.isArray(value.claimedRewardGrantKeys)) {
    throw new QuestSnapshotError('任务快照缺少必要数组字段。')
  }
  return value as QuestSnapshot
}

export function restoreQuestSnapshot(definitions: readonly QuestDefinition[], snapshot: QuestSnapshot, options: QuestEngineOptions = {}): QuestEngine {
  return createQuestEngine(definitions, snapshot, options)
}

export function activateQuest(engine: QuestEngine, questId: QuestDefinition['id']): QuestActionOutcome {
  return engine.activate(questId)
}

export function applyQuestEvent(engine: QuestEngine, event: DomainEvent): QuestEventOutcome {
  return engine.applyEvent(event)
}

export function deliverQuest(engine: QuestEngine, questId: QuestDefinition['id'], options: QuestEngineDeliveryOptions = {}): QuestDeliveryOutcome {
  return engine.deliver(questId, options)
}
