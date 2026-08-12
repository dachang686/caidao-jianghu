import type { LootTable } from '../../types/loot'
import { coreForgingEquipment } from '../recipes/forging'

const coreEquipmentLootTables: readonly LootTable[] = Array.from({ length: 8 }, (_, index) => {
  const chapter = index + 1
  const equipment = coreForgingEquipment.filter((definition) => definition.chapter === chapter)
  const first = equipment[0]
  return {
    id: `loot:core:chapter-${chapter}`,
    fixed: first ? [{ kind: 'equipment' as const, equipmentId: String(first.id), itemId: String(first.itemId), firstRewardKey: `first:core:${String(first.id)}` }] : [],
    weighted: equipment.slice(1).map((definition, weightIndex) => ({
      reward: { kind: 'equipment' as const, equipmentId: String(definition.id), itemId: String(definition.itemId), firstRewardKey: `first:core:${String(definition.id)}` },
      weight: Math.max(1, 4 - weightIndex),
    })),
    rolls: equipment.length > 1 ? 1 : undefined,
  }
})

export const coreLootTables: readonly LootTable[] = [
  {
    id: 'loot:roadside-bandit',
    fixed: [{ kind: 'silver', amount: 12 }],
    weighted: [
      { reward: { kind: 'material', itemId: 'item:herb', count: 1 }, weight: 3 },
      { reward: { kind: 'material', itemId: 'item:iron-scrap', count: 1 }, weight: 2 },
    ],
    rolls: 1,
  },
  {
    id: 'loot:chapter-first-cleaver',
    fixed: [{ kind: 'equipment', equipmentId: 'equipment:starter-cleaver', itemId: 'item:starter-cleaver', firstRewardKey: 'first:starter-cleaver' }],
  },
  ...coreEquipmentLootTables,
]

export const CORE_LOOT_TABLES = coreLootTables
export const CORE_EQUIPMENT_LOOT_TABLES = coreEquipmentLootTables
