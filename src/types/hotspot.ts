import type { Condition } from './conditions'
import type { Effect } from './effects'
import type { EffectState } from './effects'
import type { DomainEvent } from './events'
import type { HotspotId, LocationId } from './ids'

/** 归一化到场景容器的坐标，避免把图片像素坐标写进内容。 */
export interface HotspotPlacement {
  readonly x: number
  readonly y: number
}

export interface HotspotLayout {
  readonly desktop: HotspotPlacement
  readonly mobile?: HotspotPlacement
}

export type HotspotActionMode = 'once' | 'repeat'

export interface HotspotDefinition {
  readonly id: HotspotId
  readonly locationId: LocationId
  readonly label: string
  readonly description: string
  readonly layout: HotspotLayout
  readonly keyboardOrder: number
  readonly mode: HotspotActionMode
  readonly conditions?: readonly Condition[]
  readonly effects: readonly Effect[]
  readonly lockedReason?: string
}

export interface HotspotState {
  readonly completedIds: readonly HotspotId[]
  readonly activationCounts: Readonly<Record<string, number>>
  readonly processedActionIds: readonly string[]
}

export interface ExplorationSnapshot {
  readonly version: 1
  readonly hotspots: HotspotState
  readonly effects: EffectState
}

export interface HotspotView {
  readonly definition: HotspotDefinition
  readonly available: boolean
  readonly completed: boolean
  readonly activationCount: number
  readonly lockedReason?: string
}

export type HotspotActivationStatus = 'activated' | 'locked' | 'already_completed' | 'duplicate_action'

export interface HotspotActivationResult {
  readonly status: HotspotActivationStatus
  readonly view: HotspotView
  readonly state: HotspotState
  readonly actionId?: string
  readonly effects: readonly Effect[]
  readonly events: readonly DomainEvent[]
}
