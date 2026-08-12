import type { EquipmentDefinition, EquipmentSourceKind } from '../../../types/equipment'
import type { ForgeRecipeDefinition } from '../../../types/recipe'
import type { ItemDefinition } from '../../../types/item'
import { asChapterId, asEquipmentId, asItemId, asRecipeId } from '../../../types/ids'

const materialsByChapter: Record<number, readonly { itemId: string; count: number }[]> = {
  5: [{ itemId: 'item:western-sand-herb', count: 1 }, { itemId: 'item:tempered-steel', count: 2 }],
  6: [{ itemId: 'item:donghai-sea-salt', count: 1 }, { itemId: 'item:spirit-stone', count: 2 }],
  7: [{ itemId: 'item:capital-ink', count: 1 }, { itemId: 'item:jade', count: 2 }],
  8: [{ itemId: 'item:convention-pepper', count: 1 }, { itemId: 'item:spirit-stone-powder', count: 2 }],
}

const LATE_UPGRADE_CURVE = [
  { level: 0, statDelta: {} },
  { level: 1, statDelta: { attack: 3, defense: 1 } },
  { level: 2, statDelta: { attack: 2, maxQi: 2 } },
  { level: 3, statDelta: { maxHp: 8, posture: 2 } },
  { level: 4, statDelta: { attack: 3, defense: 2 } },
  { level: 5, statDelta: { crit: 0.02, damageWhenPostureBroken: 0.04 } },
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
    description: `${name}：后四章阶段装备，支持${buildTags.join('、')}而不会让单一属性失控。`,
    modifiers,
    unique: true,
    chapter,
    stage,
    price,
    sellPrice: Math.floor(price * 0.45),
    sources: [{ kind: sourceKind, id: `source:${stage}:${id.replace('equipment:', '')}`, label: sourceKind === 'vendor' ? '章节商店' : sourceKind === 'loot' ? '精英掉落' : sourceKind === 'commission' ? '高阶委托' : '后期锻造' }],
    upgradeCurve: LATE_UPGRADE_CURVE,
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
    tags: ['core', 'equipment', 'late', definition.stage ?? 'late', `slot:${definition.slot}`, ...(definition.buildTags ?? [])],
  }
}

const lateEquipment: readonly EquipmentDefinition[] = [
  equipment('equipment:western-seal-blade', 'item:western-seal-blade', 'weapon', '封条行刀', 5, 180, [{ stat: 'attack', operation: 'add', value: 6 }, { stat: 'accuracy', operation: 'add', value: 0.02 }], ['命中', '输出'], 'loot'),
  equipment('equipment:desert-hood', 'item:desert-hood', 'head', '沙幕兜帽', 5, 160, [{ stat: 'defense', operation: 'add', value: 5 }, { stat: 'dodge', operation: 'add', value: 0.03 }], ['灵活', '耐打'], 'vendor'),
  equipment('equipment:relay-vest', 'item:relay-vest', 'body', '驿路短褂', 5, 172, [{ stat: 'defense', operation: 'add', value: 6 }, { stat: 'maxHp', operation: 'add', value: 10 }], ['耐打'], 'forging'),
  equipment('equipment:camel-bell-boots', 'item:camel-bell-boots', 'feet', '驼铃快靴', 5, 166, [{ stat: 'dodge', operation: 'add', value: 0.05 }, { stat: 'accuracy', operation: 'add', value: 0.02 }], ['灵活', '命中'], 'forging'),
  equipment('equipment:sandglass-charm', 'item:sandglass-charm', 'accessory', '风沙漏坠', 5, 174, [{ stat: 'crit', operation: 'add', value: 0.025 }, { stat: 'posture', operation: 'add', value: 3 }], ['暴击', '架势'], 'loot'),
  equipment('equipment:relay-manual', 'item:relay-manual', 'manual', '驿路换气诀', 5, 168, [{ stat: 'maxQi', operation: 'add', value: 8 }, { stat: 'qiRecovery', operation: 'add', value: 2 }], ['内力', '续航'], 'commission'),

  equipment('equipment:tide-hook-blade', 'item:tide-hook-blade', 'weapon', '潮声钩刃', 6, 214, [{ stat: 'attack', operation: 'add', value: 7 }, { stat: 'posture', operation: 'add', value: 3 }], ['破势', '输出'], 'loot'),
  equipment('equipment:shell-crown', 'item:shell-crown', 'head', '贝壳听潮冠', 6, 198, [{ stat: 'defense', operation: 'add', value: 6 }, { stat: 'maxQi', operation: 'add', value: 6 }], ['内力', '耐打'], 'vendor'),
  equipment('equipment:harbor-coat', 'item:harbor-coat', 'body', '港口防潮衣', 6, 208, [{ stat: 'defense', operation: 'add', value: 7 }, { stat: 'healingMultiplier', operation: 'add', value: 0.05 }], ['续航', '耐打'], 'forging'),
  equipment('equipment:reef-step', 'item:reef-step', 'feet', '礁石踏浪鞋', 6, 202, [{ stat: 'dodge', operation: 'add', value: 0.05 }, { stat: 'posture', operation: 'add', value: 3 }], ['灵活', '架势'], 'forging'),
  equipment('equipment:tide-pearl-charm', 'item:tide-pearl-charm', 'accessory', '潮声珠串', 6, 216, [{ stat: 'crit', operation: 'add', value: 0.025 }, { stat: 'maxQi', operation: 'add', value: 5 }], ['暴击', '内力'], 'loot'),
  equipment('equipment:tide-manual', 'item:tide-manual', 'manual', '听潮借力篇', 6, 206, [{ stat: 'damageWhenPostureBroken', operation: 'add', value: 0.08 }, { stat: 'qiRecovery', operation: 'add', value: 2 }], ['破势', '续航'], 'commission'),

  equipment('equipment:capital-seal-saber', 'item:capital-seal-saber', 'weapon', '公牍裁字刀', 7, 254, [{ stat: 'attack', operation: 'add', value: 8 }, { stat: 'accuracy', operation: 'add', value: 0.03 }], ['命中', '输出'], 'loot'),
  equipment('equipment:ranking-cap', 'item:ranking-cap', 'head', '榜司乌纱', 7, 232, [{ stat: 'defense', operation: 'add', value: 7 }, { stat: 'crit', operation: 'add', value: 0.015 }], ['暴击', '耐打'], 'vendor'),
  equipment('equipment:archive-robe', 'item:archive-robe', 'body', '藏卷长衫', 7, 246, [{ stat: 'defense', operation: 'add', value: 8 }, { stat: 'maxQi', operation: 'add', value: 8 }], ['内力', '耐打'], 'forging'),
  equipment('equipment:gatehouse-boots', 'item:gatehouse-boots', 'feet', '京门巡步靴', 7, 238, [{ stat: 'dodge', operation: 'add', value: 0.06 }, { stat: 'accuracy', operation: 'add', value: 0.02 }], ['灵活', '命中'], 'forging'),
  equipment('equipment:writ-charm', 'item:writ-charm', 'accessory', '公牍印坠', 7, 252, [{ stat: 'posture', operation: 'add', value: 5 }, { stat: 'damageWhenPostureBroken', operation: 'add', value: 0.05 }], ['架势', '破势'], 'loot'),
  equipment('equipment:archive-manual', 'item:archive-manual', 'manual', '公开复核诀', 7, 244, [{ stat: 'accuracy', operation: 'add', value: 0.04 }, { stat: 'qiRecovery', operation: 'add', value: 2 }], ['命中', '内力'], 'commission'),

  equipment('equipment:convention-cleaver', 'item:convention-cleaver', 'weapon', '大会定论刀', 8, 302, [{ stat: 'attack', operation: 'add', value: 9 }, { stat: 'posture', operation: 'add', value: 4 }], ['输出', '破势'], 'loot'),
  equipment('equipment:crest-crown', 'item:crest-crown', 'head', '大会冠礼', 8, 278, [{ stat: 'defense', operation: 'add', value: 8 }, { stat: 'maxHp', operation: 'add', value: 12 }], ['耐打'], 'vendor'),
  equipment('equipment:judge-robe', 'item:judge-robe', 'body', '裁量长袍', 8, 292, [{ stat: 'defense', operation: 'add', value: 9 }, { stat: 'healingMultiplier', operation: 'add', value: 0.06 }], ['续航', '耐打'], 'forging'),
  equipment('equipment:arena-step', 'item:arena-step', 'feet', '擂台回身靴', 8, 286, [{ stat: 'dodge', operation: 'add', value: 0.06 }, { stat: 'crit', operation: 'add', value: 0.015 }], ['灵活', '暴击'], 'forging'),
  equipment('equipment:crest-charm', 'item:crest-charm', 'accessory', '大会印坠', 8, 306, [{ stat: 'crit', operation: 'add', value: 0.03 }, { stat: 'damageWhenPostureBroken', operation: 'add', value: 0.06 }], ['暴击', '破势'], 'loot'),
  equipment('equipment:four-style-manual', 'item:four-style-manual', 'manual', '四系合流谱', 8, 298, [{ stat: 'attack', operation: 'add', value: 3 }, { stat: 'maxQi', operation: 'add', value: 10 }, { stat: 'qiRecovery', operation: 'add', value: 2 }], ['四系武学', '内力'], 'commission'),
]

function recipeFor(definition: EquipmentDefinition): ForgeRecipeDefinition {
  const chapter = definition.chapter ?? 5
  const slug = String(definition.id).replace('equipment:', '')
  return {
    id: asRecipeId(`recipe:core:${slug}`),
    name: `${definition.name}锻造图`,
    description: `用后期区域材料制作${definition.name}，强化曲线与前期装备相接。`,
    chapterId: asChapterId(`ch0${chapter}`),
    requiredChapter: chapter,
    materials: materialsByChapter[chapter] ?? materialsByChapter[5]!,
    output: { itemId: definition.itemId, count: 1, equipmentId: definition.id },
  }
}

export const CORE_LATE_EQUIPMENT = lateEquipment
export const CORE_LATE_EQUIPMENT_ITEMS: readonly ItemDefinition[] = lateEquipment.map(item)
export const CORE_LATE_FORGING_RECIPES: readonly ForgeRecipeDefinition[] = lateEquipment.map(recipeFor)
export const CORE_LATE_UPGRADE_CURVE = LATE_UPGRADE_CURVE
