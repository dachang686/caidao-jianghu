import { describe, expect, it } from 'vitest'
import { CH04_QUESTS } from '../../content/quests/ch04'
import { asGatheringNodeId, asHotspotId, asNpcId } from '../../types/ids'
import type { ConditionContext, QuestConditionStatus } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { QuestDefinition } from '../../types/quest'
import { QuestEngine, validateQuestDefinitions } from './engine'

const gateDiscipleId = asNpcId('qingyun-gate-disciple')
const herbalistId = asNpcId('qingyun-herbalist')
const bellKeeperId = asNpcId('qingyun-bell-keeper')
const mainline = CH04_QUESTS.filter((quest) => quest.kind === 'main')
const side = CH04_QUESTS.filter((quest) => quest.kind === 'side')

const baseContext: ConditionContext = {
  quests: {},
  inventory: {},
  stats: {},
  flags: { ch03_mainline_complete: true },
}

function event(id: string, type: string, payload: Record<string, unknown>): DomainEvent {
  return { id, type, occurredAtTick: 1, payload, sourceActionId: `${id}:action` }
}

describe('C332 青云山任务链', () => {
  it('严格包含四条主线、两条手工支线，奖励 grantKey 唯一且定义完整', () => {
    const validation = validateQuestDefinitions(CH04_QUESTS)
    expect(validation.valid).toBe(true)
    expect(mainline).toHaveLength(4)
    expect(side).toHaveLength(2)
    expect(new Set(CH04_QUESTS.map((quest) => quest.rewardGrantKey)).size).toBe(CH04_QUESTS.length)
    expect(CH04_QUESTS.every((quest) => quest.objectives?.length === 1)).toBe(true)
  })

  it('四条主线按事件可达，末条主线只设置掌门前置与自动存档标记', () => {
    let questStatuses: Record<string, QuestConditionStatus> = {}
    const context = (): ConditionContext => ({ ...baseContext, quests: questStatuses })
    const engine = new QuestEngine(CH04_QUESTS, undefined, { conditionContext: context })
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

    deliver(first!.id, event('ch04:q1', 'npc.interaction', { npcId: gateDiscipleId, kind: 'help' }))
    deliver(second!.id, event('ch04:q2', 'exploration.hotspot_activated', { hotspotId: asHotspotId('ch04:gate-inscription') }))
    deliver(third!.id, event('ch04:q3', 'npc.interaction', { npcId: herbalistId, kind: 'help' }))
    const final = deliver(fourth!.id, event('ch04:q4', 'npc.interaction', { npcId: bellKeeperId, kind: 'help' }))

    expect(final.effectResult?.state.flags).toMatchObject({ ch04_boss_ready: true, ch04_autosave_checkpoint: true, ch04_mainline_complete: true })
    expect(engine.deliver(fourth!.id).status).toBe('already_completed')
  })

  it('手工支线引用真实青蘅采集节点，且不把材料墙写进主线', () => {
    const herbQuest = CH04_QUESTS.find((quest) => String(quest.id) === 'ch04:side:cloud-herb')!
    expect(herbQuest.kind).toBe('side')
    expect(herbQuest.objectives?.[0]?.payloadMatch?.nodeId).toBe(asGatheringNodeId('ch04:cloud-herb'))
    expect(herbQuest.conditions?.[0]).toEqual({ type: 'quest_complete', questId: mainline[0]!.id })
    expect(mainline.some((quest) => quest.objectives?.[0]?.payloadMatch?.nodeId === asGatheringNodeId('ch04:cloud-herb'))).toBe(false)
  })
})
