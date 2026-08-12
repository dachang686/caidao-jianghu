import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch06')
const portId = asLocationId('donghai-port')
const marketId = asLocationId('donghai-shell-market')
const templeId = asLocationId('donghai-tide-temple')

export const ch06NpcDefinitions: readonly NpcDefinition[] = [
  { id: asNpcId('donghai-boatwoman'), name: '海棠', locationIds: [portId], tags: ['boatwoman', 'port', 'stateful'], keyNpc: true, dialogueIds: [asDialogueId('dialogue:ch06:boatwoman')], taskQuestIds: [asQuestId('ch06:mainline:ship-log'), asQuestId('ch06:mainline:light-stone')], relationship: { favorMin: -20, favorMax: 70, irritationMin: 0, irritationMax: 55 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch06:ship-log'] }, help: { favorDelta: 5, irritationDelta: -2, knownInfoIds: ['info:ch06:ship-log'] }, deceive: { favorDelta: -3, irritationDelta: 4 } }, appearances: [{ chapterId, locationId: portId }] },
  { id: asNpcId('donghai-shell-vendor'), name: '贝小满', locationIds: [marketId], tags: ['vendor', 'market', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch06:shell-vendor')], taskQuestIds: [asQuestId('ch06:mainline:light-stone'), asQuestId('ch06:side:shell-polish')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch06:stone-market'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch06:stone-market'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: marketId }] },
  { id: asNpcId('donghai-tide-bell-keeper'), name: '潮生', locationIds: [templeId], tags: ['bell', 'temple', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch06:tide-bell-keeper')], taskQuestIds: [asQuestId('ch06:mainline:tide-verdict'), asQuestId('ch06:side:tide-prayer')], relationship: { favorMin: -5, favorMax: 80, irritationMin: 0, irritationMax: 40 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch06:tide-cycle'] }, help: { favorDelta: 6, irritationDelta: -2, knownInfoIds: ['info:ch06:tide-cycle'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: templeId }] },
]

export default ch06NpcDefinitions
