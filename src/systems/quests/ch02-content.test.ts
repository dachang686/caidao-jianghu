import { describe, expect, it } from 'vitest'
import { CH02_QUESTS } from '../../content/quests/ch02'
import { asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'
import type { ConditionContext, QuestConditionStatus } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { QuestDefinition } from '../../types/quest'
import { QuestEngine, validateQuestDefinitions } from './engine'

const registrarId = asNpcId('qinghe-registrar')
const boatwomanId = asNpcId('qinghe-boatwoman')
const teaKeeperId = asNpcId('qinghe-tea-keeper')
const mainline = CH02_QUESTS.filter((quest) => quest.kind === 'main')
const side = CH02_QUESTS.filter((quest) => quest.kind === 'side')

const baseContext: ConditionContext = {
  quests: {},
  inventory: {},
  stats: {},
  flags: { ch01_mainline_complete: true },
}

function event(id: string, type: string, payload: Record<string, unknown>): DomainEvent {
  return { id, type, occurredAtTick: 1, payload, sourceActionId: `${id}:action` }
}

describe('C312 清河县任务链', () => {
  it('严格包含四条主线、两条支线，奖励 grantKey 唯一且定义完整', () => {
    const validation = validateQuestDefinitions(CH02_QUESTS)
    expect(validation.valid).toBe(true)
    expect(mainline).toHaveLength(4)
    expect(side).toHaveLength(2)
    expect(new Set(CH02_QUESTS.map((quest) => quest.rewardGrantKey)).size).toBe(CH02_QUESTS.length)
    expect(CH02_QUESTS.every((quest) => quest.objectives?.length === 1)).toBe(true)
  })

  it('四条主线按事件可达，末条主线只设置 Boss 前置与自动存档标记', () => {
    let questStatuses: Record<string, QuestConditionStatus> = {}
    const context = (): ConditionContext => ({ ...baseContext, quests: questStatuses })
    const engine = new QuestEngine(CH02_QUESTS, undefined, { conditionContext: context })
    const [first, second, third, fourth] = mainline
    expect(engine.getState().tasks.find((task) => task.questId === first!.id)?.status).toBe('active')

    const deliver = (questId: QuestDefinition['id'], questEvent: DomainEvent) => {
      const applied = engine.applyEvent(questEvent)
      expect(applied.changedQuestIds).toContain(questId)
      const result = engine.deliver(questId)
      expect(result.status).toBe('delivered')
      questStatuses = { ...questStatuses, [String(questId)]: 'completed' }
      engine.refresh()
      return result
    }

    deliver(first!.id, event('ch02:q1', 'npc.interaction', { npcId: registrarId, kind: 'help' }))
    deliver(second!.id, event('ch02:q2', 'exploration.hotspot_activated', { hotspotId: asHotspotId('ch02:ranking-board') }))
    deliver(third!.id, event('ch02:q3', 'npc.interaction', { npcId: boatwomanId, kind: 'help' }))
    const final = deliver(fourth!.id, event('ch02:q4', 'npc.interaction', { npcId: teaKeeperId, kind: 'help' }))

    expect(final.effectResult?.state.flags).toMatchObject({ ch02_boss_ready: true, ch02_autosave_checkpoint: true, ch02_mainline_complete: true })
    expect(engine.deliver(fourth!.id).status).toBe('already_completed')
  })

  it('支线莲子目标引用真实采集节点，避免把材料墙写进主线', () => {
    const lotusQuest = CH02_QUESTS.find((quest) => String(quest.id) === 'ch02:side:river-lotus')!
    expect(lotusQuest.kind).toBe('side')
    expect(lotusQuest.objectives?.[0]?.payloadMatch?.nodeId).toBe(asGatheringNodeId('ch02:river-lotus'))
    expect(lotusQuest.conditions?.[0]).toEqual({ type: 'quest_complete', questId: asQuestId('ch02:mainline:river-route') })
  })
})
