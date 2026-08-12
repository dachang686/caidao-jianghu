import { useMemo, useState } from 'react'
import { ITEMS } from '../../game/data'
import type { ItemId } from '../../game/types'
import type { DerivedCombatStats } from '../../types/skill'
import type { EquipmentDefinition, EquipmentLoadout } from '../../types/equipment'
import { recalculateEquipmentStats } from '../../systems/inventory'
import { Button } from '../game-ui'
import { useGameStore } from '../../stores'

type InventoryFilter = 'all' | 'item' | 'equipment' | 'material' | 'food' | 'quest'

const filterLabels: Record<InventoryFilter, string> = { all: '全部', item: '物品', equipment: '装备', material: '材料', food: '食物', quest: '关键物品' }
const equipmentSlots = ['weapon', 'head', 'body', 'feet', 'accessory', 'manual'] as const
const equipmentSlotLabels: Record<typeof equipmentSlots[number], string> = { weapon: '武器', head: '头部', body: '衣服', feet: '鞋', accessory: '饰品', manual: '秘籍' }

function categoryOf(itemId: ItemId): Exclude<InventoryFilter, 'all'> {
  const item = ITEMS[itemId]
  if (item.category === 'weapon') return 'equipment'
  if (item.category === 'quest') return 'quest'
  if (item.category === 'consumable' && (itemId === 'erguotou' || itemId === 'stalePill')) return 'food'
  return 'item'
}

function equipmentDefinition(itemId: ItemId): EquipmentDefinition | null {
  const item = ITEMS[itemId]
  if (item.category !== 'weapon') return null
  return {
    id: `equipment:${itemId}`,
    itemId,
    slot: 'weapon',
    name: item.name,
    description: item.description,
    modifiers: [{ stat: 'attack', operation: 'add', value: itemId === 'rustyCleaver' ? 3 : 1 }],
  }
}

function baseDerivedStats(player: NonNullable<ReturnType<typeof useGameStore.getState>['player']>): DerivedCombatStats {
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
  const player = useGameStore((state) => state.player)
  const useItem = useGameStore((state) => state.useItem)
  const equipWeapon = useGameStore((state) => state.equipWeapon)
  const [filter, setFilter] = useState<InventoryFilter>('all')
  const [message, setMessage] = useState('物品数量来自当前存档；关键物品不会被误用或出售。')
  const counts = useMemo(() => {
    const result: Partial<Record<ItemId, number>> = {}
    player?.inventory.forEach((itemId) => { result[itemId] = (result[itemId] ?? 0) + 1 })
    return result
  }, [player?.inventory])
  if (!player) return null

  const items = (Object.keys(counts) as ItemId[]).filter((itemId) => filter === 'all' || categoryOf(itemId) === filter)
  const base = baseDerivedStats(player)
  const currentLoadout: EquipmentLoadout = { weapon: player.equippedWeapon ? `equipment:${player.equippedWeapon}` : null, head: null, body: null, feet: null, accessory: null, manual: null }
  const currentDefinition = player.equippedWeapon ? equipmentDefinition(player.equippedWeapon) : null
  const currentStats = recalculateEquipmentStats(base, currentLoadout, currentDefinition ? [currentDefinition] : [])

  const equip = (itemId: ItemId) => {
    equipWeapon(itemId)
    setMessage(`已装备「${ITEMS[itemId].name}」，属性对比按领域公式更新。`)
  }

  return <div className="inventory-equipment-panel" data-testid={`${mode}-panel`}>
    <div className="inventory-heading"><div><h2>{mode === 'inventory' ? '背包' : '装备'}</h2><p>容量 {player.inventory.length} 件 · 装备切换不会复制物品</p></div></div>
    <p className="inventory-message" role="status">{message}</p>
    {mode === 'inventory' && <div className="inventory-filters" role="tablist" aria-label="物品分类">{(Object.keys(filterLabels) as InventoryFilter[]).map((key) => <button key={key} className={filter === key ? 'is-selected' : ''} onClick={() => setFilter(key)}>{filterLabels[key]}</button>)}</div>}
    {mode === 'equipment' && <div className="equipment-slots">{equipmentSlots.map((slot) => <div className="equipment-slot" key={slot}><small>{equipmentSlotLabels[slot]}</small><b>{slot === 'weapon' && player.equippedWeapon ? ITEMS[player.equippedWeapon].name : '未装备'}</b><span>{slot === 'weapon' ? `攻击 ${formatDifference(currentStats.attack - base.attack)}` : '暂无装备'}</span></div>)}</div>}
    {mode === 'inventory' && <div className="inventory-list">{items.length === 0 && <p>这个分类目前没有物品。</p>}{items.map((itemId) => { const item = ITEMS[itemId]; const equipment = equipmentDefinition(itemId); const equipped = player.equippedWeapon === itemId; return <article className="inventory-card" key={itemId}><div><h3>{item.name}<small> × {counts[itemId]}</small></h3><p>{item.description}</p><span className="inventory-tag">{filterLabels[categoryOf(itemId)]}</span></div><div className="inventory-card-actions">{item.category === 'consumable' && <Button onClick={() => { useItem(itemId); setMessage(`已尝试使用「${item.name}」。`) }}>使用</Button>}{equipment && <Button disabled={equipped} onClick={() => equip(itemId)}>{equipped ? '已装备' : '装备'}</Button>}{item.category === 'quest' && <Button disabled title="关键物品不能在此使用">关键物品</Button>}</div></article> })}</div>}
    {mode === 'equipment' && <div className="equipment-compare"><h3>当前派生属性</h3>{(['attack', 'defense', 'maxHp', 'maxQi', 'crit', 'dodge'] as const).map((stat) => <div key={stat}><span>{stat}</span><b>{formatDifference(currentStats[stat] - base[stat])}</b></div>)}<p>强化入口会使用存档种子计算下一次结果；刷新不会改变结果，失败不会销毁装备。</p></div>}
  </div>
}
