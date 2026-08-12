export interface PostgameDungeonEncounter {
  readonly id: string
  readonly title: string
  readonly enemyIds: readonly string[]
  readonly resourceCost: number
  readonly canExitAfter: boolean
}

export interface PostgameDungeonDefinition {
  readonly id: string
  readonly title: string
  readonly theme: string
  readonly discoveryClue: string
  readonly encounters: readonly PostgameDungeonEncounter[]
  readonly firstClearGrantKey: string
  readonly firstClearSummary: string
  readonly repeatRewardMultiplier: number
  readonly failurePolicy: 'preserve_core_and_equipment'
  readonly offlineSafe: true
}

export interface PostgameDungeonState {
  readonly unlocked: boolean
  readonly activeDungeonId: string | null
  readonly encounterIndex: number
  readonly checkpointIndex: number
  readonly completedDungeonIds: readonly string[]
  readonly claimedGrantKeys: readonly string[]
  readonly processedActionIds: readonly string[]
}

export type PostgameDungeonAdvanceStatus = 'started' | 'advanced' | 'completed' | 'defeat_checkpoint' | 'exited' | 'already_processed' | 'locked' | 'unknown_dungeon' | 'invalid_outcome'

export interface PostgameDungeonAdvanceResult {
  readonly status: PostgameDungeonAdvanceStatus
  readonly state: PostgameDungeonState
  readonly message: string
  readonly encounter?: PostgameDungeonEncounter
  readonly firstClear: boolean
}

