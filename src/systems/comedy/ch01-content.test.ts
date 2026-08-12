import { describe, expect, it } from 'vitest'
import { ch01InteractionChainDefinitions, ch01SituationComboDefinitions } from '../../content/comedy/ch01'
import type { DomainEvent } from '../../types/events'
import { createInteractionChainEngine, validateInteractionChainDefinitions } from './interactions'
import { createSituationComboEngine, validateSituationComboDefinitions } from './situations'

function event(id: string, type: string, payload: Record<string, unknown>): DomainEvent {
  return { id, type, payload, occurredAtTick: 1, sourceActionId: `action:${id}` }
}

describe('C302 第 1 章情境与互动幽默', () => {
  it('包含一组自然情境组合，首次发现和重复触发均幂等', () => {
    expect(validateSituationComboDefinitions(ch01SituationComboDefinitions)).toEqual({ valid: true, issues: [] })
    const definition = ch01SituationComboDefinitions[0]!
    const engine = createSituationComboEngine(definition ? [definition] : [])
    const context = {
      conditionContext: { quests: {}, inventory: {}, stats: {}, flags: { catResolved: true } },
      tags: definition.requiredTags,
      tick: 1,
      actionId: 'action:ch01:herb:1',
      rngState: 19,
    }
    const first = engine.trigger(event('ch01:herb:1', 'gathering.node_collected', { nodeId: 'ch01:hill-herbs' }), context)
    expect(first).toMatchObject({ status: 'triggered', comboId: definition.id, repeat: false })
    const repeat = engine.trigger(event('ch01:herb:2', 'gathering.node_collected', { nodeId: 'ch01:hill-herbs' }), { ...context, tick: 2, actionId: 'action:ch01:herb:2' })
    expect(repeat).toMatchObject({ status: 'repeat', comboId: definition.id, repeat: true })
    expect(engine.getEffectState().experience).toBe(1)
  })

  it('两条互动链均为 3–5 级，阶段奖励只请求一次，达到末级后稳定短反馈', () => {
    expect(ch01InteractionChainDefinitions).toHaveLength(2)
    expect(validateInteractionChainDefinitions(ch01InteractionChainDefinitions)).toEqual({ valid: true, issues: [] })
    ch01InteractionChainDefinitions.forEach((definition) => {
      const engine = createInteractionChainEngine([definition])
      definition.stages.forEach((stage, index) => {
        const result = engine.trigger(
          event(`${definition.id}:${index + 1}`, definition.triggerEvent, { interactionChainId: definition.id }),
          { actionId: `${definition.id}:action:${index + 1}`, occurredAtTick: index + 1 },
        )
        expect(result.status).toBe('triggered')
        expect(result.stageIndex).toBe(index)
        result.effectRequests.forEach((effect) => {
          if (effect.type === 'give_exp' || effect.type === 'give_item') expect(effect.grantKey).toBeTruthy()
        })
      })
      const stable = engine.trigger(
        event(`${definition.id}:stable`, definition.triggerEvent, { interactionChainId: definition.id }),
        { actionId: `${definition.id}:stable`, occurredAtTick: definition.stages.length + 1 },
      )
      expect(stable).toMatchObject({ status: 'stable_repeat', repeat: true, cueId: definition.stableRepeatCueId })
      expect(stable.effectRequests).toEqual([])
      expect(engine.snapshot().claimedStageKeys).toHaveLength(definition.stages.length)
    })
  })
})
