import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const clerk = asNpcId('capital-clerk'); const registrar = asNpcId('capital-registrar'); const storyteller = asNpcId('capital-storyteller'); const archivist = asNpcId('capital-archivist')
const id = (value: string) => asDialogueId(`dialogue:ch07:${value}`)
const choice = (slug: string, label: string, nextNodeId?: DialogueNode['id'], options: Partial<DialogueNode['choices'][number]> = {}) => ({ id: asChoiceId(`choice:ch07:${slug}`), label, ...(nextNodeId ? { nextNodeId } : {}), ...options })
const hub = id('hub'); const clerkNode = id('clerk'); const clerkClue = id('clerk:clue'); const clerkDetour = id('clerk:detour'); const registrarNode = id('registrar'); const registrarClue = id('registrar:clue'); const registrarDetour = id('registrar:detour'); const storytellerNode = id('storyteller'); const storytellerClue = id('storyteller:clue'); const storytellerDetour = id('storyteller:detour'); const archiveNode = id('archivist'); const review = id('review:confirm')

export const ch07DialogueDefinitions: readonly DialogueNode[] = [
  { id: hub, speakerNpcId: clerk, text: '京城的榜单每天更新，只有档案房坚持使用昨天的纸。小吏阿文说，百晓榜幕后交易先要解决一个问题：谁有资格看榜。', choices: [choice('hub-clerk', '问阿文入场牌', clerkNode), choice('hub-registrar', '去榜司看账本', registrarNode), choice('hub-storyteller', '找阿墨听榜外消息', storytellerNode), choice('hub-archive', '到档案房核墨迹', archiveNode)] },
  { id: clerkNode, speakerNpcId: clerk, text: '小吏阿文递来三块牌：“一块写可看，一块写可买，一块什么都没写但最贵。京城规矩有时比字更有价格。”', choices: [choice('clerk-clue', '请他指出合法入场牌', clerkClue), choice('clerk-detour', '先给自己发一块热搜牌', clerkDetour, { branch: 'confusing', returnToNodeId: clerkNode })] },
  { id: clerkClue, speakerNpcId: clerk, text: '合法入场牌有档案编号，不写推荐词。阿文说，真正的门票不需要提前宣布自己很重要。', choices: [choice('clerk-back', '把入场规则记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch07_clerk_seen', value: true }] }), choice('clerk-review', '把规则交榜司正式备案', review, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch07_review_notice', value: true }] })] },
  { id: clerkDetour, speakerNpcId: clerk, text: '阿文盖章：“热搜牌可以发，但它只证明你来过，不证明你说得对。”', choices: [choice('clerk-detour-back', '回到入场牌核对', clerkNode, { branch: 'confusing', returnToNodeId: clerkNode })] },
  { id: registrarNode, speakerNpcId: registrar, text: '冯榜把账本夹在榜单后：“这一页买的是位置，那一页买的是解释。最贵的页码通常没有正文。”', choices: [choice('registrar-clue', '请他打开交易账本', registrarClue), choice('registrar-detour', '先问账本能否上榜', registrarDetour, { branch: 'confusing', returnToNodeId: registrarNode })] },
  { id: registrarClue, speakerNpcId: registrar, text: '账本的墨色分三层，最深的一层来自档案房，说明交易并非传闻。冯榜第一次承认：榜单也需要被审计。', choices: [choice('registrar-back', '把账本层次记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch07_registrar_seen', value: true }] })] },
  { id: registrarDetour, speakerNpcId: registrar, text: '冯榜说：“账本可以上榜，但它会把自己的价格也写上去，读者大概会先笑。”', choices: [choice('registrar-detour-back', '回到交易账本', registrarNode, { branch: 'confusing', returnToNodeId: registrarNode })] },
  { id: storytellerNode, speakerNpcId: storyteller, text: '阿墨压低声音：“榜外消息不等于真相，它只是还没找到一张合适的纸。”', choices: [choice('storyteller-clue', '请他讲一条可复核的消息', storytellerClue), choice('storyteller-detour', '先把押韵写成榜单', storytellerDetour, { branch: 'confusing', returnToNodeId: storytellerNode })] },
  { id: storytellerClue, speakerNpcId: storyteller, text: '阿墨指向档案房：“查到原始墨迹，再把故事说出去。否则押韵只是押住了证据。”', choices: [choice('storyteller-back', '把榜外线索记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch07_storyteller_seen', value: true }] })] },
  { id: storytellerDetour, speakerNpcId: storyteller, text: '阿墨说：“可以，但榜单会先问你有没有买它的韵脚。”', choices: [choice('storyteller-detour-back', '回到可复核消息', storytellerNode, { branch: 'confusing', returnToNodeId: storytellerNode })] },
  { id: archiveNode, speakerNpcId: archivist, text: '沈卷守着一排墨锭：“档案不替榜单发言，只保证每个字都能找到前一笔。”', choices: [choice('archive-back', '把档案规则记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch07_archivist_seen', value: true }] })] },
  { id: review, speakerNpcId: registrar, text: '冯榜把交易账、入场牌和原始墨迹并排放好：“确认现在公开这套审计规则吗？公开之后，榜单的热度不能再替它删页。”', choices: [choice('review-confirm', '确认，让每一笔都有出处', hub)] },
]
export const CH07_DIALOGUE_GRAPH: DialogueGraph = { id: 'dialogue:ch07', startNodeId: hub, nodes: ch07DialogueDefinitions, mainlineNodeIds: [hub, clerkNode, clerkClue, registrarNode, registrarClue, storytellerNode, storytellerClue, archiveNode, review], maxConfusingHops: 2 }
export const CH07_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = { mild: ['榜单有排名，档案有出处。', '阿墨说故事先找纸，再找韵。'], standard: ['入场牌不写推荐词，反而显得最像真的。', '沈卷保证每个字都能找到前一笔，榜单暂时找不到自己的。'], spicy: ['京城热榜：价格已上榜，正文仍在审核。', '阿墨的押韵申请被退回，理由是缺少可复核来源。', '档案房今日限量墨锭，买一块送一条未被买走的真相。'] }
export const CH07_MODERN_MAPPING_LINES: readonly string[] = ['京城热榜：价格已上榜，正文仍在审核。']
export const CH07_DIALOGUE_COPY_KEYS = { entry: asContentKey('line:ch07:entry-token'), ledger: asContentKey('line:ch07:trade-ledger'), truth: asContentKey('line:ch07:boss-ready') } as const
export const CORE_CH07_DIALOGUES = ch07DialogueDefinitions
