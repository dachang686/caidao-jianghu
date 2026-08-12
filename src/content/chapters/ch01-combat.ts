import type { Ch01BossRewardDefinition } from '../../types/chapter-combat'

/** 章节奖励只是结算数据；实际一次性交付由游戏状态事务完成。 */
export const CH01_BOSS_REWARD: Ch01BossRewardDefinition = {
  grantKey: 'reward:ch01:bai-daxia',
  experience: 42,
  silver: 50,
  itemId: 'rustyCleaver',
  titleId: 'cleaverNovice',
}
