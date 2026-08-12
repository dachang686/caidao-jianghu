import type { ItemId } from './ids'

export type ItemCategory = 'weapon' | 'consumable' | 'quest' | 'material' | 'food'

export interface ItemDefinition {
  readonly id: ItemId | string
  readonly name: string
  readonly description: string
  readonly category: ItemCategory
  readonly maxStack: number
  readonly unique?: boolean
  readonly keyItem?: boolean
  readonly tags?: readonly string[]
}

export interface ItemStack {
  readonly itemId: string
  readonly count: number
}

export interface InventoryState {
  readonly capacity: number
  readonly stacks: readonly ItemStack[]
  readonly protectedItemIds: readonly string[]
}

export interface ItemCatalog {
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
}

