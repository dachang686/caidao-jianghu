import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch02GatheringNodes } from '../gathering/ch02'
import { ch02HotspotDefinitions } from '../hotspots/ch02'
import { ch02NpcDefinitions } from '../npcs/ch02'
import { ch02DialogueDefinitions } from '../dialogues/ch02'
import { CH02_QUESTS } from '../quests/ch02'
import { CH02_ENTRY_CONDITION, CH02_LOCKED_REASON } from './ch02-entry'
import { CH02_ENEMY_DEFINITIONS } from '../enemies'

const chapterId = asChapterId('ch02')
const regionId = asWorldRegionId('qinghe-county')
const marketId = asLocationId('qinghe-market')
const riverfrontId = asLocationId('qinghe-riverfront')

const regionAssets = [
  CORE_ASSET_IDS.qingheMarketBackground,
  CORE_ASSET_IDS.qingheRegistrar,
  CORE_ASSET_IDS.qingheBoatwoman,
  CORE_ASSET_IDS.qingheTeaKeeper,
  CORE_ASSET_IDS.qingheBangsi,
] as const

export const chapterContent: ChapterContent = {
  chapter: {
    id: chapterId,
    title: '清河县',
    order: 2,
    entryLocationId: marketId,
    locationIds: [marketId, riverfrontId],
    resourceEntry: './chapters/ch02',
  },
  locations: [
    {
      id: marketId,
      chapterId,
      title: '清河县街市',
      description: '石桥、茶摊和百晓榜告示台挤在一条街上，人人都在看别人上榜。',
      npcIds: [
        ch02NpcDefinitions[0]!.id,
        ch02NpcDefinitions[2]!.id,
        ch02NpcDefinitions[3]!.id,
      ],
      questIds: [],
      regionId,
      entryCondition: CH02_ENTRY_CONDITION,
      lockedReason: CH02_LOCKED_REASON,
      assetIds: regionAssets,
    },
    {
      id: riverfrontId,
      chapterId,
      title: '清河码头',
      description: '河水从石桥下绕过，柳婶的药篮和一条不急着开船的小舟靠在岸边。',
      npcIds: [ch02NpcDefinitions[1]!.id],
      questIds: [],
      regionId,
      entryCondition: CH02_ENTRY_CONDITION,
      lockedReason: CH02_LOCKED_REASON,
      returnToLocationId: marketId,
      assetIds: [CORE_ASSET_IDS.qingheMarketBackground, CORE_ASSET_IDS.qingheBoatwoman],
    },
  ],
  npcs: ch02NpcDefinitions,
  hotspots: ch02HotspotDefinitions,
  gatheringNodes: ch02GatheringNodes,
  dialogues: ch02DialogueDefinitions,
  quests: CH02_QUESTS,
  enemies: CH02_ENEMY_DEFINITIONS,
}

export default chapterContent
