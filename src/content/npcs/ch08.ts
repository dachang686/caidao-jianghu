import type { NpcDefinition } from '../../types/npc'
import { asChapterId, asDialogueId, asLocationId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch08')
const gateId = asLocationId('convention-gate')
const stageId = asLocationId('convention-stage')
const kitchenId = asLocationId('convention-kitchen')

export const ch08NpcDefinitions: readonly NpcDefinition[] = [
  { id: asNpcId('convention-usher'), name: '顾门牌', locationIds: [gateId], tags: ['usher', 'gate', 'stateful'], keyNpc: true, dialogueIds: [asDialogueId('dialogue:ch08:usher')], taskQuestIds: [asQuestId('ch08:mainline:register')], relationship: { favorMin: -20, favorMax: 70, irritationMin: 0, irritationMax: 55 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch08:register'] }, help: { favorDelta: 4, irritationDelta: -2, knownInfoIds: ['info:ch08:register'] }, deceive: { favorDelta: -3, irritationDelta: 4 } }, appearances: [{ chapterId, locationId: gateId }] },
  { id: asNpcId('convention-sect-representative'), name: '叶青锋', locationIds: [stageId], tags: ['sect', 'rival', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch08:sect-representative')], taskQuestIds: [asQuestId('ch08:mainline:definition'), asQuestId('ch08:side:sect-score')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch08:definition'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch08:definition'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: stageId }] },
  { id: asNpcId('convention-noodle-vendor'), name: '面摊小周', locationIds: [kitchenId], tags: ['noodle', 'kitchen', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch08:noodle-vendor')], taskQuestIds: [asQuestId('ch08:mainline:final-menu'), asQuestId('ch08:side:noodle-line')], relationship: { favorMin: -10, favorMax: 70, irritationMin: 0, irritationMax: 45 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch08:final-menu'] }, help: { favorDelta: 5, irritationDelta: -1, knownInfoIds: ['info:ch08:final-menu'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: kitchenId }] },
  { id: asNpcId('convention-judge'), name: '司空秤', locationIds: [stageId], tags: ['judge', 'scale', 'stateful'], dialogueIds: [asDialogueId('dialogue:ch08:judge')], taskQuestIds: [asQuestId('ch08:mainline:definition'), asQuestId('ch08:mainline:final-menu')], relationship: { favorMin: -5, favorMax: 80, irritationMin: 0, irritationMax: 40 }, interactionEffects: { click: { irritationDelta: 1, knownInfoIds: ['info:ch08:judge'] }, help: { favorDelta: 6, irritationDelta: -2, knownInfoIds: ['info:ch08:judge'] }, deceive: { favorDelta: -4, irritationDelta: 3 } }, appearances: [{ chapterId, locationId: stageId }] },
]

export default ch08NpcDefinitions
