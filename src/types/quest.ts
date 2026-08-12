import type { Condition, ConditionContext } from './conditions'
import type { Effect, EffectCatalog, EffectExecutionResult, EffectState } from './effects'
import type { ChapterId, DialogueId, NpcId, QuestId } from './ids'
import type { DomainEvent, DomainEventType } from './events'

export type QuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed'
export type QuestKind = 'main' | 'side' | 'commission'

export interface QuestObjective {
  readonly id: string
  readonly label: string
  readonly eventType: DomainEventType
  readonly requiredCount: number
  /** 只匹配事件 payload 的 JSON 标量字段，不在组件里写计数逻辑。 */
  readonly payloadMatch?: Readonly<Record<string, string | number | boolean>>
}

export interface QuestDefinition {
  readonly id: QuestId
  readonly title: string
  readonly chapterId: ChapterId
  readonly objective: string
  readonly kind?: QuestKind
  readonly priority?: number
  readonly giverNpcId?: NpcId
  readonly dialogueId?: DialogueId
  readonly conditions?: readonly Condition[]
  readonly objectives?: readonly QuestObjective[]
  /** `effects` 保留 F003 内容字段名；`rewards` 是任务系统更明确的别名。 */
  readonly effects?: readonly Effect[]
  readonly rewards?: readonly Effect[]
  readonly rewardGrantKey?: string
}

export interface QuestTaskState {
  readonly questId: QuestId
  readonly status: QuestStatus
  /** 面向列表展示的总进度，目标明细见 objectiveProgress。 */
  readonly progress: number
  readonly objectiveProgress: Readonly<Record<string, number>>
  readonly appliedEventIds: readonly string[]
}

export interface QuestEngineState {
  readonly tasks: readonly QuestTaskState[]
  readonly processedEventIds: readonly string[]
  readonly pendingEvents: readonly DomainEvent[]
  readonly claimedRewardGrantKeys: readonly string[]
}

export type QuestSnapshot = QuestEngineState

export interface QuestEngineOptions {
  readonly conditionContext?: ConditionContext | (() => ConditionContext)
  readonly effectState?: EffectState
  readonly effectCatalog?: EffectCatalog
}

export interface QuestEventOutcome {
  readonly state: QuestEngineState
  readonly changedQuestIds: readonly QuestId[]
  readonly queuedEventIds: readonly string[]
}

export interface QuestActionOutcome {
  readonly state: QuestEngineState
  readonly status: 'activated' | 'already_active' | 'not_available' | 'limit_reached' | 'unknown_quest'
  readonly questId: QuestId
  readonly message: string
}

export interface QuestValidationIssue {
  readonly code: 'duplicate_id' | 'duplicate_objective_id' | 'invalid_value' | 'missing_reward_grant_key'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface QuestValidationResult {
  readonly valid: boolean
  readonly issues: readonly QuestValidationIssue[]
}

export interface QuestDeliveryOutcome {
  readonly state: QuestEngineState
  readonly status: 'delivered' | 'already_completed' | 'not_ready' | 'unknown_quest'
  readonly questId: QuestId
  readonly grantKey?: string
  readonly effectResult?: EffectExecutionResult
  readonly message: string
}

export interface QuestEngineDeliveryOptions {
  readonly sourceActionId?: string
  readonly occurredAtTick?: number
  readonly effectState?: EffectState
  readonly effectCatalog?: EffectCatalog
}
