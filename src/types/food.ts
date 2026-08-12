import type { ConditionContext } from './conditions'
import type { DomainEvent } from './events'
import type { InventoryState, ItemDefinition } from './item'
import type { ContentKey, ItemId } from './ids'

export type FoodStackingMode = 'replace' | 'extend' | 'ignore'

export interface FoodNegativeEffect {
  readonly id: string
  readonly turns: number
  readonly description: string
  readonly accuracyDelta?: number
  readonly qiCostMultiplier?: number
  readonly selfDamageRatio?: number
}

export interface FoodBuffDefinition {
  readonly id: string
  readonly foodItemId: ItemId | string
  readonly name: string
  readonly durationBattles: 1 | 2 | 3
  readonly stacking: FoodStackingMode
  readonly attackMultiplier?: number
  readonly defenseDelta?: number
  readonly accuracyDelta?: number
  readonly critDelta?: number
  readonly qiRecoveryDelta?: number
  readonly healingMultiplier?: number
  readonly immediateHeal?: number
  readonly negative?: FoodNegativeEffect
  readonly localExplanationKey?: ContentKey | string
}

export interface FoodBuffInstance {
  readonly buffId: string
  readonly remainingBattles: number
  readonly negativeTurns: number
}

export interface FoodBuffSnapshot {
  readonly version: 1
  readonly active: readonly FoodBuffInstance[]
  readonly battleTick: number
  readonly processedBattleEventIds: readonly string[]
  readonly processedActionIds: readonly string[]
}

export interface FoodBuffCatalog {
  readonly foods: readonly FoodBuffDefinition[]
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
}

export interface FoodConsumeRequest {
  readonly foodItemId: ItemId | string
  readonly inventory: InventoryState
  readonly currentHp: number
  readonly maxHp: number
  readonly conditionContext?: ConditionContext
  readonly actionId?: string
}

export type FoodConsumeStatus = 'consumed' | 'duplicate_action' | 'already_active' | 'missing_food' | 'invalid_hp'

export interface FoodConsumeResult {
  readonly status: FoodConsumeStatus
  readonly foodItemId: string
  readonly inventory: InventoryState
  readonly hp: number
  readonly state: FoodBuffSnapshot
  readonly events: readonly DomainEvent[]
  readonly explanation: string
  readonly message: string
  readonly actionId?: string
}

export interface FoodModifiers {
  readonly attackMultiplier: number
  readonly defenseDelta: number
  readonly accuracyDelta: number
  readonly critDelta: number
  readonly qiRecoveryDelta: number
  readonly healingMultiplier: number
  readonly negativeStatuses: readonly FoodNegativeEffect[]
}

export type FoodBattleAdvanceStatus = 'advanced' | 'duplicate_event' | 'ignored_event'

export interface FoodBattleAdvanceResult {
  readonly status: FoodBattleAdvanceStatus
  readonly state: FoodBuffSnapshot
  readonly message: string
}
