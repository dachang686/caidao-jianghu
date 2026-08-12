import { describe, expect, it } from 'vitest'
import { ch02InteractionChainDefinitions, ch02SituationComboDefinitions } from '../../content/comedy/ch02'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import { InteractionChainEngine, validateInteractionChainDefinitions } from './interactions'
import { SituationComboEngine, validateSituationComboDefinitions } from './situations'

const context: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: { ch02_board_seen: true } }

function event(id: string): DomainEvent {
  return {
    id,
    type: 'gathering.node_collected',
    occurredAtTick: 1,
    payload: { nodeId: 'ch02:river-lotus', locationId: 'qinghe-riverfront' },
    sourceActionId: `${id}:action`,
  }
}

describe('C312 清河县情境与互动幽默', () => {
  it('情境组合首次奖励幂等，重复事件不会重复结算', () => {
    expect(validateSituationComboDefinitions(ch02SituationComboDefinitions).valid).toBe(true)
    const engine = new SituationComboEngine(ch02SituationComboDefinitions, undefined, { conditionContext: context })
    const tags = ['location:qinghe-county', 'gathering:lotus', 'npc:qinghe-registrar']
    const first = engine.trigger(event('ch02:lotus:1'), { tags, tick: 1, actionId: 'ch02:lotus:action:1', rngState: 7 })
    expect(first.status).toBe('triggered')
    expect(first.effectResult?.state.experience).toBe(1)
    expect(engine.trigger(event('ch02:lotus:1'), { tags, tick: 2, actionId: 'ch02:lotus:action:1', rngState: first.rngState }).status).toBe('duplicate_event')
  })

  it('互动链包含四级回应，快速重复输入保持进度不越级', () => {
    expect(validateInteractionChainDefinitions(ch02InteractionChainDefinitions).valid).toBe(true)
    const definition = ch02InteractionChainDefinitions[0]!
    const engine = new InteractionChainEngine(ch02InteractionChainDefinitions)
    const outcomes = [1, 2, 3, 4].map((index) => engine.trigger({
      id: `ch02:registrar:${index}`,
      type: 'npc.interaction',
      occurredAtTick: index,
      payload: { interactionChainId: definition.id },
      sourceActionId: `ch02:registrar:action:${index}`,
    }))
    expect(outcomes.map((outcome) => outcome.status)).toEqual(['triggered', 'triggered', 'triggered', 'triggered'])
    expect(outcomes.at(-1)?.progress).toBe(4)
    expect(engine.trigger({ ...event('ch02:fast-repeat'), type: 'npc.interaction', payload: { interactionChainId: definition.id }, sourceActionId: 'ch02:registrar:action:4' }).status).toBe('duplicate_action')
    expect(engine.getState().progress[definition.id]).toBe(4)
  })
})
