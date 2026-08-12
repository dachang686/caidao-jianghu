import { asContentKey, asItemId } from '../../types/ids'
import type { InteractionChainDefinition, SituationComboDefinition } from '../../types/comedy'

/** 小愚村的情境笑点只在满足真实场景标签时出现，不改变任务和战斗结算。 */
export const ch01SituationComboDefinitions: readonly SituationComboDefinition[] = [
  {
    id: 'situation:ch01:cat-herb',
    layer: 'situation',
    scale: 'minor',
    triggerEvent: 'gathering.node_collected',
    conditions: [{ type: 'flag_equals', flag: 'catResolved', value: true }],
    requiredTags: ['location:xiaoyu-village', 'gathering:herb', 'npc:dahuang-cat'],
    cooldownGroup: 'situation:ch01:cat-herb',
    cooldownTicks: 1,
    firstCueId: 'cue:ch01:cat-herb:first',
    repeatCueId: 'cue:ch01:cat-herb:repeat',
    reducedMotionCueId: 'cue:ch01:cat-herb:static',
    maxBlockingMs: 280,
    firstDiscoveryGrantKey: 'grant:situation:ch01:cat-herb',
    effects: [
      { type: 'give_exp', amount: 1, grantKey: 'effect:situation:ch01:cat-herb:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch01:cat-herb') },
    ],
  },
]

export const CORE_CH01_SITUATION_COMBOS = ch01SituationComboDefinitions

export const ch01InteractionChainDefinitions: readonly InteractionChainDefinition[] = [
  {
    id: 'interaction:ch01:old-man-wisdom',
    triggerEvent: 'npc.interaction',
    stages: [
      { threshold: 1, cueId: 'cue:ch01:old-man:listen', effects: [{ type: 'narrate', lineId: asContentKey('line:ch01:old-man-listen') }] },
      { threshold: 2, cueId: 'cue:ch01:old-man:clue', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch01:old-man:stage-2' }] },
      { threshold: 3, cueId: 'cue:ch01:old-man:ledger', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch01:old-man:stage-3' }] },
      { threshold: 4, cueId: 'cue:ch01:old-man:stable', effects: [{ type: 'narrate', lineId: asContentKey('line:ch01:old-man-stable') }] },
    ],
    stableRepeatCueId: 'cue:ch01:old-man:stable-repeat',
  },
  {
    id: 'interaction:ch01:well-reflection',
    triggerEvent: 'exploration.hotspot_activated',
    stages: [
      { threshold: 1, cueId: 'cue:ch01:well:reflection', effects: [{ type: 'narrate', lineId: asContentKey('line:ch01:well-reflection') }] },
      { threshold: 2, cueId: 'cue:ch01:well:ranking', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch01:well:stage-2' }] },
      { threshold: 3, cueId: 'cue:ch01:well:answer', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch01:well:stage-3' }] },
    ],
    stableRepeatCueId: 'cue:ch01:well:stable-repeat',
  },
]

export const CORE_CH01_INTERACTION_CHAINS = ch01InteractionChainDefinitions

/** 仅供演出层查找的本地笑点文案；事件处理器不读取它来决定任务结果。 */
export const CH01_COMEDY_COPY = {
  catHerb: '大黄猫验收止血草：药草合格，鱼干仍需另行报销。',
  oldManStable: '老头把同一条线索讲到第四遍，终于承认这叫“稳定输出”。',
  wellReflection: '井里的倒影没有上榜，但它至少没有把菜刀拿反。',
} as const

export const CH01_COMEDY_ITEM = asItemId('item:herb')

