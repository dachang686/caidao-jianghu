import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch05GatheringNodes } from '../gathering/ch05'
import { ch05HotspotDefinitions } from '../hotspots/ch05'
import { ch05NpcDefinitions } from '../npcs/ch05'
import { ch05DialogueDefinitions } from '../dialogues/ch05'
import { CH05_QUESTS } from '../quests/ch05'
import { CH05_ENTRY_CONDITION, CH05_LOCKED_REASON } from './ch05-entry'
import { CH05_ENEMY_DEFINITIONS } from '../enemies/ch05'

const chapterId = asChapterId('ch05'); const regionId = asWorldRegionId('western-relay'); const stationId = asLocationId('western-relay-station'); const duneId = asLocationId('western-dune-supply'); const caravanId = asLocationId('western-caravan-yard')
const regionAssets = [CORE_ASSET_IDS.westernRelayBackground, CORE_ASSET_IDS.westernCourier, CORE_ASSET_IDS.westernGuard, CORE_ASSET_IDS.westernTeaKeeper, CORE_ASSET_IDS.roadBandit, CORE_ASSET_IDS.maskedBandit, CORE_ASSET_IDS.twinBandits] as const
export const chapterContent: ChapterContent = { chapter: { id: chapterId, title: '西域驿路', order: 5, entryLocationId: stationId, locationIds: [stationId, duneId, caravanId], resourceEntry: './chapters/ch05' }, locations: [
  { id: stationId, chapterId, title: '西域驿站', description: '风沙把驿站的货单吹成了折页，洛小铃坚持每一页都还能证明自己是完整的。', npcIds: [ch05NpcDefinitions[0]!.id], questIds: [CH05_QUESTS[0]!.id, CH05_QUESTS[1]!.id], regionId, entryCondition: CH05_ENTRY_CONDITION, lockedReason: CH05_LOCKED_REASON, assetIds: regionAssets },
  { id: duneId, chapterId, title: '沙丘补给点', description: '沙井旁的茶摊给路线提供水、茶和一份需要核验的传闻。', npcIds: [ch05NpcDefinitions[1]!.id], questIds: [CH05_QUESTS[1]!.id, CH05_QUESTS[4]!.id], regionId, entryCondition: CH05_ENTRY_CONDITION, lockedReason: CH05_LOCKED_REASON, returnToLocationId: stationId, assetIds: [CORE_ASSET_IDS.westernRelayBackground, CORE_ASSET_IDS.westernTeaKeeper] },
  { id: caravanId, chapterId, title: '驼队车场', description: '驼铃架旁堆着封条与车辙，老关说真正的谜案往往比货箱轻。', npcIds: [ch05NpcDefinitions[2]!.id], questIds: [CH05_QUESTS[2]!.id, CH05_QUESTS[5]!.id], regionId, entryCondition: CH05_ENTRY_CONDITION, lockedReason: CH05_LOCKED_REASON, returnToLocationId: stationId, assetIds: [CORE_ASSET_IDS.westernRelayBackground, CORE_ASSET_IDS.westernGuard] },
], npcs: ch05NpcDefinitions, quests: CH05_QUESTS, hotspots: ch05HotspotDefinitions, gatheringNodes: ch05GatheringNodes, dialogues: ch05DialogueDefinitions, enemies: CH05_ENEMY_DEFINITIONS }
export default chapterContent
