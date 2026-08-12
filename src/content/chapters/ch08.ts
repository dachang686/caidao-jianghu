import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch08GatheringNodes } from '../gathering/ch08'
import { ch08HotspotDefinitions } from '../hotspots/ch08'
import { ch08NpcDefinitions } from '../npcs/ch08'
import { ch08DialogueDefinitions } from '../dialogues/ch08'
import { CH08_QUESTS } from '../quests/ch08'
import { CH08_ENTRY_CONDITION, CH08_LOCKED_REASON } from './ch08-entry'
import { CH08_ENEMY_DEFINITIONS } from '../enemies/ch08'

const chapterId = asChapterId('ch08'); const regionId = asWorldRegionId('martial-convention'); const gateId = asLocationId('convention-gate'); const stageId = asLocationId('convention-stage'); const kitchenId = asLocationId('convention-kitchen')
const regionAssets = [CORE_ASSET_IDS.martialConventionBackground, CORE_ASSET_IDS.conventionUsher, CORE_ASSET_IDS.sectRepresentative, CORE_ASSET_IDS.noodleVendor, CORE_ASSET_IDS.conventionJudge, CORE_ASSET_IDS.rivalMartialist, CORE_ASSET_IDS.conventionChallenger, CORE_ASSET_IDS.rankingMaster] as const
export const chapterContent: ChapterContent = { chapter: { id: chapterId, title: '武林大会', order: 8, entryLocationId: gateId, locationIds: [gateId, stageId, kitchenId], resourceEntry: './chapters/ch08' }, locations: [
  { id: gateId, chapterId, title: '大会入口', description: '顾门牌把参会登记写得比江湖定义更清楚，空白栏正在等证据签字。', npcIds: [ch08NpcDefinitions[0]!.id], questIds: [CH08_QUESTS[0]!.id], regionId, entryCondition: CH08_ENTRY_CONDITION, lockedReason: CH08_LOCKED_REASON, assetIds: regionAssets },
  { id: stageId, chapterId, title: '评判台', description: '门派、裁判和刀谱在同一张台面上对照，谁的声音最大不再等于谁的定义有效。', npcIds: [ch08NpcDefinitions[1]!.id, ch08NpcDefinitions[3]!.id], questIds: [CH08_QUESTS[1]!.id, CH08_QUESTS[3]!.id], regionId, entryCondition: CH08_ENTRY_CONDITION, lockedReason: CH08_LOCKED_REASON, returnToLocationId: gateId, assetIds: [CORE_ASSET_IDS.martialConventionBackground, CORE_ASSET_IDS.sectRepresentative, CORE_ASSET_IDS.conventionJudge] },
  { id: kitchenId, chapterId, title: '大会厨房', description: '面摊小周说排队也是江湖秩序，厨房成为最稳定的证据现场。', npcIds: [ch08NpcDefinitions[2]!.id], questIds: [CH08_QUESTS[2]!.id, CH08_QUESTS[4]!.id], regionId, entryCondition: CH08_ENTRY_CONDITION, lockedReason: CH08_LOCKED_REASON, returnToLocationId: gateId, assetIds: [CORE_ASSET_IDS.martialConventionBackground, CORE_ASSET_IDS.noodleVendor] },
], npcs: ch08NpcDefinitions, quests: CH08_QUESTS, hotspots: ch08HotspotDefinitions, gatheringNodes: ch08GatheringNodes, dialogues: ch08DialogueDefinitions, enemies: CH08_ENEMY_DEFINITIONS }
export default chapterContent
