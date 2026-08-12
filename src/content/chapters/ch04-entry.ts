import type { Condition } from '../../types/conditions'

/** 青云山只在黑风寨主线完成后开放，先完成冲榜再登名门。 */
export const CH04_ENTRY_CONDITION: Condition = {
  type: 'flag_equals',
  flag: 'ch03_mainline_complete',
  value: true,
}

export const CH04_LOCKED_REASON = '先在黑风寨把冲榜账目对齐，青云山门才会承认这把菜刀的来历。'
