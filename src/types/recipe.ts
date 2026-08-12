import type { Condition, ConditionContext } from './conditions'
import type { DomainEvent } from './events'
import type { EquipmentDefinition } from './equipment'
import type { InventoryState, ItemDefinition } from './item'
import type { ChapterId, EquipmentId, ItemId, RecipeId } from './ids'
import type { FoodBuffDefinition } from './food'

export interface RecipeMaterial {
  readonly itemId: ItemId | string
  readonly count: number
}

export interface ForgeRecipeOutput {
  readonly itemId: ItemId | string
  readonly count: number
  readonly equipmentId?: EquipmentId | string
}

export interface ForgeRecipeDefinition {
  readonly id: RecipeId
  readonly name: string
  readonly description: string
  readonly chapterId: ChapterId
  readonly requiredChapter: number
  readonly unlockCondition?: Condition
  readonly lockedReason?: string
  readonly materials: readonly RecipeMaterial[]
  readonly output: ForgeRecipeOutput
}

export interface ForgingCatalog {
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
  readonly equipment?: readonly EquipmentDefinition[] | ReadonlyMap<string, EquipmentDefinition>
}

export interface ForgingSnapshot {
  readonly version: 1
  readonly craftedCounts: Readonly<Record<string, number>>
  readonly processedActionIds: readonly string[]
}

export interface ForgeRequest {
  readonly recipeId: RecipeId
  readonly chapter: number
  readonly inventory: InventoryState
  readonly equipmentIds: readonly string[]
  readonly unlockedRecipeIds?: readonly RecipeId[]
  readonly conditionContext?: ConditionContext
  readonly actionId?: string
}

export type ForgeStatus =
  | 'crafted'
  | 'duplicate_action'
  | 'chapter_locked'
  | 'condition_locked'
  | 'insufficient_materials'
  | 'inventory_full'
  | 'unique_output_owned'

export interface ForgeResult {
  readonly status: ForgeStatus
  readonly recipeId: RecipeId
  readonly inventory: InventoryState
  readonly equipmentIds: readonly string[]
  readonly state: ForgingSnapshot
  readonly output?: ForgeRecipeOutput
  readonly events: readonly DomainEvent[]
  readonly message: string
  readonly actionId?: string
}

export interface CookingRecipeOutput {
  readonly itemId: ItemId | string
  readonly count: number
  readonly buff: FoodBuffDefinition
}

export interface CookingRecipeDefinition {
  readonly id: RecipeId
  readonly name: string
  readonly description: string
  readonly chapterId: ChapterId
  readonly requiredChapter: number
  readonly unlockCondition?: Condition
  readonly lockedReason?: string
  readonly materials: readonly RecipeMaterial[]
  readonly output: CookingRecipeOutput
}

export interface CookingSnapshot {
  readonly version: 1
  readonly cookedCounts: Readonly<Record<string, number>>
  readonly processedActionIds: readonly string[]
}

export interface CookRequest {
  readonly recipeId: RecipeId
  readonly chapter: number
  readonly inventory: InventoryState
  readonly unlockedRecipeIds?: readonly RecipeId[]
  readonly conditionContext?: ConditionContext
  readonly actionId?: string
}

export type CookStatus = 'cooked' | 'duplicate_action' | 'chapter_locked' | 'condition_locked' | 'insufficient_materials' | 'inventory_full' | 'unique_output_owned'

export interface CookResult {
  readonly status: CookStatus
  readonly recipeId: RecipeId
  readonly inventory: InventoryState
  readonly state: CookingSnapshot
  readonly output?: CookingRecipeOutput
  readonly events: readonly DomainEvent[]
  readonly message: string
  readonly actionId?: string
}
