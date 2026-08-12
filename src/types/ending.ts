import type { Condition, ConditionContext } from './conditions'
import type { EndingId } from './ids'

export interface EndingChoiceDefinition {
  readonly id: string
  readonly label: string
  readonly summary: string
  readonly seriousConfirmation: boolean
}

export interface EndingDefinition {
  readonly id: EndingId | string
  readonly title: string
  readonly subtitle: string
  readonly priority: number
  readonly conditions: Condition
  readonly finalChoiceIds: readonly string[]
  readonly choices: readonly EndingChoiceDefinition[]
  readonly settlementSummary: string
  readonly postgameLabel: string
  readonly grantKey: string
  readonly presentationCueId: string
}

export interface EndingSelection {
  readonly status: 'selected' | 'none_available'
  readonly ending: EndingDefinition | null
  readonly candidates: readonly EndingDefinition[]
  readonly reason: string
}

export interface EndingRecordState {
  readonly seenIds: readonly string[]
  readonly chosenId: string | null
  readonly claimedGrantKeys: readonly string[]
  readonly postgameContinues: boolean
}

export interface EndingRecordResult {
  readonly status: 'recorded' | 'already_recorded' | 'invalid_choice' | 'confirmation_required'
  readonly state: EndingRecordState
  readonly ending: EndingDefinition
  readonly choiceId?: string
  readonly message: string
}

export interface EndingValidationIssue {
  readonly code: 'duplicate_id' | 'duplicate_priority' | 'invalid_value' | 'duplicate_grant_key'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface EndingValidationResult {
  readonly valid: boolean
  readonly issues: readonly EndingValidationIssue[]
}

export type EndingConditionContext = ConditionContext
