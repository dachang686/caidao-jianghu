import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch05')
const stationId = asLocationId('western-relay-station')
const duneId = asLocationId('western-dune-supply')
const caravanId = asLocationId('western-caravan-yard')

export const ch05NpcDefinitions: readonly NpcDefinition[] = [
  { id: asNpcId('western-courier'), name: '洛小铃', locationIds: [stationId], tags: ['courier', 'station', 'stateful'], keyNpc: true, dialogueIds: [asDialogueId('dialogue:ch05:courier')], taskQuestIds: [asQuestId('ch05:mainline:manifest'), asQuestId('ch05:mainline:route')], relationship: { favorMin: -20, favorMax: 70, irritationMin: 0, irritationMax: 55 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch05:manifest'] }, help: { favorDelta: 5, irritationDelta: -2, knownInfoIds: ['info:ch05:manifest'] }, deceive: { favorDelta: -3, irritationDelta: 4 } }, appearances: [{ chapterId, locationId: stationId }] },
  { id: asNpcId('western-tea-keeper'), name: '白沙姑', locationIds: [duneId], tags: ['tea', 'dune', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch05:tea-keeper')], taskQuestIds: [asQuestId('ch05:mainline:route'), asQuestId('ch05:side:tea-water')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch05:water-route'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch05:water-route'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: duneId }] },
  { id: asNpcId('western-guard'), name: '驼背老关', locationIds: [caravanId], tags: ['guard', 'caravan', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch05:guard')], taskQuestIds: [asQuestId('ch05:mainline:seal'), asQuestId('ch05:side:camel-bells')], relationship: { favorMin: -5, favorMax: 80, irritationMin: 0, irritationMax: 40 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch05:seal'] }, help: { favorDelta: 6, irritationDelta: -2, knownInfoIds: ['info:ch05:seal'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: caravanId }] },
]

export default ch05NpcDefinitions
