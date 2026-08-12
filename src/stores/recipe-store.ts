import { create } from 'zustand'
import { coreCookingItems, coreCookingRecipes } from '../content/recipes/cooking'
import { coreForgingEquipment, coreForgingItems, coreForgingRecipes } from '../content/recipes/forging'
import { useGameStore } from './root-store'
import { addItem, createInventoryState } from '../systems/inventory'
import { createCookingEngine } from '../systems/crafting/cooking'
import { createForgingEngine } from '../systems/crafting/forging'
import type { CookResult, CookingSnapshot, ForgeResult, ForgingSnapshot } from '../types/recipe'
import type { InventoryState, ItemDefinition } from '../types/item'

const allItems: readonly ItemDefinition[] = Array.from(new Map([...coreForgingItems, ...coreCookingItems].map((item) => [String(item.id), item])).values())
const workshopCounts: Readonly<Record<string, number>> = {
  'item:iron-scrap': 8,
  'item:tempered-steel': 2,
  'item:spirit-stone': 4,
  'item:herb': 6,
  'item:cloth': 4,
  'item:wood': 5,
  'item:jade': 2,
  'item:grain': 6,
  'item:spice': 6,
  'item:fish': 4,
}

function createWorkshopInventory(): InventoryState {
  let inventory = createInventoryState(24)
  Object.entries(workshopCounts).forEach(([itemId, count]) => {
    const item = allItems.find((candidate) => String(candidate.id) === itemId)
    if (item) inventory = addItem(inventory, item, count)
  })
  return inventory
}

const INITIAL_INVENTORY = createWorkshopInventory()
const INITIAL_FORGING_SNAPSHOT: ForgingSnapshot = { version: 1, craftedCounts: {}, processedActionIds: [] }
const INITIAL_COOKING_SNAPSHOT: CookingSnapshot = { version: 1, cookedCounts: {}, processedActionIds: [] }

export interface RecipeStore {
  readonly chapter: number
  readonly inventory: InventoryState
  readonly equipmentIds: readonly string[]
  readonly forgingSnapshot: ForgingSnapshot
  readonly cookingSnapshot: CookingSnapshot
  readonly statusMessage: string
  openCrafting: () => void
  openCooking: () => void
  close: () => void
  craft: (recipeId: string) => ForgeResult
  cook: (recipeId: string) => CookResult
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  chapter: 2,
  inventory: INITIAL_INVENTORY,
  equipmentIds: [],
  forgingSnapshot: INITIAL_FORGING_SNAPSHOT,
  cookingSnapshot: INITIAL_COOKING_SNAPSHOT,
  statusMessage: '材料来自当前工作台库存，成功制作后会原子更新。',
  openCrafting: () => { useGameStore.getState().setScreen('crafting') },
  openCooking: () => { useGameStore.getState().setScreen('cooking') },
  close: () => { useGameStore.getState().setScreen('jianghu') },
  craft: (recipeId) => {
    const current = get()
    const recipe = coreForgingRecipes.find((candidate) => String(candidate.id) === recipeId)
    if (!recipe) throw new Error(`未知锻造配方「${recipeId}」`)
    const engine = createForgingEngine(coreForgingRecipes, { items: allItems, equipment: coreForgingEquipment }, current.forgingSnapshot)
    const craftedCount = current.forgingSnapshot.craftedCounts[recipeId] ?? 0
    const result = engine.craft({ recipeId: recipe.id, chapter: current.chapter, inventory: current.inventory, equipmentIds: current.equipmentIds, actionId: `ui:forge:${recipeId}:${craftedCount + 1}` })
    set({ inventory: result.inventory, equipmentIds: result.equipmentIds, forgingSnapshot: result.state, statusMessage: result.message })
    return result
  },
  cook: (recipeId) => {
    const current = get()
    const recipe = coreCookingRecipes.find((candidate) => String(candidate.id) === recipeId)
    if (!recipe) throw new Error(`未知烹饪菜谱「${recipeId}」`)
    const engine = createCookingEngine(coreCookingRecipes, { items: allItems }, current.cookingSnapshot)
    const cookedCount = current.cookingSnapshot.cookedCounts[recipeId] ?? 0
    const result = engine.cook({ recipeId: recipe.id, chapter: current.chapter, inventory: current.inventory, actionId: `ui:cook:${recipeId}:${cookedCount + 1}` })
    set({ inventory: result.inventory, cookingSnapshot: result.state, statusMessage: result.message })
    return result
  },
}))

export { allItems as recipeItems }
