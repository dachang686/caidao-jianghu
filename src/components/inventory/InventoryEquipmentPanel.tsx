import { useMemo, useState } from 'react'
import { coreCookingItems, coreFoodBuffs } from '../../content/recipes/cooking'
import { coreForgingEquipment, coreForgingItems } from '../../content/recipes/forging'
import { strengtheningBalance } from '../../content/balance/strengthening'
import type { EquipmentLoadout } from '../../types/equipment'
import type { ItemCategory, ItemDefinition } from '../../types/item'
import type { DerivedCombatStats } from '../../types/skill'
import { recalculateEquipmentStats } from '../../systems/inventory'
import { applyStrengtheningBonuses } from '../../systems/equipment'
import { useRootGameStore } from '../../stores'
import { Button } from '../game-ui'

type InventoryFilter = 'all' | ItemCategory

const allItems: readonly ItemDefinition[] = Array.from(new Map([...coreForgingItems, ...coreCookingItems].map((item) => [String(item.id), item])).values())
const filterLabels: Record<InventoryFilter, string> = { all: '全部', weapon: '装备', consumable: '物品', material: '材料', food: '食物', quest: '关键物品' }
const equipmentSlots = ['weapon', 'head', 'body', 'feet', 'accessory', 'manual'] as const
const equipmentSlotLabels: Record<typeof equipmentSlots[number], string> = { weapon: '武器', head: '头部', body: '衣服', feet: '鞋', accessory: '饰品', manual: '秘籍' }
const foodNames = new Map(coreFoodBuffs.map((food) => [String(food.id), food.name]))

function baseDerivedStats(player: NonNullable<ReturnType<typeof useRootGameStore.getState>['player']>): DerivedCombatStats {
  return {
    maxHp: player.maxHp, maxQi: player.maxQi, attack: player.stats.attack, defense: player.stats.defense, posture: 25,
    accuracy: player.stats.accuracy, dodge: player.stats.dodge, crit: player.stats.crit, qiRecovery: 3, healingMultiplier: 1, damageWhenPostureBroken: 0,
  }
}

function formatDifference(value: number): string {
  if (value === 0) return '—'
  return `${value > 0 ? '+' : ''}${Number.isInteger(value) ? value : value.toFixed(2)}`
}

export function InventoryPanel() {
  return <InventoryEquipmentPanel mode="inventory" />
}

export function EquipmentPanel() {
  return <InventoryEquipmentPanel mode="equipment" />
}

function InventoryEquipmentPanel({ mode }: { mode: 'inventory' | 'equipment' }) {
  const player = useRootGameStore((state) => state.player)
  const world = useRootGameStore((state) => state.world)
  const inventory = useRootGameStore((state) => state.inventoryState)
  const loadout = useRootGameStore((state) => state.equipmentLoadout)
  const equipmentStrengthening = useRootGameStore((state) => state.equipmentStrengthening)
  const equipInventoryEquipment = useRootGameStore((state) => state.equipInventoryEquipment)
  const unequipInventoryEquipment = useRootGameStore((state) => state.unequipInventoryEquipment)
  const strengthenInventoryEquipment = useRootGameStore((state) => state.strengthenInventoryEquipment)
  const consumeFoodItem = useRootGameStore((state) => state.consumeFoodItem)
  const foodBuffSnapshot = useRootGameStore((state) => state.foodBuffSnapshot)
  const workshopMessage = useRootGameStore((state) => state.workshopMessage)
  const [filter, setFilter] = useState<InventoryFilter>('all')
  const counts = useMemo(() => new Map(inventory.stacks.map((stack) => [stack.itemId, stack.count])), [inventory.stacks])
  if (!player) return null

  const items = allItems.filter((item) => (counts.get(String(item.id)) ?? 0) > 0 && (filter === 'all' || item.category === filter))
  const base = baseDerivedStats(player)
  const currentStats = applyStrengtheningBonuses(recalculateEquipmentStats(base, loadout, coreForgingEquipment), Object.values(loadout).flatMap((equipmentId) => equipmentId ? [equipmentStrengthening[equipmentId]?.bonus ?? {}] : []))
  const equippedBySlot = new Map(coreForgingEquipment.map((definition) => [String(definition.id), definition]))
  const confirmStrengthening = (equipmentId: string) => {
    const level = equipmentStrengthening[equipmentId]?.level ?? 0
    const next = strengtheningBalance.find((config) => config.fromLevel === level)
    if (!next) return strengthenInventoryEquipment(equipmentId)
    if (window.confirm(`确认强化至 +${next.toLevel}？消耗 ${next.cost.silver} 银两与 ${next.cost.materialCount} 个 ${next.cost.materialId}；结果由当前存档种子固定。`)) strengthenInventoryEquipment(equipmentId)
  }

  return <div className="inventory-equipment-panel" data-testid={`${mode}-panel`}>
    <div className="inventory-heading"><div><h2>{mode === 'inventory' ? '背包' : '装备'}</h2><p>容量 {inventory.stacks.length}/{inventory.capacity} 格，所有物品与装备都写入当前存档。</p></div></div>
    <p className="inventory-message" role="status">{workshopMessage || '装备会从背包移入对应槽位，卸下时再放回背包。'}</p>
    {mode === 'inventory' && foodBuffSnapshot.active.length > 0 && <p className="inventory-message">生效中的食物：{foodBuffSnapshot.active.map((buff) => `${foodNames.get(buff.buffId) ?? buff.buffId}（剩 ${buff.remainingBattles} 场）`).join('、')}</p>}
    {mode === 'inventory' && <div className="inventory-filters" role="tablist" aria-label="物品分类">{(Object.keys(filterLabels) as InventoryFilter[]).map((key) => <button key={key} className={filter === key ? 'is-selected' : ''} onClick={() => setFilter(key)}>{filterLabels[key]}</button>)}</div>}
    {mode === 'equipment' && <div className="equipment-slots">{equipmentSlots.map((slot) => {
      const definition = loadout[slot] ? equippedBySlot.get(loadout[slot]!) : undefined
      const equipmentId = definition ? String(definition.id) : null
      const level = equipmentId ? equipmentStrengthening[equipmentId]?.level ?? 0 : 0
      return <div className="equipment-slot" key={slot}><small>{equipmentSlotLabels[slot]}</small><b>{definition ? `${definition.name} +${level}` : '未装备'}</b><span>{definition ? definition.modifiers.map((modifier) => `${modifier.stat} ${formatDifference(modifier.value)}`).join('，') : '暂无装备'}</span>{definition && <div><Button onClick={() => unequipInventoryEquipment(slot)}>卸下</Button><Button disabled={!world.systemUnlocks.equipmentStrengthening} title={world.systemUnlocks.equipmentStrengthening ? '成本与结果会在确认后按存档种子结算。' : '完成青云山主线后解锁强化。'} onClick={() => confirmStrengthening(equipmentId!)}>强化</Button></div>}</div>
    })}</div>}
    {mode === 'inventory' && <div className="inventory-list">{items.length === 0 && <p>这个分类目前没有物品。</p>}{items.map((item) => {
      const equipment = coreForgingEquipment.find((definition) => definition.itemId === String(item.id))
      const equipped = equipment ? Object.values(loadout).includes(String(equipment.id)) : false
       return <article className="inventory-card" key={item.id}><div><h3>{item.name}<small> × {counts.get(String(item.id))}</small></h3><p>{item.description}</p><span className="inventory-tag">{filterLabels[item.category]}</span></div><div className="inventory-card-actions">{equipment && <Button disabled={equipped} onClick={() => equipInventoryEquipment(String(equipment.id))}>{equipped ? '已装备' : '装备'}</Button>}{item.category === 'food' && <Button onClick={() => consumeFoodItem(String(item.id))}>食用</Button>}{item.keyItem && <Button disabled title="关键物品不能在此使用">关键物品</Button>}</div></article>
    })}</div>}
    {mode === 'equipment' && <div className="equipment-compare"><h3>当前派生属性</h3>{(['attack', 'defense', 'maxHp', 'maxQi', 'crit', 'dodge'] as const).map((stat) => <div key={stat}><span>{stat}</span><b>{formatDifference(currentStats[stat] - base[stat])}</b></div>)}<p>强化结果由存档种子决定，不会用刷新改变结果。</p></div>}
  </div>
}
