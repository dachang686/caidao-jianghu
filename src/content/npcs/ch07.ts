import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch07')
const gateId = asLocationId('capital-gate')
const officeId = asLocationId('capital-ranking-office')
const archiveId = asLocationId('capital-archive')

export const ch07NpcDefinitions: readonly NpcDefinition[] = [
  { id: asNpcId('capital-clerk'), name: '小吏阿文', locationIds: [gateId], tags: ['clerk', 'gate', 'stateful'], keyNpc: true, dialogueIds: [asDialogueId('dialogue:ch07:clerk')], taskQuestIds: [asQuestId('ch07:mainline:entry-token')], relationship: { favorMin: -20, favorMax: 70, irritationMin: 0, irritationMax: 55 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch07:entry-token'] }, help: { favorDelta: 4, irritationDelta: -2, knownInfoIds: ['info:ch07:entry-token'] }, deceive: { favorDelta: -3, irritationDelta: 4 } }, appearances: [{ chapterId, locationId: gateId }] },
  { id: asNpcId('capital-registrar'), name: '冯榜', locationIds: [officeId], tags: ['registrar', 'office', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch07:registrar')], taskQuestIds: [asQuestId('ch07:mainline:trade-ledger'), asQuestId('ch07:side:seal-rubbing')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch07:trade-ledger'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch07:trade-ledger'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: officeId }] },
  { id: asNpcId('capital-storyteller'), name: '阿墨', locationIds: [gateId], tags: ['storyteller', 'street', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch07:storyteller')], taskQuestIds: [asQuestId('ch07:mainline:public-truth'), asQuestId('ch07:side:street-rhyme')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch07:public-truth'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch07:public-truth'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: gateId }] },
  { id: asNpcId('capital-archivist'), name: '沈卷', locationIds: [archiveId], tags: ['archive', 'scrolls', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch07:archivist')], taskQuestIds: [asQuestId('ch07:mainline:public-truth')], relationship: { favorMin: -5, favorMax: 80, irritationMin: 0, irritationMax: 40 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch07:archive'] }, help: { favorDelta: 6, irritationDelta: -2, knownInfoIds: ['info:ch07:archive'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: archiveId }] },
]

export default ch07NpcDefinitions
