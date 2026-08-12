import type { EndingDefinition } from '../../types/ending'
import type { Condition } from '../../types/conditions'
import { asEndingId } from '../../types/ids'

const completedChapterEight: Condition = { type: 'flag_equals', flag: 'ch08MainlineComplete', value: true }
const complete = (conditions: readonly Condition[]): Condition => ({ type: 'all', conditions: [completedChapterEight, ...conditions] })

export const CORE_ENDING_CHOICES = [
  { id: 'ending-choice:publish', label: '把刀谱公开', summary: '把功劳写回江湖，不把真相锁在一人手里。', seriousConfirmation: true },
  { id: 'ending-choice:lead', label: '留在榜上领航', summary: '接受榜司邀请，负责让规则先于热闹。', seriousConfirmation: true },
  { id: 'ending-choice:found', label: '开宗立派', summary: '把门规写短一点，再正式收下第一批门人。', seriousConfirmation: true },
  { id: 'ending-choice:retire', label: '回乡开店', summary: '把战绩换成菜单，今后只和锅铲切磋。', seriousConfirmation: true },
] as const

export const CORE_ENDINGS: readonly EndingDefinition[] = [
  {
    id: asEndingId('ending:cleaver-master'),
    title: '菜刀宗师',
    subtitle: '刀谱公开，手艺归于众人。',
    priority: 10,
    conditions: complete([{ type: 'stat_gte', stat: 'moral', value: 8 }, { type: 'stat_gte', stat: 'fame', value: 18 }, { type: 'flag_equals', flag: 'publicTruthChosen', value: true }]),
    finalChoiceIds: ['ending-choice:publish'],
    choices: [CORE_ENDING_CHOICES[0]],
    settlementSummary: '你没有把最后一页藏起来，而是让每个灶台都能学会判断。',
    postgameLabel: '公开刀谱后继续经营门派与委托。',
    grantKey: 'ending:reward:cleaver-master',
    presentationCueId: 'presentation:ending:cleaver-master',
  },
  {
    id: asEndingId('ending:hot-list-leader'),
    title: '热榜盟主',
    subtitle: '榜单终于学会承认自己的来源。',
    priority: 20,
    conditions: complete([{ type: 'stat_gte', stat: 'fame', value: 30 }, { type: 'stat_gte', stat: 'wealth', value: 100 }, { type: 'flag_equals', flag: 'rankingReformed', value: true }]),
    finalChoiceIds: ['ending-choice:lead'],
    choices: [CORE_ENDING_CHOICES[1]],
    settlementSummary: '你接过榜册，却先把“热度”一栏改成了“可复核”。',
    postgameLabel: '榜单改革后继续挑战高阶委托。',
    grantKey: 'ending:reward:hot-list-leader',
    presentationCueId: 'presentation:ending:hot-list-leader',
  },
  {
    id: asEndingId('ending:sect-founder'),
    title: '开宗立派',
    subtitle: '门派第一条规矩：别把规矩写成三卷。',
    priority: 30,
    conditions: complete([{ type: 'flag_equals', flag: 'sectCreated', value: true }, { type: 'stat_gte', stat: 'sectProsperity', value: 8 }, { type: 'stat_gte', stat: 'fame', value: 12 }]),
    finalChoiceIds: ['ending-choice:found'],
    choices: [CORE_ENDING_CHOICES[2]],
    settlementSummary: '你把一路收集的笑话、手艺和可靠的人，拼成了一块真正能遮雨的门牌。',
    postgameLabel: '开宗后继续门人事件、设施与派遣。',
    grantKey: 'ending:reward:sect-founder',
    presentationCueId: 'presentation:ending:sect-founder',
  },
  {
    id: asEndingId('ending:retired-proprietor'),
    title: '归隐掌柜',
    subtitle: '江湖没有消失，只是改成了午间菜单。',
    priority: 40,
    conditions: complete([{ type: 'stat_gte', stat: 'wealth', value: 120 }, { type: 'flag_equals', flag: 'quietRouteChosen', value: true }]),
    finalChoiceIds: ['ending-choice:retire'],
    choices: [CORE_ENDING_CHOICES[3]],
    settlementSummary: '你把菜刀挂在墙上，发现它依然比招牌更有说服力。',
    postgameLabel: '归隐后保留原档，可继续经营与回看结局。',
    grantKey: 'ending:reward:retired-proprietor',
    presentationCueId: 'presentation:ending:retired-proprietor',
  },
]

export const CORE_ENDING_IDS = CORE_ENDINGS.map((ending) => ending.id)
export const coreEndingDefinitions = CORE_ENDINGS
