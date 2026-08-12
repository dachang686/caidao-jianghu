import { describe, expect, it } from 'vitest'
import type { DomainEvent } from '../../types/events'
import type { UnlockableDefinition } from '../../types/unlockable'
import {
  UnlockableEngine,
  calculateTitleBonuses,
  deriveTitleCombatStats,
  parseUnlockableSnapshot,
  serializeUnlockableSnapshot,
} from './engine'

function event(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 1, sourceActionId: `action:${id}` }
}

const definitions: readonly UnlockableDefinition[] = [
  {
    id: 'npc:old-man',
    kind: 'npc',
    name: '不正经老头',
    description: '村口的前辈。',
    clue: '村口有个影子。',
    eventRules: [{ type: 'npc.first_seen', payload: { npcId: 'old-man' } }],
  },
  {
    id: 'title:cleaver',
    kind: 'title',
    name: '菜刀新秀',
    description: '刀法尚可。',
    clue: '木牌上有一道刀痕。',
    eventRules: [{ type: 'title.earned', payload: { titleId: 'cleaver' } }],
    titleBonus: { attack: 1, crit: 0.01 },
  },
  {
    id: 'achievement:rich',
    kind: 'achievement',
    name: '有钱能使鬼推磨',
    description: '钱袋有点分量。',
    clue: '钱袋在响，但还听不清里面有几枚。',
    eventRules: [{ type: 'wealthy', payload: { tier: 'high' } }],
    conditions: [{ type: 'stat_gte', stat: 'wealth', value: 100 }],
  },
]

describe('UnlockableEngine', () => {
  it('processes each event once and never repeats title rewards', () => {
    const engine = new UnlockableEngine(definitions)
    const first = engine.applyEvent(event('seen-1', 'npc.first_seen', { npcId: 'old-man' }))
    const duplicate = engine.applyEvent(event('seen-1', 'npc.first_seen', { npcId: 'old-man' }))
    const repeatedRule = engine.applyEvent(event('seen-2', 'npc.first_seen', { npcId: 'old-man' }))
    const title = engine.applyEvent(event('title-1', 'title.earned', { titleId: 'cleaver' }))
    const titleAgain = engine.applyEvent(event('title-2', 'title.earned', { titleId: 'cleaver' }))

    expect(first.status).toBe('unlocked')
    expect(duplicate.status).toBe('duplicate_event')
    expect(repeatedRule.status).toBe('already_unlocked')
    expect(title.titleRewardIds).toEqual(['title:cleaver'])
    expect(titleAgain.titleRewardIds).toEqual([])
    expect(engine.getState().unlockedIds).toEqual(['npc:old-man', 'title:cleaver'])
    expect(engine.getState().claimedRewardIds).toEqual(['title-reward:title:cleaver'])
  })

  it('uses conditions without leaking a missing condition reference', () => {
    const engine = new UnlockableEngine(definitions)
    const notEnough = engine.applyEvent(event('wealth-1', 'wealthy', { tier: 'high' }), {
      conditionContext: { quests: {}, inventory: {}, stats: { wealth: 99 }, flags: {} },
    })
    const enough = engine.applyEvent(event('wealth-2', 'wealthy', { tier: 'high' }), {
      conditionContext: { quests: {}, inventory: {}, stats: { wealth: 100 }, flags: {} },
    })

    expect(notEnough.status).toBe('no_match')
    expect(enough.unlockedIds).toEqual(['achievement:rich'])
  })

  it('derives title stats from the base so recalculation is stable', () => {
    const base = { attack: 10, defense: 4, crit: 0.1 }
    expect(calculateTitleBonuses(definitions, ['title:cleaver', 'title:cleaver'])).toEqual({ attack: 1, crit: 0.01 })
    expect(deriveTitleCombatStats(base, definitions, ['title:cleaver'])).toEqual({ attack: 11, defense: 4, crit: 0.11 })
    expect(deriveTitleCombatStats(base, definitions, ['title:cleaver'])).toEqual({ attack: 11, defense: 4, crit: 0.11 })
  })

  it('round-trips a saveable snapshot and diagnoses deleted content', () => {
    const engine = new UnlockableEngine(definitions)
    engine.applyEvent(event('seen-1', 'npc.first_seen', { npcId: 'old-man' }))
    const serialized = serializeUnlockableSnapshot({
      ...engine.getState(),
      unlockedIds: [...engine.getState().unlockedIds, 'npc:deleted'],
    })
    const restored = new UnlockableEngine(definitions, parseUnlockableSnapshot(serialized))

    expect(restored.getDiagnostics()).toEqual({ missingDefinitionIds: ['npc:deleted'], missingRewardIds: [] })
    expect(restored.getView('npc:old-man').silhouette).toBe(false)
    expect(restored.getView('achievement:rich').displayName).toBe('未解锁条目')
  })
})
