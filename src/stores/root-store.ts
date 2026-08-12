import { create } from 'zustand'
import { CORE_ENDINGS } from '../content'
import { ALL_UNLOCKABLES } from '../content/unlockables'
import { EMPTY_UNLOCKABLE_SNAPSHOT, createUnlockableEngine, deriveTitleCombatStats } from '../systems/unlocks'
import { DEFAULT_KEY_BINDINGS, updateGameSettings } from '../systems/input'
import { applyEndingChoice, createEndingState, selectEnding } from '../systems/endings'
import type { DomainEvent } from '../types/events'
import type { UnlockableSnapshot } from '../types/unlockable'
import type { ConditionContext } from '../types/conditions'
import type { EndingRecordResult, EndingRecordState, EndingSelection } from '../types/ending'
import { BASE_STATS, ITEMS, TALENTS } from '../game/data'
import { settleCh01BossVictory } from '../game/chapter-combat'
import { settleCh02BossVictory } from '../game/chapter-combat-ch02'
import { settleCh03BossVictory } from '../game/chapter-combat-ch03'
import { settleCh04BossVictory } from '../game/chapter-combat-ch04'
import { settleCh05BossVictory } from '../game/chapter-combat-ch05'
import { settleCh06BossVictory } from '../game/chapter-combat-ch06'
import { settleCh07BossVictory } from '../game/chapter-combat-ch07'
import { settleCh08BossVictory } from '../game/chapter-combat-ch08'
import type {
  BattleLogEntry,
  BattleState,
  BattleStatus,
  CombatStats,
  EnemyState,
  GameSaveV1,
  GameSettings,
  ItemId,
  PlayerState,
  QuestId,
  QuestState,
  ScreenId,
  SkillId,
  TalentId,
  TitleId,
  WorldState,
} from '../game/types'

type PanelId = 'inventory' | 'skills' | 'equipment' | 'settings' | 'guide' | 'codex' | null
type CatChoice = 'coax' | 'bribe' | 'grab'

export interface RootGameStore {
  screen: ScreenId
  player: PlayerState | null
  quests: QuestState[]
  world: WorldState
  settings: GameSettings
  rngState: number
  battle: BattleState | null
  activePanel: PanelId
  activeDialogue: 'oldMan' | 'aunt' | 'cat' | 'bai' | null
  narrator: string | null
  temporaryMode: boolean
  unlockables: UnlockableSnapshot
  saveStatus: 'idle' | 'saving' | 'saved' | 'temporary' | 'error'
  endingSelection: EndingSelection | null
  endingRecordState: EndingRecordState
  setScreen: (screen: ScreenId) => void
  startNewGame: (name: string, talent: TalentId) => void
  openDialogue: (dialogue: RootGameStore['activeDialogue']) => void
  closeDialogue: () => void
  meetOldMan: () => void
  acceptCatQuest: () => void
  resolveCatQuest: (choice: CatChoice) => void
  startChapterTwo: () => void
  completeChapterTwoInvestigation: () => void
  startChapterThree: () => void
  completeChapterThreeInvestigation: () => void
  startChapterFour: () => void
  completeChapterFourInvestigation: () => void
  startChapterFive: () => void
  completeChapterFiveInvestigation: () => void
  startChapterSix: () => void
  completeChapterSixInvestigation: () => void
  startChapterSeven: () => void
  completeChapterSevenInvestigation: () => void
  startChapterEight: () => void
  completeChapterEightInvestigation: () => void
  startBattle: (chapterId?: 'ch01' | 'ch02' | 'ch03' | 'ch04' | 'ch05' | 'ch06' | 'ch07' | 'ch08') => void
  useSkill: (skillId: SkillId) => void
  retryBattle: () => void
  leaveBattle: () => void
  recordEndingChoice: (choiceId: string, confirmed: boolean) => EndingRecordResult | null
  continuePostgame: () => void
  recordNpcClick: (npcId: string) => void
  setPanel: (panel: PanelId) => void
  setSettings: (settings: Partial<GameSettings>) => void
  useItem: (itemId: ItemId) => void
  equipWeapon: (itemId: ItemId) => void
  toggleBossKey: () => void
  setSaveStatus: (status: RootGameStore['saveStatus']) => void
  maybeNarrate: (id: string, text: string) => void
  dismissNarrator: () => void
  makeSave: () => GameSaveV1 | null
  hydrateSave: (save: GameSaveV1) => void
  importSave: (save: GameSaveV1) => void
}

const DEFAULT_SETTINGS: GameSettings = {
  reducedMotion: false,
  masterMuted: false,
  bgmEnabled: true,
  sfxEnabled: true,
  sillySfxEnabled: true,
  masterVolume: 1,
  musicVolume: 0.55,
  sfxVolume: 0.75,
  sillyVolume: 0.8,
  memeDensity: 'standard',
  textSpeed: 'standard',
  difficulty: 'standard',
  keyBindings: DEFAULT_KEY_BINDINGS,
  aiEnhancement: { enabled: false, provider: 'none' },
}

const EMPTY_WORLD: WorldState = {
  currentChapter: 'ch01',
  oldManMet: false,
  catQuestAccepted: false,
  catChoice: null,
  catResolved: false,
  baiDefeated: false,
  npcClickCounts: {},
  damageTakenHits: 0,
  narratorSeen: [],
  lastNarratorAt: 0,
  tipsyNextBattle: false,
  systemUnlocks: { dialogue: false, basicCombat: false, inventory: false, equipment: false, gathering: false, forging: false, skillTree: false, cooking: false, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false },
  nextChapterUnlocked: false,
  endingEligible: false,
  ch01AutosaveCheckpoint: false,
  ch02MainlineComplete: false,
  ch02BossReady: false,
  ch02BangsiDefeated: false,
  ch02AutosaveCheckpoint: false,
  ch03MainlineComplete: false,
  ch03BossReady: false,
  ch03BlackwindLeaderDefeated: false,
  ch03AutosaveCheckpoint: false,
  ch04MainlineComplete: false,
  ch04BossReady: false,
  ch04QingyunMasterDefeated: false,
  ch04AutosaveCheckpoint: false,
  ch05MainlineComplete: false,
  ch05BossReady: false,
  ch05TwinBanditsDefeated: false,
  ch05AutosaveCheckpoint: false,
  ch06MainlineComplete: false,
  ch06BossReady: false,
  ch06TideMasterDefeated: false,
  ch06AutosaveCheckpoint: false,
  ch07MainlineComplete: false,
  ch07BossReady: false,
  ch07RankingGovernorDefeated: false,
  ch07AutosaveCheckpoint: false,
  ch08MainlineComplete: false,
  ch08BossReady: false,
  ch08RankingMasterDefeated: false,
  ch08AutosaveCheckpoint: false,
}

const EMPTY_QUESTS: QuestState[] = [
  { id: 'firstSteps', status: 'active', progress: 0 },
  { id: 'findCat', status: 'locked', progress: 0 },
  { id: 'challengeBai', status: 'locked', progress: 0 },
]

function unlockableEvent(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 0, sourceActionId: id }
}

function applyUnlockableEvents(snapshot: UnlockableSnapshot, events: readonly DomainEvent[]): UnlockableSnapshot {
  const engine = createUnlockableEngine(ALL_UNLOCKABLES, snapshot)
  events.forEach((event) => engine.applyEvent(event))
  return engine.getState()
}

function titleUnlockableId(title: TitleId): string {
  return `title:${title}`
}

function makeBaseCombatStats(talent: TalentId): CombatStats {
  const talentDefinition = TALENTS.find((item) => item.id === talent)!
  const bonus = talentDefinition.statBonus
  return {
    attack: BASE_STATS.attack + (bonus.attack ?? 0),
    defense: BASE_STATS.defense + (bonus.defense ?? 0),
    speed: BASE_STATS.speed + (bonus.speed ?? 0),
    crit: BASE_STATS.crit + (bonus.crit ?? 0),
    dodge: BASE_STATS.dodge + (bonus.dodge ?? 0),
    accuracy: BASE_STATS.accuracy + (bonus.accuracy ?? 0),
  }
}

function copyQuests(quests: QuestState[], id: QuestId, change: Partial<QuestState>): QuestState[] {
  return quests.map((quest) => (quest.id === id ? { ...quest, ...change } : quest))
}

function appendLog(logs: BattleLogEntry[], text: string, kind: BattleLogEntry['kind'] = 'system'): BattleLogEntry[] {
  return [...logs, { id: `${Date.now()}-${logs.length}`, text, kind }].slice(-50)
}

function createBattlePosture(max = 100): BattleState['playerPosture'] {
  return { current: max, max, broken: false, exposedTurns: 0 }
}

function applyBattlePosture(posture: BattleState['playerPosture'], amount: number): { posture: BattleState['playerPosture']; brokeNow: boolean } {
  if (posture.broken || amount <= 0) return { posture: { ...posture }, brokeNow: false }
  const current = Math.max(0, posture.current - amount)
  if (current > 0) return { posture: { ...posture, current }, brokeNow: false }
  return { posture: { ...posture, current: 0, broken: true, exposedTurns: 1 }, brokeNow: true }
}

function advanceBattlePosture(posture: BattleState['playerPosture']): BattleState['playerPosture'] {
  if (!posture.broken) return { ...posture }
  if (posture.exposedTurns > 1) return { ...posture, exposedTurns: posture.exposedTurns - 1 }
  return createBattlePosture(posture.max)
}

function nextFloat(seed: number): [number, number] {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0
  let value = nextSeed
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return [nextSeed, ((value ^ (value >>> 14)) >>> 0) / 4294967296]
}

function hasStatus(statuses: BattleStatus[], id: BattleStatus['id']): boolean {
  return statuses.some((status) => status.id === id)
}

function removeStatus(statuses: BattleStatus[], id: BattleStatus['id']): BattleStatus[] {
  return statuses.filter((status) => status.id !== id)
}

function addTitle(player: PlayerState, title: TitleId): PlayerState {
  if (player.titles.includes(title)) return player
  const upgraded = { ...player, titles: [...player.titles, title] }
  upgraded.stats = deriveTitleCombatStats(makeBaseCombatStats(upgraded.talent), ALL_UNLOCKABLES, upgraded.titles.map(titleUnlockableId))
  return upgraded
}

function makePlayer(name: string, talent: TalentId): PlayerState {
  const talentDefinition = TALENTS.find((item) => item.id === talent)!
  const bonus = talentDefinition.statBonus
  const stats: CombatStats = makeBaseCombatStats(talent)
  const maxHp = 100 + (bonus.maxHp ?? 0)
  return {
    name: name.trim() || '小虾米',
    talent,
    level: 1,
    experience: 0,
    nextLevelExperience: 100,
    hp: maxHp,
    maxHp,
    qi: 55,
    maxQi: 55,
    silver: 20,
    moral: 0,
    stats,
    inventory: ['stalePill', 'erguotou'],
    equippedWeapon: null,
    activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'],
    titles: [],
  }
}

function makeEndingContext(player: PlayerState, world: WorldState): ConditionContext {
  const defeatedBosses = [
    world.baiDefeated,
    world.ch02BangsiDefeated,
    world.ch03BlackwindLeaderDefeated,
    world.ch04QingyunMasterDefeated,
    world.ch05TwinBanditsDefeated,
    world.ch06TideMasterDefeated,
    world.ch07RankingGovernorDefeated,
    world.ch08RankingMasterDefeated,
  ].filter(Boolean).length
  const fame = defeatedBosses * 5 + player.titles.length * 2
  return {
    quests: {},
    inventory: player.inventory,
    stats: {
      moral: player.moral,
      fame,
      wealth: player.silver,
      sectProsperity: world.systemUnlocks.sectCreation ? 8 : 0,
    },
    flags: {
      ch08MainlineComplete: world.ch08MainlineComplete,
      publicTruthChosen: world.ch07MainlineComplete && player.moral >= 8,
      rankingReformed: world.ch07RankingGovernorDefeated && world.ch08MainlineComplete,
      sectCreated: world.systemUnlocks.sectCreation,
      quietRouteChosen: world.ch08MainlineComplete && player.silver >= 120 && player.moral <= 2,
    },
  }
}

type StoreChapterId = 'ch01' | 'ch02' | 'ch03' | 'ch04' | 'ch05' | 'ch06' | 'ch07' | 'ch08'

function makeEnemy(chapterId: StoreChapterId = 'ch01'): EnemyState {
  if (chapterId === 'ch02') {
    return {
      id: 'bangsi',
      name: '榜下捕快',
      hp: 145,
      maxHp: 145,
      qi: 44,
      maxQi: 44,
      stats: { attack: 18, defense: 10, speed: 8, crit: 0.1, dodge: 0.05, accuracy: 0.89 },
      phase: 1,
      statuses: [],
    }
  }
  if (chapterId === 'ch03') {
    return {
      id: 'blackwindLeader',
      name: '黑风寨主',
      hp: 168,
      maxHp: 168,
      qi: 48,
      maxQi: 48,
      stats: { attack: 20, defense: 11, speed: 8, crit: 0.1, dodge: 0.05, accuracy: 0.9 },
      phase: 1,
      statuses: [],
    }
  }
  if (chapterId === 'ch04') {
    return {
      id: 'qingyunMaster',
      name: '青云掌门',
      hp: 176,
      maxHp: 176,
      qi: 50,
      maxQi: 50,
      stats: { attack: 21, defense: 12, speed: 8, crit: 0.1, dodge: 0.05, accuracy: 0.9 },
      phase: 1,
      statuses: [],
    }
  }
  if (chapterId === 'ch05') return { id: 'twinBandits', name: '驿路双煞', hp: 190, maxHp: 190, qi: 54, maxQi: 54, stats: { attack: 22, defense: 13, speed: 8, crit: .1, dodge: .06, accuracy: .9 }, phase: 1, statuses: [] }
  if (chapterId === 'ch06') return { id: 'tideMaster', name: '海潮帮主', hp: 204, maxHp: 204, qi: 58, maxQi: 58, stats: { attack: 23, defense: 14, speed: 8, crit: .1, dodge: .06, accuracy: .9 }, phase: 1, statuses: [] }
  if (chapterId === 'ch07') return { id: 'rankingGovernor', name: '榜司督主', hp: 218, maxHp: 218, qi: 62, maxQi: 62, stats: { attack: 24, defense: 15, speed: 8, crit: .11, dodge: .06, accuracy: .91 }, phase: 1, statuses: [] }
  if (chapterId === 'ch08') return { id: 'rankingMaster', name: '百晓榜主', hp: 236, maxHp: 236, qi: 66, maxQi: 66, stats: { attack: 25, defense: 16, speed: 8, crit: .11, dodge: .06, accuracy: .91 }, phase: 1, statuses: [] }
  return {
    id: 'baiDaxia',
    name: '白大侠',
    hp: 130,
    maxHp: 130,
    qi: 40,
    maxQi: 40,
    stats: { attack: 17, defense: 11, speed: 8, crit: 0.1, dodge: 0.04, accuracy: 0.88 },
    phase: 1,
    statuses: [],
  }
}

function makeEnemyIntent(enemy: EnemyState, player: PlayerState): BattleState['enemyIntent'] {
  const dazed = hasStatus(enemy.statuses, 'dazed')
  if (dazed) return {
    id: 'intent:dazed',
    label: '晕头转向',
     summary: enemy.id === 'bangsi' ? '本回合不会出手，榜下捕快正在重新填写空白卷宗。' : enemy.id === 'blackwindLeader' ? '本回合不会出手，黑风寨主正在把空旗重新挂正。' : enemy.id === 'qingyunMaster' ? '本回合不会出手，青云掌门正在重新背诵过长的门规。' : enemy.id === 'twinBandits' ? '本回合不会出手，驿路双煞正在重新给货箱换封条。' : enemy.id === 'tideMaster' ? '本回合不会出手，海潮帮主正在等潮钟把热度退回去。' : enemy.id === 'rankingGovernor' ? '本回合不会出手，榜司督主正在重新盖一枚可复核的章。' : enemy.id === 'rankingMaster' ? '本回合不会出手，百晓榜主正在重新称量定义权。' : '本回合不会出手，白大侠正在重新理解你的歪理。',
    expectedDamage: 0,
    expectedPostureDamage: 0,
    honest: true,
  }
  if (enemy.id === 'bangsi') {
    const power = enemy.phase === 2 ? 1.32 : 1.05
    const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
    return {
      id: enemy.phase === 2 ? 'intent:bangsi:reversal' : 'intent:bangsi:seal',
      label: enemy.phase === 2 ? '反盖一印' : '红印落榜',
      summary: `预计造成约 ${expectedDamage} 点伤害，并削减 ${enemy.phase === 2 ? 12 : 10} 点架势。${enemy.phase === 1 ? '偶尔会翻到空白卷宗，本回合他会自己卡住。' : '卷宗页角已经卷起来了，仍会先明示招式。'}`,
      expectedDamage,
      expectedPostureDamage: enemy.phase === 2 ? 12 : 10,
      honest: true,
    }
  }
  if (enemy.id === 'blackwindLeader') {
    const power = enemy.phase === 2 ? 1.34 : 1.08
    const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
    return {
      id: enemy.phase === 2 ? 'intent:blackwind-leader:reversal' : 'intent:blackwind-leader:banner-cut',
      label: enemy.phase === 2 ? '反卷山河' : '旗影断粮',
      summary: `预计造成约 ${expectedDamage} 点伤害，并削减 ${enemy.phase === 2 ? 13 : 11} 点架势。${enemy.phase === 1 ? '偶尔会翻到空旗，寨主会被自己的旗绊住。' : '空旗仍会先明示，别把山风当随机数。'}`,
      expectedDamage,
      expectedPostureDamage: enemy.phase === 2 ? 13 : 11,
      honest: true,
    }
  }
  if (enemy.id === 'qingyunMaster') {
    const power = enemy.phase === 2 ? 1.34 : 1.08
    const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
    return {
      id: enemy.phase === 2 ? 'intent:qingyun-master:correction' : 'intent:qingyun-master:rule-call',
      label: enemy.phase === 2 ? '剑谱纠错' : '门规点名',
      summary: `预计造成约 ${expectedDamage} 点伤害，并削减 ${enemy.phase === 2 ? 13 : 11} 点架势。${enemy.phase === 1 ? '偶尔会念到礼法反噬，掌门会被自己的门规劝住。' : '门规仍会先明示，剑谱纠错只是更大声。'}`,
      expectedDamage,
      expectedPostureDamage: enemy.phase === 2 ? 13 : 11,
      honest: true,
    }
  }
  const late = enemy.id === 'twinBandits' ? { id: 'twin', first: '双线封条', second: '一明一暗', power: 1.12, phasePower: 1.38, posture: 11, phasePosture: 13, note: '偶尔会调包换位，双煞会自己停一回合。' } : enemy.id === 'tideMaster' ? { id: 'tide', first: '潮钟点名', second: '回流压岸', power: 1.14, phasePower: 1.4, posture: 11, phasePosture: 14, note: '偶尔会带货涨潮，帮主会自己停一回合。' } : enemy.id === 'rankingGovernor' ? { id: 'governor', first: '印章定价', second: '热榜发布', power: 1.16, phasePower: 1.42, posture: 12, phasePosture: 15, note: '偶尔会把榜文写模糊，督主会自己停一回合。' } : enemy.id === 'rankingMaster' ? { id: 'master', first: '评审落笔', second: '终局判词', power: 1.18, phasePower: 1.45, posture: 12, phasePosture: 16, note: '偶尔会暂不定义，榜主会自己停一回合。' } : null
  if (late) {
    const power = enemy.phase === 2 ? late.phasePower : late.power
    const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
    return { id: `intent:${late.id}:${enemy.phase === 2 ? 'phase-two' : 'opening'}`, label: enemy.phase === 2 ? late.second : late.first, summary: `预计造成约 ${expectedDamage} 点伤害，并削减 ${enemy.phase === 2 ? late.phasePosture : late.posture} 点架势。${late.note}`, expectedDamage, expectedPostureDamage: enemy.phase === 2 ? late.phasePosture : late.posture, honest: true }
  }
  const power = enemy.phase === 2 ? 1.32 : 1.05
  const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
  return {
    id: enemy.phase === 2 ? 'intent:serious-palm' : 'intent:palm',
    label: enemy.phase === 2 ? '认真三成' : '降龙十巴掌',
    summary: `预计造成约 ${expectedDamage} 点伤害，并削减 10 点架势。${enemy.phase === 1 ? '掌风偶尔会带出风火轮，失手时他会自己晕一回合。' : ''}`,
    expectedDamage,
    expectedPostureDamage: 10,
    honest: true,
  }
}

function makeBattle(chapterId: StoreChapterId = 'ch01'): BattleState {
  const enemy = makeEnemy(chapterId)
  const isBangsi = enemy.id === 'bangsi'
  const isBlackwindLeader = enemy.id === 'blackwindLeader'
  const isQingyunMaster = enemy.id === 'qingyunMaster'
  const isLateBoss = ['twinBandits', 'tideMaster', 'rankingGovernor', 'rankingMaster'].includes(enemy.id)
  const lateBossName = enemy.id === 'twinBandits' ? '驿路双煞' : enemy.id === 'tideMaster' ? '海潮帮主' : enemy.id === 'rankingGovernor' ? '榜司督主' : '百晓榜主'
  return {
    enemy,
    playerCooldowns: {},
    playerStatuses: [],
    playerPosture: createBattlePosture(),
    enemyPosture: createBattlePosture(),
    enemyIntent: {
      id: 'intent:opening',
      label: '蓄势待发',
      summary: isBangsi ? '榜下捕快正在摊开卷宗，下一步大概率是红印落榜。空白卷宗也会提前明示。' : isBlackwindLeader ? '黑风寨主正在抖空旗，下一步大概率是旗影断粮。空旗反卷也会提前明示。' : isQingyunMaster ? '青云掌门正在展开剑谱，下一步大概率是门规点名。礼法反噬也会提前明示。' : isLateBoss ? `${lateBossName}正在准备第一份公开意图，特殊规则也会提前明示。` : '白大侠…82 tokens truncated…|| !state.world.ch05BossReady || state.world.ch05TwinBanditsDefeated)) return
    if (chapterId === 'ch06' && (state.world.currentChapter !== 'ch06' || !state.world.ch06BossReady || state.world.ch06TideMasterDefeated)) return
    if (chapterId === 'ch07' && (state.world.currentChapter !== 'ch07' || !state.world.ch07BossReady || state.world.ch07RankingGovernorDefeated)) return
    if (chapterId === 'ch08' && (state.world.currentChapter !== 'ch08' || !state.world.ch08BossReady || state.world.ch08RankingMasterDefeated)) return
    const battle = makeBattle(chapterId)
    if (state.world.tipsyNextBattle) {
      battle.playerStatuses = [{ id: 'tipsy', turns: 99 }]
      battle.logs = appendLog(battle.logs, '二锅头的勇气上头了：攻击更猛，准头随缘。', 'status')
    }
    set({
      screen: 'battle',
      battle,
      world: { ...state.world, currentChapter: chapterId, tipsyNextBattle: false },
      unlockables: applyUnlockableEvents(state.unlockables, [unlockableEvent(`npc:first-seen:${chapterId}`, 'npc.first_seen', { npcId: chapterId === 'ch02' ? 'bangsi' : chapterId === 'ch03' ? 'blackwind-leader' : chapterId === 'ch04' ? 'qingyun-master' : chapterId === 'ch05' ? 'twin-bandits' : chapterId === 'ch06' ? 'tide-master' : chapterId === 'ch07' ? 'ranking-governor' : chapterId === 'ch08' ? 'ranking-master' : 'bai' })]),
      activeDialogue: null,
      activePanel: null,
    })
  },
  useSkill: (skillId) => {
    const state = get()
    const player = state.player
    const battle = state.battle
    if (!player || !battle || battle.turn !== 'player') return
    const isBangsi = battle.enemy.id === 'bangsi'
    const isBlackwindLeader = battle.enemy.id === 'blackwindLeader'
    const isQingyunMaster = battle.enemy.id === 'qingyunMaster'
    const isTwinBandits = battle.enemy.id === 'twinBandits'
    const isTideMaster = battle.enemy.id === 'tideMaster'
    const isRankingGovernor = battle.enemy.id === 'rankingGovernor'
    const isRankingMaster = battle.enemy.id === 'rankingMaster'
    const isLateBoss = isTwinBandits || isTideMaster || isRankingGovernor || isRankingMaster
    const enemyName = isBangsi ? '榜下捕快' : isBlackwindLeader ? '黑风寨主' : isQingyunMaster ? '青云掌门' : isTwinBandits ? '驿路双煞' : isTideMaster ? '海潮帮主' : isRankingGovernor ? '榜司督主' : isRankingMaster ? '百晓榜主' : '白大侠'
    const definitions = {
      basicSlash: { qi: 0, cooldown: 0, power: 1 },
      cleaverWhirl: { qi: 12, cooldown: 2, power: 1.55 },
      mockery: { qi: 10, cooldown: 3, power: 0.55 },
      playDead: { qi: 8, cooldown: 3, power: 0 },
    } as const
    const definition = definitions[skillId]
    if ((battle.playerCooldowns[skillId] ?? 0) > 0) {
      set({ battle: { ...battle, logs: appendLog(battle.logs, '这招还在喘气，先别硬掏。', 'status') } })
      return
    }
    if (player.qi < definition.qi) {
      set({ battle: { ...battle, logs: appendLog(battle.logs, '内力不够，菜刀都替你尴尬。', 'status') } })
      return
    }

    let seed = state.rngState
    let nextPlayer = { ...player, qi: player.qi - definition.qi }
    let nextEnemy = { ...battle.enemy, statuses: [...battle.enemy.statuses] }
    let playerStatuses = [...battle.playerStatuses]
    let playerPosture = advanceBattlePosture(battle.playerPosture)
    let enemyPosture = advanceBattlePosture(battle.enemyPosture)
    let logs = [...battle.logs]
    let cooldowns = { ...battle.playerCooldowns }
    if (definition.cooldown) cooldowns[skillId] = definition.cooldown

    if (skillId === 'playDead') {
      playerStatuses = [{ id: 'feignedDeath', turns: 1 }]
      logs = appendLog(logs, `${player.name}往地上一躺，演技让路边石头都想鼓掌。`, 'player')
    } else {
      let attackStats = nextPlayer.stats
      let wildMiss = false
      if (hasStatus(playerStatuses, 'tipsy')) {
        let tipsyRoll: number
        ;[seed, tipsyRoll] = nextFloat(seed)
        if (tipsyRoll < 0.15) {
          logs = appendLog(logs, `${player.name}酒劲一上来，对着自己的影子挥了一刀。`, 'status')
          wildMiss = true
        }
        attackStats = { ...attackStats, attack: attackStats.attack * 1.25 }
      }
      const hit = wildMiss ? null : calculateDamage(attackStats, nextEnemy.stats, definition.power * (enemyPosture.broken ? 1.5 : 1), seed)
      if (hit) seed = hit.seed
      if (!hit || hit.dodged) {
        logs = appendLog(logs, `${player.name}一刀劈空，${enemyName}的防具毫发无伤。`, 'status')
      } else {
        nextEnemy = { ...nextEnemy, hp: Math.max(0, nextEnemy.hp - hit.damage) }
        logs = appendLog(logs, `${player.name}使出${skillId === 'mockery' ? '「嘴遁」' : skillId === 'cleaverWhirl' ? '「菜刀乱舞」' : '「普通攻击」'}，${enemyName}受到 ${hit.damage} 点伤害。${hit.crit ? ' 暴击，确实有点疼！' : ''}`, hit.crit ? 'critical' : 'player')
        const postureHit = applyBattlePosture(enemyPosture, skillId === 'mockery' ? 14 : skillId === 'cleaverWhirl' ? 22 : 10)
        enemyPosture = postureHit.posture
        if (postureHit.brokeNow) logs = appendLog(logs, `${enemyName}的架势被劈开，下一回合会更容易吃痛。`, 'status')
        if (skillId === 'mockery' && nextEnemy.hp > 0) {
          nextEnemy.statuses = [{ id: 'dazed', turns: 1 }]
          logs = appendLog(logs, `${enemyName}陷入沉思：他说得好像也有点道理？`, 'status')
        }
      }
    }

    if (nextEnemy.hp <= 0) {
      const settlement = isBangsi
        ? settleCh02BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isBlackwindLeader
        ? settleCh03BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isQingyunMaster
        ? settleCh04BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isTwinBandits
        ? settleCh05BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isTideMaster
        ? settleCh06BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isRankingGovernor
        ? settleCh07BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : isRankingMaster
        ? settleCh08BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
        : settleCh01BossVictory({ player: nextPlayer, quests: state.quests, world: state.world })
      const unlockables = applyUnlockableEvents(state.unlockables, [
        unlockableEvent(`battle:skill:${state.rngState}:${battle.round}`, 'skill.used', { skillId }),
        ...settlement.events,
      ])
      set({
        player: settlement.player,
        world: settlement.world,
        quests: settlement.quests as QuestState[],
        unlockables,
        rngState: seed,
        battle: { ...battle, enemy: nextEnemy, playerCooldowns: cooldowns, playerStatuses, playerPosture, enemyPosture, enemyIntent: makeEnemyIntent(nextEnemy, settlement.player), turn: 'victory', logs: appendLog(logs, isBangsi ? '榜下捕快盖章认输：这份结果，暂时可以上榜。' : isBlackwindLeader ? '黑风寨主收起空旗：这次败北，算山风的。' : isQingyunMaster ? '青云掌门收起折扇：门面验收通过，规则终于写短了。' : isLateBoss ? `${enemyName}收起证据：这次败北，终于可以公开复核。` : '白大侠抱拳认输：这把菜刀，讲道理。', 'system'), rewardGranted: true },
        narrator: isBangsi ? '说书人：清河县核验完毕，你的菜刀终于拿到了一块不太空白的榜牌。' : isBlackwindLeader ? '说书人：黑风寨验收完毕，技能树和烹饪终于不再只是菜单上的远景。' : isQingyunMaster ? '说书人：青云山验收完毕，意图进阶和装备强化已从门面工程里落地。' : isTwinBandits ? '说书人：西域驿路签收完毕，门派创建与 Tick 派遣终于不再只是远景。' : isTideMaster ? '说书人：东海镇核验完毕，进阶委托与门人事件开始按潮汐运行。' : isRankingGovernor ? '说书人：京城账本核验完毕，结局路线锁定已写进可复核规则。' : isRankingMaster ? '说书人：武林大会落幕，四种结局与通关后继续都已打开。' : '说书人：恭喜，你终于从“会挥刀”升级成“差点会挥刀”。',
      })
      return
    }

    if (nextEnemy.phase === 1 && nextEnemy.hp <= nextEnemy.maxHp / 2) {
      nextEnemy = { ...nextEnemy, phase: 2 }
      logs = appendLog(logs, isBangsi ? '榜下捕快翻到卷宗背面：看来得拿出反盖一印了！' : isBlackwindLeader ? '黑风寨主把空旗一拧：看来得拿出反卷山河了！' : isQingyunMaster ? '青云掌门翻开剑谱背面：看来得拿出剑谱纠错了！' : isLateBoss ? `${enemyName}翻开第二页证据：看来得把特殊规则写得更大。` : '白大侠脸色一沉：看来得拿出三成实力了！', 'system')
    }

    if (hasStatus(nextEnemy.statuses, 'dazed')) {
      nextEnemy = { ...nextEnemy, statuses: removeStatus(nextEnemy.statuses, 'dazed') }
        logs = appendLog(logs, `${enemyName}还在琢磨你的歪理，错过了出手时机。`, 'status')
    } else {
      let roll: number
      ;[seed, roll] = nextFloat(seed)
      const feigning = hasStatus(playerStatuses, 'feignedDeath')
      if (feigning && roll < 0.72) {
        playerStatuses = removeStatus(playerStatuses, 'feignedDeath')
        logs = appendLog(logs, `${enemyName}踢了踢你：演得不错，下次别眨眼。`, 'status')
      } else if (roll < (isBangsi ? 0.2 : 0.18)) {
        nextEnemy = { ...nextEnemy, statuses: [{ id: 'dazed', turns: 1 }] }
        logs = appendLog(logs, isBangsi ? '榜下捕快翻开「空白卷宗」，先把自己卡在公文里了。' : isBlackwindLeader ? '黑风寨主挂反「空旗」，先把自己绊在山风里了。' : isQingyunMaster ? '青云掌门念完「礼法反噬」，先把自己念进沉思里了。' : isLateBoss ? `${enemyName}触发特殊规则，先停下来重新解释自己的证据。` : '白大侠使出「无敌风火轮」，先把自己转晕了。', 'enemy')
      } else {
        const power = isBangsi ? (nextEnemy.phase === 2 ? 1.32 : 1.05) : isBlackwindLeader ? (nextEnemy.phase === 2 ? 1.34 : 1.08) : isQingyunMaster ? (nextEnemy.phase === 2 ? 1.34 : 1.08) : isTwinBandits ? (nextEnemy.phase === 2 ? 1.38 : 1.12) : isTideMaster ? (nextEnemy.phase === 2 ? 1.4 : 1.14) : isRankingGovernor ? (nextEnemy.phase === 2 ? 1.42 : 1.16) : isRankingMaster ? (nextEnemy.phase === 2 ? 1.45 : 1.18) : (nextEnemy.phase === 2 ? 1.32 : 1.05)
        const hit = calculateDamage(nextEnemy.stats, nextPlayer.stats, power, seed)
        seed = hit.seed
        if (hit.dodged) {
          logs = appendLog(logs, `${enemyName}一招拍空，你靠本能躲开了。`, 'status')
        } else {
          nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - hit.damage) }
          const moveLabel = isBangsi ? (nextEnemy.phase === 2 ? '反盖一印' : '红印落榜') : isBlackwindLeader ? (nextEnemy.phase === 2 ? '反卷山河' : '旗影断粮') : isQingyunMaster ? (nextEnemy.phase === 2 ? '剑谱纠错' : '门规点名') : isTwinBandits ? (nextEnemy.phase === 2 ? '一明一暗' : '双线封条') : isTideMaster ? (nextEnemy.phase === 2 ? '回流压岸' : '潮钟点名') : isRankingGovernor ? (nextEnemy.phase === 2 ? '热榜发布' : '印章定价') : isRankingMaster ? (nextEnemy.phase === 2 ? '终局判词' : '评审落笔') : '降龙十巴掌'
          logs = appendLog(logs, `${enemyName}使出「${moveLabel}」，你受到 ${hit.damage} 点伤害。${hit.crit ? ' 这一下挺有排面。' : ''}`, hit.crit ? 'critical' : 'enemy')
          const postureHit = applyBattlePosture(playerPosture, isBlackwindLeader || isQingyunMaster ? (nextEnemy.phase === 2 ? 13 : 11) : isTwinBandits ? (nextEnemy.phase === 2 ? 13 : 11) : isTideMaster ? (nextEnemy.phase === 2 ? 14 : 11) : isRankingGovernor ? (nextEnemy.phase === 2 ? 15 : 12) : isRankingMaster ? (nextEnemy.phase === 2 ? 16 : 12) : 10)
          playerPosture = postureHit.posture
          if (postureHit.brokeNow) logs = appendLog(logs, '你的架势被拍散了，下一回合要小心易伤。', 'status')
        }
      }
    }

    cooldowns = Object.fromEntries(Object.entries(cooldowns).map(([id, turns]) => [id, Math.max(0, turns - 1)]))
    const defeated = nextPlayer.hp <= 0
    const damageTakenHits = state.world.damageTakenHits + (nextPlayer.hp < player.hp ? 1 : 0)
    const earnedPunchingBag = damageTakenHits >= 3 && !nextPlayer.titles.includes('punchingBag')
    if (earnedPunchingBag) nextPlayer = addTitle(nextPlayer, 'punchingBag')
    const unlockables = applyUnlockableEvents(state.unlockables, [
      unlockableEvent(`battle:skill:${state.rngState}:${battle.round}`, 'skill.used', { skillId }),
      ...(earnedPunchingBag ? [unlockableEvent('title:earned:punchingBag', 'title.earned', { titleId: 'punchingBag' })] : []),
    ])
    set({
      player: nextPlayer,
      world: { ...state.world, damageTakenHits },
      unlockables,
      rngState: seed,
      battle: {
        ...battle,
        enemy: nextEnemy,
        playerCooldowns: cooldowns,
        playerStatuses,
        playerPosture,
        enemyPosture,
        enemyIntent: makeEnemyIntent(nextEnemy, nextPlayer),
        turn: defeated ? 'defeat' : 'player',
        round: defeated ? battle.round : battle.round + 1,
        logs: defeated ? appendLog(logs, '你倒下了，但菜刀还很倔强地指着天。', 'system') : logs,
      },
      narrator: defeated ? '说书人：挨打不丢人，丢人的是挨完还没记住招式。' : state.narrator,
    })
  },
  retryBattle: () => {
    const state = get()
    if (!state.player) return
    set({
      player: { ...state.player, hp: state.player.maxHp, qi: state.player.maxQi },
      battle: makeBattle(state.world.currentChapter),
      narrator: '说书人：来，站起来，重新组织一下语言和骨头。',
    })
  },
  leaveBattle: () => {
    const state = get()
    if (state.battle?.turn === 'victory' && state.world.ch08RankingMasterDefeated && state.player) {
      const endingSelection = selectEnding(CORE_ENDINGS, makeEndingContext(state.player, state.world))
      set({ screen: 'ending', battle: null, endingSelection, activePanel: null, activeDialogue: null, narrator: endingSelection.reason })
      return
    }
    set({ screen: 'jianghu', battle: null })
  },
  recordEndingChoice: (choiceId, confirmed) => {
    const state = get()
    const ending = state.endingSelection?.ending
    if (!ending) return null
    const result = applyEndingChoice(state.endingRecordState, ending, choiceId, confirmed)
    set({
      endingRecordState: result.state,
      world: { ...state.world, systemUnlocks: { ...state.world.systemUnlocks, postgameContinue: true } },
      narrator: result.message,
    })
    return result
  },
  continuePostgame: () => {
    const state = get()
    set({ screen: 'jianghu', battle: null, activePanel: null, activeDialogue: null, narrator: state.endingSelection?.ending?.postgameLabel ?? '原档已保留，继续经营你的江湖。' })
  },
  recordNpcClick: (npcId) => {
    const state = get()
    const count = (state.world.npcClickCounts[npcId] ?? 0) + 1
    const counts = { ...state.world.npcClickCounts, [npcId]: count }
    let player = state.player
    let narrator = state.narrator
    if (npcId === 'oldMan' && count === 5 && player) {
      player = addTitle({ ...player, silver: player.silver + 1 }, 'chatterboxBane')
      narrator = '不正经老头塞给你一文钱：拿去，别再点我了。'
    }
    const unlockEvents = [
      ...(npcId === 'oldMan' ? [unlockableEvent(`npc:interaction:old-man:${count}`, 'npc.interaction', { npcId: 'old-man', kind: 'click' })] : []),
      ...(npcId === 'oldMan' && count === 5 ? [unlockableEvent('title:earned:chatterboxBane', 'title.earned', { titleId: 'chatterboxBane' })] : []),
    ]
    set({ player, world: { ...state.world, npcClickCounts: counts }, unlockables: applyUnlockableEvents(state.unlockables, unlockEvents), narrator })
  },
  setPanel: (activePanel) => set({ activePanel }),
  setSettings: (settings) => set((state) => {
    const result = updateGameSettings(state.settings, settings, state.screen === 'battle')
    return result.difficultyBlocked
      ? { settings: result.settings, narrator: '战斗中不能切换难度，先把白大侠的掌风接住。' }
      : { settings: result.settings }
  }),
  useItem: (itemId) => {
    const state = get()
    const player = state.player
    if (!player || !player.inventory.includes(itemId) || state.screen === 'battle') return
    if (itemId === 'stalePill') {
      let seed: number
      let roll: number
      ;[seed, roll] = nextFloat(state.rngState)
      const helps = roll >= 0.5
      const hp = helps ? Math.min(player.maxHp, player.hp + 38) : Math.max(1, player.hp - 7)
      set({
        player: { ...player, hp, inventory: player.inventory.filter((item) => item !== itemId) },
        rngState: seed,
        narrator: helps ? '说书人：药居然还没彻底失效，今天算你赚到。' : '说书人：药效走偏了，但至少你还站着。',
      })
      return
    }
    if (itemId === 'erguotou') {
      if (state.world.tipsyNextBattle) {
        set({ narrator: '说书人：再喝就不是增益，是给白大侠加节目。' })
        return
      }
      set({
        player: { ...player, inventory: player.inventory.filter((item) => item !== itemId) },
        world: { ...state.world, tipsyNextBattle: true },
        narrator: '说书人：二锅头下肚，下一场攻击 +25%，但有 15% 概率砍向空气。',
      })
    }
  },
  equipWeapon: (itemId) => {
    const state = get()
    if (!state.player || !state.player.inventory.includes(itemId) || ITEMS[itemId]?.category !== 'weapon') return
    set({ player: { ...state.player, equippedWeapon: itemId } })
  },
  toggleBossKey: () => set((state) => ({ temporaryMode: !state.temporaryMode })),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  maybeNarrate: (id, text) => {
    const state = get()
    const now = Date.now()
    if (state.world.narratorSeen.includes(id) || now - state.world.lastNarratorAt < 8000) return
    set({
      narrator: text,
      world: { ...state.world, narratorSeen: [...state.world.narratorSeen, id], lastNarratorAt: now },
    })
  },
  dismissNarrator: () => set({ narrator: null }),
  makeSave: () => {
    const state = get()
    if (!state.player) return null
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      screen: state.screen === 'battle' || state.screen === 'crafting' || state.screen === 'cooking' ? 'jianghu' : state.screen,
      player: state.player,
      quests: state.quests,
      world: state.world,
      settings: state.settings,
      rngState: state.rngState,
      unlockables: state.unlockables,
      ending: state.endingRecordState,
    }
  },
  hydrateSave: (save) => set((state) => ({
    screen: save.screen,
    player: save.player,
    quests: save.quests,
    world: save.world,
    settings: save.settings,
    rngState: save.rngState,
    unlockables: save.unlockables,
    battle: null,
    activeDialogue: null,
    activePanel: null,
    saveStatus: 'saved',
    endingRecordState: createEndingState(save.ending ?? state.endingRecordState),
    endingSelection: save.screen === 'ending' && save.player && save.world.ch08RankingMasterDefeated
      ? selectEnding(CORE_ENDINGS, makeEndingContext(save.player, save.world))
      : null,
  })),
  importSave: (save) => get().hydrateSave(save),
}))


/** 旧调用方继续使用同一实例，避免运行时出现双 store。 */
export const useGameStore = useRootGameStore

export function getRootGameStore(): RootGameStore {
  return useRootGameStore.getState()
}


