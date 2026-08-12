import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const gateDiscipleId = asNpcId('qingyun-gate-disciple')
const herbalistId = asNpcId('qingyun-herbalist')
const bellKeeperId = asNpcId('qingyun-bell-keeper')

const hubId = asDialogueId('dialogue:ch04:hub')
const gateId = asDialogueId('dialogue:ch04:gate-disciple')
const gateClueId = asDialogueId('dialogue:ch04:gate-disciple:clue')
const gateDetourId = asDialogueId('dialogue:ch04:gate-disciple:detour')
const herbId = asDialogueId('dialogue:ch04:herbalist')
const herbRouteId = asDialogueId('dialogue:ch04:herbalist:route')
const herbDetourId = asDialogueId('dialogue:ch04:herbalist:detour')
const bellId = asDialogueId('dialogue:ch04:bell-keeper')
const bellRouteId = asDialogueId('dialogue:ch04:bell-keeper:route')
const bellDetourId = asDialogueId('dialogue:ch04:bell-keeper:detour')
const seriousReviewId = asDialogueId('dialogue:ch04:review:confirm')

const choice = (
  slug: string,
  label: string,
  nextNodeId?: DialogueNode['id'],
  options: Partial<DialogueNode['choices'][number]> = {},
) => ({
  id: asChoiceId(`choice:ch04:${slug}`),
  label,
  ...(nextNodeId ? { nextNodeId } : {}),
  ...options,
})

/** 青云山对白只写静态内容；任务推进与奖励仍由 Quest/Effect 领域层负责。 */
export const ch04DialogueDefinitions: readonly DialogueNode[] = [
  {
    id: hubId,
    speakerNpcId: gateDiscipleId,
    text: '青云山把山门、药圃和听云台都擦得一尘不染。林小门说，名门的第一门功课不是剑法，是让每一块石头都知道自己该站哪里。',
    choices: [
      choice('hub-gate', '问林小门山门怎么登记', gateId),
      choice('hub-herb', '去药圃看看青蘅草', herbId),
      choice('hub-bell', '到听云台确认钟声路线', bellId),
    ],
  },
  {
    id: gateId,
    speakerNpcId: gateDiscipleId,
    text: '林小门展开来访册：“姓名、来历、鞋底泥量，三项缺一不可。掌门说门面工程要从脚下开始。”',
    choices: [
      choice('gate-clue', '请他指出山门真正的规矩', gateClueId),
      choice('gate-detour', '先问菜刀能不能算拜帖', gateDetourId, { branch: 'confusing', returnToNodeId: gateId }),
    ],
  },
  {
    id: gateClueId,
    speakerNpcId: gateDiscipleId,
    text: '山门规训石刻最后一行被云气遮住：凡要进山者，先把自己的名号写清，再把自己的借口收好。林小门说，这条通常最难执行。',
    choices: [
      choice('gate-clue-back', '把山门标准记进百味刀谱', hubId, { effects: [{ type: 'set_flag', flag: 'ch04_gate_seen', value: true }] }),
      choice('gate-serious-review', '把规训石刻交给掌门核验', seriousReviewId, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch04_review_notice', value: true }] }),
    ],
  },
  {
    id: gateDetourId,
    speakerNpcId: gateDiscipleId,
    text: '林小门把菜刀放在来访册旁比较：“拜帖讲究纸面，菜刀讲究锋面。两者都能留下印象，但只有一个会让门卫后退半步。”',
    choices: [choice('gate-detour-back', '还是回到山门登记规矩', gateId, { branch: 'confusing', returnToNodeId: gateId })],
  },
  {
    id: herbId,
    speakerNpcId: herbalistId,
    text: '苏青禾背着药篮从云雾里出来：“青蘅草只在雨后显眼，名门弟子却总把它当成景观。你若要找药，先别被门面骗了。”',
    choices: [
      choice('herb-route', '请她说明药圃路线', herbRouteId),
      choice('herb-detour', '先问药草能不能修饰门面', herbDetourId, { branch: 'confusing', returnToNodeId: herbId }),
    ],
  },
  {
    id: herbRouteId,
    speakerNpcId: herbalistId,
    text: '苏青禾指向山腰：“先看石阶边的青蘅，再去听云台核对风向。药材有路线，百味刀谱也得有目录。”',
    choices: [choice('herb-route-back', '把药圃路线记进刀谱', hubId, { effects: [{ type: 'set_flag', flag: 'ch04_herb_route_seen', value: true }] })],
  },
  {
    id: herbDetourId,
    speakerNpcId: herbalistId,
    text: '苏青禾点头：“可以。青蘅草的颜色很适合衬托山门，但它本人更希望被采下来入药，不想只负责站在画面里。”',
    choices: [choice('herb-detour-back', '回到云台药圃路线', herbId, { branch: 'confusing', returnToNodeId: herbId })],
  },
  {
    id: bellId,
    speakerNpcId: bellKeeperId,
    text: '钟小响拎着铜钟跑来：“听云台有三种回声，第一声报到，第二声提醒，第三声会让掌门以为有人把门面擦过头了。”',
    choices: [
      choice('bell-route', '请他确认最后的传令顺序', bellRouteId),
      choice('bell-detour', '先问铜钟能不能报名门派', bellDetourId, { branch: 'confusing', returnToNodeId: bellId }),
    ],
  },
  {
    id: bellRouteId,
    speakerNpcId: bellKeeperId,
    text: '钟小响把鼓槌递来：“最后一声钟只负责通知，不负责替你赢。你把山门规矩和药圃路线都记好，掌门才会愿意听完。”',
    choices: [choice('bell-route-back', '把传令顺序记入山门册', hubId, { effects: [{ type: 'set_flag', flag: 'ch04_bell_route_seen', value: true }] })],
  },
  {
    id: bellDetourId,
    speakerNpcId: bellKeeperId,
    text: '钟小响摇头：“铜钟可以报名，但门派不会给它发腰牌。它每次响完都要回到原位，算是最稳定的弟子。”',
    choices: [choice('bell-detour-back', '回到听云台传令顺序', bellId, { branch: 'confusing', returnToNodeId: bellId })],
  },
  {
    id: seriousReviewId,
    speakerNpcId: gateDiscipleId,
    text: '规训石刻被拓印进山门册。林小门提醒：“交给掌门之后，门面上的每条规矩都会被正式看见。现在确认，你愿意让这份标准进入青云山记录吗？”',
    choices: [choice('review-confirm-back', '确认，规矩应该经得起核验', hubId)],
  },
]

export const CH04_DIALOGUE_GRAPH: DialogueGraph = {
  id: 'dialogue:ch04',
  startNodeId: hubId,
  nodes: ch04DialogueDefinitions,
  mainlineNodeIds: [hubId, gateId, gateClueId, herbId, herbRouteId, bellId, bellRouteId, seriousReviewId],
  maxConfusingHops: 2,
}

export const CH04_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = {
  mild: [
    '名门提醒：先登记，再登山；鞋底和名号都要有来处。',
    '钟小响说铜钟最稳定，因为它每次响完都会回到原位。',
  ],
  standard: [
    '林小门把鞋底泥量写进来访册，青云山的门面终于拥有了可量化的尺寸。',
    '苏青禾说药草不想当盆景，你的菜刀暂时被安排做采集记录员。',
  ],
  spicy: [
    '青云山今日门面榜：石阶擦拭次数第一，掌门尚未出场。',
    '听云台三声钟响完，唯一没有改变位置的是铜钟本人。',
    '林小门宣布拜帖和菜刀都能留下印象，但只有一个会让门卫后退半步。',
  ],
}

export const CH04_MODERN_MAPPING_LINES: readonly string[] = ['青云山今日门面榜：石阶擦拭次数第一，掌门尚未出场。']

export const CH04_DIALOGUE_COPY_KEYS = {
  entry: asContentKey('line:ch04:gate-register'),
  standards: asContentKey('line:ch04:mountain-standards'),
  herb: asContentKey('line:ch04:cloud-herb-route'),
  bossReady: asContentKey('line:ch04:boss-ready'),
} as const

export const CORE_CH04_DIALOGUES = ch04DialogueDefinitions
