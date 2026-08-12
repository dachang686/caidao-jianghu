import type { CommissionGenerationContext, CommissionGenerationResult, CommissionSnapshot, CommissionTask, CommissionTemplate } from './commission'

export type PostgameDifficulty = 'ordinary' | 'elite' | 'legendary'

export interface PostgameState {
  readonly unlocked: boolean
  readonly difficulty: PostgameDifficulty
  readonly commission: CommissionSnapshot
  readonly completedEndingIds: readonly string[]
  readonly prosperity: number
  readonly totalWealth: number
  readonly totalFame: number
  readonly claimedOneTimeTargetIds: readonly string[]
}

export interface PostgameGenerationResult {
  readonly status: CommissionGenerationResult['status'] | 'locked'
  readonly state: PostgameState
  readonly task?: CommissionTask
  readonly message: string
}

export interface PostgameClaimResult {
  readonly status: 'claimed' | 'already_claimed' | 'not_ready' | 'unknown_commission' | 'locked'
  readonly state: PostgameState
  readonly task?: CommissionTask
  readonly wealthDelta: number
  readonly fameDelta: number
  readonly prosperityDelta: number
  readonly message: string
}

export interface PostgameContext extends CommissionGenerationContext {
  readonly completedEndingIds: readonly string[]
  readonly prosperity: number
}

export interface PostgameTemplatePack {
  readonly templates: readonly CommissionTemplate[]
  readonly oneTimeTargetIds: readonly string[]
}
