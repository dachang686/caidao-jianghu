import type { Condition, ConditionContext } from './conditions'
import type { Effect, EffectExecutionResult, EffectState } from './effects'
import type { DomainEventType } from './events'

export type ComedyLayer = 'rule' | 'situation' | 'interaction' | 'presentation'
export type ComedyScale = 'major' | 'minor'

export interface ComedyBeatDefinition {
  readonly id: string
  readonly layer: ComedyLayer
  readonly scale: ComedyScale
  readonly triggerEvent: DomainEventType
  readonly conditions: readonly Condition[]
  readonly cooldownGroup: string
  readonly cooldownTicks?: number
  readonly firstCueId: string
  readonly repeatCueId: string
  readonly maxBlockingMs: number
  readonly reducedMotionCueId: string
  readonly dependsOn?: readonly string[]
  readonly required?: boolean
}

export interface RuleComedyDefinition {
  readonly id: string
  readonly mechanicId: string
  readonly mechanicType: 'skill' | 'item' | 'enemy_behavior' | 'environment'
  readonly previewStatKeys: readonly string[]
  readonly aiRestrictions: readonly string[]
  readonly presentationCueId: string
}

export interface SituationComboDefinition extends ComedyBeatDefinition {
  readonly requiredTags: readonly string[]
  readonly effects: readonly Effect[]
  readonly firstDiscoveryGrantKey?: string
}

export interface SituationComboSnapshot {
  readonly discoveredComboIds: readonly string[]
  readonly claimedGrantKeys: readonly string[]
  readonly processedEventIds: readonly string[]
  readonly cooldowns: Readonly<Record<string, number>>
}

export interface SituationComboOutcome {
  readonly status: 'triggered' | 'repeat' | 'none' | 'missing_tags' | 'cooldown' | 'duplicate_event'
  readonly comboId: string | null
  readonly cueId?: string
  readonly repeat: boolean
  readonly effectResult?: EffectExecutionResult
  readonly state: SituationComboSnapshot
  readonly rngState: number
  readonly message: string
}

export interface SituationComboEngineOptions {
  readonly conditionContext?: ConditionContext | (() => ConditionContext)
  readonly effectState?: EffectState
  readonly effectCatalog?: import('./effects').EffectCatalog
}

export interface SituationComboValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'missing_dependency' | 'dependency_cycle' | 'missing_grant_key'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface SituationComboValidationResult {
  readonly valid: boolean
  readonly issues: readonly SituationComboValidationIssue[]
}

export interface InteractionChainStage {
  readonly threshold: number
  readonly effects: readonly Effect[]
  readonly cueId: string
}

export interface InteractionChainDefinition {
  readonly id: string
  readonly triggerEvent: DomainEventType
  readonly stages: readonly InteractionChainStage[]
  readonly stableRepeatCueId: string
  readonly progressActionId?: string
}

export interface InteractionChainSnapshot {
  readonly version: 1
  readonly progress: Readonly<Record<string, number>>
  readonly claimedStageKeys: readonly string[]
  readonly processedEventIds: readonly string[]
  readonly processedActionIds: readonly string[]
}

export type InteractionChainStatus = 'triggered' | 'progressed' | 'stable_repeat' | 'none' | 'duplicate_event' | 'duplicate_action'

export interface InteractionChainOutcome {
  readonly status: InteractionChainStatus
  readonly chainId: string | null
  readonly progress: number
  readonly stageIndex?: number
  readonly cueId?: string
  readonly effectRequests: readonly Effect[]
  readonly repeat: boolean
  readonly progressActionId?: string
  readonly progressPreserved: boolean
  readonly state: InteractionChainSnapshot
  readonly message: string
}

export interface InteractionChainTriggerContext {
  readonly actionId?: string
  readonly occurredAtTick?: number
}

export interface InteractionChainValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'stage_count' | 'threshold_order'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface InteractionChainValidationResult {
  readonly valid: boolean
  readonly issues: readonly InteractionChainValidationIssue[]
}

export interface PresentationCueDefinition {
  readonly id: string
  readonly steps: readonly { type: 'anticipation' | 'action' | 'pause' | 'reaction'; durationMs: number }[]
  readonly shortCueId: string
  readonly reducedMotionCueId: string
  readonly sfxCooldownGroup?: string
}

export type PresentationCuePhase = 'idle' | 'anticipation' | 'action' | 'pause' | 'reaction' | 'short' | 'static'
export type PresentationCueStatus = 'idle' | 'running' | 'completed' | 'short' | 'static' | 'skipped' | 'cancelled'

export interface PresentationCueSnapshot {
  readonly status: PresentationCueStatus
  readonly phase: PresentationCuePhase
  readonly stepIndex: number
  readonly cueId: string | null
  readonly actionId: string | null
  readonly isRepeat: boolean
  readonly reducedMotion: boolean
  readonly muted: boolean
}

export interface ComedySelectionContext {
  readonly conditionContext: ConditionContext
  readonly tags?: readonly string[]
  readonly tick: number
  readonly actionId: string
  readonly rngState: number
}

export interface ComedyCueRequest {
  readonly definitionId: string
  readonly layer: ComedyLayer
  readonly scale: ComedyScale
  readonly cueId: string
  readonly reducedMotionCueId: string
  readonly maxBlockingMs: number
  readonly isRepeat: boolean
  readonly eventId: string
  readonly effectRequests: readonly Effect[]
}

export interface ComedySelection {
  readonly major: ComedyCueRequest | null
  readonly minor: readonly ComedyCueRequest[]
  readonly rngState: number
}
