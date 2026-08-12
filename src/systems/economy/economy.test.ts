import { describe, expect, it } from 'vitest'
import { DeterministicRng } from '../rng'
import type { ItemDefinition } from '../../types/item'
import { addItem, createInventoryState } from '../inventory'
import {
  buyMarketItem,
  createEconomyState,
  grantLoot,
  quoteMarketItem,
  rollLoot,
  sellMarketItem,
} from './index'

const herb: ItemDefinition = { id: 'item:herb', name: '止血草', description: '', category: 'material', maxStack: 1 }
const scrap: ItemDefinition = { id: 'item:scrap', name: '铁屑', description: '', category: 'material', maxStack: 1 }
const marketItem = { itemId: 'item:herb', basePrice: 100, item: herb }

describe('loot and economy', () => {
  it('掉落使用独立 RNG fork，固定 seed 结果可复现，首奖输入不重复', () => {
    const table = {
      id: 'test:loot',
      fixed: [{ kind: 'silver' as const, amount: 10 }, { kind: 'material' as const, itemId: 'item:herb', count: 1, firstRewardKey: 'first:herb' }],
      weighted: [{ reward: { kind: 'material' as const, itemId: 'item:scrap', count: 1 }, weight: 1 }],
      rolls: 1,
    }
    const first = rollLoot(table, { rng: new DeterministicRng(9) })
    const second = rollLoot(table, { rng: new DeterministicRng(9) })
    expect(second).toEqual(first)
    const claimed = rollLoot(table, { rng: new DeterministicRng(9), claimedFirstRewardKeys: ['first:herb'] })
    expect(claimed.rewards.some((reward) => reward.firstRewardKey === 'first:herb')).toBe(false)
  })

  it('背包满时奖励进入可恢复队列，成功入账后首奖才幂等标记', () => {
    const inventory = addItem(createInventoryState(1), scrap)
    const state = createEconomyState(inventory)
    const rewards = [{ kind: 'material' as const, itemId: 'item:herb', count: 1, firstRewardKey: 'first:herb' }]
    const pending = grantLoot(state, rewards, [herb, scrap])
    expect(pending.granted).toHaveLength(0)
    expect(pending.state.pendingLoot).toHaveLength(1)
    expect(pending.state.claimedFirstRewardKeys).toEqual([])
    const recovered = grantLoot({ ...pending.state, inventory: createInventoryState(2) }, pending.state.pendingLoot.map((item) => item.reward), [herb, scrap])
    expect(recovered.granted).toHaveLength(1)
    expect(recovered.state.claimedFirstRewardKeys).toEqual(['first:herb'])
  })

  it('阶段价格保证买卖同物品不会形成正收益循环', () => {
    const quote = quoteMarketItem(marketItem, 1, 1)
    expect(quote.sellPrice).toBeLessThan(quote.buyPrice)
    let state = { ...createEconomyState(createInventoryState(4)), silver: quote.buyPrice }
    state = buyMarketItem(state, marketItem, 1, 1)
    const afterSell = sellMarketItem(state, marketItem, 1, 1)
    expect(afterSell.silver).toBeLessThanOrEqual(quote.buyPrice)
  })
})

