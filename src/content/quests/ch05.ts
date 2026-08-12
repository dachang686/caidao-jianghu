import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch05')
const courierId = asNpcId('western-courier')
const teaId = asNpcId('western-tea-keeper')
const guardId = asNpcId('western-guard')
const courierDialogue = asDialogueId('dialogue:ch05:courier')
const teaDialogue = asDialogueId('dialogue:ch05:tea-keeper')
const guardDialogue = asDialogueId('dialogue:ch05:guard')
const manifestId = asQuestId('ch05:mainline:manifest')
const routeId = asQuestId('ch05:mainline:route')
const sealId = asQuestId('ch05:mainline:seal')
const verdictId = asQuestId('ch05:mainline:twin-verdict')

export const CH05_QUESTS: readonly QuestDefinition[] = [
  {
    id: manifestId, title: '刀谱物流之谜：先把货单找回来', chapterId,
    objective: '向洛小铃核对西域驿站的货单，确认百味刀谱没有被当成普通包裹', kind: 'main', priority: 40,
    giverNpcId: courierId, dialogueId: courierDialogue,
    conditions: [{ type: 'flag_equals', flag: 'ch04_mainline_complete', value: true }],
    objectives: [{ id: 'help-courier', label: '帮助洛小铃核对一份货单', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: courierId, kind: 'help' } }],
    effects: [{ type: 'set_flag', flag: 'ch05_manifest_checked', value: true }, { type: 'give_exp', amount: 5, grantKey: 'quest:ch05:mainline:manifest:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:manifest') }],
    rewardGrantKey: 'quest:ch05:mainline:manifest',
  },
  {
    id: routeId, title: '刀谱物流之谜：补给路线不能靠感觉', chapterId,
    objective: '从沙井与茶摊拼出真实路线，证明货物不是被风吹走的', kind: 'main', priority: 30,
    giverNpcId: teaId, dialogueId: teaDialogue, conditions: [{ type: 'quest_complete', questId: manifestId }],
    objectives: [{ id: 'inspect-route', label: '调查驿站货单上的补给路线', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch05:station:manifest') } }],
    effects: [{ type: 'set_flag', flag: 'ch05_route_checked', value: true }, { type: 'give_exp', amount: 5, grantKey: 'quest:ch05:mainline:route:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:route') }],
    rewardGrantKey: 'quest:ch05:mainline:route',
  },
  {
    id: sealId, title: '刀谱物流之谜：驼铃上的封条', chapterId,
    objective: '向驼背老关核对封条与驼铃，锁定双煞动手的车队', kind: 'main', priority: 20,
    giverNpcId: guardId, dialogueId: guardDialogue, conditions: [{ type: 'quest_complete', questId: routeId }],
    objectives: [{ id: 'help-guard', label: '帮助驼背老关核对封条', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: guardId, kind: 'help' } }],
    effects: [{ type: 'set_flag', flag: 'ch05_seal_checked', value: true }, { type: 'give_exp', amount: 6, grantKey: 'quest:ch05:mainline:seal:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:seal') }],
    rewardGrantKey: 'quest:ch05:mainline:seal',
  },
  {
    id: verdictId, title: '刀谱物流之谜：驿路双煞的交付单', chapterId,
    objective: '把货单、路线和封条合并成一份可验证的双煞交付单，准备面对 Boss', kind: 'main', priority: 10,
    giverNpcId: guardId, dialogueId: guardDialogue, conditions: [{ type: 'quest_complete', questId: sealId }],
    objectives: [{ id: 'collect-sand-herb', label: '采集一份沙参作为交付凭证', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch05:sand-herb') } }],
    effects: [{ type: 'set_flag', flag: 'ch05_boss_ready', value: true }, { type: 'set_flag', flag: 'ch05_autosave_checkpoint', value: true }, { type: 'set_flag', flag: 'ch05_mainline_complete', value: true }, { type: 'give_exp', amount: 9, grantKey: 'quest:ch05:mainline:twin-verdict:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:boss-ready') }],
    rewardGrantKey: 'quest:ch05:mainline:twin-verdict',
  },
  {
    id: asQuestId('ch05:side:tea-water'), title: '手工支线：茶摊的水要有来路', chapterId,
    objective: '从沙井取一份西域沙参，换白沙姑一句真话', kind: 'side', priority: 15,
    giverNpcId: teaId, dialogueId: teaDialogue, conditions: [{ type: 'quest_complete', questId: manifestId }],
    objectives: [{ id: 'collect-tea-herb', label: '完成一次西域沙参采集', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch05:sand-herb') } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch05:side:tea-water:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:tea-water') }],
    rewardGrantKey: 'quest:ch05:side:tea-water',
  },
  {
    id: asQuestId('ch05:side:camel-bells'), title: '手工支线：驼铃不要各唱各的', chapterId,
    objective: '帮助驼背老关校准一组驼铃，找出混进车队的假响', kind: 'side', priority: 5,
    giverNpcId: guardId, dialogueId: guardDialogue, conditions: [{ type: 'quest_complete', questId: routeId }],
    objectives: [{ id: 'help-bells', label: '帮助老关校准驼铃', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: guardId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch05:side:camel-bells:exp' }, { type: 'narrate', lineId: asContentKey('line:ch05:camel-bells') }],
    rewardGrantKey: 'quest:ch05:side:camel-bells',
  },
]

export const CORE_CH05_QUESTS = CH05_QUESTS
