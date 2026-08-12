import { describe, expect, it } from 'vitest'
import { sectSituationComboDefinitions } from '../../content/comedy'
import { asItemId } from '../../types/ids'
import type { SituationComboDefinition } from '../../types/comedy'
import type { DomainEvent } from '../../types/events'
import {
  SituationComboEngine,
  SituationComboEngineError,
  createSituationComboEngine,
  parseSituationComboSnapshot,
  restoreSituationComboSnapshot,
  serializeSituationComboSnapshot,
  validateSituationComboDefinitions,
} from './situations'

const itemId = asItemId('item:fish')
const eventOne: DomainEvent = { id: 'event:fish-1', type: 'item.gained', occurredAtTick: 1, payload: {}, sourceActionId: 'action:fish-1' }
const eventTwo: DomainEvent = { id: 'event:fish-2', type: 'item.gained', occurredAtTick: 2, payload: {}, sourceActionId: 'action:fish-2' }

function makeDefinition(): SituationComboDefinition {
  return {
    id: 'situation:cat-fish',
    layer: 'situation',
    scale: 'minor',
    triggerEvent: 'item.gained',
    conditions: [{ type: 'flag_equals', flag: 'fishStall', value: true }],
    requiredTags: ['cat', 'quest:fish'],
    cooldownGroup: 'situation:cat-fish',
    cooldownTicks: 1,
    firstCueId: 'cue:cat-fish:first',
    repeatCueId: 'cue:cat-fish:repeat',
    reducedMotionCueId: 'cue:cat-fish:static',
    maxBlockingMs: 300,
    firstDiscoveryGrantKey: 'grant:situation:cat-fish',
    effects: [{ type: 'give_item', itemId, count: 1, grantKey: 'effect:situation:cat-fish' }],
  }
}

function context(tags: readonly string[] = ['cat', 'quest:fish'], rngState = 7) {
  return {
    conditionContext: { quests: {}, inventory: {}, stats: {}, flags: { fishStall: true } },
    tags,
    tick: 1,
    actionId: 'action:situation',
    rngState,
  }
}

describe('SituationComboEngine', () => {
  it('Core 门派四组情境组合均有安全的首次幂等奖励', () => {
    expect(sectSituationComboDefinitions).toHaveLength(4)
    expect(validateSituationComboDefinitions(sectSituationComboDefinitions)).toEqual({ valid: true, issues: [] })
    sectSituationComboDefinitions.forEach((definition, index) => {
      const engine = createSituationComboEngine([definition])
      const first = engine.trigger(
        { id: `event:sect-dispatch:${index}:first`, type: 'sect.dispatch_completed', occurredAtTick: 1, payload: {}, sourceActionId: `action:sect-dispatch:${index}:first` },
        { conditionContext: { quests: {}, inventory: {}, stats: {}, flags: {} }, tags: definition.requiredTags, tick: 1, actionId: `action:sect-dispatch:${index}:first`, rngState: index + 1 },
      )
      const repeat = engine.trigger(
        { id: `event:sect-dispatch:${index}:repeat`, type: 'sect.dispatch_completed', occurredAtTick: 2, payload: {}, sourceActionId: `action:sect-dispatch:${index}:repeat` },
        { conditionContext: { quests: {}, inventory: {}, stats: {}, flags: {} }, tags: definition.requiredTags, tick: 2, actionId: `action:sect-dispatch:${index}:repeat`, rngState: index + 1 },
      )
      expect(first).toMatchObject({ status: 'triggered', comboId: definition.id, repeat: false })
      expect(repeat).toMatchObject({ status: 'repeat', comboId: definition.id, repeat: true })
      expect(engine.getState().claimedGrantKeys).toEqual([definition.firstDiscoveryGrantKey])
    })
  })

  it('固定事件、标签、Condition 与 RNG 得到可复现结果', () => {
    const first = createSituationComboEngine([makeDefinition()])
    const second = createSituationComboEngine([makeDefinition()])
    const firstResult = first.trigger(eventOne, context())
    const secondResult = second.trigger(eventOne, context())
    expect(firstResult).toEqual(secondResult)
    expect(firstResult).toMatchObject({ status: 'triggered', comboId: 'situation:cat-fish', cueId: 'cue:cat-fish:first', repeat: false })
    expect(first.getEffectState().inventory[itemId]).toBe(1)
  })

  it('缺失标签会被拒绝，首次 grantKey 只发一次，重复只返回短 cue', () => {
    const engine = new SituationComboEngine([makeDefinition()])
    expect(engine.trigger(eventOne, context(['cat'])).status).toBe('missing_tags')
    const first = engine.trigger(eventTwo, { ...context(), tick: 2, actionId: 'action:situation:2' })
    expect(first.status).toBe('triggered')
    const repeat = engine.trigger({ ...eventTwo, id: 'event:fish-3' }, { ...context(), tick: 3, actionId: 'action:situation:3' })
    expect(repeat).toMatchObject({ status: 'repeat', cueId: 'cue:cat-fish:repeat', repeat: true })
    expect(engine.getEffectState().inventory[itemId]).toBe(1)
  })

  it('快照恢复后仍保持首次发现幂等', () => {
    const engine = createSituationComboEngine([makeDefinition()])
    engine.trigger(eventOne, context())
    const snapshot = parseSituationComboSnapshot(serializeSituationComboSnapshot(engine.snapshot()))
    const restored = restoreSituationComboSnapshot([makeDefinition()], snapshot)
    const repeat = restored.trigger(eventTwo, { ...context(), tick: 2, actionId: 'action:restored' })
    expect(repeat.status).toBe('repeat')
    expect(restored.getEffectState().inventory[itemId]).toBeUndefined()
  })

  it('拒绝非法 Effect 与自循环组合依赖', () => {
    const base = makeDefinition()
    expect(() => new SituationComboEngine([{ ...base, effects: [{ type: 'delete_item' } as never] }])).toThrow(SituationComboEngineError)
    expect(() => new SituationComboEngine([{ ...base, id: 'loop', dependsOn: ['loop'] }])).toThrow(/循环/)
  })
})
