import type { Condition } from '../../types/conditions'

/** 黑风寨只在清河县主线完成后开放，避免提前暴露未接入的山寨流程。 */
export const CH03_ENTRY_CONDITION: Condition = {
  type: 'flag_equals',
  flag: 'ch02_mainline_complete',
  value: true,
}

export const CH03_LOCKED_REASON = '先在清河县把百晓榜缺页核验完，黑风寨的山路才会放行。'
