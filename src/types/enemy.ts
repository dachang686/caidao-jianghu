import type { EnemyId } from './ids'
import type { EnemyIntentKind } from './enemy-intent'

export type EnemyBehaviorTemplateId = string
export type EnemyMoveId = string

export type DifficultyLevel = 'story' | 'standard' | 'expert'

export interface EnemyStats {
  readonly maxHp: number
  readonly maxQi: number
  readonly attack: number
  readonly defense: number
  readonly posture: number
  readonly accuracy: number
  readonly dodge: number
  readonly crit: number
}

export interface EnemyCurveValue {
  readonly base: number
  /** Prefer growth for readable content; perLevel is kept as a serializable alias. */
  readonly growth?: number
  readonly perLevel?: number
  readonly min?: number
  readonly max?: number
}

export interface EnemyStatCurve {
  readonly maxHp: EnemyCurveValue
  readonly maxQi: EnemyCurveValue
  readonly attack: EnemyCurveValue
  readonly defense: EnemyCurveValue
  readonly posture: EnemyCurveValue
  readonly accuracy?: EnemyCurveValue
  readonly dodge?: EnemyCurveValue
  readonly crit?: EnemyCurveValue
}

export interface EnemyMoveDefinition {
  readonly id: EnemyMoveId
  readonly name: string
  readonly kind: EnemyIntentKind
  readonly summary: string
  readonly weight?: number
  readonly power?: number
  readonly posturePower?: number
  readonly guardRatio?: number
  readonly qiCost?: number
  readonly cooldown?: number
  readonly chargeTurns?: number
}

export interface EnemyBehaviorTemplate {
  readonly id: EnemyBehaviorTemplateId
  readonly name: string
  readonly moveIds: readonly EnemyMoveId[]
  readonly fallbackMoveId?: EnemyMoveId
  readonly tags?: readonly string[]
}

export interface CoreEnemyBehaviorTemplate extends EnemyBehaviorTemplate {
  readonly description: string
  readonly readableIntent: boolean
  readonly resourcePressure: readonly string[]
}

export interface CoreEnemyVariant {
  readonly id: string
  readonly chapterId: string
  readonly role: 'normal'
  readonly name: string
  readonly templateId: string
  readonly moveSet: readonly string[]
  readonly statProfile: Pick<EnemyStats, 'maxHp' | 'attack' | 'defense' | 'posture'>
  readonly readableIntent: boolean
  readonly encounterIds: readonly string[]
  readonly commissionIds: readonly string[]
  readonly tags: readonly string[]
}

export interface CoreEnemyEncounterTable {
  readonly id: string
  readonly chapterId: string
  readonly enemyIds: readonly string[]
  readonly contextTags: readonly string[]
}

export interface BossPhaseDefinition {
  readonly id: string
  readonly phase: number
  /** Enter this phase when current HP is at or below this fraction of max HP. */
  readonly hpThresholdRatio?: number
  readonly hpThreshold?: number
  readonly moveIds?: readonly EnemyMoveId[]
  readonly deceptiveChance?: number
}

export interface BossDefinition {
  readonly phases: readonly BossPhaseDefinition[]
}

export interface CombatEnemyDefinition {
  readonly id: EnemyId | string
  readonly name: string
  readonly behavior: EnemyBehaviorTemplate
  readonly moves: readonly EnemyMoveDefinition[]
  readonly curve: EnemyStatCurve
  readonly boss?: BossDefinition
}

export interface BossPhaseState {
  readonly phase: number
  readonly transitionedPhaseIds: readonly string[]
  readonly lastObservedHp: number
  readonly outcome: 'active' | 'victory'
}

export interface BossPhaseTransition {
  readonly state: BossPhaseState
  readonly changed: boolean
  readonly fromPhase: number
  readonly toPhase: number
  readonly transitionId?: string
}
