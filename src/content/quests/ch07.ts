import type { QuestDefinition } from '../../types/quest'
import { asChapterId, asContentKey, asDialogueId, asGatheringNodeId, asHotspotId, asNpcId, asQuestId } from '../../types/ids'

const chapterId = asChapterId('ch07')
const clerkId = asNpcId('capital-clerk')
const registrarId = asNpcId('capital-registrar')
const storytellerId = asNpcId('capital-storyteller')
const clerkDialogue = asDialogueId('dialogue:ch07:clerk')
const registrarDialogue = asDialogueId('dialogue:ch07:registrar')
const storytellerDialogue = asDialogueId('dialogue:ch07:storyteller')
const entryId = asQuestId('ch07:mainline:entry-token')
const ledgerId = asQuestId('ch07:mainline:trade-ledger')

export const CH07_QUESTS: readonly QuestDefinition[] = [
  {
    id: entryId, title: '百晓榜幕后交易：先拿到入场牌', chapterId, objective: '向小吏阿文核对入场牌，确认百晓榜交易会没有把你列成道具', kind: 'main', priority: 30,
    giverNpcId: clerkId, dialogueId: clerkDialogue, conditions: [{ type: 'flag_equals', flag: 'ch06_mainline_complete', value: true }],
    objectives: [{ id: 'help-clerk', label: '帮助小吏阿文核对入场牌', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: clerkId, kind: 'help' } }],
    effects: [{ type: 'set_flag', flag: 'ch07_entry_checked', value: true }, { type: 'give_exp', amount: 7, grantKey: 'quest:ch07:mainline:entry-token:exp' }, { type: 'narrate', lineId: asContentKey('line:ch07:entry-token') }], rewardGrantKey: 'quest:ch07:mainline:entry-token',
  },
  {
    id: ledgerId, title: '百晓榜幕后交易：账本不能只剩热度', chapterId, objective: '从榜司和档案中拼出交易账本，分开真相与热搜', kind: 'main', priority: 20,
    giverNpcId: registrarId, dialogueId: registrarDialogue, conditions: [{ type: 'quest_complete', questId: entryId }],
    objectives: [{ id: 'inspect-ranking-ledger', label: '调查百晓榜交易账本', eventType: 'exploration.hotspot_activated', requiredCount: 1, payloadMatch: { hotspotId: asHotspotId('ch07:office:ledger') } }],
    effects: [{ type: 'set_flag', flag: 'ch07_ledger_checked', value: true }, { type: 'give_exp', amount: 7, grantKey: 'quest:ch07:mainline:trade-ledger:exp' }, { type: 'narrate', lineId: asContentKey('line:ch07:trade-ledger') }], rewardGrantKey: 'quest:ch07:mainline:trade-ledger',
  },
  {
    id: asQuestId('ch07:mainline:public-truth'), title: '百晓榜幕后交易：把真相写在榜外', chapterId, objective: '让阿墨公开一条可复核的榜外真相，准备面对榜司督主', kind: 'main', priority: 10,
    giverNpcId: storytellerId, dialogueId: storytellerDialogue, conditions: [{ type: 'quest_complete', questId: ledgerId }],
    objectives: [{ id: 'collect-capital-ink', label: '采集一块京城墨锭', eventType: 'gathering.node_collected', requiredCount: 1, payloadMatch: { nodeId: asGatheringNodeId('ch07:capital-ink') } }],
    effects: [{ type: 'set_flag', flag: 'ch07_boss_ready', value: true }, { type: 'set_flag', flag: 'ch07_autosave_checkpoint', value: true }, { type: 'set_flag', flag: 'ch07_mainline_complete', value: true }, { type: 'give_exp', amount: 10, grantKey: 'quest:ch07:mainline:public-truth:exp' }, { type: 'narrate', lineId: asContentKey('line:ch07:boss-ready') }], rewardGrantKey: 'quest:ch07:mainline:public-truth',
  },
  {
    id: asQuestId('ch07:side:seal-rubbing'), title: '手工支线：印章拓痕不等于背书', chapterId, objective: '帮冯榜整理一枚不带买榜暗示的印章拓痕', kind: 'side', priority: 15,
    giverNpcId: registrarId, dialogueId: registrarDialogue, conditions: [{ type: 'quest_complete', questId: entryId }],
    objectives: [{ id: 'help-registrar', label: '帮助冯榜整理拓痕', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: registrarId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch07:side:seal-rubbing:exp' }, { type: 'narrate', lineId: asContentKey('line:ch07:seal-rubbing') }], rewardGrantKey: 'quest:ch07:side:seal-rubbing',
  },
  {
    id: asQuestId('ch07:side:street-rhyme'), title: '手工支线：街头押韵要有出处', chapterId, objective: '帮阿墨把一段街头押韵标上可验证出处', kind: 'side', priority: 5,
    giverNpcId: storytellerId, dialogueId: storytellerDialogue, conditions: [{ type: 'quest_complete', questId: ledgerId }],
    objectives: [{ id: 'help-storyteller', label: '帮助阿墨标注街头押韵出处', eventType: 'npc.interaction', requiredCount: 1, payloadMatch: { npcId: storytellerId, kind: 'help' } }],
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'quest:ch07:side:street-rhyme:exp' }, { type: 'narrate', lineId: asContentKey('line:ch07:street-rhyme') }], rewardGrantKey: 'quest:ch07:side:street-rhyme',
  },
]

export const CORE_CH07_QUESTS = CH07_QUESTS
