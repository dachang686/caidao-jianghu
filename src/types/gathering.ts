import type { ConditionContext, Condition } from './conditions'
import type { DomainEvent } from './events'
import type { InventoryState, ItemDefinition } from './item'
import type { ChapterId, GatheringNodeId, ItemId, LocationId } from './ids'

export type GatheringNodeMode = 'once' | 'repeat'

export interface GatheringReward {
  readonly itemId: ItemId | string
  readonly count: number
}

export interface GatheringNodeDefinition {
  readonly id: GatheringNodeId
  readonly chapterId: ChapterId
  readonly locationId: LocationId
  readonly label: string
  readonly description: string
  readonly mode: GatheringNodeMode
  readonly requiredChapter: number
  readonly availableFromBattleTick?: number
  readonly refreshEveryBattleTicks?: number
  readonly condition?: Condition
  readonly rewards: readonly GatheringReward[]
}

export interface GatheringCatalog {
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
}

export interface GatheringSnapshot {
  readonly version: 1
  readonly battleTick: number
  readonly collectedNodeIds: readonly GatheringNodeId[]
  readonly lastCollectedAtTick: Readonly<Record<string, number>>
  readonly processedBattleEventIds: readonly string[]
  readonly processedActionIds: readonly string[]
}

export interface GatheringCollectRequest {
  readonly nodeId: GatheringNodeId
  readonly locationId: LocationId
  readonly chapter: number
  readonly inventory: InventoryState
  readonly conditionContext?: ConditionContext
  readonly actionId?: string
}

export type GatheringCollectStatus =
  | 'collected'
  | 'duplicate_action'
  | 'already_collected'
  | 'wrong_location'
  | 'chapter_locked'
  | 'condition_locked'
  | 'refresh_pending'
  | 'inventory_full'

export interface GatheringCollectResult {
  readonly status: GatheringCollectStatus
  readonly nodeId: GatheringNodeId
  readonly inventory: InventoryState
  readonly state: GatheringSnapshot
  readonly rewards: readonly GatheringReward[]
  readonly events: readonly DomainEvent[]
  readonly message: string
  readonly actionId?: string
}

export type GatheringAdvanceStatus = 'advanced' | 'duplicate_event' | 'ignored_event'

export interface GatheringAdvanceResult {
  readonly status: GatheringAdvanceStatus
  readonly state: GatheringSnapshot
  readonly message: string
}
