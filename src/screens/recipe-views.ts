import { getItemCount } from '../systems/inventory'
import type { InventoryState, ItemDefinition } from '../types/item'
import type { CookingRecipeDefinition, ForgeRecipeDefinition } from '../types/recipe'
import type { RecipeView } from '../components/recipes'
import type { EquipmentDefinition } from '../types/equipment'

function item(items: readonly ItemDefinition[], id: string): ItemDefinition | undefined {
  return items.find((candidate) => String(candidate.id) === id)
}

function materials(items: readonly ItemDefinition[], inventory: InventoryState, recipe: ForgeRecipeDefinition | CookingRecipeDefinition) {
  return recipe.materials.map((material) => {
    const id = String(material.itemId)
    return { id, name: item(items, id)?.name ?? id, required: material.count, owned: getItemCount(inventory, id) }
  })
}

function unlock(chapter: number, requiredChapter: number): Pick<RecipeView, 'unlocked' | 'unlockReason'> {
  return chapter >= requiredChapter ? { unlocked: true } : { unlocked: false, unlockReason: `第 ${requiredChapter} 章后解锁，当前为第 ${chapter} 章。` }
}

export function toForgingRecipeViews(recipes: readonly ForgeRecipeDefinition[], items: readonly ItemDefinition[], equipment: readonly EquipmentDefinition[], inventory: InventoryState, chapter: number): readonly RecipeView[] {
  return recipes.map((recipe) => {
    const outputId = String(recipe.output.itemId)
    const output = item(items, outputId)
    const equipmentDefinition = recipe.output.equipmentId ? equipment.find((candidate) => String(candidate.id) === String(recipe.output.equipmentId)) : undefined
    return {
      id: String(recipe.id),
      name: recipe.name,
      description: recipe.description,
      ...unlock(chapter, recipe.requiredChapter),
      materials: materials(items, inventory, recipe),
      outputName: `${output?.name ?? outputId} ×${recipe.output.count}`,
      outputDescription: output?.description ?? '产物说明暂缺。',
      outputUse: equipmentDefinition?.description ?? '作为材料或经济物品使用。',
    }
  })
}

const stackingLabels = { replace: '替换同类效果', extend: '延长同类效果', ignore: '同类效果存在时忽略本次' } as const

export function toCookingRecipeViews(recipes: readonly CookingRecipeDefinition[], items: readonly ItemDefinition[], inventory: InventoryState, chapter: number): readonly RecipeView[] {
  return recipes.map((recipe) => {
    const outputId = String(recipe.output.itemId)
    const output = item(items, outputId)
    const buff = recipe.output.buff
    const negative = buff.negative ? `负面「${buff.negative.description}」最多 ${buff.negative.turns} 回合，自伤不会让生命低于 1。` : '没有额外负面状态。'
    return {
      id: String(recipe.id),
      name: recipe.name,
      description: recipe.description,
      ...unlock(chapter, recipe.requiredChapter),
      materials: materials(items, inventory, recipe),
      outputName: `${output?.name ?? outputId} ×${recipe.output.count}`,
      outputDescription: output?.description ?? '食物说明暂缺。',
      outputUse: `食用后持续 ${buff.durationBattles} 场战斗，${stackingLabels[buff.stacking]}。`,
      effectSummary: `${negative}${buff.immediateHeal ? ` 即时回复 ${buff.immediateHeal} 点生命。` : ''}`,
    }
  })
}
