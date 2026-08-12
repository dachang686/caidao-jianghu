import type { EquipmentDefinition, EquipmentSourceKind } from '../../../types/equipment'
import type { ForgeRecipeDefinition } from '../../../types/recipe'
import type { ItemDefinition } from '../../../types/item'
import { asChapterId, asEquipmentId, asItemId, asRecipeId } from '../../../types/ids'

const materialsByChapter: Record<number, readonly { itemId: string; count: number }[]> = {
  1: [{ itemId: 'item:wood', count: 1 }, { itemId: 'item:cloth', count: 1 }],
  2: [{ itemId: 'item:iron-scrap', count: 2 }, { itemId: 'item:herb', count: 1 }],
  3: [{ itemId: 'item:tempered-steel', count: 1 }, { itemId: 'item:spirit-stone', count: 1 }],
  4: [{ itemId: 'item:jade', count: 1 }, { itemId: 'item:spirit-stone-powder', count: 1 }],
}

const CORE_UPGRADE_CURVE = [
  { level: 0, statDelta: {} },
  { level: 1, statDelta: { attack: 2, defense: 1 } },
  { level: 2, statDelta: { attack: 2, posture: 1 } },
  { level: 3, statDelta: { maxHp: 5, maxQi: 2 } },
  { level: 4, statDelta: { attack: 3, defense: 2 } },
  { level: 5, statDelta: { crit: 0.02, dodge: 0.01 } },
] as const

function equipment(
  id: string,
  itemId: string,
  slot: EquipmentDefinition['slot'],
  name: string,
  chapter: number,
  price: number,
  modifiers: EquipmentDefinition['modifiers'],
  buildTags: readonly string[],
  sourceKind: EquipmentSourceKind,
): EquipmentDefinition {
  const stage = `ch0${chapter}`
  return {
    id: asEquipmentId(id),
    itemId: asItemId(itemId),
    slot,
    name,
    description: `${name}：第${chapter}章可获得，适合${buildTags.join('、')}构筑。`,
    modifiers,
    unique: true,
    chapter,
    stage,
    price,
    sellPrice: Math.floor(price * 0.45),
    sources: [{ kind: sourceKind, id: `source:${stage}:${id.replace('equipment:', '')}`, label: sourceKind === 'vendor' ? '区域商店' : sourceKind === 'loot' ? '章节掉落' : sourceKind === 'quest' ? '任务首奖' : '铁匠铺锻造' }],
    upgradeCurve: CORE_UPGRADE_CURVE,
    protectable: true,
    buildTags,
  }
}

function item(definition: EquipmentDefinition): ItemDefinition {
  return {
    id: definition.itemId,
    name: definition.name,
    description: definition.description,
    category: 'weapon',
    maxStack: 1,
    unique: true,
    tags: ['core', 'equipment', definition.stage ?? 'early', `slot:${definition.slot}`, ...(definition.buildTags ?? [])],
  }
}

const earlyEquipment: readonly EquipmentDefinition[] = [
  equipment('equipment:village-cleaver', 'item:village-cleaver', 'weapon', '村口短菜刀', 1, 42, [{ stat: 'attack', operation: 'add', value: 2 }], ['稳健', '基础刀法'], 'vendor'),
  equipment('equipment:cloth-cap', 'item:cloth-cap', 'head', '粗布头巾', 1, 28, [{ stat: 'defense', operation: 'add', value: 1 }, { stat: 'maxHp', operation: 'add', value: 3 }], ['耐打'], 'vendor'),
  equipment('equipment:patched-apron', 'item:patched-apron', 'body', '补丁围裙', 1, 36, [{ stat: 'defense', operation: 'add', value: 2 }], ['耐打', '后厨'], 'vendor'),
  equipment('equipment:straw-sandals', 'item:straw-sandals', 'feet', '草绳凉鞋', 1, 30, [{ stat: 'dodge', operation: 'add', value: 0.02 }], ['灵活'], 'vendor'),
  equipment('equipment:pepper-bead', 'item:pepper-bead', 'accessory', '胡椒念珠', 1, 34, [{ stat: 'crit', operation: 'add', value: 0.01 }], ['暴击', '调味'], 'vendor'),
  equipment('equipment:pantry-manual', 'item:pantry-manual', 'manual', '后厨吐纳页', 1, 40, [{ stat: 'maxQi', operation: 'add', value: 3 }, { stat: 'qiRecovery', operation: 'add', value: 1 }], ['内力'], 'quest'),

  equipment('equipment:iron-cleaver', 'item:iron-cleaver', 'weapon', '回炉菜刀', 2, 70, [{ stat: 'attack', operation: 'add', value: 3 }], ['稳健', '基础刀法'], 'forging'),
  equipment('equipment:bamboo-head', 'item:bamboo-head', 'head', '竹节头冠', 2, 54, [{ stat: 'defense', operation: 'add', value: 2 }], ['闪避', '轻装'], 'forging'),
  equipment('equipment:traveler-coat', 'item:traveler-coat', 'body', '走江湖短褂', 2, 66, [{ stat: 'defense', operation: 'add', value: 3 }, { stat: 'maxQi', operation: 'add', value: 4 }], ['内力', '耐打'], 'forging'),
  equipment('equipment:qinghe-walking-shoes', 'item:qinghe-walking-shoes', 'feet', '清河快脚鞋', 2, 62, [{ stat: 'dodge', operation: 'add', value: 0.03 }, { stat: 'accuracy', operation: 'add', value: 0.02 }], ['灵活', '命中'], 'forging'),
  equipment('equipment:qinghe-badge-charm', 'item:qinghe-badge-charm', 'accessory', '清河榜牌坠', 2, 58, [{ stat: 'crit', operation: 'add', value: 0.015 }, { stat: 'posture', operation: 'add', value: 2 }], ['暴击', '架势'], 'forging'),
  equipment('equipment:river-manual', 'item:river-manual', 'manual', '河口借力诀', 2, 60, [{ stat: 'damageWhenPostureBroken', operation: 'add', value: 0.04 }, { stat: 'qiRecovery', operation: 'add', value: 1 }], ['破势', '内力'], 'quest'),

  equipment('equipment:tempered-cleaver', 'item:tempered-cleaver', 'weapon', '淬火菜刀', 3, 104, [{ stat: 'attack', operation: 'add', value: 5 }, { stat: 'posture', operation: 'add', value: 2 }], ['破势', '稳健'], 'forging'),
  equipment('equipment:iron-cap', 'item:iron-cap', 'head', '铁锅护额', 3, 88, [{ stat: 'defense', operation: 'add', value: 4 }, { stat: 'maxHp', operation: 'add', value: 8 }], ['耐打'], 'loot'),
  equipment('equipment:blackwind-vest', 'item:blackwind-vest', 'body', '黑风轻甲', 3, 96, [{ stat: 'defense', operation: 'add', value: 4 }, { stat: 'dodge', operation: 'add', value: 0.02 }], ['轻装', '耐打'], 'loot'),
  equipment('equipment:cloud-shoes', 'item:cloud-shoes', 'feet', '云步鞋', 3, 92, [{ stat: 'dodge', operation: 'add', value: 0.05 }], ['灵活'], 'forging'),
  equipment('equipment:blackwind-token', 'item:blackwind-token', 'accessory', '黑风寨信物', 3, 90, [{ stat: 'attack', operation: 'add', value: 2 }, { stat: 'crit', operation: 'add', value: 0.02 }], ['暴击', '输出'], 'loot'),
  equipment('equipment:windmill-manual', 'item:windmill-manual', 'manual', '风车卸力谱', 3, 86, [{ stat: 'damageWhenPostureBroken', operation: 'add', value: 0.06 }, { stat: 'dodge', operation: 'add', value: 0.02 }], ['破势', '灵活'], 'quest'),

  equipment('equipment:traveling-dao', 'item:traveling-dao', 'weapon', '行脚短刀', 4, 140, [{ stat: 'attack', operation: 'add', value: 4 }, { stat: 'dodge', operation: 'add', value: 0.03 }], ['灵活', '输出'], 'forging'),
  equipment('equipment:mist-crown', 'item:mist-crown', 'head', '青云雾冠', 4, 126, [{ stat: 'defense', operation: 'add', value: 4 }, { stat: 'accuracy', operation: 'add', value: 0.03 }], ['命中', '耐打'], 'quest'),
  equipment('equipment:mountain-coat', 'item:mountain-coat', 'body', '山门行衣', 4, 132, [{ stat: 'defense', operation: 'add', value: 5 }, { stat: 'maxQi', operation: 'add', value: 5 }], ['内力', '耐打'], 'loot'),
  equipment('equipment:stone-step-boots', 'item:stone-step-boots', 'feet', '石阶踏云靴', 4, 118, [{ stat: 'dodge', operation: 'add', value: 0.04 }, { stat: 'posture', operation: 'add', value: 3 }], ['架势', '灵活'], 'loot'),
  equipment('equipment:jade-bead', 'item:jade-bead', 'accessory', '温玉念珠', 4, 148, [{ stat: 'crit', operation: 'add', value: 0.02 }, { stat: 'healingMultiplier', operation: 'add', value: 0.05 }], ['暴击', '续航'], 'forging'),
  equipment('equipment:cleaver-manual', 'item:cleaver-manual', 'manual', '菜刀心法残页', 4, 122, [{ stat: 'attack', operation: 'add', value: 2 }, { stat: 'qiRecovery', operation: 'add', value: 1 }], ['基础刀法', '内力'], 'forging'),
]

function recipeFor(definition: EquipmentDefinition): ForgeRecipeDefinition {
  const chapter = definition.chapter ?? 1
  const slug = String(definition.id).replace('equipment:', '')
  return {
    id: asRecipeId(`recipe:core:${slug}`),
    name: `${definition.name}锻造图`,
    description: `用本章材料制作${definition.name}，失败不会消耗唯一装备。`,
    chapterId: asChapterId(`ch0${chapter}`),
    requiredChapter: chapter,
    materials: materialsByChapter[chapter] ?? materialsByChapter[1]!,
    output: { itemId: definition.itemId, count: 1, equipmentId: definition.id },
  }
}

export const CORE_EARLY_EQUIPMENT = earlyEquipment
export const CORE_EARLY_EQUIPMENT_ITEMS: readonly ItemDefinition[] = earlyEquipment.map(item)
export const CORE_EARLY_FORGING_RECIPES: readonly ForgeRecipeDefinition[] = earlyEquipment.map(recipeFor)
export const CORE_EARLY_UPGRADE_CURVE = CORE_UPGRADE_CURVE
