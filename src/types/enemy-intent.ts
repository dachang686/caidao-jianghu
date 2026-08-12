export type EnemyIntentKind = 'aggressive' | 'charge' | 'defend' | 'special'

export interface EnemyIntent {
  readonly id: string
  readonly kind: EnemyIntentKind
  readonly label: string
  readonly summary: string
  readonly expectedDamage: number
  readonly expectedPostureDamage: number
  readonly guardRatio: number
  readonly honest: boolean
  readonly deceptiveChance?: number
}

export interface EnemyIntentUiSummary {
  readonly id: string
  readonly kind: EnemyIntentKind
  readonly label: string
  readonly summary: string
  readonly expectedDamage: number
  readonly expectedPostureDamage: number
  readonly guardRatio: number
  readonly honest: boolean
}
