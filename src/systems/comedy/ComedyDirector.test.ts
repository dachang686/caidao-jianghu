import { describe, expect, it } from 'vitest'
import { asItemId, asQuestId } from '../../types/ids'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import { ComedyDirector, ComedyDirectorError } from './ComedyDirector'

const context: ConditionContext = { quests: { [asQuestId('quest:intro')]: 'complete' }, inventory: { [asItemId('item:fish')]: 1 }, stats: { moral: 1, fame: 2, wealth: 3, sectProsperity: 0 }, flags: { seen: true } }
const event: DomainEvent = { id: 'event-1', type: 'battle.enemy_defeated', occurredAtTick: 4, payload: {}, sourceActionId: 'action-1' }

describe('ComedyDirector', () => {
  it('同一 RNG/事件序列稳定选择 1 个主笑点和最多 2 个轻反应', () => {
    const definitions = [
      { id: 'major-a', layer: 'rule' as const, scale: 'major' as const, triggerEvent: event.type, conditions: [], cooldownGroup: 'major', firstCueId: 'cue:a:first', repeatCueId: 'cue:a:repeat', maxBlockingMs: 500, reducedMotionCueId: 'cue:a:static' },
      { id: 'minor-a', layer: 'situation' as const, scale: 'minor' as const, triggerEvent: event.type, conditions: [], cooldownGroup: 'minor-a', firstCueId: 'cue:ma:first', repeatCueId: 'cue:ma:repeat', maxBlockingMs: 300, reducedMotionCueId: 'cue:ma:static' },
      { id: 'minor-b', layer: 'interaction' as const, scale: 'minor' as const, triggerEvent: event.type, conditions: [], cooldownGroup: 'minor-b', firstCueId: 'cue:mb:first', repeatCueId: 'cue:mb:repeat', maxBlockingMs: 300, reducedMotionCueId: 'cue:mb:static' },
      { id: 'minor-c', layer: 'presentation' as const, scale: 'minor' as const, triggerEvent: event.type, conditions: [], cooldownGroup: 'minor-c', firstCueId: 'cue:mc:first', repeatCueId: 'cue:mc:repeat', maxBlockingMs: 300, reducedMotionCueId: 'cue:mc:static' },
    ]
    const first = new ComedyDirector(definitions).select(event, { conditionContext: context, tick: 4, actionId: 'action-1', rngState: 123 })
    const second = new ComedyDirector(definitions).select(event, { conditionContext: context, tick: 4, actionId: 'action-1', rngState: 123 })
    expect(first).toEqual(second)
    expect(first.major).not.toBeNull()
    expect(first.minor).toHaveLength(2)
  })

  it('重复笑点使用 repeat cue，冷却按 tick 生效且首次奖励只请求一次', () => {
    const director = new ComedyDirector([{
      id: 'combo', layer: 'situation', scale: 'minor', triggerEvent: event.type, conditions: [], requiredTags: ['cat'], cooldownGroup: 'combo', cooldownTicks: 3, firstCueId: 'first', repeatCueId: 'repeat', maxBlockingMs: 400, reducedMotionCueId: 'static', firstDiscoveryGrantKey: 'grant:combo', effects: [{ type: 'give_item', itemId: asItemId('item:fish'), count: 1, grantKey: 'grant:combo' }],
    }])
    const first = director.select(event, { conditionContext: context, tags: ['cat'], tick: 1, actionId: 'a', rngState: 1 })
    expect(first.minor[0]).toMatchObject({ cueId: 'first', isRepeat: false, effectRequests: [{ type: 'give_item' }] })
    expect(director.select(event, { conditionContext: context, tags: ['cat'], tick: 2, actionId: 'b', rngState: 1 }).minor).toHaveLength(0)
    const repeat = director.select(event, { conditionContext: context, tags: ['cat'], tick: 4, actionId: 'c', rngState: 1 })
    expect(repeat.minor[0]).toMatchObject({ cueId: 'repeat', isRepeat: true, effectRequests: [] })
  })

  it('拒绝超时演出、非法 Effect 和依赖循环', () => {
    expect(() => new ComedyDirector([{ id: 'slow', layer: 'rule', scale: 'major', triggerEvent: 'x', conditions: [], cooldownGroup: 'x', firstCueId: 'a', repeatCueId: 'b', maxBlockingMs: 1201, reducedMotionCueId: 'c' }])).toThrow(ComedyDirectorError)
    expect(() => new ComedyDirector([{ id: 'bad-effect', layer: 'rule', scale: 'minor', triggerEvent: 'x', conditions: [], cooldownGroup: 'x', firstCueId: 'a', repeatCueId: 'b', maxBlockingMs: 1, reducedMotionCueId: 'c', effects: [{ type: 'delete_item' } as never] }])).toThrow(/Effect 类型/)
    expect(() => new ComedyDirector([
      { id: 'a', layer: 'rule', scale: 'minor', triggerEvent: 'x', conditions: [], cooldownGroup: 'a', firstCueId: 'a', repeatCueId: 'ar', maxBlockingMs: 1, reducedMotionCueId: 'as', dependsOn: ['b'] },
      { id: 'b', layer: 'rule', scale: 'minor', triggerEvent: 'x', conditions: [], cooldownGroup: 'b', firstCueId: 'b', repeatCueId: 'br', maxBlockingMs: 1, reducedMotionCueId: 'bs', dependsOn: ['a'] },
    ])).toThrow(/循环/)
  })
})
