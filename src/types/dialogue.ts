import type { Condition, ConditionContext } from './conditions'
import type { DomainEvent } from './events'
import type { Effect, EffectCatalog, EffectExecutionResult, EffectState } from './effects'
import type { ChoiceId, DialogueId, NpcId } from './ids'

export type DialogueBranch = 'main' | 'confusing'
export type DialoguePlaybackMode = 'typewriter' | 'instant'

export interface DialogueChoice {
  readonly id: ChoiceId
  readonly optionId?: ChoiceId
  readonly label: string
  readonly nextNodeId?: DialogueId
  readonly conditions?: readonly Condition[]
  readonly effects?: readonly Effect[]
  readonly semanticTag?: string
  readonly branch?: DialogueBranch
  readonly returnToNodeId?: DialogueId
  readonly irreversible?: boolean
  readonly requiresConfirmation?: boolean
}

export type ChoiceDefinition = DialogueChoice

export interface DialogueNode {
  readonly id: DialogueId
  readonly speakerNpcId?: NpcId
  readonly text: string
  readonly choices: readonly DialogueChoice[]
  readonly returnToNodeId?: DialogueId
}

export interface DialogueGraph {
  readonly id: string
  readonly startNodeId: DialogueId
  readonly nodes: readonly DialogueNode[]
  /** 主线节点集合用于静态检查迷惑分支是否可回归。 */
  readonly mainlineNodeIds?: readonly DialogueId[]
  readonly maxConfusingHops?: number
}

export interface DialogueSnapshot {
  readonly graphId: string
  readonly currentNodeId: DialogueId | null
  readonly returnPath: readonly DialogueId[]
  readonly readNodeIds: readonly DialogueId[]
  readonly readOptionIds: readonly ChoiceId[]
  readonly executedActionIds: readonly string[]
  readonly confusingHops: number
  readonly mode: DialoguePlaybackMode
  readonly auto: boolean
}

export interface DialogueEngineOptions {
  readonly conditionContext?: ConditionContext | (() => ConditionContext)
  readonly effectState?: EffectState
  readonly effectCatalog?: EffectCatalog
  readonly maxConfusingHops?: number
}

export interface DialogueChoiceView {
  readonly choice: DialogueChoice
  readonly optionId: ChoiceId
  readonly enabled: boolean
  readonly reason?: string
  readonly requiresConfirmation: boolean
}

export interface DialogueView {
  readonly node: DialogueNode | null
  readonly choices: readonly DialogueChoiceView[]
  readonly status: 'active' | 'completed' | 'diagnostic'
  readonly diagnostic?: string
}

export type DialogueActionStatus = 'advanced' | 'completed' | 'blocked' | 'requires_confirmation' | 'duplicate_action' | 'unknown_choice'

export interface DialogueActionResult {
  readonly status: DialogueActionStatus
  readonly state: DialogueSnapshot
  readonly view: DialogueView
  readonly effectResult?: EffectExecutionResult
  readonly events: readonly DomainEvent[]
  readonly message: string
}

export interface DialogueValidationIssue {
  readonly code: 'duplicate_id' | 'missing_reference' | 'dead_end' | 'all_choices_locked' | 'confusing_branch_overflow' | 'irreversible_without_confirmation'
  readonly path: string
  readonly message: string
}

export interface DialogueValidationResult {
  readonly valid: boolean
  readonly issues: readonly DialogueValidationIssue[]
}
