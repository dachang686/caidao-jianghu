import type { WorldRegionId } from './ids'

export type CommissionTier = 'ordinary' | 'elite' | 'legendary'
export type CommissionTargetKind = 'collect' | 'defeat' | 'deliver' | 'investigate' | 'help'

export interface CommissionTarget {
  readonly kind: CommissionTargetKind
  readonly id: string
  readonly label: string
  readonly count?: number
  readonly enemyId?: string
  readonly contextTags: readonly string[]
}

export interface CommissionReward {
  readonly wealth: number
  readonly fame: number
  readonly itemIds?: readonly string[]
  readonly grantKey: string
}

export interface CommissionTemplate {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly tier: CommissionTier
  readonly regionId: WorldRegionId | string
  readonly requiredChapter?: number
  readonly target: CommissionTarget
  readonly reward: CommissionReward
  readonly oneTime?: boolean
}

export interface CommissionRngSnapshot {
  readonly seed: number
  readonly state: number
}

export interface CommissionTask {
  readonly instanceId: string
  readonly templateId: string
  readonly title: string
  readonly description: string
  readonly tier: CommissionTier
  readonly regionId: WorldRegionId | string
  readonly target: CommissionTarget
  readonly reward: CommissionReward
  readonly payoutMultiplier: number
  readonly generatedAtProgress: number
  readonly rng: CommissionRngSnapshot
  readonly status: 'active' | 'ready' | 'claimed'
}

export interface CommissionSnapshot {
  readonly progress: number
  readonly active: readonly CommissionTask[]
  readonly templateUseCounts: Readonly<Record<string, number>>
  readonly completedTemplateIds: readonly string[]
  readonly claimedGrantKeys: readonly string[]
  readonly generatedRequestKeys: readonly string[]
}

export interface CommissionGenerationContext {
  readonly chapter: number
  readonly unlockedRegionIds: readonly (WorldRegionId | string)[]
  readonly progress: number
  readonly rng: CommissionRngSnapshot
  readonly regionId?: WorldRegionId | string
}

export interface CommissionGenerationResult {
  readonly status: 'generated' | 'limit_reached' | 'no_eligible_template' | 'duplicate_request' | 'invalid_context'
  readonly state: CommissionSnapshot
  readonly task?: CommissionTask
  readonly message: string
}

export interface CommissionActionResult {
  readonly status: 'ready' | 'already_ready' | 'claimed' | 'already_claimed' | 'not_ready' | 'unknown_commission'
  readonly state: CommissionSnapshot
  readonly task?: CommissionTask
  readonly message: string
}

export interface CommissionValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'duplicate_grant_key'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface CommissionValidationResult {
  readonly valid: boolean
  readonly issues: readonly CommissionValidationIssue[]
}
