import { describe, expect, it } from 'vitest'
import { addItem, createInventoryState, getItemCount } from '../inventory'
import type { DomainEvent } from '../../types/events'
import type { FoodBuffCatalog } from '../../types/food'
import type { ItemDefinition } from '../../types/item'
import { FoodBuffEngine } from './food-buffs'

const foodItem: ItemDefinition = { id: 'item:test-bun', name: '测试烧饼', description: '', category: 'food', maxStack: 5 }
const catalog: FoodBuffCatalog = {
  items: [foodItem],
  foods: [{
    id: 'buff:test-bun',
    foodItemId: foodItem.id,
    name: '测试烧饼',
    durationBattles: 2,
    stacking: 'replace',
    attackMultiplier: 1.2,
    accuracyDelta: -0.1,
    immediateHeal: 10,
    negative: { id: 'status:test-tipsy', turns: 2, description: '脚步有点飘', accuracyDelta: -0.15, selfDamageRatio: 0.08 },
    localExplanationKey: 'food.test_bun',
  }],
}

const battleEvent = (id: string, payload: Record<string, unknown> = {}): DomainEvent => ({
  id,
  type: 'battle.completed',
  occurredAtTick: 1,
  payload: { battleId: id, outcome: 'won', ...payload },
  sourceActionId: `battle:${id}`,
})

describe('food buff engine', () => {
  it('食用原子扣除食物并提供即时回复、可见说明和战斗修正', () => {
    const engine = new FoodBuffEngine(catalog)
    const result = engine.consume({ foodItemId: foodItem.id, inventory: addItem(createInventoryState(2), foodItem, 1), currentHp: 20, maxHp: 50, actionId: 'food:eat' })
    expect(result.status).toBe('consumed')
    expect(result.hp).toBe(30)
    expect(getItemCount(result.inventory, String(foodItem.id))).toBe(0)
    expect(result.explanation).toContain('测试烧饼')
    expect(engine.getModifiers()).toMatchObject({ attackMultiplier: 1.2, accuracyDelta: -0.1 })
    expect(engine.getModifiers().negativeStatuses[0]).toMatchObject({ turns: 2, selfDamageRatio: 0.08 })
  })

  it('只按有效战斗结算扣减场次，重试/模拟/重复事件不会重复扣减', () => {
    const engine = new FoodBuffEngine(catalog)
    engine.consume({ foodItemId: foodItem.id, inventory: addItem(createInventoryState(2), foodItem, 1), currentHp: 50, maxHp: 50, actionId: 'food:eat' })
    expect(engine.advanceBattle(battleEvent('retry', { isRetry: true })).status).toBe('ignored_event')
    expect(engine.advanceBattle(battleEvent('battle-1')).status).toBe('advanced')
    expect(engine.advanceBattle(battleEvent('battle-1')).status).toBe('duplicate_event')
    expect(engine.getState().active[0]?.remainingBattles).toBe(1)
    expect(engine.advanceBattle(battleEvent('preview', { mode: 'simulation' })).status).toBe('ignored_event')
    expect(engine.advanceBattle(battleEvent('battle-2')).status).toBe('advanced')
    expect(engine.getState().active).toEqual([])
  })

  it('负面回合单独递减且自伤安全阀保证不会降到 1 以下', () => {
    const engine = new FoodBuffEngine(catalog)
    engine.consume({ foodItemId: foodItem.id, inventory: addItem(createInventoryState(2), foodItem, 1), currentHp: 50, maxHp: 50, actionId: 'food:eat' })
    expect(engine.tickCombatTurn().active[0]?.negativeTurns).toBe(1)
    expect(engine.safeSelfDamage(2, 100, catalog.foods[0]!.negative!)).toBe(1)
    expect(engine.tickCombatTurn().active[0]?.negativeTurns).toBe(0)
    expect(engine.getModifiers().negativeStatuses).toEqual([])
  })
})
