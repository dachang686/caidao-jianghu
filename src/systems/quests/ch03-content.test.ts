import { describe, expect, it } from 'vitest'
import { CH03_QUESTS } from '../../content/quests/ch03'
import { asGatheringNodeId, asHotspotId, asNpcId } from '../../types/ids'
import type { ConditionContext, QuestConditionStatus } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { QuestDefinition } from '../../types/quest'
import { QuestEngine, validateQuestDefinitions } from './engine'

const ledgerKeeperId = asNpcId('blackwind-ledger-keeper')
const cookId = asNpcId('blackwind-cook')
const runnerId = asNpcId('blackwind-runner')
const mainline = CH03_QUESTS.filter((quest) => quest.kind === 'main')
const side = CH03_QUESTS.filter((quest) => quest.kind === 'side')

const baseContext: ConditionContext = {
  quests: {},
  inventory: {},
  stats: {},
  flags: { ch02_mainline_complete: true },
}

function event(id: string, type: string, payload: Record<string, unknown>): DomainEvent {
  return { id, type, occurredAtTick: 1, payload, sourceActionId: `${id}:action` }
}

describe('C322 黑风寨任务链', () => {
  it('严格包含四条主线、两条手工支线，奖励 grantKey 唯一且定义完整', () => {
    const validation = validateQuestDefinitions(CH03_QUESTS)
    expect(validation.valid).toBe(true)
    expect(mainline).toHaveLength(4)
    expect(side).toHaveLength(2)
    expect(new Set(CH03_QUESTS.map((quest) => quest.rewardGrantKey)).size).toBe(CH03_QUESTS.length)
    expect(CH03_QUESTS.every((quest) => quest.objectives?.length === 1)).toBe(true)
  })

  it('四条主线按事件可达，末条主线只设置 Boss 前置与自动存档标记', () => {
    let questStatuses: Record<string, QuestConditionStatus> = {}
    const context = (): ConditionContext => ({ ...baseContext, quests: questStatuses })
    const engine = new QuestEngine(CH03_QUESTS, undefined, { conditionContext: context })
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

    deliver(first!.id, event('ch03:q1', 'npc.interaction', { npcId: ledgerKeeperId, kind: 'help' }))
    deliver(second!.id, event('ch03:q2', 'exploration.hotspot_activated', { hotspotId: asHotspotId('ch03:gate-ledger-board') }))
    deliver(third!.id, event('ch03:q3', 'npc.interaction', { npcId: cookId, kind: 'help' }))
    const final = deliver(fourth!.id, event('ch03:q4', 'npc.interaction', { npcId: runnerId, kind: 'help' }))

    expect(final.effectResult?.state.flags).toMatchObject({ ch03_boss_ready: true, ch03_autosave_checkpoint: true, ch03_mainline_complete: true })
    expect(engine.deliver(fourth!.id).status).toBe('already_completed')
  })

  it('手工支线引用真实采集节点，且不把材料墙写进主线', () => {
    const pepperQuest = CH03_QUESTS.find((quest) => String(quest.id) === 'ch03:side:mountain-pepper')!
    expect(pepperQuest.kind).toBe('side')
    expect(pepperQuest.objectives?.[0]?.payloadMatch?.nodeId).toBe(asGatheringNodeId('ch03:mountain-pepper'))
    expect(pepperQuest.conditions?.[0]).toEqual({ type: 'quest_complete', questId: mainline[0]!.id })
  })
})
