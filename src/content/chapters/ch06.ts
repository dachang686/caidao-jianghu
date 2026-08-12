import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch06GatheringNodes } from '../gathering/ch06'
import { ch06HotspotDefinitions } from '../hotspots/ch06'
import { ch06NpcDefinitions } from '../npcs/ch06'
import { ch06DialogueDefinitions } from '../dialogues/ch06'
import { CH06_QUESTS } from '../quests/ch06'
import { CH06_ENTRY_CONDITION, CH06_LOCKED_REASON } from './ch06-entry'
import { CH06_ENEMY_DEFINITIONS } from '../enemies/ch06'

const chapterId = asChapterId('ch06'); const regionId = asWorldRegionId('donghai-town'); const portId = asLocationId('donghai-port'); const marketId = asLocationId('donghai-shell-market'); const templeId = asLocationId('donghai-tide-temple')
const regionAssets = [CORE_ASSET_IDS.donghaiTownBackground, CORE_ASSET_IDS.donghaiBoatwoman, CORE_ASSET_IDS.shellVendor, CORE_ASSET_IDS.tideBellKeeper, CORE_ASSET_IDS.dockSmuggler, CORE_ASSET_IDS.hookBandit, CORE_ASSET_IDS.tideMaster] as const
export const chapterContent: ChapterContent = { chapter: { id: chapterId, title: '东海镇', order: 6, entryLocationId: portId, locationIds: [portId, marketId, templeId], resourceEntry: './chapters/ch06' }, locations: [
  { id: portId, chapterId, title: '东海码头', description: '潮水把船单冲出盐痕，海棠说带货文案没有重量，所以最容易超载。', npcIds: [ch06NpcDefinitions[0]!.id], questIds: [CH06_QUESTS[0]!.id], regionId, entryCondition: CH06_ENTRY_CONDITION, lockedReason: CH06_LOCKED_REASON, assetIds: regionAssets },
  { id: marketId, chapterId, title: '贝壳市场', description: '贝小满给每枚贝壳留出真实反光，留影石却试图把浪花写成证书。', npcIds: [ch06NpcDefinitions[1]!.id], questIds: [CH06_QUESTS[1]!.id, CH06_QUESTS[3]!.id], regionId, entryCondition: CH06_ENTRY_CONDITION, lockedReason: CH06_LOCKED_REASON, returnToLocationId: portId, assetIds: [CORE_ASSET_IDS.donghaiTownBackground, CORE_ASSET_IDS.shellVendor] },
  { id: templeId, chapterId, title: '潮声寺', description: '潮钟只报时间，不替任何观点涨潮。', npcIds: [ch06NpcDefinitions[2]!.id], questIds: [CH06_QUESTS[2]!.id, CH06_QUESTS[4]!.id], regionId, entryCondition: CH06_ENTRY_CONDITION, lockedReason: CH06_LOCKED_REASON, returnToLocationId: portId, assetIds: [CORE_ASSET_IDS.donghaiTownBackground, CORE_ASSET_IDS.tideBellKeeper] },
], npcs: ch06NpcDefinitions, quests: CH06_QUESTS, hotspots: ch06HotspotDefinitions, gatheringNodes: ch06GatheringNodes, dialogues: ch06DialogueDefinitions, enemies: CH06_ENEMY_DEFINITIONS }
export default chapterContent
