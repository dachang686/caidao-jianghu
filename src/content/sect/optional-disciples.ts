import { asDiscipleId } from '../../types/ids'
import type { DiscipleDefinition, DiscipleDispatchEventDefinition } from '../../types/disciple'

const recruits = [
  ['disciple:archive-cat', '卷宗猫', 'archive', 'intel', ['listener', 'shy'], '听完三句闲话就能把原卷位置画成猫爪图。'],
  ['disciple:pepper-scout', '椒香探子', 'pepper', 'kitchen', ['cook', 'showoff'], '每次回来都带一份香气过于具体的路线报告。'],
  ['disciple:silent-smith', '无声铁匠', 'silent', 'forge', ['craftsman', 'steady'], '不评价锤声，只把成品和材料账一起交回来。'],
  ['disciple:coastal-mediator', '潮边调停人', 'coastal', 'management', ['steady', 'manager'], '擅长把两个帮派的口号拆成三栏可执行清单。'],
  ['disciple:ranking-poet', '榜外诗人', 'poet', 'intel', ['showoff', 'listener'], '押韵不一定准确，但每句都标注了证据来源。'],
  ['disciple:four-style-cook', '四系厨师', 'four-style', 'kitchen', ['cook', 'manager'], '能让四种构筑在一口锅里互相尊重。'],
] as const

export const OPTIONAL_DISCIPLE_DEFINITIONS: readonly DiscipleDefinition[] = recruits.map(([id, name, key, specialty, traitIds, description], index) => ({
  id: asDiscipleId(id),
  name,
  description,
  recruitment: { requiredChapter: 5 + Math.floor(index / 2), conditions: [{ type: 'flag_equals', flag: `optional_disciple_${key}_found`, value: true }] },
  traitIds,
  specialty,
  dispatchEventIds: [`dispatch-event:${id}:report`],
}))

const effects = [
  { type: 'change_stat', stat: 'fame', delta: 2 },
  { type: 'change_stat', stat: 'wealth', delta: 2 },
  { type: 'change_stat', stat: 'sectProsperity', delta: 2 },
  { type: 'change_stat', stat: 'sectProsperity', delta: 1 },
  { type: 'change_stat', stat: 'fame', delta: 2 },
  { type: 'change_stat', stat: 'wealth', delta: 2 },
] as const

export const OPTIONAL_DISCIPLE_DISPATCH_EVENTS: readonly DiscipleDispatchEventDefinition[] = recruits.map(([id, name, key, specialty, traitIds], index) => ({
  id: `dispatch-event:${id}:report`,
  discipleId: asDiscipleId(id),
  title: `${name}的专项汇报`,
  description: `${name}完成${key}线索任务，结果、消耗和下一步都写进门派账。`,
  triggerEvent: 'sect.dispatch_completed',
  specialty,
  requiredTraitIds: [traitIds[0]!],
  feedback: `专项路线「${key}」已归档，收益按公开规则结算。`,
  effect: effects[index],
}))

export const OPTIONAL_DISCIPLE_DIALOGUES: Readonly<Record<string, readonly string[]>> = Object.fromEntries(recruits.map(([id, name, key]) => [id, [`${name}：我不是隐藏入口，只是把线索放得比较讲究。`, `掌柜：${key}线索已登记，派遣前后都能查到。`]]))

