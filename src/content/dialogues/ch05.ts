import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const courier = asNpcId('western-courier'); const tea = asNpcId('western-tea-keeper'); const guard = asNpcId('western-guard')
const id = (value: string) => asDialogueId(`dialogue:ch05:${value}`)
const choice = (slug: string, label: string, nextNodeId?: DialogueNode['id'], options: Partial<DialogueNode['choices'][number]> = {}) => ({ id: asChoiceId(`choice:ch05:${slug}`), label, ...(nextNodeId ? { nextNodeId } : {}), ...options })
const hub = id('hub'); const courierNode = id('courier'); const courierClue = id('courier:clue'); const courierDetour = id('courier:detour')
const teaNode = id('tea-keeper'); const teaClue = id('tea-keeper:clue'); const teaDetour = id('tea-keeper:detour')
const guardNode = id('guard'); const guardClue = id('guard:clue'); const guardDetour = id('guard:detour'); const review = id('review:confirm')

export const ch05DialogueDefinitions: readonly DialogueNode[] = [
  { id: hub, speakerNpcId: courier, text: '西域驿站的风把货单吹成了折扇。洛小铃说，刀谱物流案的第一嫌疑不是盗匪，是每个人都觉得自己记得路线。', choices: [choice('hub-courier', '问洛小铃货单', courierNode), choice('hub-tea', '去茶摊核水路', teaNode), choice('hub-guard', '到车队找封条', guardNode)] },
  { id: courierNode, speakerNpcId: courier, text: '洛小铃把三张货单压在茶碗下：“第一张写西，第二张写东，第三张只写了一个刀字。你说这算物流，还是算谜语？”', choices: [choice('courier-clue', '请她指出可核对的路线', courierClue), choice('courier-detour', '先给货单盖个驼印', courierDetour, { branch: 'confusing', returnToNodeId: courierNode })] },
  { id: courierClue, speakerNpcId: courier, text: '真正的路线要经过沙井补给点，货单上的墨迹在那里被潮气晕过。洛小铃承认：刀谱至少确实来过西域。', choices: [choice('courier-back', '把路线记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch05_courier_seen', value: true }] }), choice('courier-review', '把这份路线交给驿站正式备案', review, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch05_review_notice', value: true }] })] },
  { id: courierDetour, speakerNpcId: courier, text: '驼印盖下去，货单反而更像一张合格证明。洛小铃说，至少它现在有了一个不会自称无辜的印记。', choices: [choice('courier-detour-back', '回到货单核对', courierNode, { branch: 'confusing', returnToNodeId: courierNode })] },
  { id: teaNode, speakerNpcId: tea, text: '白沙姑端来一碗茶：“沙井的水有来路，茶摊的传闻也有。区别是水喝完会少，传闻喝完会长。”', choices: [choice('tea-clue', '请她说明补给路线', teaClue), choice('tea-detour', '问茶能不能当运输凭证', teaDetour, { branch: 'confusing', returnToNodeId: teaNode })] },
  { id: teaClue, speakerNpcId: tea, text: '茶碗底有一粒沙，来自车队第三个转弯。白沙姑说，若想验证就去采沙参，别把口供只写在热气里。', choices: [choice('tea-back', '把沙井线索记进案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch05_tea_seen', value: true }] })] },
  { id: teaDetour, speakerNpcId: tea, text: '白沙姑点头：“能，但凭证会先被喝掉。你们查案的人总想把证据变成早餐。”', choices: [choice('tea-detour-back', '回到补给路线', teaNode, { branch: 'confusing', returnToNodeId: teaNode })] },
  { id: guardNode, speakerNpcId: guard, text: '驼背老关摸着驼铃：“双煞不偷整车，他们只调换封条。车队因此每天都在运输，唯独不知道自己运的是什么。”', choices: [choice('guard-clue', '请他核对封条', guardClue), choice('guard-detour', '先把驼铃当作证人传唤', guardDetour, { branch: 'confusing', returnToNodeId: guardNode })] },
  { id: guardClue, speakerNpcId: guard, text: '封条上的双线结来自同一把刀，且结尾多了一圈。老关说，第二个打结的人很急，急到忘了假装专业。', choices: [choice('guard-back', '把封条证据记入案卷', hub, { effects: [{ type: 'set_flag', flag: 'ch05_guard_seen', value: true }] })] },
  { id: guardDetour, speakerNpcId: guard, text: '老关替驼铃回答：“我只负责响，不负责作证。要不然每次风大，车队都得开庭。”', choices: [choice('guard-detour-back', '回到封条核对', guardNode, { branch: 'confusing', returnToNodeId: guardNode })] },
  { id: review, speakerNpcId: courier, text: '洛小铃把路线、茶碗和封条摆成一排：“现在确认，要把这份可复核证据交给驿站备案吗？备案后双煞会知道我们已经把谜语翻译完了。”', choices: [choice('review-confirm', '确认，证据应当公开备案', hub)] },
]

export const CH05_DIALOGUE_GRAPH: DialogueGraph = { id: 'dialogue:ch05', startNodeId: hub, nodes: ch05DialogueDefinitions, mainlineNodeIds: [hub, courierNode, courierClue, teaNode, teaClue, guardNode, guardClue, review], maxConfusingHops: 2 }
export const CH05_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = {
  mild: ['驿站提醒：路线要有来处，驼铃也要有落点。', '白沙姑说茶水少，传闻多。'],
  standard: ['货单被风折成扇面，洛小铃只好用茶碗给它压回证据形状。', '驼背老关发现封条多了一圈，说明有人把心虚也打了结。'],
  spicy: ['西域物流 KPI：货物持续移动，负责的人持续互相指路。', '驼铃拒绝出庭，因为风一大它就会同时推翻三份口供。', '茶摊今日新品：一碗水，附赠一条尚未核验的路线。'],
}
export const CH05_MODERN_MAPPING_LINES: readonly string[] = ['西域物流 KPI：货物持续移动，负责的人持续互相指路。']
export const CH05_DIALOGUE_COPY_KEYS = { entry: asContentKey('line:ch05:manifest'), route: asContentKey('line:ch05:route'), seal: asContentKey('line:ch05:seal'), bossReady: asContentKey('line:ch05:boss-ready') } as const
export const CORE_CH05_DIALOGUES = ch05DialogueDefinitions
