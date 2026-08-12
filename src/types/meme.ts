import type { MemeDensity } from './text-provider'

export type MemeCategory = 'workplace' | 'delivery' | 'livestream' | 'hotlist' | 'social' | 'emotion' | 'jianghu'

export interface MemeDefinition {
  readonly id: string
  readonly category: MemeCategory
  readonly triggerEvent: string
  readonly text: string
  readonly minDensity: MemeDensity
  readonly cooldownGroup: string
  readonly cooldownTicks?: number
  readonly requiredTags?: readonly string[]
  /** Modern mapping is declared for ratio review, not shown as a real-world brand. */
  readonly modernMapping?: string
}

export interface MemeSelectionContext {
  readonly density: MemeDensity
  readonly tags?: readonly string[]
  readonly tick: number
  readonly actionId: string
  readonly rngState: number
}

export type MemeSelectionStatus = 'selected' | 'none' | 'missing_tags' | 'cooldown' | 'duplicate_event'

export interface MemeSelection {
  readonly status: MemeSelectionStatus
  readonly memeId: string | null
  readonly text: string | null
  readonly repeat: boolean
  readonly rngState: number
  readonly state: MemeDirectorSnapshot
  readonly message: string
}

export interface MemeDirectorSnapshot {
  readonly version: 1
  readonly consumedByGroup: Readonly<Record<string, readonly string[]>>
  readonly cooldowns: Readonly<Record<string, number>>
  readonly processedEventIds: readonly string[]
}

export interface MemeValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'missing_cooldown' | 'sensitive_text' | 'modern_ratio'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface MemeValidationResult {
  readonly valid: boolean
  readonly issues: readonly MemeValidationIssue[]
}
