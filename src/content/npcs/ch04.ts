import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch04')
const gateId = asLocationId('qingyun-gate')
const herbGardenId = asLocationId('qingyun-herb-garden')
const bellTerraceId = asLocationId('qingyun-bell-terrace')

/** C331 只建立青云山门的状态化 NPC；对白、任务与掌门行为在后续任务接入。 */
export const ch04NpcDefinitions: readonly NpcDefinition[] = [
  {
    id: asNpcId('qingyun-gate-disciple'),
    name: '林小门',
    locationIds: [gateId],
    tags: ['gate', 'disciple', 'stateful'],
    dialogueIds: [asDialogueId('dialogue:ch04:gate-disciple')],
    taskQuestIds: [asQuestId('ch04:mainline:gate-register'), asQuestId('ch04:mainline:mountain-standards')],
    relationship: { favorMin: -15, favorMax: 60, irritationMin: 0, irritationMax: 45 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch04:gate-rules'] },
      help: { favorDelta: 4, irritationDelta: -2, knownInfoIds: ['info:ch04:gate-rules'] },
      deceive: { favorDelta: -3, irritationDelta: 4 },
    },
    appearances: [{ chapterId, locationId: gateId }],
  },
  {
    id: asNpcId('qingyun-herbalist'),
    name: '苏青禾',
    locationIds: [herbGardenId],
    tags: ['herbalist', 'gathering-guide', 'stateful'],
    dialogueIds: [asDialogueId('dialogue:ch04:herbalist')],
    taskQuestIds: [asQuestId('ch04:mainline:cloud-herb-route'), asQuestId('ch04:side:cloud-herb')],
    relationship: { favorMin: -5, favorMax: 70, irritationMin: 0, irritationMax: 40 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch04:cloud-herb'] },
      help: { favorDelta: 5, irritationDelta: -2, knownInfoIds: ['info:ch04:cloud-herb'] },
      deceive: { favorDelta: -4, irritationDelta: 3 },
    },
    appearances: [{ chapterId, locationId: herbGardenId }],
  },
  {
    id: asNpcId('qingyun-bell-keeper'),
    name: '钟小响',
    locationIds: [bellTerraceId],
    tags: ['bell-keeper', 'watch', 'stateful'],
    dialogueIds: [asDialogueId('dialogue:ch04:bell-keeper')],
    taskQuestIds: [asQuestId('ch04:mainline:bell-judgment'), asQuestId('ch04:side:bell-practice')],
    relationship: { favorMin: -10, favorMax: 65, irritationMin: 0, irritationMax: 50 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch04:bell-route'] },
      help: { favorDelta: 4, irritationDelta: -1, knownInfoIds: ['info:ch04:bell-route'] },
      deceive: { favorDelta: -2, irritationDelta: 5 },
    },
    appearances: [{ chapterId, locationId: bellTerraceId }],
  },
]

export default ch04NpcDefinitions
