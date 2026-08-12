import type { SkillId } from './ids'

export type SkillSchool = 'dao' | 'mouth' | 'survival' | 'misc'
export type SkillTarget = 'self' | 'enemy' | 'all_enemies'

export type SkillEffect =
  | { readonly type: 'damage'; readonly power: number; readonly posturePower?: number; readonly hits?: number; readonly variance?: number }
  | { readonly type: 'posture_damage'; readonly amount?: number; readonly power?: number }
  | { readonly type: 'heal'; readonly amount: number }
  | { readonly type: 'gain_qi'; readonly amount: number }
  | { readonly type: 'apply_status'; readonly statusId: string; readonly turns: number; readonly stacks?: number }
  | { readonly type: 'guard'; readonly ratio: number; readonly turns?: number }
  | { readonly type: 'self_damage'; readonly amount?: number; readonly maxHpRatio?: number }
  | { readonly type: 'clear_status'; readonly count?: number }
  | { readonly type: 'modify_qi_cost'; readonly amount: number; readonly turns: number }
  | { readonly type: 'modify_accuracy'; readonly delta: number; readonly turns: number }
  | { readonly type: 'grant_evasion'; readonly turns: number }

export interface SkillAiLimit {
  readonly allowedWhen?: string
  readonly forbiddenTargets?: readonly string[]
  readonly maxUsesPerTurn?: number
}

export interface SkillSafetyValve {
  readonly maxSelfDamageRatio?: number
  readonly minimumHpAfterSelfDamage?: number
  readonly maximumNegativeStatusTurns?: number
  readonly maximumHits?: number
  readonly grantsExtraTurns?: boolean
}

export interface SkillPreview {
  readonly summary: string
  readonly values: Readonly<Record<string, number | string>>
}

export interface SkillDefinition {
  readonly id: SkillId | string
  readonly name: string
  readonly description: string
  readonly school: SkillSchool
  readonly target: SkillTarget
  readonly qiCost: number
  readonly cooldown: number
  readonly effects: readonly SkillEffect[]
  readonly preview: SkillPreview
  readonly aiLimit?: SkillAiLimit
  readonly statusNotes?: readonly string[]
  readonly safety?: SkillSafetyValve
  readonly prerequisiteIds?: readonly (SkillId | string)[]
  readonly requiredLevel?: number
  readonly maxRank?: number
  readonly aiTags?: readonly string[]
}

export interface SkillProgressState {
  readonly level: number
  readonly earnedSkillPoints: number
  readonly spentSkillPoints: number
  readonly unlockedSkillIds: readonly string[]
  readonly ranks: Readonly<Record<string, number>>
  readonly loadout: readonly (string | null)[]
}

export interface SkillLoadoutValidation {
  readonly valid: boolean
  readonly errors: readonly string[]
}

export type PassiveSchool = SkillSchool
export type PassiveStat = 'maxHp' | 'maxQi' | 'attack' | 'defense' | 'posture' | 'accuracy' | 'dodge' | 'crit' | 'qiRecovery' | 'healingMultiplier' | 'damageWhenPostureBroken'
export type PassiveCondition = 'always' | 'low_hp' | 'posture_broken' | 'control_failed' | 'out_of_combat'

export interface PassiveEffect {
  readonly stat: PassiveStat
  readonly operation: 'add' | 'multiply'
  readonly value: number
  readonly condition?: PassiveCondition
}

export interface PassiveDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly school: PassiveSchool
  readonly effects: readonly PassiveEffect[]
  readonly preview: SkillPreview
  readonly prerequisiteIds?: readonly string[]
  readonly mutuallyExclusiveIds?: readonly string[]
}

export interface PassiveTreeState {
  readonly earnedSkillPoints: number
  readonly spentSkillPoints: number
  readonly unlockedPassiveIds: readonly string[]
}

export interface DerivedCombatStats {
  readonly maxHp: number
  readonly maxQi: number
  readonly attack: number
  readonly defense: number
  readonly posture: number
  readonly accuracy: number
  readonly dodge: number
  readonly crit: number
  readonly qiRecovery: number
  readonly healingMultiplier: number
  readonly damageWhenPostureBroken: number
}

export interface PassiveCalculationContext {
  readonly hpRatio?: number
  readonly postureBroken?: boolean
  readonly controlFailed?: boolean
  readonly outOfCombat?: boolean
}

export const MAX_PLAYER_LEVEL = 30
export const MAX_SKILL_SLOTS = 6
