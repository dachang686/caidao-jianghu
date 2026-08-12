import type { EquipmentDefinition } from '../../../types/equipment'
import type { ForgeRecipeDefinition } from '../../../types/recipe'
import type { ItemDefinition } from '../../../types/item'
import { asChapterId, asEquipmentId, asItemId, asRecipeId } from '../../../types/ids'

const slots: readonly EquipmentDefinition['slot'][] = ['weapon', 'head', 'body', 'feet', 'accessory', 'manual']
const names = ['秘境回锅刀', '藏风头巾', '门人护心衣', '无声踏云靴', '证据留影坠', '四系旁注册', '暗潮钩刀', '潮痕听冠', '盐纹短褂', '礁影回身履', '海眼定心珠', '听潮残篇', '墨线裁字刃', '档案压页帽', '原卷护身袍', '京门不惊靴', '榜外留名坠', '可复核刀谱', '会场定音刀', '礼台冠带', '门派遮雨衣', '不抢先手鞋', '四方印信坠', '开宗短章', '旧 Boss 复盘刃', '复盘头牌', '门派试炼衣', '收束步履', '结算留痕坠', '通关后手册', '离线备忘刀', '不掉线斗篷'] as const
const sources = ['hidden-boss', 'postgame-dungeon', 'sect', 'advanced-forging'] as const
const sourceLabels = { 'hidden-boss': '隐藏 Boss 首胜', 'postgame-dungeon': '通关后秘境', sect: '门派经营', 'advanced-forging': '高级锻造' } as const
const modifierStats = ['attack', 'defense', 'maxHp', 'dodge', 'crit', 'maxQi'] as const
const materialIds = ['item:optional-rare-ore', 'item:optional-ink', 'item:optional-shell', 'item:optional-pepper'] as const

const upgradeCurve = [
  { level: 0, statDelta: {} },
  { level: 1, statDelta: { attack: 3, defense: 1 } },
  { level: 2, statDelta: { maxQi: 3, posture: 2 } },
  { level: 3, statDelta: { maxHp: 8 } },
  { level: 4, statDelta: { attack: 3, defense: 2 } },
  { level: 5, statDelta: { crit: 0.02, dodge: 0.01 } },
] as const

function equipmentAt(index: number): EquipmentDefinition {
  const chapter = 5 + Math.floor(index / 8)
  const slot = slots[index % slots.length]!
  const sourceKind = sources[index % sources.length]!
  const id = `equipment:optional:${index + 1}`
  const itemId = `item:optional-equipment:${index + 1}`
  const stat = modifierStats[index % modifierStats.length]!
  const secondary = modifierStats[(index + 2) % modifierStats.length]!
  const price = 320 + index * 18
  return {
    id: asEquipmentId(id),
    itemId: asItemId(itemId),
    slot,
    name: names[index]!,
    description: `${names[index]}：${sourceLabels[sourceKind]}可得，给后期构筑一个明确但不唯一的换装理由。`,
    modifiers: [{ stat, operation: 'add', value: stat === 'crit' || stat === 'dodge' ? 0.03 : 8 }, { stat: secondary, operation: 'add', value: secondary === 'crit' || secondary === 'dodge' ? 0.015 : 3 }],
    unique: true,
    chapter,
    stage: `ch0${chapter}`,
    price,
    sellPrice: Math.floor(price * 0.45),
    sources: [{ kind: sourceKind === 'hidden-boss' ? 'loot' : sourceKind === 'postgame-dungeon' ? 'commission' : sourceKind === 'sect' ? 'quest' : 'forging', id: `source:optional:${sourceKind}:${index + 1}`, label: sourceLabels[sourceKind] }],
    upgradeCurve,
    protectable: true,
    buildTags: [`optional:${sourceKind}`, `slot:${slot}`, index % 2 === 0 ? '爆发' : '续航'],
  }
}

export const OPTIONAL_EQUIPMENT: readonly EquipmentDefinition[] = Array.from({ length: 32 }, (_, index) => equipmentAt(index))
export const OPTIONAL_EQUIPMENT_ITEMS: readonly ItemDefinition[] = OPTIONAL_EQUIPMENT.map((definition) => ({ id: definition.itemId, name: definition.name, description: definition.description, category: 'weapon', maxStack: 1, unique: true, tags: ['optional', 'equipment', definition.stage ?? 'postgame', `slot:${definition.slot}`, ...(definition.buildTags ?? [])] }))
export const OPTIONAL_EQUIPMENT_MATERIALS: readonly ItemDefinition[] = materialIds.map((id, index) => ({ id: asItemId(id), name: ['稀有矿', '封存墨', '潮壳', '会场椒'][index]!, description: 'Optional 内容使用的可追踪材料，不依赖现实时间。', category: 'material', maxStack: 40 }))
export const OPTIONAL_EQUIPMENT_FORGING_RECIPES: readonly ForgeRecipeDefinition[] = OPTIONAL_EQUIPMENT.map((definition, index) => {
  const chapter = definition.chapter ?? 5
  return {
    id: asRecipeId(`recipe:optional:equipment:${index + 1}`),
    name: `${definition.name}高级锻造图`,
    description: `用通关后材料制作${definition.name}，失败不清除主线或已拥有装备。`,
    chapterId: asChapterId(`ch0${chapter}`),
    requiredChapter: chapter,
    materials: [{ itemId: materialIds[index % materialIds.length]!, count: 2 }, { itemId: materialIds[(index + 1) % materialIds.length]!, count: 1 }],
    output: { itemId: definition.itemId, count: 1, equipmentId: definition.id },
  }
})

