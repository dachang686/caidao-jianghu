import type { DeterministicRng, RngSnapshot } from '../systems/rng'
import type { InventoryState, ItemDefinition } from './item'

export type LootKind = 'silver' | 'material' | 'equipment' | 'quest_item'

export interface LootRewardBase {
  readonly kind: LootKind
  readonly firstRewardKey?: string
}

export interface SilverLootReward extends LootRewardBase {
  readonly kind: 'silver'
  readonly amount: number
}

export interface ItemLootReward extends LootRewardBase {
  readonly kind: 'material' | 'quest_item'
  readonly itemId: string
  readonly count: number
}

export interface EquipmentLootReward extends LootRewardBase {
  readonly kind: 'equipment'
  readonly equipmentId: string
  readonly itemId: string
  readonly count?: number
}

export type LootReward = SilverLootReward | ItemLootReward | EquipmentLootReward

export interface LootEntry {
  readonly reward: LootReward
  readonly weight?: number
}

export interface LootTable {
  readonly id: string
  readonly fixed?: readonly LootReward[]
  readonly weighted?: readonly LootEntry[]
  readonly rolls?: number
}

export interface LootRollOptions {
  readonly rng: DeterministicRng
  readonly claimedFirstRewardKeys?: readonly string[]
}

export interface LootRollResult {
  readonly tableId: string
  readonly rewards: readonly LootReward[]
  readonly rng: RngSnapshot
}

export interface PendingLoot {
  readonly reward: LootReward
  readonly reason: 'inventory_full' | 'unique_owned'
}

export interface EconomyState {
  readonly silver: number
  readonly inventory: InventoryState
  readonly equipmentIds: readonly string[]
  readonly claimedFirstRewardKeys: readonly string[]
  readonly pendingLoot: readonly PendingLoot[]
}

export interface LootGrantResult {
  readonly state: EconomyState
  readonly granted: readonly LootReward[]
  readonly pending: readonly PendingLoot[]
}

export interface EconomyStageProfile {
  readonly chapterOrder: number
  readonly buyPriceMultiplier: number
  readonly sellPriceMultiplier: number
  readonly rewardMultiplier: number
}

export interface MarketItem {
  readonly itemId: string
  readonly basePrice: number
  readonly item: ItemDefinition
}

export interface MarketQuote {
  readonly itemId: string
  readonly quantity: number
  readonly buyPrice: number
  readonly sellPrice: number
}

