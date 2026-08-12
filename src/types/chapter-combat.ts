import type { ChapterId } from './ids'
import type { CombatEnemyDefinition } from './enemy'

export type ChapterEnemyRole = 'normal' | 'boss'

/** 章节只补充内容元数据，具体回合结算仍由 systems/combat 负责。 */
export interface ChapterEnemyDefinition extends CombatEnemyDefinition {
  readonly chapterId: ChapterId
  readonly role: ChapterEnemyRole
  readonly readableIntent: boolean
  readonly specialRuleIds?: readonly string[]
  readonly presentationCueIds?: readonly string[]
}

export interface SystemUnlockState {
  readonly dialogue: boolean
  readonly basicCombat: boolean
  readonly inventory: boolean
  readonly equipment: boolean
  readonly gathering: boolean
  readonly forging: boolean
  readonly skillTree: boolean
  readonly cooking: boolean
  readonly advancedIntent: boolean
  readonly equipmentStrengthening: boolean
  readonly sectCreation: boolean
  readonly tickDispatch: boolean
  readonly advancedCommissions: boolean
  readonly discipleEvents: boolean
  readonly endingRouteLock: boolean
  readonly fourEndings: boolean
  readonly postgameContinue: boolean
}

export interface Ch01BossRewardDefinition {
  readonly grantKey: string
  readonly experience: number
  readonly silver: number
  readonly itemId: string
  readonly titleId: string
}

export interface Ch02BossRewardDefinition {
  readonly grantKey: string
  readonly experience: number
  readonly silver: number
  readonly itemId: string
}

export interface Ch03BossRewardDefinition {
  readonly grantKey: string
  readonly experience: number
  readonly silver: number
  readonly itemId: string
}

export interface Ch04BossRewardDefinition {
  readonly grantKey: string
  readonly experience: number
  readonly silver: number
  readonly itemId: string
}

export interface Ch05BossRewardDefinition {
  readonly grantKey: string
  readonly experience: number
  readonly silver: number
  readonly itemId: string
}

export interface Ch06BossRewardDefinition extends Ch05BossRewardDefinition {}
export interface Ch07BossRewardDefinition extends Ch05BossRewardDefinition {}
export interface Ch08BossRewardDefinition extends Ch05BossRewardDefinition {}
