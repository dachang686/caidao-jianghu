import { asContentKey } from '../../types/ids'
import type { InteractionChainDefinition, SituationComboDefinition } from '../../types/comedy'

/** 青云山的笑点绑定真实采集、地点和 NPC 状态，不改变任务结果。 */
export const ch04SituationComboDefinitions: readonly SituationComboDefinition[] = [
  {
    id: 'situation:ch04:gate-herb',
    layer: 'situation',
    scale: 'minor',
    triggerEvent: 'gathering.node_collected',
    conditions: [{ type: 'flag_equals', flag: 'ch04_gate_seen', value: true }],
    requiredTags: ['location:qingyun-mountain', 'gathering:cloud-herb', 'npc:qingyun-herbalist'],
    cooldownGroup: 'situation:ch04:gate-herb',
    cooldownTicks: 1,
    firstCueId: 'cue:ch04:gate-herb:first',
    repeatCueId: 'cue:ch04:gate-herb:repeat',
    reducedMotionCueId: 'cue:ch04:gate-herb:static',
    maxBlockingMs: 320,
    firstDiscoveryGrantKey: 'grant:situation:ch04:gate-herb',
    effects: [
      { type: 'give_exp', amount: 1, grantKey: 'effect:situation:ch04:gate-herb:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch04:gate-herb') },
    ],
  },
]

export const ch04InteractionChainDefinitions: readonly InteractionChainDefinition[] = [
  {
    id: 'interaction:ch04:bell-polish',
    triggerEvent: 'npc.interaction',
    progressActionId: 'interaction:ch04:bell-polish:tap',
    stages: [
      { threshold: 1, cueId: 'cue:ch04:bell:notice', effects: [{ type: 'narrate', lineId: asContentKey('line:ch04:bell-notice') }] },
      { threshold: 2, cueId: 'cue:ch04:bell:register', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch04:bell:stage-2' }] },
      { threshold: 3, cueId: 'cue:ch04:bell:echo', effects: [{ type: 'set_flag', flag: 'ch04_bell_repeatable', value: true }] },
      { threshold: 4, cueId: 'cue:ch04:bell:stable', effects: [{ type: 'narrate', lineId: asContentKey('line:ch04:bell-stable') }] },
    ],
    stableRepeatCueId: 'cue:ch04:bell:stable-repeat',
  },
]

export const CORE_CH04_SITUATION_COMBOS = ch04SituationComboDefinitions
export const CORE_CH04_INTERACTION_CHAINS = ch04InteractionChainDefinitions

export const CH04_COMEDY_COPY = {
  gateHerb: '你采到青蘅草，林小门采到一条新规矩：药圃也算门面的一部分。',
  bellStable: '钟小响第四次确认回声落点，铜钟决定把这叫稳定输出。',
} as const
