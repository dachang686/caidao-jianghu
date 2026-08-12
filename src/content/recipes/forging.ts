import type { EquipmentDefinition } from '../../types/equipment'
import type { ForgeRecipeDefinition } from '../../types/recipe'
import type { ItemDefinition } from '../../types/item'
import { asChapterId, asItemId, asRecipeId } from '../../types/ids'
import {
  CORE_EARLY_EQUIPMENT,
  CORE_EARLY_EQUIPMENT_ITEMS,
  CORE_EARLY_FORGING_RECIPES,
  CORE_LATE_EQUIPMENT,
  CORE_LATE_EQUIPMENT_ITEMS,
  CORE_LATE_FORGING_RECIPES,
} from '../items/equipment'

const ch02 = asChapterId('ch02')
const ch04 = asChapterId('ch04')
const ironScrap = asItemId('item:iron-scrap')
const temperedSteel = asItemId('item:tempered-steel')
const spiritStone = asItemId('item:spirit-stone')
const herb = asItemId('item:herb')
const wood = asItemId('item:wood')

const materialItems: readonly ItemDefinition[] = [
  { id: ironScrap, name: '铁屑', description: '可回炉的基础锻造材料。', category: 'material', maxStack: 20 },
  { id: spiritStone, name: '灵石', description: '带着一点不肯解释的光。', category: 'material', maxStack: 20 },
  { id: herb, name: '止血草', description: '山路边的常见药草。', category: 'material', maxStack: 20 },
  { id: 'item:cloth', name: '粗布', description: '能包东西，也能包住一点体面。', category: 'material', maxStack: 20 },
  { id: wood, name: '硬木', description: '适合做柄，或者做不太硬的道理。', category: 'material', maxStack: 20 },
  { id: 'item:jade', name: '温玉', description: '摸起来比银两更有温度。', category: 'material', maxStack: 20 },
  { id: temperedSteel, name: '淬火钢', description: '给武器强化用的硬材料。', category: 'material', maxStack: 20 },
  { id: 'item:spirit-stone-powder', name: '灵石粉', description: '灵石磨成粉，效果没有磨损。', category: 'material', maxStack: 20 },
  { id: 'item:edge-whetstone', name: '磨刀石', description: '让菜刀重新想起锋利这件事。', category: 'material', maxStack: 20 },
]

const lateMaterialItems: readonly ItemDefinition[] = [
  { id: 'item:western-sand-herb', name: '西域沙参', description: '后期锻造的耐旱材料。', category: 'material', maxStack: 20 },
  { id: 'item:donghai-sea-salt', name: '东海盐晶', description: '后期锻造的潮汐材料。', category: 'material', maxStack: 20 },
  { id: 'item:capital-ink', name: '京城墨锭', description: '后期锻造的文书材料。', category: 'material', maxStack: 20 },
  { id: 'item:convention-pepper', name: '会场椒香', description: '后期锻造的调味材料。', category: 'material', maxStack: 20 },
]

export const coreForgingItems: readonly ItemDefinition[] = [
  ...materialItems,
  ...lateMaterialItems,
  ...CORE_EARLY_EQUIPMENT_ITEMS,
  ...CORE_LATE_EQUIPMENT_ITEMS,
]

export const coreForgingEquipment: readonly EquipmentDefinition[] = [...CORE_EARLY_EQUIPMENT, ...CORE_LATE_EQUIPMENT]

const materialRecipe = (id: string, name: string, description: string, chapterId: ReturnType<typeof asChapterId>, requiredChapter: number, materials: ForgeRecipeDefinition['materials'], itemId: string, count: number): ForgeRecipeDefinition => ({
  id: asRecipeId(id),
  name,
  description,
  chapterId,
  requiredChapter,
  materials,
  output: { itemId, count },
})

export const coreForgingRecipes: readonly ForgeRecipeDefinition[] = [
  materialRecipe('recipe:tempered-steel', '淬火钢', '给强化台准备更像样的材料。', ch02, 2, [{ itemId: ironScrap, count: 5 }, { itemId: spiritStone, count: 1 }], temperedSteel, 2),
  materialRecipe('recipe:spirit-stone-powder', '灵石粉', '把灵石磨成粉，至少没有磨掉灵气。', ch04, 4, [{ itemId: spiritStone, count: 2 }, { itemId: herb, count: 2 }], 'item:spirit-stone-powder', 2),
  materialRecipe('recipe:edge-whetstone', '磨刀石', '磨刀不误砍柴工，尤其是柴还没找到的时候。', ch02, 2, [{ itemId: ironScrap, count: 2 }, { itemId: wood, count: 1 }], 'item:edge-whetstone', 3),
  ...CORE_EARLY_FORGING_RECIPES,
  ...CORE_LATE_FORGING_RECIPES,
]

export const FORGING_RECIPES = coreForgingRecipes
