import { asContentKey } from '../../types/ids'
import type { InteractionChainDefinition, SituationComboDefinition } from '../../types/comedy'

/** 黑风寨的情境笑点必须同时满足真实采集、地点和 NPC 状态，不改变任务结果。 */
export const ch03SituationComboDefinitions: readonly SituationComboDefinition[] = [
  {
    id: 'situation:ch03:ledger-pepper',
    layer: 'situation',
    scale: 'minor',
    triggerEvent: 'gathering.node_collected',
    conditions: [{ type: 'flag_equals', flag: 'ch03_ledger_seen', value: true }],
    requiredTags: ['location:blackwind-fortress', 'gathering:pepper', 'npc:blackwind-cook'],
    cooldownGroup: 'situation:ch03:ledger-pepper',
    cooldownTicks: 1,
    firstCueId: 'cue:ch03:ledger-pepper:first',
    repeatCueId: 'cue:ch03:ledger-pepper:repeat',
    reducedMotionCueId: 'cue:ch03:ledger-pepper:static',
    maxBlockingMs: 320,
    firstDiscoveryGrantKey: 'grant:situation:ch03:ledger-pepper',
    effects: [
      { type: 'give_exp', amount: 1, grantKey: 'effect:situation:ch03:ledger-pepper:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch03:ledger-pepper') },
    ],
  },
]

export const ch03InteractionChainDefinitions: readonly InteractionChainDefinition[] = [
  {
    id: 'interaction:ch03:cook-stir',
    triggerEvent: 'npc.interaction',
    progressActionId: 'interaction:ch03:cook-stir:tap',
    stages: [
      { threshold: 1, cueId: 'cue:ch03:cook:notice', effects: [{ type: 'narrate', lineId: asContentKey('line:ch03:cook-notice') }] },
      { threshold: 2, cueId: 'cue:ch03:cook:ledger', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch03:cook:stage-2' }] },
      { threshold: 3, cueId: 'cue:ch03:cook:pepper', effects: [{ type: 'set_flag', flag: 'ch03_cook_repeatable', value: true }] },
      { threshold: 4, cueId: 'cue:ch03:cook:stable', effects: [{ type: 'narrate', lineId: asContentKey('line:ch03:cook-stable') }] },
    ],
    stableRepeatCueId: 'cue:ch03:cook:stable-repeat',
  },
]

export const CORE_CH03_SITUATION_COMBOS = ch03SituationComboDefinitions
export const CORE_CH03_INTERACTION_CHAINS = ch03InteractionChainDefinitions

export const CH03_COMEDY_COPY = {
  ledgerPepper: '你采到山椒，曹掌柜采到一条新口径：灶房也能给账榜提供证据。',
  cookStable: '胡大勺第四次确认火候，锅盖决定把这叫稳定输出。',
} as const
