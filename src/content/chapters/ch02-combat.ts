import type { Ch02BossRewardDefinition } from '../../types/chapter-combat'

/** 清河县奖励只描述交付内容；实际胜利结算由 game/chapter-combat-ch02 原子处理。 */
export const CH02_BOSS_REWARD: Ch02BossRewardDefinition = {
  grantKey: 'reward:ch02:bangsi',
  experience: 58,
  silver: 72,
  itemId: 'qingheBadge',
}
