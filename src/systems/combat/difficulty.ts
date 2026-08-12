import type { DifficultyLevel, EnemyStats } from '../../types/enemy'

export interface ResourceTolerance {
  readonly qiRecoveryMultiplier: number
  readonly healingMultiplier: number
  readonly retryRecoveryMultiplier: number
}

export interface DifficultyProfile {
  readonly level: DifficultyLevel
  readonly enemyStatMultiplier: number
  readonly enemyDamageMultiplier: number
  readonly enemyPostureMultiplier: number
  readonly resourceTolerance: ResourceTolerance
  /** 1 means the displayed intent is always truthful. */
  readonly intentHonesty: number
  /** Applied only to an explicitly configured Boss phase deception chance. */
  readonly deceptionMultiplier: number
}

const PROFILES: Readonly<Record<DifficultyLevel, DifficultyProfile>> = {
  story: {
    level: 'story',
    enemyStatMultiplier: 0.86,
    enemyDamageMultiplier: 0.86,
    enemyPostureMultiplier: 0.9,
    resourceTolerance: { qiRecoveryMultiplier: 1.25, healingMultiplier: 1.15, retryRecoveryMultiplier: 1 },
    intentHonesty: 1,
    deceptionMultiplier: 0,
  },
  standard: {
    level: 'standard',
    enemyStatMultiplier: 1,
    enemyDamageMultiplier: 1,
    enemyPostureMultiplier: 1,
    resourceTolerance: { qiRecoveryMultiplier: 1, healingMultiplier: 1, retryRecoveryMultiplier: 1 },
    intentHonesty: 0.9,
    deceptionMultiplier: 0.5,
  },
  expert: {
    level: 'expert',
    enemyStatMultiplier: 1.12,
    enemyDamageMultiplier: 1.12,
    enemyPostureMultiplier: 1.1,
    resourceTolerance: { qiRecoveryMultiplier: 0.85, healingMultiplier: 0.9, retryRecoveryMultiplier: 1 },
    intentHonesty: 0.7,
    deceptionMultiplier: 1,
  },
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}

export function getDifficultyProfile(level: DifficultyLevel): DifficultyProfile {
  return PROFILES[level]
}

export const getDifficultyModifiers = getDifficultyProfile

export function applyDifficultyToEnemyStats(stats: EnemyStats, level: DifficultyLevel): EnemyStats {
  const profile = getDifficultyProfile(level)
  return {
    ...stats,
    maxHp: Math.max(1, Math.round(stats.maxHp * profile.enemyStatMultiplier)),
    maxQi: Math.max(0, Math.round(stats.maxQi * profile.enemyStatMultiplier)),
    attack: Math.max(0, stats.attack * profile.enemyDamageMultiplier),
    defense: Math.max(0, stats.defense * profile.enemyStatMultiplier),
    posture: Math.max(1, stats.posture * profile.enemyPostureMultiplier),
  }
}

export const scaleEnemyStatsForDifficulty = applyDifficultyToEnemyStats

export function applyResourceTolerance<T extends { qiRecovery: number; healing: number; retryRecovery: number }>(
  resources: T,
  level: DifficultyLevel,
): T {
  const tolerance = getDifficultyProfile(level).resourceTolerance
  return {
    ...resources,
    qiRecovery: Math.max(0, resources.qiRecovery * tolerance.qiRecoveryMultiplier),
    healing: Math.max(0, resources.healing * tolerance.healingMultiplier),
    retryRecovery: Math.max(0, resources.retryRecovery * tolerance.retryRecoveryMultiplier),
  }
}

export function getIntentHonesty(level: DifficultyLevel): number {
  return getDifficultyProfile(level).intentHonesty
}

export function getEffectiveDeceptiveChance(
  baseChance: number,
  level: DifficultyLevel,
  isBossPhaseTwo: boolean,
): number {
  if (!isBossPhaseTwo) return 0
  const profile = getDifficultyProfile(level)
  return clamp(baseChance, 0, 0.2) * profile.deceptionMultiplier
}

export const resolveDeceptiveChance = getEffectiveDeceptiveChance

