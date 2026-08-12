import { describe, expect, it } from 'vitest'
import { chapterContent } from '../../content/chapters/ch01'
import { createEffectState } from '../../types/effects'
import type { DomainEvent } from '../../types/events'
import { asQuestId } from '../../types/ids'
import { createQuestEngine, validateQuestDefinitions } from './engine'

function event(id: string, type: string, payload: Record<string, unknown>): DomainEvent {
  return { id, type, payload, occurredAtTick: 1, sourceActionId: `action:${id}` }
}

describe('C302 第 1 章任务内容', () => {
  it('严格包含三条主线和两条支线，奖励 grantKey 唯一', () => {
    const quests = chapterContent.quests
    expect(quests.filter((quest) => quest.kind === 'main')).toHaveLength(3)
    expect(quests.filter((quest) => quest.kind === 'side')).toHaveLength(2)
    expect(validateQuestDefinitions(quests)).toEqual({ valid: true, issues: [] })
    const grantKeys = quests.map((quest) => quest.rewardGrantKey)
    expect(grantKeys.every((key) => typeof key === 'string' && key.length > 0)).toBe(true)
    expect(new Set(grantKeys).size).toBe(quests.length)
  })

  it('主线可按领域事件推进到白大侠前置，并在重复交付时保持幂等', () => {
    const effects = createEffectState()
    let engine: ReturnType<typeof createQuestEngine>
    engine = createQuestEngine(chapterContent.quests, undefined, {
      effectState: effects,
      conditionContext: () => ({
        quests: Object.fromEntries(engine.getState().tasks.map((task) => [String(task.questId), { status: task.status }])),
        inventory: {},
        stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
        flags: {},
      }),
    })

    expect(engine.getState().tasks.find((task) => task.questId === 'first-steps')?.status).toBe('active')
    engine.applyEvent(event('ch01:old-man-help', 'npc.interaction', { npcId: 'old-man', kind: 'help' }))
    const firstDelivery = engine.deliver(asQuestId('first-steps'), { sourceActionId: 'quest:ch01:first-steps:deliver' })
    expect(firstDelivery.status).toBe('delivered')
    expect(firstDelivery.effectResult?.state.flags.ch01_manual_path_open).toBe(true)
    expect(engine.refresh().tasks.find((task) => task.questId === asQuestId('manual-clue'))?.status).toBe('active')

    engine.applyEvent(event('ch01:old-man-click', 'npc.interaction', { npcId: 'old-man', kind: 'click' }))
    expect(engine.deliver(asQuestId('manual-clue')).status).toBe('delivered')
    expect(engine.refresh().tasks.find((task) => task.questId === asQuestId('challenge-bai'))?.status).toBe('active')

    engine.applyEvent(event('ch01:bai-win', 'battle.won', { enemyId: 'bai-daxia' }))
    const finalDelivery = engine.deliver(asQuestId('challenge-bai'), { sourceActionId: 'quest:ch01:challenge-bai:deliver' })
    expect(finalDelivery.status).toBe('delivered')
    expect(finalDelivery.effectResult?.state.flags).toMatchObject({
      ch01_boss_ready: true,
      ch01_autosave_checkpoint: true,
      ch01_mainline_complete: true,
    })
    expect(engine.deliver(asQuestId('challenge-bai')).status).toBe('already_completed')
  })

  it('支线不在主线条件链上，采集与猫事件均有明确入口', () => {
    const sideIds = chapterContent.quests.filter((quest) => quest.kind === 'side').map((quest) => quest.id)
    expect(sideIds).toEqual(['find-cat', 'kitchen-supply'])
    expect(chapterContent.quests.find((quest) => quest.id === 'find-cat')?.objectives?.[0]?.eventType).toBe('npc.interaction')
    expect(chapterContent.quests.find((quest) => quest.id === 'kitchen-supply')?.objectives?.[0]?.eventType).toBe('gathering.node_collected')
  })
})
