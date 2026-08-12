import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const registrarId = asNpcId('qinghe-registrar')
const boatwomanId = asNpcId('qinghe-boatwoman')
const teaKeeperId = asNpcId('qinghe-tea-keeper')
const bangsiId = asNpcId('qinghe-bangsi')

const hubId = asDialogueId('dialogue:ch02:hub')
const registrarNodeId = asDialogueId('dialogue:ch02:registrar')
const registrarClueId = asDialogueId('dialogue:ch02:registrar:clue')
const registrarDetourId = asDialogueId('dialogue:ch02:registrar:detour')
const teaNodeId = asDialogueId('dialogue:ch02:tea-keeper')
const teaRumorId = asDialogueId('dialogue:ch02:tea-keeper:rumor')
const teaDetourId = asDialogueId('dialogue:ch02:tea-keeper:detour')
const boatNodeId = asDialogueId('dialogue:ch02:boatwoman')
const boatRouteId = asDialogueId('dialogue:ch02:boatwoman:route')
const boatDetourId = asDialogueId('dialogue:ch02:boatwoman:detour')
const bangsiNodeId = asDialogueId('dialogue:ch02:bangsi')
const bangsiWarningId = asDialogueId('dialogue:ch02:bangsi:warning')

const choice = (
  slug: string,
  label: string,
  nextNodeId?: DialogueNode['id'],
  options: Partial<DialogueNode['choices'][number]> = {},
) => ({
  id: asChoiceId(`choice:ch02:${slug}`),
  label,
  ...(nextNodeId ? { nextNodeId } : {}),
  ...options,
})

/** 清河县对白全部是本地静态内容；任务条件和奖励仍由 Quest/Effect 领域层处理。 */
export const ch02DialogueDefinitions: readonly DialogueNode[] = [
  {
    id: hubId,
    speakerNpcId: registrarId,
    text: '清河县的街市把江湖摊成两排：一排卖茶，一排卖名次。沈青禾说，先看清榜单，再决定要不要把菜刀放在桌上。',
    choices: [
      choice('hub-registrar', '问沈青禾百晓榜怎么记名', registrarNodeId),
      choice('hub-tea', '去茶摊听一耳朵风声', teaNodeId),
      choice('hub-boat', '到河边问问石桥下的路', boatNodeId),
      choice('hub-bangsi', '看看榜下捕快在查什么', bangsiNodeId),
    ],
  },
  {
    id: registrarNodeId,
    speakerNpcId: registrarId,
    text: '沈青禾把空白竹册敲了敲：“百晓榜记的是大家都看得见的事。至于看不见的那半页，通常在河风里。”',
    choices: [
      choice('registrar-clue', '请她指出榜单缺口', registrarClueId),
      choice('registrar-detour', '先问上榜要不要交茶钱', registrarDetourId, {
        branch: 'confusing',
        returnToNodeId: registrarNodeId,
      }),
    ],
  },
  {
    id: registrarClueId,
    speakerNpcId: registrarId,
    text: '沈青禾指向榜纸背面：“缺口不是漏写，是有人把名次拿去换东西。你若要查，就先记下这条，不要急着拔刀。”',
    choices: [
      choice('registrar-clue-back', '把线索记在刀谱边角', hubId, {
        effects: [{ type: 'set_flag', flag: 'ch02_board_seen', value: true }],
      }),
      choice('registrar-notice-bangsi', '确认把线索交到榜下捕快手里', bangsiWarningId, {
        irreversible: true,
        requiresConfirmation: true,
        effects: [{ type: 'set_flag', flag: 'ch02_bangsi_notice', value: true }],
      }),
    ],
  },
  {
    id: registrarDetourId,
    speakerNpcId: registrarId,
    text: '沈青禾认真算了一遍：“茶钱不收，问榜单的时间要收。收费标准是再问一遍时，心里先准备好答案。”',
    choices: [choice('registrar-detour-back', '回到榜单缺口', registrarNodeId, { branch: 'confusing', returnToNodeId: registrarNodeId })],
  },
  {
    id: teaNodeId,
    speakerNpcId: teaKeeperId,
    text: '陆掌柜把茶壶往旁边挪：“清河县最近的茶客都在讨论同一件事——榜上的人越来越像榜下的人。”',
    choices: [
      choice('tea-rumor', '请他把话说明白', teaRumorId),
      choice('tea-detour', '先比较三种茶的江湖地位', teaDetourId, {
        branch: 'confusing',
        returnToNodeId: teaNodeId,
      }),
    ],
  },
  {
    id: teaRumorId,
    speakerNpcId: teaKeeperId,
    text: '陆掌柜压低声音：“榜下捕快每次来都只看一张空白纸，可他离开后，榜单总会多一条对某人的评价。茶叶不会写字，我保证。”',
    choices: [choice('tea-rumor-back', '记下这条茶摊口供', hubId, { effects: [{ type: 'set_flag', flag: 'ch02_rumor_heard', value: true }] })],
  },
  {
    id: teaDetourId,
    speakerNpcId: teaKeeperId,
    text: '三种茶分别自称清醒、沉着和回甘，最后都在你问价时表现出同一种江湖绝学：装作没听见。',
    choices: [choice('tea-detour-back', '还是回到榜下捕快的话题', teaNodeId, { branch: 'confusing', returnToNodeId: teaNodeId })],
  },
  {
    id: boatNodeId,
    speakerNpcId: boatwomanId,
    text: '柳婶在石桥边理药篮：“河水只往前走，人可以绕回去。你要查榜单，先记住哪条路能把话带回来。”',
    choices: [
      choice('boat-route', '请她说说河岸的来回路', boatRouteId),
      choice('boat-detour', '先问小舟能不能载菜刀', boatDetourId, {
        branch: 'confusing',
        returnToNodeId: boatNodeId,
      }),
    ],
  },
  {
    id: boatRouteId,
    speakerNpcId: boatwomanId,
    text: '柳婶点了点桥下的石阶：“从街市到码头只隔一座桥，回来也只隔一座桥。江湖难的是把证据带回来，不是认路。”',
    choices: [choice('boat-route-back', '把河岸路线记进刀谱', hubId, { effects: [{ type: 'set_flag', flag: 'ch02_river_route_open', value: true }] })],
  },
  {
    id: boatDetourId,
    speakerNpcId: boatwomanId,
    text: '柳婶看了看你的菜刀：“能载，但它不会划船。你若让它负责水路，最后还是得你自己站起来。”',
    choices: [choice('boat-detour-back', '回到证据路线', boatNodeId, { branch: 'confusing', returnToNodeId: boatNodeId })],
  },
  {
    id: bangsiNodeId,
    speakerNpcId: bangsiId,
    text: '榜下捕快抱着空白卷宗站在告示台旁：“别误会，我不是来抓人的。我只是来确认大家有没有按照榜单上的姿势站好。”',
    choices: [
      choice('bangsi-warning', '认真听他说完榜下规矩', bangsiWarningId),
      choice('bangsi-question', '问他空白卷宗为何天天更新', bangsiWarningId),
    ],
  },
  {
    id: bangsiWarningId,
    speakerNpcId: bangsiId,
    text: '捕快合上卷宗：“证据可以交，名次不能借。你若要把刀谱线索递上去，先确认自己愿意让榜单看见它。”',
    choices: [choice('bangsi-warning-back', '暂时收好线索，回街市再想', hubId)],
  },
]

export const CH02_DIALOGUE_GRAPH: DialogueGraph = {
  id: 'dialogue:ch02',
  startNodeId: hubId,
  nodes: ch02DialogueDefinitions,
  mainlineNodeIds: [hubId, registrarNodeId, registrarClueId, teaNodeId, teaRumorId, boatNodeId, boatRouteId, bangsiNodeId, bangsiWarningId],
  maxConfusingHops: 2,
}

/** 三档密度只调整展示文案，不改变任务条件、奖励或对白图可达性。 */
export const CH02_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = {
  mild: [
    '江湖提醒：先把榜单缺口记清，再决定菜刀要不要出鞘。',
    '柳婶说河水只往前走，你发现自己的脚步已经走回茶摊两次。',
  ],
  standard: [
    '榜下捕快每天检查空白卷宗，清河县的纸张因此获得了稳定的存在感。',
    '陆掌柜把口供泡进茶里，茶味没有变，故事倒是更浓了。',
  ],
  spicy: [
    '沈青禾说名次要靠证据，你的菜刀当场申请成为证人。',
    '石桥两头都能回街市，只有你的思路还在绕行。',
    '百晓榜今日热榜：空白卷宗连续蝉联第一，暂无竞争者。',
  ],
}

export const CH02_MODERN_MAPPING_LINES: readonly string[] = ['百晓榜今日热榜：空白卷宗连续蝉联第一，暂无竞争者。']

export const CH02_DIALOGUE_COPY_KEYS = {
  board: asContentKey('line:ch02:board-clue'),
  rumor: asContentKey('line:ch02:tea-rumor'),
  route: asContentKey('line:ch02:river-route'),
  bossReady: asContentKey('line:ch02:boss-ready'),
} as const

export const CORE_CH02_DIALOGUES = ch02DialogueDefinitions
