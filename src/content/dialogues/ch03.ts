import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const ledgerKeeperId = asNpcId('blackwind-ledger-keeper')
const runnerId = asNpcId('blackwind-runner')
const cookId = asNpcId('blackwind-cook')

const hubId = asDialogueId('dialogue:ch03:hub')
const ledgerId = asDialogueId('dialogue:ch03:ledger-keeper')
const ledgerClueId = asDialogueId('dialogue:ch03:ledger-keeper:clue')
const ledgerDetourId = asDialogueId('dialogue:ch03:ledger-keeper:detour')
const cookNodeId = asDialogueId('dialogue:ch03:cook')
const cookRouteId = asDialogueId('dialogue:ch03:cook:route')
const cookDetourId = asDialogueId('dialogue:ch03:cook:detour')
const runnerNodeId = asDialogueId('dialogue:ch03:runner')
const runnerSignalId = asDialogueId('dialogue:ch03:runner:signal')
const runnerDetourId = asDialogueId('dialogue:ch03:runner:detour')
const seriousReviewId = asDialogueId('dialogue:ch03:review:confirm')

const choice = (
  slug: string,
  label: string,
  nextNodeId?: DialogueNode['id'],
  options: Partial<DialogueNode['choices'][number]> = {},
) => ({
  id: asChoiceId(`choice:ch03:${slug}`),
  label,
  ...(nextNodeId ? { nextNodeId } : {}),
  ...options,
})

/** 黑风寨对白只写本地静态内容；任务推进和奖励仍由 Quest/Effect 领域层负责。 */
export const ch03DialogueDefinitions: readonly DialogueNode[] = [
  {
    id: hubId,
    speakerNpcId: ledgerKeeperId,
    text: '黑风寨把山路、灶房和瞭望台都排进同一张账榜。曹掌柜说，山寨要冲榜，第一步是先让每个人知道自己排在第几锅。',
    choices: [
      choice('hub-ledger', '问曹掌柜账榜怎么记名', ledgerId),
      choice('hub-cook', '去灶房听听百味刀谱', cookNodeId),
      choice('hub-runner', '到瞭望台确认传令路线', runnerNodeId),
    ],
  },
  {
    id: ledgerId,
    speakerNpcId: ledgerKeeperId,
    text: '曹掌柜把三枚印章摆成一排：“粮草、巡哨、面子，各有各的章。你若只盖面子章，账面会很热闹，锅里还是空的。”',
    choices: [
      choice('ledger-clue', '请他指出账榜的真正缺口', ledgerClueId),
      choice('ledger-detour', '先问面子章能不能盖在菜刀上', ledgerDetourId, { branch: 'confusing', returnToNodeId: ledgerId }),
    ],
  },
  {
    id: ledgerClueId,
    speakerNpcId: ledgerKeeperId,
    text: '账榜背面藏着一行小字：上月最忙的不是巡哨，是改榜。曹掌柜叹气说，山寨的笔比刀快，快到每个人都想给自己加一行。',
    choices: [
      choice('ledger-clue-back', '把账榜缺口记进百味刀谱', hubId, { effects: [{ type: 'set_flag', flag: 'ch03_ledger_seen', value: true }] }),
      choice('ledger-serious-review', '将空白账页交给寨主核验', seriousReviewId, { irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'ch03_review_notice', value: true }] }),
    ],
  },
  {
    id: ledgerDetourId,
    speakerNpcId: ledgerKeeperId,
    text: '曹掌柜认真比了比印章和菜刀：“刀可以切菜，也可以切账。只是切完之后，账和菜都需要重新解释。”',
    choices: [choice('ledger-detour-back', '还是回到账榜缺口', ledgerId, { branch: 'confusing', returnToNodeId: ledgerId })],
  },
  {
    id: cookNodeId,
    speakerNpcId: cookId,
    text: '胡大勺端来一锅没有名字的汤：“百味刀谱先不急着写招式。山椒、锅盖和火候都同意之后，招式才不会只剩一张菜单。”',
    choices: [
      choice('cook-route', '请他说明灶房的配方路线', cookRouteId),
      choice('cook-detour', '先问锅盖能不能算防具', cookDetourId, { branch: 'confusing', returnToNodeId: cookNodeId }),
    ],
  },
  {
    id: cookRouteId,
    speakerNpcId: cookId,
    text: '胡大勺指向灶房后侧：“先采山椒，再看火候；先把材料记清，再谈一刀能不能把饭和名次一起端上桌。”',
    choices: [choice('cook-route-back', '把灶房路线记进刀谱', hubId, { effects: [{ type: 'set_flag', flag: 'ch03_kitchen_route_seen', value: true }] })],
  },
  {
    id: cookDetourId,
    speakerNpcId: cookId,
    text: '胡大勺端起锅盖：“它能挡住汤沸，也能挡住你问第三遍的勇气。至于防具评级，得先问铁匠。”',
    choices: [choice('cook-detour-back', '回到百味刀谱路线', cookNodeId, { branch: 'confusing', returnToNodeId: cookNodeId })],
  },
  {
    id: runnerNodeId,
    speakerNpcId: runnerId,
    text: '小顺从瞭望台跑下来：“传令路线有三条，第一条最快，第二条最稳，第三条会经过灶房，容易被胡大勺拦下来先吃一口。”',
    choices: [
      choice('runner-signal', '请他确认最后的传令顺序', runnerSignalId),
      choice('runner-detour', '先问第三条路能不能多经过两次灶房', runnerDetourId, { branch: 'confusing', returnToNodeId: runnerNodeId }),
    ],
  },
  {
    id: runnerSignalId,
    speakerNpcId: runnerId,
    text: '小顺把鼓槌递来：“最后一声鼓只负责通知，不负责替你打赢。你把账榜、刀谱和山椒都带齐，寨主才会觉得这次不是临时起意。”',
    choices: [choice('runner-signal-back', '把传令顺序记入账榜', hubId, { effects: [{ type: 'set_flag', flag: 'ch03_signal_route_seen', value: true }] })],
  },
  {
    id: runnerDetourId,
    speakerNpcId: runnerId,
    text: '小顺摇头：“第三条路可以多走，但灶房只认一日三餐。多走一次不算加餐，最多算你对山路有长期规划。”',
    choices: [choice('runner-detour-back', '回到传令顺序', runnerNodeId, { branch: 'confusing', returnToNodeId: runnerNodeId })],
  },
  {
    id: seriousReviewId,
    speakerNpcId: ledgerKeeperId,
    text: '空白账页被封进木匣。曹掌柜提醒：“递给寨主以后，账上的每一笔都会被看见。现在确认，你愿意让这张空白也进入山寨的正式记录吗？”',
    choices: [choice('review-confirm-back', '确认，记录必须经得起核验', hubId)],
  },
]

export const CH03_DIALOGUE_GRAPH: DialogueGraph = {
  id: 'dialogue:ch03',
  startNodeId: hubId,
  nodes: ch03DialogueDefinitions,
  mainlineNodeIds: [hubId, ledgerId, ledgerClueId, cookNodeId, cookRouteId, runnerNodeId, runnerSignalId, seriousReviewId],
  maxConfusingHops: 2,
}

export const CH03_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = {
  mild: [
    '山寨提醒：先记账，再出刀；锅里和榜上都要有据可查。',
    '小顺说传令有三条路，你发现最稳定的是回到原地问第三遍。',
  ],
  standard: [
    '曹掌柜把三枚印章排成一排，山寨的面子终于拥有了可核对的尺寸。',
    '胡大勺说百味刀谱先看火候，你的菜刀暂时被安排做旁听。',
  ],
  spicy: [
    '黑风寨本月热榜：改榜次数第一，粮草库存暂不参与竞争。',
    '小顺跑完三条传令路线，最终发现最快的路线是少听一句解释。',
    '锅盖申请加入防具谱，铁匠回复：请先证明它不是晚饭。',
  ],
}

export const CH03_MODERN_MAPPING_LINES: readonly string[] = ['黑风寨本月热榜：改榜次数第一，粮草库存暂不参与竞争。']

export const CH03_DIALOGUE_COPY_KEYS = {
  entry: asContentKey('line:ch03:entry-register'),
  ledger: asContentKey('line:ch03:three-stamps'),
  meal: asContentKey('line:ch03:meal-route'),
  bossReady: asContentKey('line:ch03:boss-ready'),
} as const

export const CORE_CH03_DIALOGUES = ch03DialogueDefinitions
