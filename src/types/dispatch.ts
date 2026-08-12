import type { DomainEvent } from './events'
import type { DiscipleDispatchModifiers } from './disciple'
import type { DiscipleId } from './ids'

export const MAX_DISPATCH_TEAMS = 3

export interface DispatchRngSnapshot {
  readonly seed: number
  readonly state: number
}

export interface DispatchTask {
  readonly dispatchId: string
  readonly discipleIds: readonly DiscipleId[]
  readonly expectedTicks: number
  readonly remainingTicks: number
  readonly createdAtBattleTick: number
  readonly rng: DispatchRngSnapshot
  readonly modifiers: DiscipleDispatchModifiers
  readonly status: 'active' | 'ready' | 'claimed'
  readonly claim?: DispatchClaim
}

export interface DispatchClaim {
  readonly dispatchId: string
  readonly qualityScore: number
  readonly resultSeed: number
}

export interface SectDispatchSnapshot {
  readonly battleTick: number
  readonly tasks: readonly DispatchTask[]
  readonly processedBattleEventIds: readonly string[]
}

export interface BattleCompletedPayload {
  readonly battleId: string
  readonly outcome?: 'won' | 'win' | 'completed' | 'lost' | 'escape' | 'escaped'
  readonly result?: 'won' | 'win' | 'completed' | 'lost' | 'escape' | 'escaped'
  readonly isRetry?: boolean
  readonly isSimulation?: boolean
  readonly mode?: 'normal' | 'retry' | 'simulation' | 'preview'
}

export type BattleCompletedEvent = DomainEvent<BattleCompletedPayload>

export interface DispatchStartRequest {
  readonly dispatchId: string
  readonly discipleIds: readonly DiscipleId[]
  readonly baseDurationTicks: number
  readonly modifiers?: DiscipleDispatchModifiers
  readonly rng: DispatchRngSnapshot
}

export type DispatchStartStatus = 'started' | 'duplicate_id' | 'team_limit' | 'disciple_occupied' | 'invalid_request'
export type DispatchClaimStatus = 'claimed' | 'already_claimed' | 'not_ready' | 'unknown_dispatch'

export interface DispatchStartResult {
  readonly status: DispatchStartStatus
  readonly dispatchId: string
  readonly state: SectDispatchSnapshot
  readonly task?: DispatchTask
  readonly message: string
}

export interface DispatchAdvanceResult {
  readonly status: 'advanced' | 'duplicate_event' | 'ignored_event'
  readonly state: SectDispatchSnapshot
  readonly advancedTaskIds: readonly string[]
  readonly message: string
}

export interface DispatchClaimResult {
  readonly status: DispatchClaimStatus
  readonly dispatchId: string
  readonly state: SectDispatchSnapshot
  readonly claim?: DispatchClaim
  readonly message: string
}
