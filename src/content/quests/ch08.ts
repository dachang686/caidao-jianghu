import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch08')
const usherId = asNpcId('convention-usher')
const representativeId = asNpcId('convention-sect-representative')
const judgeId = asNpcId('convention-judge')
const usherDialogue = asDialogueId('dialogue:ch08:usher')
const representativeDialogue = asDialogueId('dialogue:ch08:sect-representative')
const judgeDialogue = asDialogueId('dialogue:ch08:judge')
const registerId = asQuestId('ch08:mainline:register')
const definitionId = asQuestId('ch08:mainline:definition')

export const CH08_QUESTS: readonly QuestDefinition[] = [
  {
    id: registerId, title: '刀谱与江湖定义权：先登记谁能发言', chapterId, objective: '向顾门牌登记参会身份，让江湖定义权先拥有一个入口', kind: 'main', priority: 30,
    giverNpcId: usherId, dialogueId: usherDialogue, conditions: [{ type: 'flag_equals', flag: 'ch07_mainline_complete', value: true }],
    objectives: [{ id: 'help-usher', label: '帮助顾门牌完成参会登记', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: usherId, kind: 'help' } }],
    effects: [{ type: 'set_flag', flag: 'ch08_register_checked', value: true }, { type: 'give_exp', amount: 8, grantKey: 'quest:ch08:mainline:register:exp' }, { type: 'narrate', lineId: asContentKey('line:ch08:register') }], rewardGrantKey: 'quest:ch08:mainline:register',
  },
  {
    id: definitionId, title: '刀谱与江湖定义权：门派说法要能对照', chapterId, objective: '邀请门派代表、摊主和裁判对照同一份刀谱', kind: 'main', priority: 20,
    giverNpcId: representativeId, dialogueId: representativeDialogue, conditions: [{ type: 'quest_complete', questId: registerId }],
    objectives: [{ id: 'inspect-convention-stage', label: '调查武林大会评判台', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch08:stage:arena') } }],
    effects: [{ type: 'set_flag', flag: 'ch08_definition_checked', value: true }, { type: 'give_exp', amount: 8, grantKey: 'quest:ch08:mainline:definition:exp' }, { type: 'narrate', lineId: asContentKey('line:ch08:definition') }], rewardGrantKey: 'quest:ch08:mainline:definition',
  },
  {
    id: asQuestId('ch08:mainline:final-menu'), title: '刀谱与江湖定义权：最后一页由谁落款', chapterId, objective: '让司空秤确认最后一页刀谱，准备面对百晓榜主并进入结局判定', kind: 'main', priority: 10,
    giverNpcId: judgeId, dialogueId: judgeDialogue, conditions: [{ type: 'quest_complete', questId: definitionId }],
    objectives: [{ id: 'collect-convention-pepper', label: '采集一份会场椒香', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch08:convention-pepper') } }],
    effects: [{ type: 'set_flag', flag: 'ch08_boss_ready', value: true }, { type: 'set_flag', flag: 'ch08_autosave_checkpoint', value: true }, { type: 'set_flag', flag: 'ch08_mainline_complete', value: true }, { type: 'give_exp', amount: 12, grantKey: 'quest:ch08:mainline:final-menu:exp' }, { type: 'narrate', lineId: asContentKey('line:ch08:boss-ready') }], rewardGrantKey: 'quest:ch08:mainline:final-menu',
  },
  {
    id: asQuestId('ch08:side:sect-score'), title: '手工支线：门派评分先看厨房', chapterId, objective: '帮叶青锋把门派评分中的空话换成可执行条目', kind: 'side', priority: 15,
    giverNpcId: representativeId, dialogueId: representativeDialogue, conditions: [{ type: 'quest_complete', questId: registerId }],
    objectives: [{ id: 'help-representative', label: '帮助叶青锋整理门派评分', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: representativeId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 4, grantKey: 'quest:ch08:side:sect-score:exp' }, { type: 'narrate', lineId: asContentKey('line:ch08:sect-score') }], rewardGrantKey: 'quest:ch08:side:sect-score',
  },
  {
    id: asQuestId('ch08:side:noodle-line'), title: '手工支线：面摊排队也是江湖秩序', chapterId, objective: '帮面摊小周把排队规则写得人人看得懂', kind: 'side', priority: 5,
    giverNpcId: asNpcId('convention-noodle-vendor'), dialogueId: asDialogueId('dialogue:ch08:noodle-vendor'), conditions: [{ type: 'quest_complete', questId: definitionId }],
    objectives: [{ id: 'help-noodle-vendor', label: '帮助面摊小周整理排队规则', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: asNpcId('convention-noodle-vendor'), kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 4, grantKey: 'quest:ch08:side:noodle-line:exp' }, { type: 'narrate', lineId: asContentKey('line:ch08:noodle-line') }], rewardGrantKey: 'quest:ch08:side:noodle-line',
  },
]

export const CORE_CH08_QUESTS = CH08_QUESTS
