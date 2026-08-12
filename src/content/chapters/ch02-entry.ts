import type { Condition } from '../../types/conditions'

/** 清河县只在小愚村主线完成后开放，避免地图出现未接入的半成品入口。 */
export const CH02_ENTRY_CONDITION: Condition = {
  type: 'flag_equals',
  flag: 'ch01_mainline_complete',
  value: true,
}

export const CH02_LOCKED_REASON = '先在小愚村完成白大侠的擂台名次，清河县的榜下路牌才会亮起来。'
