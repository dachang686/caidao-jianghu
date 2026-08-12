import { describe, expect, it } from 'vitest'
import { CORE_CH04_COMEDY_COVERAGE } from '../../content/comedy/coverage-ch04'
import { ch04InteractionChainDefinitions, ch04SituationComboDefinitions } from '../../content/comedy/ch04'
import { ch04RuleComedyDefinitions } from '../../content/comedy/rules'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import { InteractionChainEngine, validateInteractionChainDefinitions } from './interactions'
import { SituationComboEngine, validateSituationComboDefinitions } from './situations'
import { validateComedyCoverage } from '../../validators/content/comedy'

const context: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: { ch04_gate_seen: true } }

function event(id: string): DomainEvent {
  return {
    id,
    type: 'gathering.node_collected',
    occurredAtTick: 1,
    payload: { nodeId: 'ch04:cloud-herb', locationId: 'qingyun-herb-garden' },
    sourceActionId: `${id}:action`,
  }
}

describe('C333 青云山情境与互动幽默', () => {
  it('规则、情境、互动、Boss 演出四层 coverage 完整', () => {
    expect(ch04RuleComedyDefinitions).toHaveLength(1)
    expect(validateComedyCoverage(CORE_CH04_COMEDY_COVERAGE).valid).toBe(true)
    expect(CORE_CH04_COMEDY_COVERAGE[0]!.entries.map((entry) => entry.layer)).toEqual(['rule', 'situation', 'interaction', 'presentation'])
  })

  it('情境组合首次奖励幂等，重复事件不会重复结算', () => {
    expect(validateSituationComboDefinitions(ch04SituationComboDefinitions).valid).toBe(true)
    const engine = new SituationComboEngine(ch04SituationComboDefinitions, undefined, { conditionContext: context })
    const tags = ['location:qingyun-mountain', 'gathering:cloud-herb', 'npc:qingyun-herbalist']
    const first = engine.trigger(event('ch04:herb:1'), { tags, tick: 1, actionId: 'ch04:herb:action:1', rngState: 7 })
    expect(first.status).toBe('triggered')
    expect(first.effectResult?.state.experience).toBe(1)
    expect(engine.trigger(event('ch04:herb:1'), { tags, tick: 2, actionId: 'ch04:herb:action:1', rngState: first.rngState }).status).toBe('duplicate_event')
  })

  it('互动链包含四级回应，快速重复输入保持进度不越级', () => {
    expect(validateInteractionChainDefinitions(ch04InteractionChainDefinitions).valid).toBe(true)
    const definition = ch04InteractionChainDefinitions[0]!
    const engine = new InteractionChainEngine(ch04InteractionChainDefinitions)
    const outcomes = [1, 2, 3, 4].map((index) => engine.trigger({
      id: `ch04:bell:${index}`,
      type: 'npc.interaction',
      occurredAtTick: index,
      payload: { interactionChainId: definition.id },
      sourceActionId: `ch04:bell:action:${index}`,
    }))
    expect(outcomes.map((outcome) => outcome.status)).toEqual(['triggered', 'triggered', 'triggered', 'triggered'])
    expect(outcomes.at(-1)?.progress).toBe(4)
    expect(engine.trigger({ ...event('ch04:fast-repeat'), type: 'npc.interaction', payload: { interactionChainId: definition.id }, sourceActionId: 'ch04:bell:action:4' }).status).toBe('duplicate_action')
    expect(engine.getState().progress[definition.id]).toBe(4)
  })
})
