import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch06')
const boatwomanId = asNpcId('donghai-boatwoman')
const vendorId = asNpcId('donghai-shell-vendor')
const bellId = asNpcId('donghai-tide-bell-keeper')
const boatDialogue = asDialogueId('dialogue:ch06:boatwoman')
const vendorDialogue = asDialogueId('dialogue:ch06:shell-vendor')
const bellDialogue = asDialogueId('dialogue:ch06:tide-bell-keeper')
const shipLogId = asQuestId('ch06:mainline:ship-log')
const lightStoneId = asQuestId('ch06:mainline:light-stone')

export const CH06_QUESTS: readonly QuestDefinition[] = [
  {
    id: shipLogId, title: '留影石带货乱象：先看船单', chapterId, objective: '向海棠核对码头船单，确认留影石来自哪一班潮船', kind: 'main', priority: 30,
    giverNpcId: boatwomanId, dialogueId: boatDialogue, conditions: [{ type: 'flag_equals', flag: 'ch05_mainline_complete', value: true }],
    objectives: [{ id: 'help-boatwoman', label: '帮助海棠核对船单', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: boatwomanId, kind: 'help' } }],
    effects: [{ type: 'set_flag', flag: 'ch06_ship_log_checked', value: true }, { type: 'give_exp', amount: 6, grantKey: 'quest:ch06:mainline:ship-log:exp' }, { type: 'narrate', lineId: asContentKey('line:ch06:ship-log') }], rewardGrantKey: 'quest:ch06:mainline:ship-log',
  },
  {
    id: lightStoneId, title: '留影石带货乱象：滤镜先于事实', chapterId, objective: '拼出留影石来源和传播路径，让潮声寺的钟声成为证据', kind: 'main', priority: 20,
    giverNpcId: vendorId, dialogueId: vendorDialogue, conditions: [{ type: 'quest_complete', questId: shipLogId }],
    objectives: [{ id: 'inspect-shell-market', label: '调查贝壳市场的留影石摊位', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch06:market:shells') } }],
    effects: [{ type: 'set_flag', flag: 'ch06_light_stone_checked', value: true }, { type: 'give_exp', amount: 6, grantKey: 'quest:ch06:mainline:light-stone:exp' }, { type: 'narrate', lineId: asContentKey('line:ch06:light-stone') }], rewardGrantKey: 'quest:ch06:mainline:light-stone',
  },
  {
    id: asQuestId('ch06:mainline:tide-verdict'), title: '留影石带货乱象：潮声作证', chapterId, objective: '让潮生确认潮汐记录，准备面对海潮帮主', kind: 'main', priority: 10,
    giverNpcId: bellId, dialogueId: bellDialogue, conditions: [{ type: 'quest_complete', questId: lightStoneId }],
    objectives: [{ id: 'collect-sea-salt', label: '采集一份东海潮盐', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch06:sea-salt') } }],
    effects: [{ type: 'set_flag', flag: 'ch06_boss_ready', value: true }, { type: 'set_flag', flag: 'ch06_autosave_checkpoint', value: true }, { type: 'set_flag', flag: 'ch06_mainline_complete', value: true }, { type: 'give_exp', amount: 9, grantKey: 'quest:ch06:mainline:tide-verdict:exp' }, { type: 'narrate', lineId: asContentKey('line:ch06:boss-ready') }], rewardGrantKey: 'quest:ch06:mainline:tide-verdict',
  },
  {
    id: asQuestId('ch06:side:shell-polish'), title: '手工支线：贝壳别替事实打光', chapterId, objective: '帮贝小满抛光一枚不带滤镜的贝壳', kind: 'side', priority: 15,
    giverNpcId: vendorId, dialogueId: vendorDialogue, conditions: [{ type: 'quest_complete', questId: shipLogId }],
    objectives: [{ id: 'help-shell-vendor', label: '帮助贝小满整理贝壳摊', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: vendorId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch06:side:shell-polish:exp' }, { type: 'narrate', lineId: asContentKey('line:ch06:shell-polish') }], rewardGrantKey: 'quest:ch06:side:shell-polish',
  },
  {
    id: asQuestId('ch06:side:tide-prayer'), title: '手工支线：潮钟的祈愿词', chapterId, objective: '帮潮生校准潮钟，别把涨潮播成促销', kind: 'side', priority: 5,
    giverNpcId: bellId, dialogueId: bellDialogue, conditions: [{ type: 'quest_complete', questId: lightStoneId }],
    objectives: [{ id: 'help-tide-bell', label: '帮助潮生校准潮钟', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: bellId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch06:side:tide-prayer:exp' }, { type: 'narrate', lineId: asContentKey('line:ch06:tide-prayer') }], rewardGrantKey: 'quest:ch06:side:tide-prayer',
  },
]

export const CORE_CH06_QUESTS = CH06_QUESTS
