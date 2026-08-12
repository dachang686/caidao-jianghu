import type { ChapterContent } from '../loader'
import { ch01NpcDefinitions } from '../npcs/ch01'
import { ch01HotspotDefinitions } from '../hotspots/ch01'
import { ch01GatheringNodes } from '../gathering/ch01'
import { ch01DialogueDefinitions } from '../dialogues/ch01'
import {
  asContentKey,
  asChapterId,
  asDialogueId,
  asEnemyId,
  asItemId,
  asLocationId,
  asNpcId,
  asQuestId,
  asWorldRegionId,
} from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'
import { CH01_ENEMY_DEFINITIONS } from '../enemies'

const chapterId = asChapterId('ch01')
const regionId = asWorldRegionId('xiaoyu-village')
const villageId = asLocationId('xiaoyu-village')
const oldManId = asNpcId('old-man')
const auntId = asNpcId('aunt')
const catId = asNpcId('dahuang-cat')
const baiId = asNpcId('bai-daxia')
const firstStepsQuestId = asQuestId('first-steps')
const manualClueQuestId = asQuestId('manual-clue')
const findCatQuestId = asQuestId('find-cat')
const kitchenSupplyQuestId = asQuestId('kitchen-supply')
const challengeBaiQuestId = asQuestId('challenge-bai')
const oldManDialogueId = asDialogueId('dialogue:ch01:old-man')
const auntDialogueId = asDialogueId('dialogue:ch01:aunt')
const baiDialogueId = asDialogueId('dialogue:ch01:bai')

export const chapterContent: ChapterContent = {
  chapter: {
    id: chapterId,
    title: '小愚村',
    order: 1,
    entryLocationId: villageId,
    locationIds: [villageId],
    resourceEntry: './chapters/ch01',
  },
  locations: [
    {
      id: villageId,
      chapterId,
      title: '小愚村悦来客栈',
      description: '一把菜刀、一袋盘缠，和一座看起来不太靠谱的客栈。',
      npcIds: [oldManId, auntId, catId, baiId],
      questIds: [firstStepsQuestId, manualClueQuestId, findCatQuestId, kitchenSupplyQuestId, challengeBaiQuestId],
      regionId,
      assetIds: [CORE_ASSET_IDS.villageBackground, CORE_ASSET_IDS.hero, CORE_ASSET_IDS.elder, CORE_ASSET_IDS.cat, CORE_ASSET_IDS.bai, CORE_ASSET_IDS.aunt],
    },
  ],
  npcs: ch01NpcDefinitions,
  hotspots: ch01HotspotDefinitions,
  gatheringNodes: ch01GatheringNodes,
  enemies: CH01_ENEMY_DEFINITIONS,
  dialogues: ch01DialogueDefinitions,
  quests: [
    {
      id: firstStepsQuestId,
      title: '初入江湖：刀谱开篇',
      chapterId,
      objective: '和不正经老头聊聊，记下《百味刀谱》的第一条线索',
      kind: 'main',
      priority: 30,
      giverNpcId: oldManId,
      dialogueId: oldManDialogueId,
      objectives: [{ id: 'meet-old-man', label: '认真听老头讲一回刀谱', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: oldManId, kind: 'help' } }],
      effects: [
        { type: 'set_flag', flag: 'ch01_manual_path_open', value: true },
        { type: 'give_exp', amount: 2, grantKey: 'quest:ch01:first-steps:exp' },
        { type: 'narrate', lineId: asContentKey('line:ch01:first-steps') },
      ],
      rewardGrantKey: 'quest:ch01:first-steps',
    },
    {
      id: manualClueQuestId,
      title: '百味刀谱：水边线索',
      chapterId,
      objective: '再向老头确认一次刀谱线索，整理出通往百晓榜的路',
      kind: 'main',
      priority: 20,
      giverNpcId: oldManId,
      dialogueId: oldManDialogueId,
      conditions: [{ type: 'quest_complete', questId: firstStepsQuestId }],
      objectives: [{ id: 'confirm-manual-clue', label: '向老头确认水边线索', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: oldManId, kind: 'click' } }],
      effects: [
        { type: 'set_flag', flag: 'ch01_manual_clue_found', value: true },
        { type: 'give_exp', amount: 3, grantKey: 'quest:ch01:manual-clue:exp' },
        { type: 'narrate', lineId: asContentKey('line:ch01:manual-clue') },
      ],
      rewardGrantKey: 'quest:ch01:manual-clue',
    },
    {
      id: findCatQuestId,
      title: '帮王大娘找猫',
      chapterId,
      objective: '让大黄猫回到王大娘的客栈灶台边',
      kind: 'side',
      priority: 20,
      giverNpcId: auntId,
      dialogueId: auntDialogueId,
      conditions: [{ type: 'quest_complete', questId: firstStepsQuestId }],
      objectives: [{ id: 'resolve-cat', label: '和大黄的猫商量回家', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: catId, kind: 'help' } }],
      effects: [
        { type: 'set_flag', flag: 'catResolved', value: true },
        { type: 'give_exp', amount: 2, grantKey: 'quest:ch01:find-cat:exp' },
        { type: 'narrate', lineId: asContentKey('line:ch01:find-cat') },
      ],
      rewardGrantKey: 'quest:ch01:find-cat',
    },
    {
      id: kitchenSupplyQuestId,
      title: '灶台的山路补给',
      chapterId,
      objective: '替王大娘带回一份山路止血草，别让厨房先于江湖缺货',
      kind: 'side',
      priority: 10,
      giverNpcId: auntId,
      dialogueId: auntDialogueId,
      conditions: [{ type: 'quest_complete', questId: firstStepsQuestId }],
      objectives: [{ id: 'collect-herb', label: '完成一次山路止血草采集', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: 'ch01:hill-herbs' } }],
      effects: [
        { type: 'give_item', itemId: asItemId('item:herb'), count: 1, grantKey: 'quest:ch01:kitchen-supply:herb' },
        { type: 'give_exp', amount: 2, grantKey: 'quest:ch01:kitchen-supply:exp' },
        { type: 'narrate', lineId: asContentKey('line:ch01:kitchen-supply') },
      ],
      rewardGrantKey: 'quest:ch01:kitchen-supply',
    },
    {
      id: challengeBaiQuestId,
      title: '百晓榜：擂台名次',
      chapterId,
      objective: '在擂台上击败白大侠，替菜刀争一个正式名次',
      kind: 'main',
      priority: 10,
      giverNpcId: baiId,
      dialogueId: baiDialogueId,
      conditions: [{ type: 'quest_complete', questId: manualClueQuestId }],
      objectives: [{ id: 'win-bai-daxia', label: '击败白大侠', eventType: 'battle.won', requiredCount: 1, payloadMatch: { enemyId: asEnemyId('bai-daxia') } }],
      effects: [
        { type: 'set_flag', flag: 'ch01_boss_ready', value: true },
        { type: 'set_flag', flag: 'ch01_autosave_checkpoint', value: true },
        { type: 'set_flag', flag: 'ch01_mainline_complete', value: true },
        { type: 'give_exp', amount: 6, grantKey: 'quest:ch01:challenge-bai:exp' },
        { type: 'narrate', lineId: asContentKey('line:ch01:challenge-bai') },
      ],
      rewardGrantKey: 'quest:ch01:challenge-bai',
    },
  ],
}

export default chapterContent
