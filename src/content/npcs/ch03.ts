import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch03')
const gateId = asLocationId('blackwind-gate')
const kitchenId = asLocationId('blackwind-kitchen')
const watchtowerId = asLocationId('blackwind-watchtower')

/** C321 先接入可持久化的 NPC 关系；对白、任务和 Boss 行为在后续任务中追加。 */
export const ch03NpcDefinitions: readonly NpcDefinition[] = [
  {
    id: asNpcId('blackwind-ledger-keeper'),
    name: '曹掌柜',
    locationIds: [gateId],
    tags: ['ledger', 'gate', 'stateful'],
    keyNpc: true,
    dialogueIds: [asDialogueId('dialogue:ch03:ledger-keeper')],
    taskQuestIds: [asQuestId('ch03:mainline:entry-register'), asQuestId('ch03:mainline:three-stamps')],
    relationship: { favorMin: -20, favorMax: 70, irritationMin: 0, irritationMax: 55 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch03:ledger-board'] },
      help: { favorDelta: 4, irritationDelta: -2, knownInfoIds: ['info:ch03:ledger-board'] },
      deceive: { favorDelta: -3, irritationDelta: 5 },
    },
    appearances: [{ chapterId, locationId: gateId }],
  },
  {
    id: asNpcId('blackwind-runner'),
    name: '小顺',
    locationIds: [watchtowerId],
    tags: ['courier', 'watchtower', 'stateful'],
    dialogueIds: [asDialogueId('dialogue:ch03:runner')],
    taskQuestIds: [asQuestId('ch03:mainline:roll-call'), asQuestId('ch03:side:watchtower-rounds')],
    relationship: { favorMin: -10, favorMax: 60, irritationMin: 0, irritationMax: 45 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch03:signal-route'] },
      help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch03:signal-route'] },
      deceive: { irritationDelta: 4 },
    },
    appearances: [{ chapterId, locationId: watchtowerId }],
  },
  {
    id: asNpcId('blackwind-cook'),
    name: '胡大勺',
    locationIds: [kitchenId],
    tags: ['cook', 'gathering-guide', 'stateful'],
    dialogueIds: [asDialogueId('dialogue:ch03:cook')],
    taskQuestIds: [asQuestId('ch03:mainline:meal-route'), asQuestId('ch03:side:mountain-pepper')],
    relationship: { favorMin: -5, favorMax: 80, irritationMin: 0, irritationMax: 40 },
    interactionEffects: {
      click: { irritationDelta: 1, knownInfoIds: ['info:ch03:kitchen-ration'] },
      help: { favorDelta: 6, irritationDelta: -2, knownInfoIds: ['info:ch03:kitchen-ration'] },
      deceive: { favorDelta: -4, irritationDelta: 3 },
    },
    appearances: [{ chapterId, locationId: kitchenId }],
  },
]

export default ch03NpcDefinitions
