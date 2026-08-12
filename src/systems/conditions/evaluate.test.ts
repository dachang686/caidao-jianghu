import { describe, expect, it } from 'vitest'
import { asItemId, asQuestId } from '../../types/ids'
import type { ConditionContext } from '../../types/conditions'
import { ConditionEvaluationError, evaluateCondition } from './evaluate'

const questIntro = asQuestId('quest:intro')
const itemFish = asItemId('item:fish')

function makeContext(): ConditionContext {
  return {
    quests: { [questIntro]: 'complete' },
    inventory: { [itemFish]: 2 },
    stats: { moral: 3, fame: 8, wealth: 12, sectProsperity: 0 },
    flags: { catReturned: true },
  }
}

describe('Condition evaluator', () => {
  it('支持基础条件与嵌套组合，空 all/any 遵循逻辑恒真/恒假', () => {
    const context = makeContext()
    expect(evaluateCondition({ type: 'quest_complete', questId: questIntro }, context)).toBe(true)
    expect(evaluateCondition({ type: 'has_item', itemId: itemFish, count: 2 }, context)).toBe(true)
    expect(evaluateCondition({ type: 'stat_gte', stat: 'fame', value: 8 }, context)).toBe(true)
    expect(evaluateCondition({ type: 'flag_equals', flag: 'catReturned', value: true }, context)).toBe(true)
    expect(evaluateCondition({ type: 'not', condition: { type: 'stat_gte', stat: 'wealth', value: 99 } }, context)).toBe(true)
    expect(evaluateCondition({ type: 'all', conditions: [] }, context)).toBe(true)
    expect(evaluateCondition({ type: 'any', conditions: [] }, context)).toBe(false)
    expect(evaluateCondition({
      type: 'all',
      conditions: [
        { type: 'quest_complete', questId: questIntro },
        { type: 'any', conditions: [{ type: 'stat_gte', stat: 'moral', value: 4 }, { type: 'flag_equals', flag: 'catReturned', value: true }] },
      ],
    }, context)).toBe(true)
  })

  it('缺失引用与非法数量包含可定位路径并显式失败', () => {
    const context = makeContext()
    expect(() => evaluateCondition({ type: 'quest_complete', questId: asQuestId('quest:missing') }, context)).toThrowError(/condition\.questId/)
    expect(() => evaluateCondition({ type: 'has_item', itemId: asItemId('item:missing') }, context)).toThrowError(/condition\.itemId/)
    expect(() => evaluateCondition({ type: 'has_item', itemId: itemFish, count: 0 }, context)).toThrowError(/condition\.count/)
    expect(() => evaluateCondition({ type: 'flag_equals', flag: 'missing', value: true }, context)).toThrow(ConditionEvaluationError)
    try {
      evaluateCondition({ type: 'flag_equals', flag: 'missing', value: true }, context)
    } catch (error) {
      expect((error as ConditionEvaluationError).path).toBe('condition.flag')
    }
  })

  it('不会修改只读上下文', () => {
    const context = makeContext()
    const before = JSON.stringify(context)
    evaluateCondition({ type: 'all', conditions: [{ type: 'has_item', itemId: itemFish }, { type: 'stat_gte', stat: 'moral', value: 1 }] }, context)
    expect(JSON.stringify(context)).toBe(before)
  })
})
