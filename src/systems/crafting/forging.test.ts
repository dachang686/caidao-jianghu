import { describe, expect, it } from 'vitest'
import { addItem, createInventoryState } from '../inventory'
import type { EquipmentDefinition } from '../../types/equipment'
import type { ForgeRecipeDefinition } from '../../types/recipe'
import type { ItemDefinition } from '../../types/item'
import { asChapterId, asEquipmentId, asItemId, asRecipeId } from '../../types/ids'
import { ForgingEngine, validateForgingRecipes } from './forging'

const chapter = asChapterId('test-ch02')
const scrap = asItemId('item:test-scrap')
const output = asItemId('item:test-blade')
const equipmentId = asEquipmentId('equipment:test-blade')
const items: readonly ItemDefinition[] = [
  { id: scrap, name: '铁屑', description: '', category: 'material', maxStack: 10 },
  { id: output, name: '测试菜刀', description: '', category: 'weapon', maxStack: 1, unique: true },
]
const equipment: readonly EquipmentDefinition[] = [{ id: equipmentId, itemId: output, slot: 'weapon', name: '测试菜刀', description: '', modifiers: [] }]
const recipe: ForgeRecipeDefinition = {
  id: asRecipeId('recipe:test-blade'),
  name: '测试菜刀',
  description: '用铁屑打出一把测试菜刀。',
  chapterId: chapter,
  requiredChapter: 2,
  materials: [{ itemId: scrap, count: 1 }],
  output: { itemId: output, count: 1, equipmentId },
}

describe('forging engine', () => {
  it('校验配方数量、材料和装备引用', () => {
    const result = validateForgingRecipes([{ ...recipe, materials: [{ itemId: 'missing', count: 0 }] }], { itemIds: [String(scrap)], equipmentIds: [String(equipmentId)] })
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'missing_item')).toBe(true)
    expect(result.issues.some((issue) => issue.path.endsWith('.count'))).toBe(true)
  })

  it('材料不足、章节锁定和背包满均不扣料，成功提交才登记装备', () => {
    const engine = new ForgingEngine([recipe], { items, equipment })
    const base = createInventoryState(2)
    const insufficient = engine.craft({ recipeId: recipe.id, chapter: 2, inventory: base, equipmentIds: [], actionId: 'forge:insufficient' })
    expect(insufficient.status).toBe('insufficient_materials')

    const locked = engine.craft({ recipeId: recipe.id, chapter: 1, inventory: addItem(base, items[0]!, 2), equipmentIds: [], actionId: 'forge:locked' })
    expect(locked.status).toBe('chapter_locked')

    const full = addItem(addItem(createInventoryState(2), items[0]!, 2), { id: 'item:filler', name: '测试材料', description: '', category: 'material', maxStack: 1 })
    const blocked = engine.craft({ recipeId: recipe.id, chapter: 2, inventory: full, equipmentIds: [], actionId: 'forge:full' })
    expect(blocked.status).toBe('inventory_full')
    expect(blocked.inventory.stacks).toEqual(full.stacks)

    const crafted = engine.craft({ recipeId: recipe.id, chapter: 2, inventory: addItem(base, items[0]!, 2), equipmentIds: [], actionId: 'forge:success' })
    expect(crafted.status).toBe('crafted')
    expect(crafted.inventory.stacks).toEqual([{ itemId: String(scrap), count: 1 }, { itemId: String(output), count: 1 }])
    expect(crafted.equipmentIds).toEqual([String(equipmentId)])
  })

  it('稳定 actionId 防止重复提交，唯一产物不会重复制作', () => {
    const engine = new ForgingEngine([recipe], { items, equipment })
    const inventory = addItem(createInventoryState(3), items[0]!, 4)
    const first = engine.craft({ recipeId: recipe.id, chapter: 2, inventory, equipmentIds: [], actionId: 'forge:one' })
    expect(engine.craft({ recipeId: recipe.id, chapter: 2, inventory, equipmentIds: [], actionId: 'forge:one' }).status).toBe('duplicate_action')
    expect(engine.craft({ recipeId: recipe.id, chapter: 2, inventory: first.inventory, equipmentIds: first.equipmentIds, actionId: 'forge:two' }).status).toBe('unique_output_owned')
  })
})
