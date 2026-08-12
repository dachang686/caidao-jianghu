export interface CoreBuildProfile {
  readonly id: 'balanced' | 'aggressive' | 'guardian' | 'flow'
  readonly label: string
  readonly description: string
}

export interface ChapterProgressionBudget {
  readonly chapter: number
  readonly recommendedLevel: number
  readonly goldenPathBattles: number
  readonly expectedRoundTarget: number
  readonly materialStacks: number
  readonly equipmentChoices: number
  readonly rewardSilver: number
  readonly rewardExperience: number
}

export const CORE_BUILD_PROFILES: readonly CoreBuildProfile[] = [
  { id: 'balanced', label: '均衡', description: '攻击、防御和内力均衡，作为默认参考。' },
  { id: 'aggressive', label: '破势输出', description: '更高攻击与暴击，承受能力略低。' },
  { id: 'guardian', label: '耐打续航', description: '更高生命、防御和治疗容错。' },
  { id: 'flow', label: '轻灵内功', description: '更高内力、闪避和命中，保持回合流动。' },
]

export const CORE_CHAPTER_PROGRESSION_BUDGETS: readonly ChapterProgressionBudget[] = [
  { chapter: 1, recommendedLevel: 1, goldenPathBattles: 2, expectedRoundTarget: 10, materialStacks: 3, equipmentChoices: 2, rewardSilver: 50, rewardExperience: 42 },
  { chapter: 2, recommendedLevel: 2, goldenPathBattles: 4, expectedRoundTarget: 11, materialStacks: 4, equipmentChoices: 4, rewardSilver: 72, rewardExperience: 58 },
  { chapter: 3, recommendedLevel: 3, goldenPathBattles: 5, expectedRoundTarget: 12, materialStacks: 5, equipmentChoices: 4, rewardSilver: 90, rewardExperience: 72 },
  { chapter: 4, recommendedLevel: 4, goldenPathBattles: 6, expectedRoundTarget: 13, materialStacks: 6, equipmentChoices: 4, rewardSilver: 110, rewardExperience: 86 },
  { chapter: 5, recommendedLevel: 5, goldenPathBattles: 7, expectedRoundTarget: 14, materialStacks: 7, equipmentChoices: 4, rewardSilver: 130, rewardExperience: 96 },
  { chapter: 6, recommendedLevel: 6, goldenPathBattles: 8, expectedRoundTarget: 14, materialStacks: 8, equipmentChoices: 4, rewardSilver: 150, rewardExperience: 108 },
  { chapter: 7, recommendedLevel: 7, goldenPathBattles: 9, expectedRoundTarget: 15, materialStacks: 9, equipmentChoices: 4, rewardSilver: 180, rewardExperience: 120 },
  { chapter: 8, recommendedLevel: 8, goldenPathBattles: 10, expectedRoundTarget: 16, materialStacks: 10, equipmentChoices: 4, rewardSilver: 220, rewardExperience: 150 },
]

export function getChapterProgressionBudget(chapter: number): ChapterProgressionBudget {
  const budget = CORE_CHAPTER_PROGRESSION_BUDGETS.find((candidate) => candidate.chapter === chapter)
  if (!budget) throw new Error(`未配置第${chapter}章成长预算。`)
  return budget
}
