import type { Condition, ConditionContext } from './conditions'
import type { DomainEvent } from './events'

export type UnlockableKind = 'npc' | 'enemy' | 'skill' | 'title' | 'achievement'
export type UnlockableEventValue = string | number | boolean
export type UnlockableTitleStat = 'maxHp' | 'maxQi' | 'attack' | 'defense' | 'crit' | 'dodge' | 'accuracy'
export type UnlockableTitleBonus = Partial<Record<UnlockableTitleStat, number>>

export interface UnlockableEventRule {
  readonly type: string
  readonly payload?: Readonly<Record<string, UnlockableEventValue>>
}

export interface UnlockableDefinition {
  readonly id: string
  readonly kind: UnlockableKind
  readonly name: string
  readonly description: string
  /** The clue shown before the entry is unlocked. */
  readonly clue: string
  readonly eventRules: readonly UnlockableEventRule[]
  readonly conditions?: readonly Condition[]
  readonly hidden?: boolean
  readonly titleBonus?: UnlockableTitleBonus
}

export interface UnlockableSnapshot {
  readonly version: 1
  readonly unlockedIds: readonly string[]
  readonly claimedRewardIds: readonly string[]
  readonly processedEventIds: readonly string[]
}

export type UnlockableOutcomeStatus = 'unlocked' | 'already_unlocked' | 'no_match' | 'duplicate_event'

export interface UnlockableOutcome {
  readonly status: UnlockableOutcomeStatus
  readonly unlockedIds: readonly string[]
  readonly titleRewardIds: readonly string[]
  readonly state: UnlockableSnapshot
  readonly message: string
}

export interface UnlockableView {
  readonly definition: UnlockableDefinition
  readonly unlocked: boolean
  readonly displayName: string
  readonly displayDescription: string
  readonly silhouette: boolean
}

export interface UnlockableDiagnostics {
  readonly missingDefinitionIds: readonly string[]
  readonly missingRewardIds: readonly string[]
}

export interface UnlockableValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'invalid_kind' | 'invalid_event'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface UnlockableValidationResult {
  readonly valid: boolean
  readonly issues: readonly UnlockableValidationIssue[]
}

export interface UnlockableEventContext {
  readonly conditionContext?: ConditionContext
}

export type UnlockableEvent = DomainEvent
