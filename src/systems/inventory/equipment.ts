import type { DerivedCombatStats } from '../../types/skill'
import type { EquipmentDefinition, EquipmentLoadout, EquipmentSlot } from '../../types/equipment'
import type { InventoryState, ItemDefinition } from '../../types/item'
import { addItem, removeItem, InventoryError } from './inventory'

export class EquipmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EquipmentError'
  }
}

export interface EquipmentCatalog {
  readonly equipment: readonly EquipmentDefinition[] | ReadonlyMap<string, EquipmentDefinition>
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
}

export interface EquipmentOperationResult {
  readonly inventory: InventoryState
  readonly loadout: EquipmentLoadout
}

export const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = ['weapon', 'head', 'body', 'feet', 'accessory', 'manual']

export function createEquipmentLoadout(): EquipmentLoadout {
  return { weapon: null, head: null, body: null, feet: null, accessory: null, manual: null }
}

function findDefinition<T extends { id: string }>(values: readonly T[] | ReadonlyMap<string, T>, id: string): T | undefined {
  if (Array.isArray(values)) return values.find((value: T) => String(value.id) === id)
  return (values as ReadonlyMap<string, T>).get(id)
}

function itemForEquipment(catalog: EquipmentCatalog, definition: EquipmentDefinition): ItemDefinition {
  const item = findDefinition(catalog.items, definition.itemId)
  if (!item) throw new EquipmentError(`找不到装备物品「${definition.itemId}」`)
  return item
}

export function equipEquipment(
  inventory: InventoryState,
  loadout: EquipmentLoadout,
  definition: EquipmentDefinition,
  catalog: EquipmentCatalog,
): EquipmentOperationResult {
  const id = String(definition.id)
  const oldId = loadout[definition.slot]
  if (oldId === id) return { inventory, loadout: { ...loadout } }
  const item = itemForEquipment(catalog, definition)
  const oldDefinition = oldId ? findDefinition(catalog.equipment, oldId) : undefined
  if (oldId && !oldDefinition) throw new EquipmentError(`找不到已装备物品「${oldId}」`)
  let nextInventory: InventoryState
  try {
    nextInventory = removeItem(inventory, definition.itemId, 1, item)
    if (oldDefinition) nextInventory = addItem(nextInventory, itemForEquipment(catalog, oldDefinition), 1)
  } catch (error) {
    if (error instanceof InventoryError) throw new EquipmentError(error.message)
    throw error
  }
  return { inventory: nextInventory, loadout: { ...loadout, [definition.slot]: id } }
}

export function unequipEquipment(
  inventory: InventoryState,
  loadout: EquipmentLoadout,
  slot: EquipmentSlot,
  catalog: EquipmentCatalog,
): EquipmentOperationResult {
  const equippedId = loadout[slot]
  if (!equippedId) return { inventory, loadout: { ...loadout } }
  const definition = findDefinition(catalog.equipment, equippedId)
  if (!definition) throw new EquipmentError(`找不到已装备物品「${equippedId}」`)
  let nextInventory: InventoryState
  try {
    nextInventory = addItem(inventory, itemForEquipment(catalog, definition), 1)
  } catch (error) {
    if (error instanceof InventoryError) throw new EquipmentError(error.message)
    throw error
  }
  return { inventory: nextInventory, loadout: { ...loadout, [slot]: null } }
}

export function recalculateEquipmentStats(
  base: DerivedCombatStats,
  loadout: EquipmentLoadout,
  definitions: readonly EquipmentDefinition[],
): DerivedCombatStats {
  const byId = new Map(definitions.map((definition) => [String(definition.id), definition]))
  const next = { ...base }
  EQUIPMENT_SLOTS.forEach((slot) => {
    const equipmentId = loadout[slot]
    if (!equipmentId) return
    const definition = byId.get(equipmentId)
    if (!definition) throw new EquipmentError(`未知装备「${equipmentId}」`)
    definition.modifiers.forEach((modifier) => {
      if (!Number.isFinite(modifier.value)) throw new EquipmentError(`装备「${equipmentId}」属性修正无效`)
      if (modifier.operation === 'add') next[modifier.stat] += modifier.value
      else next[modifier.stat] *= 1 + modifier.value
    })
  })
  return {
    ...next,
    maxHp: Math.max(1, next.maxHp), maxQi: Math.max(0, next.maxQi), attack: Math.max(0, next.attack), defense: Math.max(0, next.defense), posture: Math.max(1, next.posture),
    accuracy: Math.max(0, Math.min(1, next.accuracy)), dodge: Math.max(0, Math.min(1, next.dodge)), crit: Math.max(0, Math.min(1, next.crit)),
    qiRecovery: Math.max(0, next.qiRecovery), healingMultiplier: Math.max(0, next.healingMultiplier), damageWhenPostureBroken: Math.max(0, next.damageWhenPostureBroken),
  }
}

export const equip = equipEquipment
export const unequip = unequipEquipment
export const recalculateEquipmentDerivedStats = recalculateEquipmentStats
