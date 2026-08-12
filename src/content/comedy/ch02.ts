import { asContentKey } from '../../types/ids'
import type { InteractionChainDefinition, SituationComboDefinition } from '../../types/comedy'

/** 清河县的情境笑点需要真实的榜单线索、地点和采集状态同时出现。 */
export const ch02SituationComboDefinitions: readonly SituationComboDefinition[] = [
  {
    id: 'situation:ch02:ledger-lotus',
    layer: 'situation',
    scale: 'minor',
    triggerEvent: 'gathering.node_collected',
    conditions: [{ type: 'flag_equals', flag: 'ch02_board_seen', value: true }],
    requiredTags: ['location:qinghe-county', 'gathering:lotus', 'npc:qinghe-registrar'],
    cooldownGroup: 'situation:ch02:ledger-lotus',
    cooldownTicks: 1,
    firstCueId: 'cue:ch02:ledger-lotus:first',
    repeatCueId: 'cue:ch02:ledger-lotus:repeat',
    reducedMotionCueId: 'cue:ch02:ledger-lotus:static',
    maxBlockingMs: 320,
    firstDiscoveryGrantKey: 'grant:situation:ch02:ledger-lotus',
    effects: [
      { type: 'give_exp', amount: 1, grantKey: 'effect:situation:ch02:ledger-lotus:exp' },
      { type: 'narrate', lineId: asContentKey('line:ch02:ledger-lotus') },
    ],
  },
]

export const ch02InteractionChainDefinitions: readonly InteractionChainDefinition[] = [
  {
    id: 'interaction:ch02:registrar-ledger',
    triggerEvent: 'npc.interaction',
    progressActionId: 'interaction:ch02:registrar-ledger:tap',
    stages: [
      { threshold: 1, cueId: 'cue:ch02:registrar:notice', effects: [{ type: 'narrate', lineId: asContentKey('line:ch02:registrar-notice') }] },
      { threshold: 2, cueId: 'cue:ch02:registrar:ledger', effects: [{ type: 'give_exp', amount: 1, grantKey: 'grant:interaction:ch02:registrar:stage-2' }] },
      { threshold: 3, cueId: 'cue:ch02:registrar:back-page', effects: [{ type: 'set_flag', flag: 'ch02_ledger_gap_found', value: true }] },
      { threshold: 4, cueId: 'cue:ch02:registrar:stable', effects: [{ type: 'narrate', lineId: asContentKey('line:ch02:registrar-stable') }] },
    ],
    stableRepeatCueId: 'cue:ch02:registrar:stable-repeat',
  },
]

export const CORE_CH02_SITUATION_COMBOS = ch02SituationComboDefinitions
export const CORE_CH02_INTERACTION_CHAINS = ch02InteractionChainDefinitions

export const CH02_COMEDY_COPY = {
  ledgerLotus: '你采到莲子，沈青禾采到一条新口径：药篮也能给榜单提供证据。',
  registrarStable: '沈青禾第九次确认榜单缺口，空白竹册终于决定自己翻页。',
} as const
