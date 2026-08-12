import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch04')
const gateDiscipleId = asNpcId('qingyun-gate-disciple')
const herbalistId = asNpcId('qingyun-herbalist')
const bellKeeperId = asNpcId('qingyun-bell-keeper')
const dialogueGateId = asDialogueId('dialogue:ch04:gate-disciple')
const dialogueHerbalistId = asDialogueId('dialogue:ch04:herbalist')
const dialogueBellKeeperId = asDialogueId('dialogue:ch04:bell-keeper')

const gateRegisterId = asQuestId('ch04:mainline:gate-register')
const mountainStandardsId = asQuestId('ch04:mainline:mountain-standards')
const cloudHerbRouteId = asQuestId('ch04:mainline:cloud-herb-route')
const bellJudgmentId = asQuestId('ch04:mainline:bell-judgment')

export const CH04_QUESTS: readonly QuestDefinition[] = [
  {
    id: gateRegisterId,
    title: '名门的门面工程：先在山门登记',
    chapterId,
    objective: '向林小门说明来访名号，确认青云山门的接待规矩',
    kind: 'main',
    priority: 40,
    giverNpcId: gateDiscipleId,
    dialogueId: dialogueGateId,
    conditions: [{ type: 'flag_equals', flag: 'ch03_mainline_complete', value: true }],
    objectives: [{ id: 'help-gate-disciple', label: '帮林小门登记一次来访名号', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: gateDiscipleId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch04_gate_registered', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch04:mainline:gate-register:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:gate-register') },
    ],
    rewardGrantKey: 'quest:ch04:mainline:gate-register',
  },
  {
    id: mountainStandardsId,
    title: '名门的门面工程：检查山门标准',
    chapterId,
    objective: '调查山门规训石刻，把青云山的门面标准记进百味刀谱',
    kind: 'main',
    priority: 30,
    giverNpcId: gateDiscipleId,
    dialogueId: dialogueGateId,
    conditions: [{ type: 'quest_complete', questId: gateRegisterId }],
    objectives: [{ id: 'inspect-gate-inscription', label: '调查山门规训石刻', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch04:gate-inscription') } }],
    effects: [
      { type: 'set_flag', flag: 'ch04_standards_checked', value: true },
      { type: 'give_exp', amount: 4, grantKey: 'quest:ch04:mainline:mountain-standards:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:mountain-standards') },
    ],
    rewardGrantKey: 'quest:ch04:mainline:mountain-standards',
  },
  {
    id: cloudHerbRouteId,
    title: '名门的门面工程：药圃也要有章法',
    chapterId,
    objective: '向苏青禾确认云台药圃路线，把百味刀谱的药材页接上',
    kind: 'main',
    priority: 20,
    giverNpcId: herbalistId,
    dialogueId: dialogueHerbalistId,
    conditions: [{ type: 'quest_complete', questId: mountainStandardsId }],
    objectives: [{ id: 'help-herbalist', label: '向苏青禾确认药圃路线', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: herbalistId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch04_cloud_herb_route_open', value: true },
      { type: 'give_exp', amount: 5, grantKey: 'quest:ch04:mainline:cloud-herb-route:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:cloud-herb-route') },
    ],
    rewardGrantKey: 'quest:ch04:mainline:cloud-herb-route',
  },
  {
    id: bellJudgmentId,
    title: '名门的门面工程：听完最后一声钟',
    chapterId,
    objective: '向钟小响核对听云台传令，把可以递交给掌门的前置状态整理完毕',
    kind: 'main',
    priority: 10,
    giverNpcId: bellKeeperId,
    dialogueId: dialogueBellKeeperId,
    conditions: [{ type: 'quest_complete', questId: cloudHerbRouteId }],
    objectives: [{ id: 'help-bell-keeper', label: '向钟小响核对传令顺序', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: bellKeeperId, kind: 'help' } }],
    effects: [
      { type: 'set_flag', flag: 'ch04_boss_ready', value: true },
      { type: 'set_flag', flag: 'ch04_autosave_checkpoint', value: true },
      { type: 'set_flag', flag: 'ch04_mainline_complete', value: true },
      { type: 'give_exp', amount: 8, grantKey: 'quest:ch04:mainline:bell-judgment:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:boss-ready') },
    ],
    rewardGrantKey: 'quest:ch04:mainline:bell-judgment',
  },
  {
    id: asQuestId('ch04:side:cloud-herb'),
    title: '手工支线：青蘅草别只当摆设',
    chapterId,
    objective: '在云台药圃采一次云台青蘅，证明名门药材不是盆景',
    kind: 'side',
    priority: 15,
    giverNpcId: herbalistId,
    dialogueId: dialogueHerbalistId,
    conditions: [{ type: 'quest_complete', questId: gateRegisterId }],
    objectives: [{ id: 'collect-cloud-herb', label: '完成一次云台青蘅采集', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch04:cloud-herb') } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch04:side:cloud-herb:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:cloud-herb') },
    ],
    rewardGrantKey: 'quest:ch04:side:cloud-herb',
  },
  {
    id: asQuestId('ch04:side:bell-practice'),
    title: '手工支线：铜钟的三种回声',
    chapterId,
    objective: '帮钟小响核对三次回声落点，别让山门把风声记成掌门指令',
    kind: 'side',
    priority: 5,
    giverNpcId: bellKeeperId,
    dialogueId: dialogueBellKeeperId,
    conditions: [{ type: 'quest_complete', questId: mountainStandardsId }],
    objectives: [{ id: 'help-bell-practice', label: '帮钟小响核对一次回声落点', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: bellKeeperId, kind: 'help' } }],
    effects: [
      { type: 'give_exp', amount: 3, grantKey: 'quest:ch04:side:bell-practice:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:bell-practice') },
    ],
    rewardGrantKey: 'quest:ch04:side:bell-practice',
  },
]

export const CORE_CH04_QUESTS = CH04_QUESTS
