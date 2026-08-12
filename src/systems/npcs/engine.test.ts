import { describe, expect, it } from 'vitest'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'
import type { NpcDefinition } from '../../types/npc'
import { EventBus } from '../events'
import {
  NPC_INTERACTION_EVENT,
  createNpcEngine,
  createNpcInteractionEvent,
  parseNpcSnapshot,
  restoreNpcSnapshot,
  serializeNpcSnapshot,
} from './engine'

const npcId = asNpcId('npc:traveler')
const chapterOne = asChapterId('ch01')
const chapterTwo = asChapterId('ch02')
const village = asLocationId('location:village')
const county = asLocationId('location:county')
const dialogueOne = asDialogueId('dialogue:traveler-village')
const dialogueTwo = asDialogueId('dialogue:traveler-county')
const questId = asQuestId('quest:traveler')

function makeDefinition(): NpcDefinition {
  return {
    id: npcId,
    name: '行脚客',
    locationIds: [village, county],
    keyNpc: true,
    taskQuestIds: [questId],
    relationship: { favorMin: 0, favorMax: 10, irritationMin: 0, irritationMax: 3 },
    interactionEffects: {
      help: { favorDelta: 9, irritationDelta: -1, knownInfoIds: ['road-secret'] },
      deceive: { favorDelta: -20, irritationDelta: 9 },
    },
    appearances: [
      { chapterId: chapterOne, locationId: village, dialogueIds: [dialogueOne], questIds: [questId] },
      { chapterId: chapterTwo, locationId: county, dialogueIds: [dialogueTwo], questIds: [questId] },
    ],
  }
}

function questState(status: 'available' | 'active' | 'ready') {
  return [{ questId, status }]
}

describe('npc state and relations', () => {
  it('跨区域移动只切换出现规则，不复制同一 npcId 的关系状态', () => {
    const engine = createNpcEngine([makeDefinition()])
    expect(engine.interact(npcId, 'help', 'event:help-1').status).toBe('applied')
    const first = engine.getPresence({ chapterId: chapterOne, locationId: village, questStates: questState('active') }, npcId)
    const second = engine.getPresence({ chapterId: chapterTwo, locationId: county, questStates: questState('active') }, npcId)
    expect(first).toMatchObject({ locationId: village, dialogueIds: [dialogueOne], taskActions: [{ questId, kind: 'advance' }] })
    expect(second).toMatchObject({ locationId: county, dialogueIds: [dialogueTwo], taskActions: [{ questId, kind: 'advance' }] })
    expect(first?.relationship).toEqual(second?.relationship)
    expect(engine.getSnapshot().states).toHaveLength(1)
  })

  it('关系值有上下限，重复事件按 event id 幂等', () => {
    const engine = createNpcEngine([makeDefinition()])
    const first = engine.applyInteraction(createNpcInteractionEvent(npcId, 'help', 'event:help-1'))
    const duplicate = engine.applyInteraction(createNpcInteractionEvent(npcId, 'help', 'event:help-1'))
    expect(first.relationship).toMatchObject({ favor: 9, irritation: 0, knownInfoIds: ['road-secret'] })
    expect(duplicate.status).toBe('duplicate')
    expect(engine.interact(npcId, 'help', 'event:help-2').relationship?.favor).toBe(10)
    for (let index = 0; index < 5; index += 1) engine.interact(npcId, 'click', `event:click-${index}`)
    expect(engine.getRelationship(npcId).irritation).toBe(3)
    expect(engine.interact(npcId, 'deceive', 'event:deceive').relationship).toMatchObject({ favor: 0, irritation: 3 })
  })

  it('EventBus 与存档恢复保留位置、对白和任务动作的一致关系状态', () => {
    const engine = createNpcEngine([makeDefinition()])
    const bus = new EventBus()
    const unsubscribe = engine.subscribe(bus)
    bus.dispatch(createNpcInteractionEvent(npcId, 'help', 'event:bus-help'))
    unsubscribe()
    const snapshot = parseNpcSnapshot(serializeNpcSnapshot(engine.snapshot()))
    const restored = restoreNpcSnapshot([makeDefinition()], snapshot)
    const presence = restored.getPresence({ chapterId: chapterTwo, locationId: county, questStates: questState('ready') }, npcId)
    expect(presence).toMatchObject({ locationId: county, dialogueIds: [dialogueTwo], taskActions: [{ questId, kind: 'deliver' }] })
    expect(presence?.relationship.favor).toBe(9)
    expect(restored.getSnapshot().states).toHaveLength(1)
    expect(bus.dispatch(createNpcInteractionEvent(npcId, 'help', 'event:bus-help-2'))).toHaveLength(1)
    expect(engine.getRelationship(npcId).favor).toBe(9)
    expect(NPC_INTERACTION_EVENT).toBe('npc.interaction')
  })
})
