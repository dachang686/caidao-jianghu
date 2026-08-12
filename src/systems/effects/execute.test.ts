import { describe, expect, it } from 'vitest'
import { asContentKey, asEnemyId, asItemId, asQuestId } from '../../types/ids'
import { createEffectState } from '../../types/effects'
import { EffectExecutionError, executeEffects } from './execute'

const itemFish = asItemId('item:fish')
const questIntro = asQuestId('quest:intro')
const enemyBai = asEnemyId('enemy:bai')
const lineWelcome = asContentKey('line:welcome')

describe('Effect executor', () => {
  it('按声明顺序返回新状态、领域事件和战斗导航', () => {
    const initial = createEffectState({ stats: { moral: 1, fame: 0, wealth: 0, sectProsperity: 0 } })
    const result = executeEffects([
      { type: 'give_item', itemId: itemFish, count: 2, grantKey: 'reward:intro-fish' },
      { type: 'give_exp', amount: 10, grantKey: 'reward:intro-exp' },
      { type: 'set_flag', flag: 'introSeen', value: true },
      { type: 'unlock_quest', questId: questIntro },
      { type: 'change_stat', stat: 'fame', delta: 3 },
      { type: 'trigger_battle', enemyId: enemyBai },
      { type: 'narrate', lineId: lineWelcome },
    ], initial, { sourceActionId: 'action:intro', occurredAtTick: 4 })

    expect(initial.inventory).toEqual({})
    expect(result.state.inventory).toEqual({ [itemFish]: 2 })
    expect(result.state.experience).toBe(10)
    expect(result.state.flags).toEqual({ introSeen: true })
    expect(result.state.quests).toEqual({ [questIntro]: true })
    expect(result.state.stats.fame).toBe(3)
    expect(result.state.claimedGrantKeys).toEqual(['reward:intro-fish', 'reward:intro-exp'])
    expect(result.navigation).toEqual([{ type: 'battle', enemyId: enemyBai }])
    expect(result.events.map((event) => event.type)).toEqual([
      'inventory.item_granted',
      'player.experience_granted',
      'world.flag_set',
      'quest.unlocked',
      'player.stat_changed',
      'battle.requested',
      'narration.requested',
    ])
    expect(result.events[0]).toMatchObject({ id: 'action:intro:0', occurredAtTick: 4, sourceActionId: 'action:intro' })
  })

  it('grantKey 让重复奖励幂等，且不修改输入对象', () => {
    const initial = createEffectState()
    const effects = [{ type: 'give_item', itemId: itemFish, count: 2, grantKey: 'reward:once' }] as const
    const first = executeEffects(effects, initial)
    const second = executeEffects(effects, first.state)
    expect(first.state.inventory[itemFish]).toBe(2)
    expect(second.state.inventory[itemFish]).toBe(2)
    expect(second.state.claimedGrantKeys).toEqual(['reward:once'])
    expect(second.events).toEqual([])
    expect(initial).toEqual(createEffectState())
  })

  it('拒绝未知引用、负数奖励和非法数量，并保留错误路径', () => {
    const state = createEffectState()
    const catalog = { itemIds: [itemFish], questIds: [questIntro], enemyIds: [enemyBai], lineIds: [lineWelcome] }
    expect(() => executeEffects([{ type: 'give_item', itemId: asItemId('item:missing') }], state, { catalog })).toThrow(/effects\[0\]\.itemId/)
    expect(() => executeEffects([{ type: 'give_exp', amount: -1 }], state)).toThrow(/effects\[0\]\.amount/)
    expect(() => executeEffects([{ type: 'give_item', itemId: itemFish, count: 0 }], state)).toThrow(EffectExecutionError)
    expect(() => executeEffects([{ type: 'change_stat', stat: 'wealth', delta: Number.NaN }], state)).toThrow(/effects\[0\]\.delta/)
  })
})
