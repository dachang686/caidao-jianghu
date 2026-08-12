import type { Condition, ConditionContext } from './conditions'
import type { DomainEvent } from './events'
import type { ChapterId, DialogueId, LocationId, NpcId, QuestId } from './ids'
import type { QuestStatus } from './quest'

export type NpcInteractionKind = 'click' | 'help' | 'deceive'

export interface NpcRelationshipBounds {
  readonly favorMin?: number
  readonly favorMax?: number
  readonly irritationMin?: number
  readonly irritationMax?: number
}

export interface NpcInteractionEffect {
  readonly favorDelta?: number
  readonly irritationDelta?: number
  readonly knownInfoIds?: readonly string[]
}

/** 同一 npcId 可以在多个章节声明出现规则，状态始终由 npcId 唯一索引。 */
export interface NpcAppearanceDefinition {
  readonly chapterId?: ChapterId
  readonly locationId: LocationId
  readonly dialogueIds?: readonly DialogueId[]
  readonly questIds?: readonly QuestId[]
  readonly entryCondition?: Condition
  readonly priority?: number
}

export interface NpcDefinition {
  readonly id: NpcId
  readonly name: string
  /** 兼容基础内容索引；存在 appearances 时由章节/条件规则决定实际位置。 */
  readonly locationIds: readonly LocationId[]
  readonly dialogueIds?: readonly DialogueId[]
  readonly tags?: readonly string[]
  readonly appearances?: readonly NpcAppearanceDefinition[]
  readonly keyNpc?: boolean
  readonly taskQuestIds?: readonly QuestId[]
  readonly relationship?: NpcRelationshipBounds
  readonly interactionEffects?: Partial<Record<NpcInteractionKind, NpcInteractionEffect>>
}

export interface NpcRelationshipState {
  readonly npcId: NpcId
  readonly favor: number
  readonly irritation: number
  readonly knownInfoIds: readonly string[]
}

export interface NpcSnapshot {
  readonly states: readonly NpcRelationshipState[]
  readonly processedEventIds: readonly string[]
}

export interface NpcQuestState {
  readonly questId: QuestId
  readonly status: QuestStatus
}

export interface NpcPresenceContext {
  readonly chapterId: ChapterId
  readonly locationId: LocationId
  readonly conditionContext?: ConditionContext
  readonly questStates?: readonly NpcQuestState[] | Readonly<Record<string, NpcQuestState>>
}

export type NpcTaskActionKind = 'offer' | 'advance' | 'deliver'

export interface NpcTaskAction {
  readonly questId: QuestId
  readonly kind: NpcTaskActionKind
}

export interface NpcPresence {
  readonly npcId: NpcId
  readonly name: string
  readonly locationId: LocationId
  readonly dialogueIds: readonly DialogueId[]
  readonly questIds: readonly QuestId[]
  readonly taskActions: readonly NpcTaskAction[]
  readonly relationship: NpcRelationshipState
  readonly keyNpc: boolean
}

export interface NpcInteractionPayload {
  readonly npcId: NpcId
  readonly kind: NpcInteractionKind
  readonly knownInfoIds?: readonly string[]
}

export type NpcInteractionEvent = DomainEvent<NpcInteractionPayload>

export interface NpcInteractionOutcome {
  readonly status: 'applied' | 'duplicate' | 'unknown_npc'
  readonly state: NpcSnapshot
  readonly relationship?: NpcRelationshipState
  readonly message: string
}

export interface NpcValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'duplicate_reference'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface NpcValidationResult {
  readonly valid: boolean
  readonly issues: readonly NpcValidationIssue[]
}
