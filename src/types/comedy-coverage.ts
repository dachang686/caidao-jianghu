import type { Effect } from './effects'

export type ComedyCoverageLayer = 'rule' | 'situation' | 'interaction' | 'presentation'

/** Validator 用的统一审计元数据，不参与任何领域结算。 */
export interface ComedyCoverageDefinition {
  readonly id: string
  readonly layer: ComedyCoverageLayer
  readonly scale: 'major' | 'minor'
  readonly triggerEvent: string
  readonly cooldownGroup: string
  readonly firstCueId: string
  readonly repeatCueId: string
  readonly reducedMotionCueId: string
  readonly maxBlockingMs: number
  readonly required?: boolean
  readonly bossCue?: boolean
  readonly bossId?: string
  readonly previewStatKeys?: readonly string[]
  readonly effects?: readonly Effect[]
  readonly copy?: string
}

export interface ChapterComedyCoverage {
  readonly chapterId: string
  readonly entries: readonly ComedyCoverageDefinition[]
}

export interface CoreComedyMinimums {
  readonly rule: number
  readonly situation: number
  readonly interaction: number
  readonly presentation: number
}
