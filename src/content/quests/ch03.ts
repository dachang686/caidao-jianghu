import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch03')
const ledgerKeeperId = asNpcId('blackwind-ledger-keeper')
const runnerId = asNpcId('blackwind-runner')
const cookId = asNpcId('blackwind-cook')
const dialogueLedgerId = asDialogueId('dialogue:ch03:ledger-keeper')
const dialogueRunnerId = asDialogueId('dialogue:ch03:runner')
const dialogueCookId = asDialogueId('dialogue:ch03:cook')

const entryId = asQuestId('ch03:mainline:entry-register')
const stampsId = asQuestId('ch03:mainline:three-stamps')
const mealRouteId = asQuestId('ch03:mainline:meal-route')
const rollCallId = asQuestId('ch03:mainline:roll-call')

export const CH03_QUESTS: readonly QuestDefinition[] = [
  {
    id: entryId,
    title: '山寨也要冲榜：先把门口登记好',
    chapterId,
    objective: '向曹掌柜确认黑风寨的账榜规矩，并留下自己的刀谱名号',
    kind: 'main',
    priority: 40,
    giverNpcId: ledgerKeeperId,
    dialogueId: dialogueLedgerId,
    conditions: [{ type: 'flag_equals', flag: 'ch02_mainline_complete', value: true }],
    objectives: [{ id: 'help-ledger-keeper', label: '帮曹掌柜登记一次山寨账榜', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: ledgerKeeperId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch03_ledger_started', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch03:mainline:entry-register:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:entry-register') },
    ],
    rewardGrantKey: 'quest:ch03:mainline:entry-register',
  },
  {
    id: stampsId,
    title: '山寨也要冲榜：三枚印，四种口径',
    chapterId,
    objective: '检查山寨账榜，把粮草、巡哨和面子三类印记对齐',
    kind: 'main',
    priority: 30,
    giverNpcId: ledgerKeeperId,
    dialogueId: dialogueLedgerId,
    conditions: [{ type: 'quest_complete', questId: entryId }],
    objectives: [{ id: 'inspect-ledger-board', label: '调查山寨账榜', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch03:gate-ledger-board') } }],
    effects: [
      { type: 'set_flag', flag: 'ch03_three_stamps', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch03:mainline:three-stamps:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:three-stamps') },
    ],
    rewardGrantKey: 'quest:ch03:mainline:three-stamps',
  },
  {
    id: mealRouteId,
    title: '山寨也要冲榜：灶房里的百味刀谱',
    chapterId,
    objective: '向胡大勺确认山寨军粮路线，把百味刀谱的配方线索接上',
    kind: 'main',
    priority: 20,
    giverNpcId: cookId,
    dialogueId: dialogueCookId,
    conditions: [{ type: 'quest_complete', questId: stampsId }],
    objectives: [{ id: 'help-cook', label: '向胡大勺确认灶房路线', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: cookId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch03_meal_route_open', value: true },
      { type: 'give_exp', amount: 5, grantKey: 'quest:ch03:mainline:meal-route:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:meal-route') },
    ],
    rewardGrantKey: 'quest:ch03:mainline:meal-route',
  },
  {
    id: rollCallId,
    title: '山寨也要冲榜：瞭望台的最后一声鼓',
    chapterId,
    objective: '向小顺核对山寨传令，把可以递交给寨主的前置状态整理完毕',
    kind: 'main',
    priority: 10,
    giverNpcId: runnerId,
    dialogueId: dialogueRunnerId,
    conditions: [{ type: 'quest_complete', questId: mealRouteId }],
    objectives: [{ id: 'help-runner', label: '向小顺核对传令路线', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: runnerId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch03_boss_ready', value: true },
      { type: 'set_flag', flag: 'ch03_autosave_checkpoint', value: true },
      { type: 'set_flag', flag: 'ch03_mainline_complete', value: true },
      { type: 'give_exp', amount: 8, grantKey: 'quest:ch03:mainline:roll-call:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:boss-ready') },
    ],
    rewardGrantKey: 'quest:ch03:mainline:roll-call',
  },
  {
    id: asQuestId('ch03:side:mountain-pepper'),
    title: '手工支线：山椒先别进锅',
    chapterId,
    objective: '在灶房后侧采一次黑风山椒，证明食材不是凭空出现的',
    kind: 'side',
    priority: 15,
    giverNpcId: cookId,
    dialogueId: dialogueCookId,
    conditions: [{ type: 'quest_complete', questId: entryId }],
    objectives: [{ id: 'collect-mountain-pepper', label: '完成一次黑风山椒采集', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch03:mountain-pepper') } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch03:side:mountain-pepper:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:mountain-pepper') },
    ],
    rewardGrantKey: 'quest:ch03:side:mountain-pepper',
  },
  {
    id: asQuestId('ch03:side:watchtower-rounds'),
    title: '手工支线：瞭望台的三班倒',
    chapterId,
    objective: '帮小顺把三班传令的顺序记在账榜边角',
    kind: 'side',
    priority: 5,
    giverNpcId: runnerId,
    dialogueId: dialogueRunnerId,
    conditions: [{ type: 'quest_complete', questId: stampsId }],
    objectives: [{ id: 'help-runner-rounds', label: '帮小顺核对一次瞭望台传令', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: runnerId, kind: 'help' } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch03:side:watchtower-rounds:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:watchtower-rounds') },
    ],
    rewardGrantKey: 'quest:ch03:side:watchtower-rounds',
  },
]

export const CORE_CH03_QUESTS = CH03_QUESTS
