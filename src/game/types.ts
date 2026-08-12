export type ScreenId = 'menu' | 'creation' | 'jianghu' | 'battle' | 'crafting' | 'cooking' | 'ending' | 'worldMap' | 'location'

export type TalentId = 'reckless' | 'clever' | 'thickSkinned'

export type SkillId = 'basicSlash' | 'cleaverWhirl' | 'mockery' | 'playDead'

export type ItemId = 'rustyCleaver' | 'stalePill' | 'erguotou' | 'saltedFish' | 'qingheBadge' | 'blackwindSeal' | 'qingyunMark' | 'westernSeal' | 'tidePearl' | 'capitalWrit' | 'conventionCrest'

export type TitleId = 'cleaverNovice' | 'catScratchTrial' | 'chatterboxBane' | 'punchingBag'

export type QuestId = 'firstSteps' | 'findCat' | 'challengeBai'

export type BattleStatusId = 'dazed' | 'tipsy' | 'embarrassed' | 'feignedDeath'

export interface CombatStats {
  attack: number
  defense: number
  speed: number
  crit: number
  dodge: number
  accuracy: number
}

export interface PlayerState {
  name: string
  talent: TalentId
  level: number
  experience: number
  nextLevelExperience: number
  hp: number
  maxHp: number
  qi: number
  maxQi: number
  silver: number
  moral: number
  stats: CombatStats
  inventory: ItemId[]
  equippedWeapon: ItemId | null
  activeSkills: string[]
  titles: TitleId[]
}

export interface QuestState {
  id: QuestId
  status: 'locked' | 'active' | 'complete'
  progress: number
}

export interface WorldState {
  currentChapter: 'ch01' | 'ch02' | 'ch03' | 'ch04' | 'ch05' | 'ch06' | 'ch07' | 'ch08'
  oldManMet: boolean
  catQuestAccepted: boolean
  catChoice: 'coax' | 'bribe' | 'grab' | null
  catResolved: boolean
  baiDefeated: boolean
  npcClickCounts: Record<string, number>
  damageTakenHits: number
  narratorSeen: string[]
  lastNarratorAt: number
  tipsyNextBattle: boolean
  systemUnlocks: import('../types/chapter-combat').SystemUnlockState
  nextChapterUnlocked: boolean
  endingEligible: boolean
  ch01AutosaveCheckpoint: boolean
  ch02MainlineComplete: boolean
  ch02BossReady: boolean
  ch02BangsiDefeated: boolean
  ch02AutosaveCheckpoint: boolean
  ch03MainlineComplete: boolean
  ch03BossReady: boolean
  ch03BlackwindLeaderDefeated: boolean
  ch03AutosaveCheckpoint: boolean
  ch04MainlineComplete: boolean
  ch04BossReady: boolean
  ch04QingyunMasterDefeated: boolean
  ch04AutosaveCheckpoint: boolean
  ch05MainlineComplete: boolean
  ch05BossReady: boolean
  ch05TwinBanditsDefeated: boolean
  ch05AutosaveCheckpoint: boolean
  ch06MainlineComplete: boolean
  ch06BossReady: boolean
  ch06TideMasterDefeated: boolean
  ch06AutosaveCheckpoint: boolean
  ch07MainlineComplete: boolean
  ch07BossReady: boolean
  ch07RankingGovernorDefeated: boolean
  ch07AutosaveCheckpoint: boolean
  ch08MainlineComplete: boolean
  ch08BossReady: boolean
  ch08RankingMasterDefeated: boolean
  ch08AutosaveCheckpoint: boolean
}

import type { GameSettings } from '../types/settings'
export type { GameSettings } from '../types/settings'

export interface BattleStatus {
  id: BattleStatusId
  turns: number
}

export interface EnemyState {
  id: 'baiDaxia' | 'bangsi' | 'blackwindLeader' | 'qingyunMaster' | 'twinBandits' | 'tideMaster' | 'rankingGovernor' | 'rankingMaster'
  name: string
  hp: number
  maxHp: number
  qi: number
  maxQi: number
  stats: CombatStats
  phase: 1 | 2
  statuses: BattleStatus[]
}

export interface BattleLogEntry {
  id: string
  text: string
  kind: 'system' | 'player' | 'enemy' | 'critical' | 'status'
}

export interface BattlePosture {
  current: number
  max: number
  broken: boolean
  exposedTurns: number
}

export interface BattleIntent {
  id: string
  label: string
  summary: string
  expectedDamage: number
  expectedPostureDamage: number
  honest: boolean
}

export interface BattleState {
  enemy: EnemyState
  playerCooldowns: Readonly<Record<string, number>>
  playerStatuses: BattleStatus[]
  playerPosture: BattlePosture
  enemyPosture: BattlePosture
  enemyIntent: BattleIntent
  turn: 'player' | 'enemy' | 'victory' | 'defeat'
  round: number
  logs: BattleLogEntry[]
  rewardGranted: boolean
}

export type GameEvent =
  | { type: 'npc_clicked'; npcId: string }
  | { type: 'cat_grabbed' }
  | { type: 'battle_won'; enemyId: EnemyState['id'] }
  | { type: 'damage_taken'; amount: number }

export interface GameSaveV1 {
  version: 1
  savedAt: string
  screen: Exclude<ScreenId, 'battle' | 'crafting' | 'cooking'>
  player: PlayerState
  quests: QuestState[]
  world: WorldState
  settings: GameSettings
  rngState: number
  unlockables: import('../types/unlockable').UnlockableSnapshot
  /** 旧存档可缺省；首次进入结局页时由运行时补齐。 */
  ending?: import('../types/ending').EndingRecordState
}
