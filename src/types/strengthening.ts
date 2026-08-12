export interface StrengtheningCost {
  readonly silver: number
  readonly materialId: string
  readonly materialCount: number
}

export interface StrengtheningStatDelta {
  readonly attack?: number
  readonly defense?: number
  readonly maxHp?: number
  readonly maxQi?: number
  readonly posture?: number
  readonly accuracy?: number
  readonly dodge?: number
  readonly crit?: number
}

export interface StrengtheningLevelConfig {
  readonly fromLevel: number
  readonly toLevel: number
  readonly cost: StrengtheningCost
  readonly successChance: number
  readonly statDelta: StrengtheningStatDelta
}

export interface StrengtheningState {
  readonly equipmentInstanceId: string
  readonly level: number
  readonly silver: number
  readonly materials: Readonly<Record<string, number>>
  readonly bonus: StrengtheningStatDelta
  readonly attemptCount: number
  readonly history: readonly StrengtheningAttempt[]
}

export interface StrengtheningAttempt {
  readonly key: string
  readonly fromLevel: number
  readonly toLevel: number
  readonly success: boolean
  readonly roll: number
  readonly cost: StrengtheningCost
}

export type StrengtheningOutcome = 'success' | 'failed' | 'capped' | 'insufficient_resources' | 'duplicate'

export interface StrengtheningResult {
  readonly key: string
  readonly outcome: StrengtheningOutcome
  readonly fromLevel: number
  readonly toLevel: number
  readonly roll: number
  readonly cost: StrengtheningCost | null
  readonly statDelta: StrengtheningStatDelta
}

