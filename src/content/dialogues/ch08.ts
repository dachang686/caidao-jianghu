import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const usher = asNpcId('convention-usher'); const representative = asNpcId('convention-sect-representative'); const noodle = asNpcId('convention-noodle-vendor'); const judge = asNpcId('convention-judge')
const id = (value: string) => asDialogueId(`dialogue:ch08:${value}`)
const choice = (slug: string, label: string, nextNodeId?: DialogueNode['id'], options: Partial<DialogueNode['choices'][number]> = {}) => ({ id: asChoiceId(`choice:ch08:${slug}`), label, ...(nextNodeId ? { nextNodeId } : {}), ...options })
const hub = id('hub'); const usherNode = id('usher'); const usherClue = id('usher:clue'); const usherDetour = id('usher:detour'); const sectNode = id('sect-representative'); const sectClue = id('sect-representative:clue'); const sectDetour = id('sect-representative:detour'); const noodleNode = id('noodle-vendor'); const noodleClue = id('noodle-vendor:clue'); const noodleDetour = id('noodle-vendor:detour'); const judgeNode = id('judge'); const judgeClue = id('judge:clue'); const review = id('review:confirm')

export const ch08DialogueDefinitions: readonly DialogueNode[] = [
  { id: hub, speakerNpcId: usher, text: '武林大会把江湖分成看台、擂台和厨房。顾门牌说，刀谱最后一页要先回答：谁能给江湖下定义。', choices: [choice('hub-usher', '问顾门牌登记', usherNode), choice('hub-sect', '找门派代表对照', sectNode), choice('hub-noodle', '去面摊看秩序', noodleNode), choice('hub-judge', '找司空秤评判', judgeNode)] },
  { id: usherNode, speakerNpcId: usher, text: '顾门牌递来参会册：“姓名、门派、想定义的对象。最后一项写得越大，越需要先证明自己来过现场。”', choices: [choice('usher-clue', '请他解释登记规则', usherClue), choice('usher-detour', '先给菜刀登记为门派', usherDetour, { branch: 'confusing', returnToNodeId: usherNode })] },
  { id: usherClue, speakerNpcId: usher, text: '登记册的空白栏专门给最后定义权留着。顾门牌说，空白不是无主，而是等证据来签字。', choices: [choice('usher-back', '把登记规则记进刀谱', hub, { effects: [{ type: 'set_flag', flag: 'ch08_usher_seen', value: true }] }), choice('usher-review', '把规则交裁判台备案', review, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch08_review_notice', value: true }] })] },
  { id: usherDetour, speakerNpcId: usher, text: '顾门牌给菜刀发了一张临时牌：“它可以参会，但不能替你完成发言。”', choices: [choice('usher-detour-back', '回到登记规则', usherNode, { branch: 'confusing', returnToNodeId: usherNode })] },
  { id: sectNode, speakerNpcId: representative, text: '叶青锋展开门派评分表：“每家都说自己代表江湖，评分表只好先代表纸张。”', choices: [choice('sect-clue', '请他对照门派说法', sectClue), choice('sect-detour', '先给评分表比武', sectDetour, { branch: 'confusing', returnToNodeId: sectNode })] },
  { id: sectClue, speakerNpcId: representative, text: '叶青锋承认，门派说法必须与实绩、厨房和门人反馈同时对照，否则只是把口号写得更工整。', choices: [choice('sect-back', '把对照规则记进刀谱', hub, { effects: [{ type: 'set_flag', flag: 'ch08_sect_seen', value: true }] })] },
  { id: sectDetour, speakerNpcId: representative, text: '评分表没有武学根骨，输赢只能由笔尖决定。叶青锋赶紧把它从擂台请下去。', choices: [choice('sect-detour-back', '回到门派对照', sectNode, { branch: 'confusing', returnToNodeId: sectNode })] },
  { id: noodleNode, speakerNpcId: noodle, text: '面摊小周指着队伍：“排队也是江湖秩序。谁先到不一定最强，但一定先拿到自己的面。”', choices: [choice('noodle-clue', '请他说明秩序规则', noodleClue), choice('noodle-detour', '先按武功高低排队', noodleDetour, { branch: 'confusing', returnToNodeId: noodleNode })] },
  { id: noodleClue, speakerNpcId: noodle, text: '小周把排号写在锅盖上：“规则要让最后一个人也看懂，不然定义权只会落在声音最大的那位。”', choices: [choice('noodle-back', '把厨房规则记进刀谱', hub, { effects: [{ type: 'set_flag', flag: 'ch08_noodle_seen', value: true }] })] },
  { id: noodleDetour, speakerNpcId: noodle, text: '小周把最强的人请到队尾：“武功高可以先打，不能先把别人的面端走。”', choices: [choice('noodle-detour-back', '回到排队规则', noodleNode, { branch: 'confusing', returnToNodeId: noodleNode })] },
  { id: judgeNode, speakerNpcId: judge, text: '司空秤拿着两枚砝码：“一枚称招式，一枚称说法。若只称其中一枚，秤会装作自己公平。”', choices: [choice('judge-clue', '请他说明最终评判', judgeClue), choice('judge-detour', '先把砝码评为最佳选手', judgeNode, { branch: 'confusing', returnToNodeId: judgeNode })] },
  { id: judgeClue, speakerNpcId: judge, text: '司空秤说，最后一页必须同时写事实、选择与后果。谁来落款不如落款后是否仍允许继续行走重要。', choices: [choice('judge-back', '把评判规则记进刀谱', hub, { effects: [{ type: 'set_flag', flag: 'ch08_judge_seen', value: true }] })] },
  { id: review, speakerNpcId: judge, text: '司空秤把四份记录放在一起：“确认把这套定义规则交给大会备案吗？确认之后，江湖仍可继续，但不能再假装没有看见这些证据。”', choices: [choice('review-confirm', '确认，定义权应当可复核', hub)] },
]
export const CH08_DIALOGUE_GRAPH: DialogueGraph = { id: 'dialogue:ch08', startNodeId: hub, nodes: ch08DialogueDefinitions, mainlineNodeIds: [hub, usherNode, usherClue, sectNode, sectClue, noodleNode, noodleClue, judgeNode, judgeClue, review], maxConfusingHops: 2 }
export const CH08_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = { mild: ['大会规则应让最后一位参会者也看得懂。', '司空秤说事实和说法都要称。'], standard: ['菜刀拿到临时牌，终于拥有了比部分门派更完整的参会手续。', '面摊小周把排号写在锅盖上，厨房成为最稳定的裁判。'], spicy: ['武林大会榜外项目：谁最会定义自己。', '评分表被请下擂台，因为它没有武学根骨。', '司空秤今日提示：砝码不负责替你决定人生，只负责让偏心露出来。'] }
export const CH08_MODERN_MAPPING_LINES: readonly string[] = ['武林大会榜外项目：谁最会定义自己。']
export const CH08_DIALOGUE_COPY_KEYS = { entry: asContentKey('line:ch08:register'), definition: asContentKey('line:ch08:definition'), bossReady: asContentKey('line:ch08:boss-ready') } as const
export const CORE_CH08_DIALOGUES = ch08DialogueDefinitions
