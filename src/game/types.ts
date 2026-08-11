export type ScreenId = 'menu' | 'creation' | 'jianghu' | 'battle'

export type TalentId = 'reckless' | 'clever' | 'thickSkinned'

export type SkillId = 'basicSlash' | 'cleaverWhirl' | 'mockery' | 'playDead'

export type ItemId = 'rustyCleaver' | 'stalePill' | 'erguotou' | 'saltedFish'

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
  activeSkills: SkillId[]
  titles: TitleId[]
}

export interface QuestState {
  id: QuestId
  status: 'locked' | 'active' | 'complete'
  progress: number
}

export interface WorldState {
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
}

export interface GameSettings {
  reducedMotion: boolean
  masterMuted: boolean
  bgmEnabled: boolean
  sfxEnabled: boolean
  sillySfxEnabled: boolean
}

export interface BattleStatus {
  id: BattleStatusId
  turns: number
}

export interface EnemyState {
  id: 'baiDaxia'
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

export interface BattleState {
  enemy: EnemyState
  playerCooldowns: Partial<Record<SkillId, number>>
  playerStatuses: BattleStatus[]
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
  screen: Exclude<ScreenId, 'battle'>
  player: PlayerState
  quests: QuestState[]
  world: WorldState
  settings: GameSettings
  rngState: number
}
