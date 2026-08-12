import { describe, expect, it } from 'vitest'
import { asContentKey, asItemId } from '../../types/ids'
import type { DomainEvent } from '../../types/events'
import type { InteractionChainDefinition } from '../../types/comedy'
import {
  InteractionChainEngine,
  InteractionChainEngineError,
  createInteractionChainEngine,
  parseInteractionChainSnapshot,
  restoreInteractionChainSnapshot,
  serializeInteractionChainSnapshot,
  validateInteractionChainDefinitions,
} from './interactions'

const definition: InteractionChainDefinition = {
  id: 'interaction:old-man-click',
  triggerEvent: 'npc.interaction',
  stages: [
    { threshold: 1, cueId: 'cue:answer', effects: [{ type: 'narrate', lineId: asContentKey('line:answer') }] },
    { threshold: 2, cueId: 'cue:noticing', effects: [{ type: 'give_item', itemId: asItemId('item:fish'), count: 1, grantKey: 'interaction:old-man:stage-2' }] },
    { threshold: 3, cueId: 'cue:irritated', effects: [{ type: 'change_stat', stat: 'fame', delta: 1 }] },
    { threshold: 4, cueId: 'cue:reverse', effects: [] },
  ],
  stableRepeatCueId: 'cue:old-man:stable',
  progressActionId: 'quest:old-man:advance',
}

function event(id: string, sourceActionId = id, type = 'npc.interaction', chainId = definition.id): DomainEvent {
  return { id, type, occurredAtTick: 1, sourceActionId, payload: chainId ? { chainId } : {} }
}

describe('InteractionChainEngine', () => {
  it('按阈值逐级触发，重复动作不越级，最终只返回稳定短反馈', () => {
    const engine = new InteractionChainEngine([definition])
    const first = engine.trigger(event('click-1'))
    expect(first).toMatchObject({ status: 'triggered', progress: 1, stageIndex: 0, cueId: 'cue:answer', progressActionId: 'quest:old-man:advance', progressPreserved: true })
    expect(first.effectRequests).toHaveLength(1)

    const duplicateEvent = engine.trigger(event('click-1'))
    expect(duplicateEvent).toMatchObject({ status: 'duplicate_event', progress: 1, progressPreserved: true })
    expect(duplicateEvent.effectRequests).toEqual([])

    const duplicateAction = engine.trigger(event('click-1-replay', 'click-1'))
    expect(duplicateAction).toMatchObject({ status: 'duplicate_action', progress: 1 })

    expect(engine.trigger(event('click-2'))).toMatchObject({ status: 'triggered', progress: 2, stageIndex: 1 })
    expect(engine.trigger(event('click-3'))).toMatchObject({ status: 'triggered', progress: 3, stageIndex: 2 })
    expect(engine.trigger(event('click-4'))).toMatchObject({ status: 'triggered', progress: 4, stageIndex: 3 })
    const stable = engine.trigger(event('click-5'))
    expect(stable).toMatchObject({ status: 'stable_repeat', progress: 5, stageIndex: 3, cueId: 'cue:old-man:stable', repeat: true, progressActionId: 'quest:old-man:advance' })
    expect(stable.effectRequests).toEqual([])
  })

  it('快照恢复后计数跨区域延续，首次阶段奖励不会重复发放', () => {
    const original = createInteractionChainEngine([definition])
    original.trigger(event('region-a-1'))
    original.trigger(event('region-a-2'))
    const parsed = parseInteractionChainSnapshot(serializeInteractionChainSnapshot(original.snapshot()))
    const restored = restoreInteractionChainSnapshot([definition], parsed)
    const next = restored.trigger(event('region-b-3'))
    expect(next).toMatchObject({ status: 'triggered', progress: 3, stageIndex: 2 })
    expect(next.effectRequests).toHaveLength(1)
    const repeated = restored.trigger(event('region-b-3-replay', 'region-b-3'))
    expect(repeated.status).toBe('duplicate_action')
    expect(repeated.effectRequests).toEqual([])
    expect(restored.snapshot().progress[definition.id]).toBe(3)
  })

  it('同一引擎可处理 NPC、砍价、交错物品和逃跑事件，不依赖 UI 事件名', () => {
    const make = (id: string, triggerEvent: string): InteractionChainDefinition => ({
      id,
      triggerEvent,
      stages: [
        { threshold: 1, cueId: `${id}:1`, effects: [] },
        { threshold: 2, cueId: `${id}:2`, effects: [] },
        { threshold: 3, cueId: `${id}:3`, effects: [] },
      ],
      stableRepeatCueId: `${id}:stable`,
    })
    const engine = new InteractionChainEngine([
      make('interaction:bargain', 'shop.bargain'),
      make('interaction:interleave', 'inventory.interleave'),
      make('interaction:flee', 'battle.flee'),
    ])
    expect(engine.trigger(event('bargain-1', 'bargain-1', 'shop.bargain', 'interaction:bargain')).status).toBe('triggered')
    expect(engine.trigger(event('interleave-1', 'interleave-1', 'inventory.interleave', 'interaction:interleave')).status).toBe('triggered')
    expect(engine.trigger(event('flee-1', 'flee-1', 'battle.flee', 'interaction:flee')).status).toBe('triggered')
  })

  it('拒绝阶段数量/阈值错误，未匹配事件只记录一次且不改主线动作', () => {
    expect(validateInteractionChainDefinitions([{ ...definition, stages: definition.stages.slice(0, 2) }]).valid).toBe(false)
    expect(validateInteractionChainDefinitions([{ ...definition, stages: definition.stages.map((stage, index) => index === 1 ? { ...stage, threshold: 1 } : stage) }]).valid).toBe(false)
    expect(() => new InteractionChainEngine([{ ...definition, stages: definition.stages.slice(0, 2) }])).toThrow(InteractionChainEngineError)
    const engine = new InteractionChainEngine([definition])
    const none = engine.trigger({ ...event('other-1', 'other-1', 'unknown.event', '') })
    expect(none).toMatchObject({ status: 'none', chainId: null, progress: 0 })
    expect(engine.trigger({ ...event('other-1', 'other-1', 'unknown.event', '') }).status).toBe('duplicate_event')
    expect(engine.snapshot().progress).toEqual({})
  })
})
