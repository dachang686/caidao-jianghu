import type { Ch03BossRewardDefinition } from '../../types/chapter-combat'

/** 黑风寨主胜利交付的声明；结算顺序由 game/chapter-combat-ch03 原子执行。 */
export const CH03_BOSS_REWARD: Ch03BossRewardDefinition = {
  grantKey: 'reward:ch03:blackwind-leader',
  experience: 72,
  silver: 90,
  itemId: 'blackwindSeal',
}
