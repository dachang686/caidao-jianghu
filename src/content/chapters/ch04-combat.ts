import type { Ch04BossRewardDefinition } from '../../types/chapter-combat'

/** 青云掌门胜利交付的声明；结算顺序由 game/chapter-combat-ch04 原子执行。 */
export const CH04_BOSS_REWARD: Ch04BossRewardDefinition = {
  grantKey: 'reward:ch04:qingyun-master',
  experience: 86,
  silver: 110,
  itemId: 'qingyunMark',
}
