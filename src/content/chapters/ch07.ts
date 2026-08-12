import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch07GatheringNodes } from '../gathering/ch07'
import { ch07HotspotDefinitions } from '../hotspots/ch07'
import { ch07NpcDefinitions } from '../npcs/ch07'
import { ch07DialogueDefinitions } from '../dialogues/ch07'
import { CH07_QUESTS } from '../quests/ch07'
import { CH07_ENTRY_CONDITION, CH07_LOCKED_REASON } from './ch07-entry'
import { CH07_ENEMY_DEFINITIONS } from '../enemies/ch07'

const chapterId = asChapterId('ch07'); const regionId = asWorldRegionId('capital-ranking'); const gateId = asLocationId('capital-gate'); const officeId = asLocationId('capital-ranking-office'); const archiveId = asLocationId('capital-archive')
const regionAssets = [CORE_ASSET_IDS.capitalRankingBackground, CORE_ASSET_IDS.capitalClerk, CORE_ASSET_IDS.capitalRegistrar, CORE_ASSET_IDS.capitalStoryteller, CORE_ASSET_IDS.capitalArchivist, CORE_ASSET_IDS.capitalEnforcer, CORE_ASSET_IDS.capitalScrollThief, CORE_ASSET_IDS.rankingGovernor] as const
export const chapterContent: ChapterContent = { chapter: { id: chapterId, title: '京城', order: 7, entryLocationId: gateId, locationIds: [gateId, officeId, archiveId], resourceEntry: './chapters/ch07' }, locations: [
  { id: gateId, chapterId, title: '京城门楼', description: '入场牌先于榜单发放，阿文说真正的门票不需要提前宣布自己很重要。', npcIds: [ch07NpcDefinitions[0]!.id], questIds: [CH07_QUESTS[0]!.id], regionId, entryCondition: CH07_ENTRY_CONDITION, lockedReason: CH07_LOCKED_REASON, assetIds: regionAssets },
  { id: officeId, chapterId, title: '百晓榜司', description: '榜司的账本把价格写得比正文更清楚，冯榜开始怀疑热度不能替它删页。', npcIds: [ch07NpcDefinitions[1]!.id], questIds: [CH07_QUESTS[1]!.id, CH07_QUESTS[3]!.id], regionId, entryCondition: CH07_ENTRY_CONDITION, lockedReason: CH07_LOCKED_REASON, returnToLocationId: gateId, assetIds: [CORE_ASSET_IDS.capitalRankingBackground, CORE_ASSET_IDS.capitalRegistrar] },
  { id: archiveId, chapterId, title: '档案房', description: '沈卷只保证每个字能找到前一笔，不保证榜单找得到自己的。', npcIds: [ch07NpcDefinitions[2]!.id, ch07NpcDefinitions[3]!.id], questIds: [CH07_QUESTS[2]!.id, CH07_QUESTS[4]!.id], regionId, entryCondition: CH07_ENTRY_CONDITION, lockedReason: CH07_LOCKED_REASON, returnToLocationId: gateId, assetIds: [CORE_ASSET_IDS.capitalRankingBackground, CORE_ASSET_IDS.capitalStoryteller, CORE_ASSET_IDS.capitalArchivist] },
], npcs: ch07NpcDefinitions, quests: CH07_QUESTS, hotspots: ch07HotspotDefinitions, gatheringNodes: ch07GatheringNodes, dialogues: ch07DialogueDefinitions, enemies: CH07_ENEMY_DEFINITIONS }
export default chapterContent
