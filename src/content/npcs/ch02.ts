import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId } from '../../types/ids'

const chapterId = asChapterId('ch02')
const marketId = asLocationId('qinghe-market')
const riverfrontId = asLocationId('qinghe-riverfront')

export const ch02NpcDefinitions: readonly NpcDefinition[] = [
  {
    id: asNpcId('qinghe-registrar'),
    name: '沈青禾',
    locationIds: [marketId],
    tags: ['registrar', 'ranking-board', 'comic'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch02:registrar')],
    relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch02:ranking-board'] },
      help: { favorDelta: 4, irritationDelta: -1, knownInfoIds: ['info:ch02:ranking-board'] },
    },
    appearances: [{ chapterId, locationId: marketId }],
  },
  {
    id: asNpcId('qinghe-boatwoman'),
    name: '柳婶',
    locationIds: [riverfrontId],
    tags: ['riverfront', 'gathering-guide'],
    dialogueIds: [asDialogueId('dialogue:ch02:boatwoman')],
    relationship: { favorMin: 0, favorMax: 60, irritationMin: 0, irritationMax: 30 },
    interactionEffects: {
      click: { knownInfoIds: ['info:ch02:river-route'] },
      help: { favorDelta: 5, knownInfoIds: ['info:ch02:river-route'] },
    },
    appearances: [{ chapterId, locationId: riverfrontId }],
  },
  {
    id: asNpcId('qinghe-tea-keeper'),
    name: '陆掌柜',
    locationIds: [marketId],
    tags: ['tea-stall', 'rumor'],
    dialogueIds: [asDialogueId('dialogue:ch02:tea-keeper')],
    relationship: { favorMin: -5, favorMax: 50, irritationMin: 0, irritationMax: 35 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch02:market-rumor'] },
      help: { favorDelta: 3, irritationDelta: -2, knownInfoIds: ['info:ch02:market-rumor'] },
    },
    appearances: [{ chapterId, locationId: marketId }],
  },
  {
    id: asNpcId('qinghe-bangsi'),
    name: '榜下捕快',
    locationIds: [marketId],
    tags: ['patrol', 'ordinary-enemy-preview', 'ranking-board'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch02:bangsi')],
    relationship: { favorMin: -30, favorMax: 20, irritationMin: 0, irritationMax: 60 },
    interactionEffects: {
      click: { irritationDelta: 2 },
      help: { favorDelta: 1, irritationDelta: -1 },
      deceive: { irritationDelta: 4 },
    },
    appearances: [{ chapterId, locationId: marketId }],
  },
]

export default ch02NpcDefinitions
