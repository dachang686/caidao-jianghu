import { describe, expect, it } from 'vitest'
import { CORE_CH03_COMEDY_COVERAGE } from '../../content/comedy/coverage-ch03'
import { ch03InteractionChainDefinitions, ch03SituationComboDefinitions } from '../../content/comedy/ch03'
import { ch03RuleComedyDefinitions } from '../../content/comedy/rules'
import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import { InteractionChainEngine, validateInteractionChainDefinitions } from './interactions'
import { SituationComboEngine, validateSituationComboDefinitions } from './situations'
import { validateComedyCoverage } from '../../validators/content/comedy'

const context: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: { ch03_ledger_seen: true } }

function event(id: string): DomainEvent {
  return {
    id,
    type: 'gathering.node_collected',
    occurredAtTick: 1,
    payload: { nodeId: 'ch03:mountain-pepper', locationId: 'blackwind-kitchen' },
    sourceActionId: `${id}:action`,
  }
}

describe('C322 黑风寨情境与互动幽默', () => {
  it('C323 补齐规则与 Boss 演出，四层 coverage 完整', () => {
    expect(ch03RuleComedyDefinitions).toHaveLength(1)
    expect(validateComedyCoverage(CORE_CH03_COMEDY_COVERAGE).valid).toBe(true)
    expect(CORE_CH03_COMEDY_COVERAGE[0]!.entries.map((entry) => entry.layer)).toEqual(['rule', 'situation', 'interaction', 'presentation'])
  })

  it('情境组合首次奖励幂等，重复事件不会重复结算', () => {
    expect(validateSituationComboDefinitions(ch03SituationComboDefinitions).valid).toBe(true)
    const engine = new SituationComboEngine(ch03SituationComboDefinitions, undefined, { conditionContext: context })
    const tags = ['location:blackwind-fortress', 'gathering:pepper', 'npc:blackwind-cook']
    const first = engine.trigger(event('ch03:pepper:1'), { tags, tick: 1, actionId: 'ch03:pepper:action:1', rngState: 7 })
    expect(first.status).toBe('triggered')
    expect(first.effectResult?.state.experience).toBe(1)
    expect(engine.trigger(event('ch03:pepper:1'), { tags, tick: 2, actionId: 'ch03:pepper:action:1', rngState: first.rngState }).status).toBe('duplicate_event')
  })

  it('互动链包含四级回应，快速重复输入保持进度不越级', () => {
    expect(validateInteractionChainDefinitions(ch03InteractionChainDefinitions).valid).toBe(true)
    const definition = ch03InteractionChainDefinitions[0]!
    const engine = new InteractionChainEngine(ch03InteractionChainDefinitions)
    const outcomes = [1, 2, 3, 4].map((index) => engine.trigger({
      id: `ch03:cook:${index}`,
      type: 'npc.interaction',
      occurredAtTick: index,
      payload: { interactionChainId: definition.id },
      sourceActionId: `ch03:cook:action:${index}`,
    }))
    expect(outcomes.map((outcome) => outcome.status)).toEqual(['triggered', 'triggered', 'triggered', 'triggered'])
    expect(outcomes.at(-1)?.progress).toBe(4)
    expect(engine.trigger({ ...event('ch03:fast-repeat'), type: 'npc.interaction', payload: { interactionChainId: definition.id }, sourceActionId: 'ch03:cook:action:4' }).status).toBe('duplicate_action')
    expect(engine.getState().progress[definition.id]).toBe(4)
  })
})
