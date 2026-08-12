/**
 * The simulator's safety thresholds are production configuration, not test
 * fixtures. Tests and chapter reports may pass a narrower copy when they need
 * to exercise a particular alarm.
 */
export interface SimulationThresholds {
  /** A battle that reaches this limit is terminated as a timeout. */
  readonly maxRounds: number
  /** A completed battle at or above this length is reported as long. */
  readonly longBattleRounds: number
  /** Protects the CLI and CI from accidentally expanding a seed range forever. */
  readonly maxSeeds: number
}

export const DEFAULT_SIMULATION_THRESHOLDS: Readonly<SimulationThresholds> = Object.freeze({
  maxRounds: 60,
  longBattleRounds: 40,
  maxSeeds: 100_000,
})
