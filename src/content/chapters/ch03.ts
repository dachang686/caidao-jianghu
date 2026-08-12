import type { ChapterContent } from '../loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { ch03GatheringNodes } from '../gathering/ch03'
import { ch03HotspotDefinitions } from '../hotspots/ch03'
import { ch03NpcDefinitions } from '../npcs/ch03'
import { ch03DialogueDefinitions } from '../dialogues/ch03'
import { CH03_QUESTS } from '../quests/ch03'
import { CH03_ENTRY_CONDITION, CH03_LOCKED_REASON } from './ch03-entry'
import { CH03_ENEMY_DEFINITIONS } from '../enemies/ch03'

const chapterId = asChapterId('ch03')
const regionId = asWorldRegionId('blackwind-fortress')
const gateId = asLocationId('blackwind-gate')
const kitchenId = asLocationId('blackwind-kitchen')
const watchtowerId = asLocationId('blackwind-watchtower')

const regionAssets = [
  CORE_ASSET_IDS.blackwindFortressBackground,
  CORE_ASSET_IDS.blackwindLedgerKeeper,
  CORE_ASSET_IDS.blackwindRunner,
  CORE_ASSET_IDS.blackwindCook,
  CORE_ASSET_IDS.blackwindScout,
  CORE_ASSET_IDS.blackwindLeader,
] as const

export const chapterContent: ChapterContent = {
  chapter: {
    id: chapterId,
    title: '黑风寨',
    order: 3,
    entryLocationId: gateId,
    locationIds: [gateId, kitchenId, watchtowerId],
    resourceEntry: './chapters/ch03',
  },
  locations: [
    {
      id: gateId,
      chapterId,
      title: '黑风寨门',
      description: '木寨门倚着山脊，空旗在风里摆出一种尚未定稿的威严。',
      npcIds: [ch03NpcDefinitions[0]!.id],
      questIds: [CH03_QUESTS[0]!.id, CH03_QUESTS[1]!.id],
      regionId,
      entryCondition: CH03_ENTRY_CONDITION,
      lockedReason: CH03_LOCKED_REASON,
      assetIds: regionAssets,
    },
    {
      id: kitchenId,
      chapterId,
      title: '黑风寨灶房',
      description: '灶房的烟比山寨的传令更准时，锅边还留着一条采集路线。',
      npcIds: [ch03NpcDefinitions[2]!.id],
      questIds: [CH03_QUESTS[2]!.id, CH03_QUESTS[4]!.id],
      regionId,
      entryCondition: CH03_ENTRY_CONDITION,
      lockedReason: CH03_LOCKED_REASON,
      returnToLocationId: gateId,
      assetIds: [CORE_ASSET_IDS.blackwindFortressBackground, CORE_ASSET_IDS.blackwindCook],
    },
    {
      id: watchtowerId,
      chapterId,
      title: '黑风寨瞭望台',
      description: '瞭望台能看见三条下山路，小顺把每条路都跑出了不同的风格。',
      npcIds: [ch03NpcDefinitions[1]!.id],
      questIds: [CH03_QUESTS[3]!.id, CH03_QUESTS[5]!.id],
      regionId,
      entryCondition: CH03_ENTRY_CONDITION,
      lockedReason: CH03_LOCKED_REASON,
      returnToLocationId: gateId,
      assetIds: [CORE_ASSET_IDS.blackwindFortressBackground, CORE_ASSET_IDS.blackwindRunner, CORE_ASSET_IDS.blackwindScout],
    },
  ],
  npcs: ch03NpcDefinitions,
  quests: CH03_QUESTS,
  hotspots: ch03HotspotDefinitions,
  gatheringNodes: ch03GatheringNodes,
  dialogues: ch03DialogueDefinitions,
  enemies: CH03_ENEMY_DEFINITIONS,
}

export default chapterContent
