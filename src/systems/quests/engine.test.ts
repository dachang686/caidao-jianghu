import { describe, expect, it } from 'vitest'
import { createEffectState } from '../../types/effects'
import { asChapterId, asEnemyId, asItemId, asQuestId } from '../../types/ids'
import type { QuestDefinition } from '../../types/quest'
import { EventBus } from '../events'
import {
  activateQuest,
  applyQuestEvent,
  createQuestEngine,
  deliverQuest,
  parseQuestSnapshot,
  serializeQuestSnapshot,
  validateQuestDefinitions,
} from './engine'

const chapterId = asChapterId('ch01')
const mainId = asQuestId('quest:main')
const sideId = asQuestId('quest:side')
const commissionId = asQuestId('commission:delivery')
const itemId = asItemId('item:fish')
const enemyId = asEnemyId('enemy:bai')

function event(id: string, type: string, payload: Record<string, unknown> = {}): { id: string; type: string; occurredAtTick: number; payload: Record<string, unknown>; sourceActionId: string } {
  return { id, type, occurredAtTick: 1, payload, sourceActionId: `action:${id}` }
}

function makeDefinitions(): QuestDefinition[] {
  return [
    {
      id: mainId,
      title: '白大侠的菜刀试炼',
      chapterId,
      objective: '击败白大侠',
      kind: 'main',
      objectives: [{ id: 'win', label: '击败白大侠', eventType: 'battle.won', requiredCount: 1, payloadMatch: { enemyId } }],
      rewards: [{ type: 'give_item', itemId, count: 2 }],
      rewardGrantKey: 'reward:main-bai',
    },
    {
      id: sideId,
      title: '收集鱼干',
      chapterId,
      objective: '找到一条鱼干',
      objectives: [{ id: 'fish', label: '获得鱼干', eventType: 'item.gained', requiredCount: 1, payloadMatch: { itemId } }],
    },
  ]
}

describe('quest engine', () => {
  it('主线置顶语义由 kind 保留，重复事件只增加一次目标进度', () => {
    const engine = createQuestEngine(makeDefinitions())
    expect(engine.getState().tasks.map((task) => task.questId)).toEqual([mainId, sideId])
    const first = applyQuestEvent(engine, event('event:win-1', 'battle.won', { enemyId }))
    expect(first.changedQuestIds).toEqual([mainId])
    expect(engine.getState().tasks[0]).toMatchObject({ status: 'ready', progress: 1, objectiveProgress: { win: 1 } })
    const duplicate = applyQuestEvent(engine, event('event:win-1', 'battle.won', { enemyId }))
    expect(duplicate.changedQuestIds).toEqual([])
    expect(engine.getState().tasks[0]?.progress).toBe(1)
  })

  it('事件先到、任务后接取时保留待处理事件，接取后幂等重放', () => {
    let unlocked = false
    const engine = createQuestEngine([
      {
        ...makeDefinitions()[1]!,
        conditions: [{ type: 'flag_equals', flag: 'sideOpen', value: true }],
      },
    ], undefined, { conditionContext: () => ({ quests: {}, inventory: {}, stats: {}, flags: { sideOpen: unlocked } }) })
    const queued = applyQuestEvent(engine, event('event:fish-1', 'item.gained', { itemId }))
    expect(queued.queuedEventIds).toEqual(['event:fish-1'])
    expect(engine.getState().processedEventIds).not.toContain('event:fish-1')
    unlocked = true
    expect(engine.refresh().tasks[0]?.status).toBe('available')
    expect(activateQuest(engine, sideId).status).toBe('activated')
    expect(engine.getState().tasks[0]).toMatchObject({ status: 'ready', progress: 1 })
    expect(engine.getState().processedEventIds).toContain('event:fish-1')
  })

  it('交付经过 Effect executor 并以 grantKey 防止重复奖励', () => {
    const engine = createQuestEngine(makeDefinitions())
    applyQuestEvent(engine, event('event:win-1', 'battle.won', { enemyId }))
    const first = deliverQuest(engine, mainId, { effectState: createEffectState() })
    expect(first.status).toBe('delivered')
    expect(first.effectResult?.state.inventory[itemId]).toBe(2)
    expect(first.grantKey).toBe('reward:main-bai')
    const second = deliverQuest(engine, mainId, { effectState: first.effectResult!.state })
    expect(second.status).toBe('already_completed')
    expect(second.effectResult).toBeUndefined()
    expect(engine.getState().claimedRewardGrantKeys).toEqual(['reward:main-bai'])
  })

  it('普通任务和程序委托分别限制 6/3 个活动任务', () => {
    const sideDefinitions = Array.from({ length: 7 }, (_, index) => ({
      id: asQuestId(`quest:side-${index}`),
      title: `支线 ${index}`,
      chapterId,
      objective: '目标',
    }))
    const sideEngine = createQuestEngine(sideDefinitions)
    sideDefinitions.slice(0, 6).forEach((definition) => expect(activateQuest(sideEngine, definition.id).status).toBe('activated'))
    expect(activateQuest(sideEngine, sideDefinitions[6]!.id).status).toBe('limit_reached')

    const commissions = Array.from({ length: 4 }, (_, index) => ({
      id: asQuestId(`commission:test-${index}`),
      title: `委托 ${index}`,
      chapterId,
      objective: '目标',
      kind: 'commission' as const,
    }))
    const commissionEngine = createQuestEngine(commissions)
    commissions.slice(0, 3).forEach((definition) => expect(activateQuest(commissionEngine, definition.id).status).toBe('activated'))
    expect(activateQuest(commissionEngine, commissions[3]!.id).status).toBe('limit_reached')
  })

  it('可订阅 EventBus，快照 JSON 化后可恢复', () => {
    const engine = createQuestEngine(makeDefinitions())
    const bus = new EventBus()
    const unsubscribe = engine.subscribe(bus)
    bus.dispatch(event('event:win-1', 'battle.won', { enemyId }))
    unsubscribe()
    const serialized = serializeQuestSnapshot(engine.snapshot())
    const snapshot = parseQuestSnapshot(serialized)
    expect(snapshot.tasks[0]).toMatchObject({ status: 'ready', progress: 1 })
    const restored = createQuestEngine(makeDefinitions(), snapshot)
    expect(JSON.stringify(restored.snapshot())).toBe(JSON.stringify(snapshot))
  })

  it('校验重复任务和无效目标，但不要求无奖励的 legacy 任务凭空生成 grantKey', () => {
    const result = validateQuestDefinitions([
      { ...makeDefinitions()[0]!, id: mainId, objectives: [{ ...makeDefinitions()[0]!.objectives![0]!, requiredCount: 0 }] },
      { ...makeDefinitions()[0]!, id: mainId },
    ])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'duplicate_id')).toBe(true)
    expect(result.issues.some((issue) => issue.code === 'invalid_value')).toBe(true)
  })
})
