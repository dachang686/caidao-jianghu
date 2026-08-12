import type { FoodBuffDefinition } from '../../types/food'
import type { ItemDefinition } from '../../types/item'
import type { CookingRecipeDefinition, ForgeRecipeDefinition } from '../../types/recipe'
import { asChapterId, asContentKey, asItemId, asRecipeId } from '../../types/ids'
import { OPTIONAL_EQUIPMENT_MATERIALS } from '../items/equipment/optional'

const optionalMaterials = OPTIONAL_EQUIPMENT_MATERIALS.map((item) => item.id)

const optionalForgedNames = [
  '回锅刀胚', '藏风护额', '门派护心片', '无声靴底', '留影坠芯', '旁注册页',
  '暗潮钩胚', '潮痕冠片', '盐纹衣衬', '礁影鞋楦', '海眼珠芯', '听潮残页',
  '墨线刃胚', '档案压页片', '原卷衣扣', '京门鞋楦', '榜外坠芯', '可复核残页',
  '会场刀胚', '礼台冠片', '门派衣衬', '不抢先手靴', '四方印芯', '开宗短章',
] as const

const optionalFoodNames = [
  '沙参烤饼', '潮盐鱼卷', '墨香粥', '会场椒汤', '门派团圆锅', '复核凉面',
  '驿路干粮', '四系合味羹', '沙井蒸饼', '潮汐粥', '档案焖饭', '会场冷汤',
  '门人便当', '回头客拌面', '安全节点煲', '通关后甜汤',
] as const

export const OPTIONAL_FORGING_ITEMS: readonly ItemDefinition[] = optionalForgedNames.map((name, index) => ({
  id: asItemId(`item:optional-forged:${index + 1}`),
  name,
  description: '高级锻造中间产物，来源和消耗均可在离线内容中追踪。',
  category: 'material',
  maxStack: 20,
}))

export const OPTIONAL_FORGING_RECIPES: readonly ForgeRecipeDefinition[] = OPTIONAL_FORGING_ITEMS.map((item, index) => ({
  id: asRecipeId(`recipe:optional:forging:${index + 1}`),
  name: `${item.name}工艺`,
  description: `将通关后材料加工为${item.name}，不使用现实时间等待。`,
  chapterId: asChapterId(`ch0${Math.min(8, 5 + Math.floor(index / 6))}`),
  requiredChapter: Math.min(8, 5 + Math.floor(index / 6)),
  materials: [{ itemId: optionalMaterials[index % optionalMaterials.length]!, count: 2 }, { itemId: optionalMaterials[(index + 1) % optionalMaterials.length]!, count: 1 }],
  output: { itemId: item.id, count: 1 },
}))

export const OPTIONAL_COOKING_ITEMS: readonly ItemDefinition[] = optionalFoodNames.map((name, index) => ({
  id: asItemId(`item:optional-food:${index + 1}`),
  name,
  description: 'Optional 后期菜谱，增益持续 1–3 场战斗，负面效果可提前看到。',
  category: 'food',
  maxStack: 10,
}))

const optionalBuffs: readonly FoodBuffDefinition[] = OPTIONAL_COOKING_ITEMS.map((item, index) => ({
  id: `food:${item.id}`,
  foodItemId: item.id,
  name: item.name,
  durationBattles: (index % 3) + 1 as 1 | 2 | 3,
  stacking: index % 3 === 0 ? 'replace' : index % 3 === 1 ? 'extend' : 'ignore',
  attackMultiplier: index % 2 === 0 ? 1.08 : undefined,
  defenseDelta: index % 2 === 1 ? 3 : undefined,
  qiRecoveryDelta: index % 4 === 0 ? 2 : undefined,
  healingMultiplier: index % 4 === 1 ? 1.18 : undefined,
  critDelta: index % 4 === 2 ? 0.04 : undefined,
  negative: index === 3 ? { id: 'status:pepper-hiccup', turns: 1, description: '椒香打嗝：命中降低 8%，但不会致死。', accuracyDelta: -0.08 } : undefined,
  localExplanationKey: asContentKey(`food:optional:${index + 1}`),
}))

export const OPTIONAL_COOKING_RECIPES: readonly CookingRecipeDefinition[] = OPTIONAL_COOKING_ITEMS.map((item, index) => ({
  id: asRecipeId(`recipe:optional:cooking:${index + 1}`),
  name: `${item.name}菜谱`,
  description: `用后期材料制作${item.name}，效果和副作用在下锅前公开。`,
  chapterId: asChapterId(`ch0${Math.min(8, 5 + Math.floor(index / 4))}`),
  requiredChapter: Math.min(8, 5 + Math.floor(index / 4)),
  materials: [{ itemId: optionalMaterials[index % optionalMaterials.length]!, count: 1 }, { itemId: optionalMaterials[(index + 2) % optionalMaterials.length]!, count: 1 }],
  output: { itemId: item.id, count: 1, buff: optionalBuffs[index]! },
}))

export const OPTIONAL_COOKING_BUFFS = optionalBuffs
