import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch01')
const villageId = asLocationId('xiaoyu-village')
const oldManId = asNpcId('old-man')
const auntId = asNpcId('aunt')
const catId = asNpcId('dahuang-cat')
const baiId = asNpcId('bai-daxia')

export const ch01NpcDefinitions: readonly NpcDefinition[] = [
  {
    id: oldManId,
    name: '不正经老头',
    locationIds: [villageId],
    tags: ['mentor', 'comic'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch01:old-man')],
    taskQuestIds: [asQuestId('first-steps'), asQuestId('manual-clue')],
    relationship: { favorMin: -20, favorMax: 60, irritationMin: 0, irritationMax: 40 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch01:old-man:manual'] },
      help: { favorDelta: 5, irritationDelta: -2, knownInfoIds: ['info:ch01:old-man:manual'] },
    },
    appearances: [{ chapterId, locationId: villageId, questIds: [asQuestId('first-steps'), asQuestId('manual-clue')] }],
  },
  {
    id: auntId,
    name: '王大娘',
    locationIds: [villageId],
    tags: ['quest-giver'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch01:aunt')],
    taskQuestIds: [asQuestId('find-cat'), asQuestId('kitchen-supply')],
    relationship: { favorMin: 0, favorMax: 80, irritationMin: 0, irritationMax: 50 },
    interactionEffects: {
      click: { irritationDelta: 1 },
      help: { favorDelta: 4, irritationDelta: -1, knownInfoIds: ['info:ch01:aunt:ranking'] },
    },
    appearances: [{ chapterId, locationId: villageId, questIds: [asQuestId('find-cat'), asQuestId('kitchen-supply')] }],
  },
  {
    id: catId,
    name: '大黄的猫',
    locationIds: [villageId],
    tags: ['cat', 'comic'],
    dialogueIds: [asDialogueId('dialogue:ch01:cat')],
    relationship: { favorMin: -10, favorMax: 40, irritationMin: 0, irritationMax: 30 },
    interactionEffects: {
      click: { irritationDelta: 2 },
      help: { favorDelta: 6, irritationDelta: -3, knownInfoIds: ['info:ch01:cat:fish-route'] },
    },
    appearances: [{ chapterId, locationId: villageId }],
  },
  {
    id: baiId,
    name: '白大侠',
    locationIds: [villageId],
    tags: ['boss', 'duelist'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch01:bai')],
    taskQuestIds: [asQuestId('challenge-bai')],
    relationship: { favorMin: 0, favorMax: 30, irritationMin: 0, irritationMax: 20 },
    interactionEffects: {
      help: { favorDelta: 2, knownInfoIds: ['info:ch01:bai:rules'] },
      deceive: { irritationDelta: 4 },
    },
    appearances: [{ chapterId, locationId: villageId, questIds: [asQuestId('challenge-bai')] }],
  },
]

export default ch01NpcDefinitions
