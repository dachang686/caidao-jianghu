import type { Effect, EffectExecutionResult, EffectState } from './effects'
import type { DialogueId, DiscipleId, ItemId, RecipeId, WorldRegionId } from './ids'
import type { InventoryState } from './item'

export type SectFacilityId = 'training' | 'kitchen' | 'forge' | 'intel'
export type SectFacilityLevel = 0 | 1 | 2 | 3

export interface SectFacilityLevels {
  readonly training: SectFacilityLevel
  readonly kitchen: SectFacilityLevel
  readonly forge: SectFacilityLevel
  readonly intel: SectFacilityLevel
}

export interface SectBenefits {
  readonly combatAttackBonus: number
  readonly combatDefenseBonus: number
  readonly unlockedRecipeIds: readonly RecipeId[]
  readonly strengtheningChanceBonus: number
  readonly revealedRegionIds: readonly WorldRegionId[]
  readonly commissionQualityBonus: number
  readonly fameBonus: number
}

export interface SectState {
  readonly unlocked: boolean
  readonly facilities: SectFacilityLevels
  readonly benefits: SectBenefits
  readonly claimedUpgradeGrantKeys: readonly string[]
  readonly discipleIds: readonly DiscipleId[]
  readonly seenDiscipleDialogueIds: readonly DialogueId[]
}

export interface SectMaterialCost {
  readonly itemId: ItemId | string
  readonly count: number
}

export interface SectUpgradeCost {
  readonly silver: number
  readonly materials: readonly SectMaterialCost[]
}

export type SectBenefit =
  | { readonly type: 'combat_stat_bonus'; readonly stat: 'attack' | 'defense'; readonly delta: number }
  | { readonly type: 'unlock_recipe'; readonly recipeId: RecipeId }
  | { readonly type: 'strengthening_chance_bonus'; readonly delta: number }
  | { readonly type: 'reveal_region'; readonly regionId: WorldRegionId }
  | { readonly type: 'commission_quality_bonus'; readonly delta: number }
  | { readonly type: 'fame_bonus'; readonly delta: number }

export interface SectFacilityLevelDefinition {
  readonly level: SectFacilityLevel
  readonly requiredChapter: number
  readonly cost: SectUpgradeCost
  readonly prerequisite?: { readonly facilityId: SectFacilityId; readonly level: SectFacilityLevel }
  readonly grantKey: string
  readonly effects: readonly Effect[]
  readonly benefits: readonly SectBenefit[]
}

export interface SectFacilityDefinition {
  readonly id: SectFacilityId
  readonly name: string
  readonly description: string
  readonly levels: readonly SectFacilityLevelDefinition[]
}

export interface SectUpgradeState {
  readonly sect: SectState
  readonly wealth: number
  readonly inventory: InventoryState
  readonly effectState: EffectState
}

export type SectUpgradeStatus =
  | 'upgraded'
  | 'already_upgraded'
  | 'sect_locked'
  | 'max_level'
  | 'chapter_locked'
  | 'prerequisite_locked'
  | 'insufficient_wealth'
  | 'insufficient_materials'
  | 'invalid_cost'

export interface SectUpgradeResult {
  readonly status: SectUpgradeStatus
  readonly state: SectUpgradeState
  readonly facilityId: SectFacilityId
  readonly targetLevel: SectFacilityLevel | null
  readonly grantKey?: string
  readonly effectResult?: EffectExecutionResult
  readonly message: string
}

export function createSectBenefits(): SectBenefits {
  return {
    combatAttackBonus: 0,
    combatDefenseBonus: 0,
    unlockedRecipeIds: [],
    strengtheningChanceBonus: 0,
    revealedRegionIds: [],
    commissionQualityBonus: 0,
    fameBonus: 0,
  }
}

export function createSectState(overrides: Partial<SectState> = {}): SectState {
  return {
    unlocked: false,
    facilities: { training: 0, kitchen: 0, forge: 0, intel: 0 },
    benefits: createSectBenefits(),
    claimedUpgradeGrantKeys: [],
    discipleIds: [],
    seenDiscipleDialogueIds: [],
    ...overrides,
  }
}
