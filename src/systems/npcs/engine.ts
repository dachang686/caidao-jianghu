import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type {
  NpcAppearanceDefinition,
  NpcDefinition,
  NpcInteractionEffect,
  NpcInteractionEvent,
  NpcInteractionKind,
  NpcInteractionOutcome,
  NpcPresence,
  NpcPresenceContext,
  NpcQuestState,
  NpcRelationshipBounds,
  NpcRelationshipState,
  NpcSnapshot,
  NpcTaskAction,
  NpcTaskActionKind,
  NpcValidationIssue,
  NpcValidationResult,
} from '../../types/npc'
import type { NpcId } from '../../types/ids'
import { evaluateCondition } from '../conditions/evaluate'
import { EventBus } from '../events/event-bus'

export const NPC_INTERACTION_EVENT = 'npc.interaction'

const DEFAULT_BOUNDS: Required<NpcRelationshipBounds> = {
  favorMin: -100,
  favorMax: 100,
  irritationMin: 0,
  irritationMax: 100,
}

const DEFAULT_INTERACTION_EFFECTS: Record<NpcInteractionKind, NpcInteractionEffect> = {
  click: { irritationDelta: 1 },
  help: { favorDelta: 5, irritationDelta: -2 },
  deceive: { favorDelta: -8, irritationDelta: 8 },
}

const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

export class NpcEngineError extends Error {
  readonly issues?: readonly NpcValidationIssue[]

  constructor(message: string, issues?: readonly NpcValidationIssue[]) {
    super(message)
    this.name = 'NpcEngineError'
    this.issues = issues
  }
}

export class NpcSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NpcSnapshotError'
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function validateUniqueReferences(values: readonly string[] | undefined, path: string, issues: NpcValidationIssue[]): void {
  if (!values) return
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (!value.trim()) issues.push({ code: 'invalid_value', path: `${path}[${index}]`, message: '引用 ID 不能为空' })
    if (seen.has(value)) issues.push({ code: 'duplicate_reference', path: `${path}[${index}]`, message: `重复引用「${value}」`, id: value })
    seen.add(value)
  })
}

function validateBounds(bounds: NpcRelationshipBounds | undefined, path: string, issues: NpcValidationIssue[]): void {
  if (!bounds) return
  const values: Array<[keyof NpcRelationshipBounds, number | undefined]> = [
    ['favorMin', bounds.favorMin],
    ['favorMax', bounds.favorMax],
    ['irritationMin', bounds.irritationMin],
    ['irritationMax', bounds.irritationMax],
  ]
  values.forEach(([key, value]) => {
    if (value !== undefined && !isFiniteNumber(value)) issues.push({ code: 'invalid_value', path: `${path}.${key}`, message: '关系边界必须是有限数字' })
  })
  const resolved = resolveBounds(bounds)
  if (resolved.favorMin > resolved.favorMax) issues.push({ code: 'invalid_value', path, message: '好感下限不能高于上限' })
  if (resolved.irritationMin > resolved.irritationMax) issues.push({ code: 'invalid_value', path, message: '烦躁下限不能高于上限' })
}

function validateInteractionEffects(definition: NpcDefinition, path: string, issues: NpcValidationIssue[]): void {
  Object.entries(definition.interactionEffects ?? {}).forEach(([kind, effect]) => {
    if (!['click', 'help', 'deceive'].includes(kind)) {
      issues.push({ code: 'invalid_value', path: `${path}.${kind}`, message: `未知 NPC 互动类型「${kind}」` })
      return
    }
    if (effect?.favorDelta !== undefined && !isFiniteNumber(effect.favorDelta)) issues.push({ code: 'invalid_value', path: `${path}.${kind}.favorDelta`, message: '好感变化必须是有限数字' })
    if (effect?.irritationDelta !== undefined && !isFiniteNumber(effect.irritationDelta)) issues.push({ code: 'invalid_value', path: `${path}.${kind}.irritationDelta`, message: '烦躁变化必须是有限数字' })
    validateUniqueReferences(effect?.knownInfoIds, `${path}.${kind}.knownInfoIds`, issues)
  })
}

function validateAppearance(appearance: NpcAppearanceDefinition, path: string, issues: NpcValidationIssue[]): void {
  if (!appearance.locationId.trim()) issues.push({ code: 'invalid_value', path: `${path}.locationId`, message: 'NPC 地点 ID 不能为空' })
  if (appearance.priority !== undefined && (!Number.isInteger(appearance.priority) || appearance.priority < 0)) {
    issues.push({ code: 'invalid_value', path: `${path}.priority`, message: 'NPC 出现规则优先级必须是非负整数' })
  }
  validateUniqueReferences(appearance.dialogueIds, `${path}.dialogueIds`, issues)
  validateUniqueReferences(appearance.questIds, `${path}.questIds`, issues)
}

export function validateNpcDefinitions(definitions: readonly NpcDefinition[]): NpcValidationResult {
  const issues: NpcValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    const path = `npcs[${definitionIndex}]`
    if (seen.has(definition.id)) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复 NPC ID「${definition.id}」`, id: definition.id })
    seen.add(definition.id)
    if (!definition.id.trim() || !definition.name.trim()) issues.push({ code: 'invalid_value', path, message: 'NPC ID 与名称不能为空', id: definition.id })
    validateUniqueReferences(definition.locationIds, `${path}.locationIds`, issues)
    validateUniqueReferences(definition.dialogueIds, `${path}.dialogueIds`, issues)
    validateUniqueReferences(definition.taskQuestIds, `${path}.taskQuestIds`, issues)
    validateBounds(definition.relationship, `${path}.relationship`, issues)
    validateInteractionEffects(definition, `${path}.interactionEffects`, issues)
    definition.appearances?.forEach((appearance, appearanceIndex) => {
      validateAppearance(appearance, `${path}.appearances[${appearanceIndex}]`, issues)
    })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidNpcDefinitions(definitions: readonly NpcDefinition[]): void {
  const result = validateNpcDefinitions(definitions)
  if (!result.valid) throw new NpcEngineError('NPC 定义校验失败。', result.issues)
}

function resolveBounds(bounds: NpcRelationshipBounds | undefined): Required<NpcRelationshipBounds> {
  const resolved = { ...DEFAULT_BOUNDS, ...bounds }
  return resolved.favorMin <= resolved.favorMax && resolved.irritationMin <= resolved.irritationMax
    ? resolved
    : DEFAULT_BOUNDS
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function defaultRelationship(definition: NpcDefinition): NpcRelationshipState {
  const bounds = resolveBounds(definition.relationship)
  return {
    npcId: definition.id,
    favor: clamp(0, bounds.favorMin, bounds.favorMax),
    irritation: clamp(0, bounds.irritationMin, bounds.irritationMax),
    knownInfoIds: [],
  }
}

function cloneSnapshot(snapshot: NpcSnapshot): NpcSnapshot {
  return {
    states: snapshot.states.map((state) => ({ ...state, knownInfoIds: [...state.knownInfoIds] })),
    processedEventIds: [...snapshot.processedEventIds],
  }
}

function stateFor(states: readonly NpcRelationshipState[], definition: NpcDefinition): NpcRelationshipState {
  const state = states.find((candidate) => candidate.npcId === definition.id)
  if (!state) return defaultRelationship(definition)
  const bounds = resolveBounds(definition.relationship)
  return {
    npcId: definition.id,
    favor: clamp(state.favor, bounds.favorMin, bounds.favorMax),
    irritation: clamp(state.irritation, bounds.irritationMin, bounds.irritationMax),
    knownInfoIds: unique(state.knownInfoIds),
  }
}

function isConditionMet(condition: NpcAppearanceDefinition['entryCondition'], context: ConditionContext): boolean {
  if (!condition) return true
  try {
    return evaluateCondition(condition, context)
  } catch {
    return false
  }
}

function questStateMap(states: NpcPresenceContext['questStates']): ReadonlyMap<string, NpcQuestState> {
  if (!states) return new Map()
  return Array.isArray(states)
    ? new Map(states.map((state) => [state.questId, state]))
    : new Map(Object.entries(states))
}

function selectAppearance(definition: NpcDefinition, context: NpcPresenceContext): NpcAppearanceDefinition | null {
  if (definition.appearances) {
    return definition.appearances
      .filter((appearance) => (appearance.chapterId === undefined || appearance.chapterId === context.chapterId)
        && appearance.locationId === context.locationId
        && isConditionMet(appearance.entryCondition, context.conditionContext ?? EMPTY_CONTEXT))
      .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))[0] ?? null
  }
  return definition.locationIds.includes(context.locationId) ? { locationId: context.locationId } : null
}

function taskActionFor(status: NpcQuestState['status']): NpcTaskActionKind | null {
  if (status === 'available') return 'offer'
  if (status === 'active') return 'advance'
  if (status === 'ready') return 'deliver'
  return null
}

function makePresence(definition: NpcDefinition, appearance: NpcAppearanceDefinition, relationship: NpcRelationshipState, questStates: NpcPresenceContext['questStates']): NpcPresence {
  const questIds = unique([...(definition.taskQuestIds ?? []), ...(appearance.questIds ?? [])]) as unknown as NpcPresence['questIds']
  const states = questStateMap(questStates)
  const taskActions = questIds.flatMap((questId): NpcTaskAction[] => {
    const kind = taskActionFor(states.get(questId)?.status ?? 'locked')
    return kind ? [{ questId: questId as NpcTaskAction['questId'], kind }] : []
  })
  return {
    npcId: definition.id,
    name: definition.name,
    locationId: appearance.locationId,
    dialogueIds: [...(appearance.dialogueIds ?? definition.dialogueIds ?? [])],
    questIds,
    taskActions,
    relationship,
    keyNpc: definition.keyNpc === true,
  }
}

function interactionEventPayload(event: DomainEvent): NpcInteractionEvent['payload'] {
  if (!event.payload || typeof event.payload !== 'object') throw new NpcEngineError('NPC 互动事件 payload 无效。')
  const payload = event.payload as Partial<NpcInteractionEvent['payload']>
  if (typeof payload.npcId !== 'string' || !payload.npcId.trim() || !['click', 'help', 'deceive'].includes(String(payload.kind))) {
    throw new NpcEngineError('NPC 互动事件必须包含有效 npcId 与 kind。')
  }
  return payload as NpcInteractionEvent['payload']
}

export class NpcStateEngine {
  private readonly definitions: readonly NpcDefinition[]
  private readonly definitionsById: ReadonlyMap<NpcId, NpcDefinition>
  private snapshotState: NpcSnapshot

  constructor(definitions: readonly NpcDefinition[], snapshot?: Partial<NpcSnapshot>) {
    assertValidNpcDefinitions(definitions)
    this.definitions = definitions
    this.definitionsById = new Map(definitions.map((definition) => [definition.id, definition]))
    const states = definitions.map((definition) => stateFor(snapshot?.states ?? [], definition))
    const knownEventIds = snapshot?.processedEventIds ?? []
    this.snapshotState = {
      states,
      processedEventIds: unique(knownEventIds),
    }
  }

  getSnapshot(): NpcSnapshot {
    return cloneSnapshot(this.snapshotState)
  }

  snapshot(): NpcSnapshot {
    return this.getSnapshot()
  }

  getRelationship(npcId: NpcId): NpcRelationshipState {
    const definition = this.definitionsById.get(npcId)
    if (!definition) throw new NpcEngineError(`未知 NPC「${npcId}」。`)
    return stateFor(this.snapshotState.states, definition)
  }

  getPresence(context: NpcPresenceContext, npcId: NpcId): NpcPresence | null {
    const definition = this.definitionsById.get(npcId)
    if (!definition) throw new NpcEngineError(`未知 NPC「${npcId}」。`)
    const appearance = selectAppearance(definition, context)
    return appearance ? makePresence(definition, appearance, this.getRelationship(npcId), context.questStates) : null
  }

  getPresentNpcs(context: NpcPresenceContext): readonly NpcPresence[] {
    return this.definitions.flatMap((definition) => {
      const appearance = selectAppearance(definition, context)
      return appearance ? [makePresence(definition, appearance, this.getRelationship(definition.id), context.questStates)] : []
    })
  }

  applyInteraction(event: NpcInteractionEvent): NpcInteractionOutcome {
    if (event.type !== NPC_INTERACTION_EVENT) throw new NpcEngineError(`未知 NPC 事件类型「${event.type}」。`)
    const payload = interactionEventPayload(event)
    const definition = this.definitionsById.get(payload.npcId)
    if (!definition) return { status: 'unknown_npc', state: this.getSnapshot(), message: `找不到 NPC「${payload.npcId}」。` }
    const current = this.getRelationship(payload.npcId)
    if (this.snapshotState.processedEventIds.includes(event.id)) {
      return { status: 'duplicate', state: this.getSnapshot(), relationship: current, message: '该 NPC 互动事件已经处理过。' }
    }
    const effect = definition.interactionEffects?.[payload.kind] ?? DEFAULT_INTERACTION_EFFECTS[payload.kind]
    const bounds = resolveBounds(definition.relationship)
    const nextRelationship: NpcRelationshipState = {
      npcId: definition.id,
      favor: clamp(current.favor + (effect.favorDelta ?? 0), bounds.favorMin, bounds.favorMax),
      irritation: clamp(current.irritation + (effect.irritationDelta ?? 0), bounds.irritationMin, bounds.irritationMax),
      knownInfoIds: unique([...current.knownInfoIds, ...(effect.knownInfoIds ?? []), ...(payload.knownInfoIds ?? [])]),
    }
    this.snapshotState = {
      states: this.snapshotState.states.map((state) => state.npcId === definition.id ? nextRelationship : state),
      processedEventIds: [...this.snapshotState.processedEventIds, event.id],
    }
    return { status: 'applied', state: this.getSnapshot(), relationship: nextRelationship, message: 'NPC 关系已更新。' }
  }

  interact(npcId: NpcId, kind: NpcInteractionKind, actionId: string, occurredAtTick = 0, knownInfoIds?: readonly string[]): NpcInteractionOutcome {
    return this.applyInteraction(createNpcInteractionEvent(npcId, kind, actionId, occurredAtTick, knownInfoIds))
  }

  subscribe(eventBus: EventBus): () => void {
    return eventBus.subscribe(NPC_INTERACTION_EVENT, (event) => {
      this.applyInteraction(event as NpcInteractionEvent)
    })
  }
}

export function createNpcInteractionEvent(npcId: NpcId, kind: NpcInteractionKind, eventId: string, occurredAtTick = 0, knownInfoIds?: readonly string[]): NpcInteractionEvent {
  return {
    id: eventId,
    type: NPC_INTERACTION_EVENT,
    occurredAtTick,
    sourceActionId: eventId,
    payload: { npcId, kind, ...(knownInfoIds ? { knownInfoIds } : {}) },
  }
}

export function createNpcEngine(definitions: readonly NpcDefinition[], snapshot?: Partial<NpcSnapshot>): NpcStateEngine {
  return new NpcStateEngine(definitions, snapshot)
}

export function applyNpcInteraction(engine: NpcStateEngine, event: NpcInteractionEvent): NpcInteractionOutcome {
  return engine.applyInteraction(event)
}

export function getNpcPresence(engine: NpcStateEngine, context: NpcPresenceContext, npcId: NpcId): NpcPresence | null {
  return engine.getPresence(context, npcId)
}

export function serializeNpcSnapshot(snapshot: NpcSnapshot): string {
  try {
    const text = JSON.stringify(snapshot)
    if (text === undefined) throw new NpcSnapshotError('NPC 快照无法序列化。')
    return text
  } catch (error) {
    if (error instanceof NpcSnapshotError) throw error
    throw new NpcSnapshotError(`NPC 快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseNpcSnapshot(input: string): NpcSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new NpcSnapshotError('NPC 快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new NpcSnapshotError('NPC 快照必须是对象。')
  const value = parsed as Partial<NpcSnapshot>
  if (!Array.isArray(value.states) || !Array.isArray(value.processedEventIds)) throw new NpcSnapshotError('NPC 快照缺少必要字段。')
  return value as NpcSnapshot
}

export function restoreNpcSnapshot(definitions: readonly NpcDefinition[], snapshot: NpcSnapshot): NpcStateEngine {
  return createNpcEngine(definitions, snapshot)
}

export const NpcEngine = NpcStateEngine
