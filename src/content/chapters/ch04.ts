import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch04GatheringNodes } from '../gathering/ch04'
import { ch04HotspotDefinitions } from '../hotspots/ch04'
import { ch04NpcDefinitions } from '../npcs/ch04'
import { ch04DialogueDefinitions } from '../dialogues/ch04'
import { CH04_QUESTS } from '../quests/ch04'
import { CH04_ENTRY_CONDITION, CH04_LOCKED_REASON } from './ch04-entry'
import { CH04_ENEMY_DEFINITIONS } from '../enemies/ch04'

const chapterId = asChapterId('ch04')
const regionId = asWorldRegionId('qingyun-mountain')
const gateId = asLocationId('qingyun-gate')
const herbGardenId = asLocationId('qingyun-herb-garden')
const bellTerraceId = asLocationId('qingyun-bell-terrace')

const regionAssets = [
  CORE_ASSET_IDS.qingyunMountainBackground,
  CORE_ASSET_IDS.qingyunDisciple,
  CORE_ASSET_IDS.qingyunHerbalist,
  CORE_ASSET_IDS.qingyunBellKeeper,
  CORE_ASSET_IDS.qingyunSwordDisciple,
  CORE_ASSET_IDS.qingyunMaster,
] as const

export const chapterContent: ChapterContent = {
  chapter: {
    id: chapterId,
    title: '青云山',
    order: 4,
    entryLocationId: gateId,
    locationIds: [gateId, herbGardenId, bellTerraceId],
    resourceEntry: './chapters/ch04',
  },
  locations: [
    {
      id: gateId,
      chapterId,
      title: '青云山门',
      description: '青云山的石阶穿过薄雾，山门牌匾擦得很亮，像在等待一份正式的来访说明。',
      npcIds: [ch04NpcDefinitions[0]!.id],
      questIds: [CH04_QUESTS[0]!.id, CH04_QUESTS[1]!.id],
      regionId,
      entryCondition: CH04_ENTRY_CONDITION,
      lockedReason: CH04_LOCKED_REASON,
      assetIds: regionAssets,
    },
    {
      id: herbGardenId,
      chapterId,
      title: '云台药圃',
      description: '药圃沿着山腰铺开，云气把每一株青蘅草都衬得像重要证物。',
      npcIds: [ch04NpcDefinitions[1]!.id],
      questIds: [CH04_QUESTS[2]!.id, CH04_QUESTS[4]!.id],
      regionId,
      entryCondition: CH04_ENTRY_CONDITION,
      lockedReason: CH04_LOCKED_REASON,
      returnToLocationId: gateId,
      assetIds: [CORE_ASSET_IDS.qingyunMountainBackground, CORE_ASSET_IDS.qingyunHerbalist],
    },
    {
      id: bellTerraceId,
      chapterId,
      title: '听云台',
      description: '听云台悬在山脊边，铜钟每响一次，远处的云就像替它点头一次。',
      npcIds: [ch04NpcDefinitions[2]!.id],
      questIds: [CH04_QUESTS[3]!.id, CH04_QUESTS[5]!.id],
      regionId,
      entryCondition: CH04_ENTRY_CONDITION,
      lockedReason: CH04_LOCKED_REASON,
      returnToLocationId: gateId,
      assetIds: [CORE_ASSET_IDS.qingyunMountainBackground, CORE_ASSET_IDS.qingyunBellKeeper],
    },
  ],
  npcs: ch04NpcDefinitions,
  quests: CH04_QUESTS,
  hotspots: ch04HotspotDefinitions,
  gatheringNodes: ch04GatheringNodes,
  dialogues: ch04DialogueDefinitions,
  enemies: CH04_ENEMY_DEFINITIONS,
}

export default chapterContent
