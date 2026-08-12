import { describe, expect, it } from 'vitest'
import { addItem, createInventoryState, getItemCount } from '../inventory'
import { asChapterId, asItemId, asRecipeId } from '../../types/ids'
import type { ItemDefinition } from '../../types/item'
import type { CookingRecipeDefinition } from '../../types/recipe'
import { CookingEngine, validateCookingRecipes } from './cooking'

const chapter = asChapterId('test-ch02')
const grain = asItemId('item:test-grain')
const cookedFood = asItemId('item:test-food')
const items: readonly ItemDefinition[] = [
  { id: grain, name: '测试粮食', description: '', category: 'material', maxStack: 10 },
  { id: cookedFood, name: '测试菜', description: '', category: 'food', maxStack: 5 },
]
const recipe: CookingRecipeDefinition = {
  id: asRecipeId('recipe:test-food'),
  name: '测试菜',
  description: '把粮食做成一份测试菜。',
  chapterId: chapter,
  requiredChapter: 2,
  materials: [{ itemId: grain, count: 1 }],
  output: {
    itemId: cookedFood,
    count: 1,
    buff: { id: 'buff:test-food', foodItemId: cookedFood, name: '测试菜效果', durationBattles: 1, stacking: 'replace' },
  },
}

describe('cooking engine', () => {
  it('校验菜谱产物与食物 Buff 绑定，拒绝产物作为自身材料', () => {
    const result = validateCookingRecipes([{ ...recipe, materials: [{ itemId: cookedFood, count: 1 }] }], { itemIds: items.map((item) => String(item.id)) })
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'invalid_value')).toBe(true)
  })

  it('章节锁定、材料不足和背包满均不扣料，成功烹饪才添加食物', () => {
    const engine = new CookingEngine([recipe], { items })
    const empty = createInventoryState(1)
    expect(engine.cook({ recipeId: recipe.id, chapter: 1, inventory: empty, actionId: 'cook:locked' }).status).toBe('chapter_locked')
    expect(engine.cook({ recipeId: recipe.id, chapter: 2, inventory: empty, actionId: 'cook:missing' }).status).toBe('insufficient_materials')

    const full = addItem(empty, items[0]!, 2)
    const blocked = engine.cook({ recipeId: recipe.id, chapter: 2, inventory: full, actionId: 'cook:full' })
    expect(blocked.status).toBe('inventory_full')
    expect(blocked.inventory.stacks).toEqual(full.stacks)

    const cooked = engine.cook({ recipeId: recipe.id, chapter: 2, inventory: addItem(empty, items[0]!, 1), actionId: 'cook:success' })
    expect(cooked.status).toBe('cooked')
    expect(getItemCount(cooked.inventory, String(cookedFood))).toBe(1)
    expect(getItemCount(cooked.inventory, String(grain))).toBe(0)
  })

  it('稳定 actionId 防止重复提交', () => {
    const engine = new CookingEngine([recipe], { items })
    const inventory = addItem(createInventoryState(2), items[0]!, 2)
    const first = engine.cook({ recipeId: recipe.id, chapter: 2, inventory, actionId: 'cook:one' })
    expect(first.status).toBe('cooked')
    expect(engine.cook({ recipeId: recipe.id, chapter: 2, inventory, actionId: 'cook:one' }).status).toBe('duplicate_action')
  })
})
