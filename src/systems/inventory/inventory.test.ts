import { describe, expect, it } from 'vitest'
import type { DerivedCombatStats } from '../../types/skill'
import type { EquipmentDefinition } from '../../types/equipment'
import type { ItemDefinition } from '../../types/item'
import {
  InventoryError,
  addItem,
  createEquipmentLoadout,
  createInventoryState,
  equipEquipment,
  getItemCount,
  recalculateEquipmentStats,
  removeItem,
  tryAddItem,
} from './index'

const herb: ItemDefinition = { id: 'item:herb', name: '止血草', description: '', category: 'consumable', maxStack: 5 }
const key: ItemDefinition = { id: 'item:recipe', name: '刀谱', description: '', category: 'quest', maxStack: 1, keyItem: true }
const swordItem: ItemDefinition = { id: 'item:sword', name: '旧菜刀', description: '', category: 'weapon', maxStack: 1 }
const axeItem: ItemDefinition = { id: 'item:axe', name: '新菜刀', description: '', category: 'weapon', maxStack: 1 }
const sword: EquipmentDefinition = { id: 'equipment:sword', itemId: 'item:sword', slot: 'weapon', name: '旧菜刀', description: '', modifiers: [{ stat: 'attack', operation: 'add', value: 3 }] }
const axe: EquipmentDefinition = { id: 'equipment:axe', itemId: 'item:axe', slot: 'weapon', name: '新菜刀', description: '', modifiers: [{ stat: 'attack', operation: 'multiply', value: 0.1 }] }
const base: DerivedCombatStats = { maxHp: 100, maxQi: 30, attack: 20, defense: 10, posture: 25, accuracy: 0.9, dodge: 0.1, crit: 0.05, qiRecovery: 3, healingMultiplier: 1, damageWhenPostureBroken: 0 }

describe('inventory and equipment', () => {
  it('按堆叠和容量原子增减，满容量不吞物品，关键物品受保护', () => {
    let state = createInventoryState(3)
    state = addItem(state, herb, 6)
    expect(state.stacks).toEqual([{ itemId: 'item:herb', count: 5 }, { itemId: 'item:herb', count: 1 }])
    const full = addItem(state, swordItem)
    expect(tryAddItem(full, axeItem, 1).added).toBe(0)
    state = removeItem(state, 'item:herb', 2)
    expect(getItemCount(state, 'item:herb')).toBe(4)
    const withKey = addItem(state, key)
    expect(() => removeItem(withKey, 'item:recipe', 1, key)).toThrow(InventoryError)
  })

  it('装备替换先取出新物品再归还旧物品，不复制或丢失', () => {
    const catalog = { equipment: [sword, axe], items: [swordItem, axeItem] }
    let inventory = addItem(createInventoryState(4), swordItem)
    inventory = addItem(inventory, axeItem)
    let loadout = createEquipmentLoadout()
    let result = equipEquipment(inventory, loadout, sword, catalog)
    inventory = result.inventory
    loadout = result.loadout
    expect(getItemCount(inventory, 'item:sword')).toBe(0)
    result = equipEquipment(inventory, loadout, axe, catalog)
    expect(getItemCount(result.inventory, 'item:sword')).toBe(1)
    expect(getItemCount(result.inventory, 'item:axe')).toBe(0)
    expect(result.loadout.weapon).toBe('equipment:axe')
  })

  it('装备派生属性每次从基础值重算，不累计漂移', () => {
    const loadout = { ...createEquipmentLoadout(), weapon: 'equipment:sword' }
    const first = recalculateEquipmentStats(base, loadout, [sword])
    const second = recalculateEquipmentStats(base, loadout, [sword])
    expect(first).toEqual(second)
    expect(first.attack).toBe(23)
  })
})
