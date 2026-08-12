import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch02')
const registrarId = asNpcId('qinghe-registrar')
const boatwomanId = asNpcId('qinghe-boatwoman')
const teaKeeperId = asNpcId('qinghe-tea-keeper')
const bangsiId = asNpcId('qinghe-bangsi')
const dialogueRegistrarId = asDialogueId('dialogue:ch02:registrar')
const dialogueBoatwomanId = asDialogueId('dialogue:ch02:boatwoman')
const dialogueTeaKeeperId = asDialogueId('dialogue:ch02:tea-keeper')
const dialogueBangsiId = asDialogueId('dialogue:ch02:bangsi')

const mainlineStartId = asQuestId('ch02:mainline:board-first-look')
const boardLedgerId = asQuestId('ch02:mainline:board-ledger-gap')
const riverRouteId = asQuestId('ch02:mainline:river-route')
const evidenceReadyId = asQuestId('ch02:mainline:evidence-ready')

export const CH02_QUESTS: readonly QuestDefinition[] = [
  {
    id: mainlineStartId,
    title: '百晓榜初现：先看榜再出刀',
    chapterId,
    objective: '向沈青禾确认百晓榜的记名规矩',
    kind: 'main',
    priority: 40,
    giverNpcId: registrarId,
    dialogueId: dialogueRegistrarId,
    conditions: [{ type: 'flag_equals', flag: 'ch01_mainline_complete', value: true }],
    objectives: [{ id: 'meet-registrar', label: '和沈青禾认真聊一次榜单', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: registrarId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch02_board_seen', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch02:mainline:board-first-look:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:board-first-look') },
    ],
    rewardGrantKey: 'quest:ch02:mainline:board-first-look',
  },
  {
    id: boardLedgerId,
    title: '百晓榜初现：账上的缺口',
    chapterId,
    objective: '检查百晓榜告示台，找出被挪走的名次线索',
    kind: 'main',
    priority: 30,
    giverNpcId: registrarId,
    dialogueId: dialogueRegistrarId,
    conditions: [{ type: 'quest_complete', questId: mainlineStartId }],
    objectives: [{ id: 'inspect-board', label: '调查百晓榜告示台', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch02:ranking-board') } }],
    effects: [
      { type: 'set_flag', flag: 'ch02_ledger_gap_found', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch02:mainline:board-ledger-gap:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:board-ledger-gap') },
    ],
    rewardGrantKey: 'quest:ch02:mainline:board-ledger-gap',
  },
  {
    id: riverRouteId,
    title: '百晓榜初现：河风里的口供',
    chapterId,
    objective: '向柳婶确认从街市到码头的安全来回路线',
    kind: 'main',
    priority: 20,
    giverNpcId: boatwomanId,
    dialogueId: dialogueBoatwomanId,
    conditions: [{ type: 'quest_complete', questId: boardLedgerId }],
    objectives: [{ id: 'ask-river-route', label: '向柳婶询问河岸路线', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: boatwomanId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch02_river_route_open', value: true },
      { type: 'give_exp', amount: 5, grantKey: 'quest:ch02:mainline:river-route:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:river-route') },
    ],
    rewardGrantKey: 'quest:ch02:mainline:river-route',
  },
  {
    id: evidenceReadyId,
    title: '百晓榜初现：名次之前',
    chapterId,
    objective: '把河岸和茶摊的线索整理成可交给榜下捕快的证据',
    kind: 'main',
    priority: 10,
    giverNpcId: teaKeeperId,
    dialogueId: dialogueTeaKeeperId,
    conditions: [{ type: 'quest_complete', questId: riverRouteId }],
    objectives: [{ id: 'confirm-evidence', label: '向陆掌柜确认茶摊口供', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: teaKeeperId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch02_boss_ready', value: true },
      { type: 'set_flag', flag: 'ch02_autosave_checkpoint', value: true },
      { type: 'set_flag', flag: 'ch02_mainline_complete', value: true },
      { type: 'give_exp', amount: 8, grantKey: 'quest:ch02:mainline:evidence-ready:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:boss-ready') },
    ],
    rewardGrantKey: 'quest:ch02:mainline:evidence-ready',
  },
  {
    id: asQuestId('ch02:side:tea-ledger'),
    title: '茶摊账本也要讲证据',
    chapterId,
    objective: '帮陆掌柜把三种口径的茶摊账本对齐',
    kind: 'side',
    priority: 15,
    giverNpcId: teaKeeperId,
    dialogueId: dialogueTeaKeeperId,
    conditions: [{ type: 'quest_complete', questId: mainlineStartId }],
    objectives: [{ id: 'help-tea-keeper', label: '帮陆掌柜核对茶摊账本', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: teaKeeperId, kind: 'help' } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch02:side:tea-ledger:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:tea-ledger') },
    ],
    rewardGrantKey: 'quest:ch02:side:tea-ledger',
  },
  {
    id: asQuestId('ch02:side:river-lotus'),
    title: '河岸药篮的莲子',
    chapterId,
    objective: '在清河码头采一次河岸莲子，别让药篮只负责摆造型',
    kind: 'side',
    priority: 5,
    giverNpcId: boatwomanId,
    dialogueId: dialogueBoatwomanId,
    conditions: [{ type: 'quest_complete', questId: riverRouteId }],
    objectives: [{ id: 'collect-river-lotus', label: '完成一次河岸莲子采集', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch02:river-lotus') } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch02:side:river-lotus:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:river-lotus') },
    ],
    rewardGrantKey: 'quest:ch02:side:river-lotus',
  },
]

export const CORE_CH02_QUESTS = CH02_QUESTS

// 保留捕快对白引用在本章内容索引中，C313 只消费它，不提前改变本任务的奖励逻辑。
export const CH02_BANGSI_DIALOGUE_ID = dialogueBangsiId
