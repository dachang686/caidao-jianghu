import { create } from 'zustand'
import { BASE_STATS, TALENTS } from './data'
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
} from './types'

type PanelId = 'inventory' | 'skills' | 'equipment' | 'settings' | 'guide' | 'codex' | null
type CatChoice = 'coax' | 'bribe' | 'grab'

interface GameStore {
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
  saveStatus: 'idle' | 'saving' | 'saved' | 'temporary' | 'error'
  setScreen: (screen: ScreenId) => void
  startNewGame: (name: string, talent: TalentId) => void
  openDialogue: (dialogue: GameStore['activeDialogue']) => void
  closeDialogue: () => void
  meetOldMan: () => void
  acceptCatQuest: () => void
  resolveCatQuest: (choice: CatChoice) => void
  startBattle: () => void
  useSkill: (skillId: SkillId) => void
  retryBattle: () => void
  leaveBattle: () => void
  recordNpcClick: (npcId: string) => void
  setPanel: (panel: PanelId) => void
  setSettings: (settings: Partial<GameSettings>) => void
  toggleBossKey: () => void
  setSaveStatus: (status: GameStore['saveStatus']) => void
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
}

const EMPTY_WORLD: WorldState = {
  oldManMet: false,
  catQuestAccepted: false,
  catChoice: null,
  catResolved: false,
  baiDefeated: false,
  npcClickCounts: {},
  damageTakenHits: 0,
  narratorSeen: [],
  lastNarratorAt: 0,
}

const EMPTY_QUESTS: QuestState[] = [
  { id: 'firstSteps', status: 'active', progress: 0 },
  { id: 'findCat', status: 'locked', progress: 0 },
  { id: 'challengeBai', status: 'locked', progress: 0 },
]

function copyQuests(quests: QuestState[], id: QuestId, change: Partial<QuestState>): QuestState[] {
  return quests.map((quest) => (quest.id === id ? { ...quest, ...change } : quest))
}

function appendLog(logs: BattleLogEntry[], text: string, kind: BattleLogEntry['kind'] = 'system'): BattleLogEntry[] {
  return [...logs, { id: `${Date.now()}-${logs.length}`, text, kind }].slice(-8)
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
  if (title === 'cleaverNovice' || title === 'chatterboxBane') {
    upgraded.stats = { ...upgraded.stats, attack: upgraded.stats.attack + 1 }
  }
  if (title === 'punchingBag') {
    upgraded.stats = { ...upgraded.stats, defense: upgraded.stats.defense + 2 }
  }
  if (title === 'catScratchTrial') {
    upgraded.stats = { ...upgraded.stats, crit: upgraded.stats.crit + 0.01 }
  }
  return upgraded
}

function makePlayer(name: string, talent: TalentId): PlayerState {
  const talentDefinition = TALENTS.find((item) => item.id === talent)!
  const bonus = talentDefinition.statBonus
  const stats: CombatStats = {
    attack: BASE_STATS.attack + (bonus.attack ?? 0),
    defense: BASE_STATS.defense + (bonus.defense ?? 0),
    speed: BASE_STATS.speed + (bonus.speed ?? 0),
    crit: BASE_STATS.crit + (bonus.crit ?? 0),
    dodge: BASE_STATS.dodge + (bonus.dodge ?? 0),
    accuracy: BASE_STATS.accuracy + (bonus.accuracy ?? 0),
  }
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
    inventory: [],
    equippedWeapon: null,
    activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'],
    titles: [],
  }
}

function makeEnemy(): EnemyState {
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

function makeBattle(): BattleState {
  return {
    enemy: makeEnemy(),
    playerCooldowns: {},
    playerStatuses: [],
    turn: 'player',
    round: 1,
    logs: [{ id: 'opening', text: '白大侠掸了掸衣角：今天让你见识一下什么叫名门正派。', kind: 'system' }],
    rewardGranted: false,
  }
}

function calculateDamage(attacker: CombatStats, defender: CombatStats, power: number, seed: number): { damage: number; crit: boolean; dodged: boolean; seed: number } {
  let nextSeed = seed
  let roll: number
  ;[nextSeed, roll] = nextFloat(nextSeed)
  if (roll < defender.dodge) return { damage: 0, crit: false, dodged: true, seed: nextSeed }
  ;[nextSeed, roll] = nextFloat(nextSeed)
  const crit = roll < attacker.crit
  ;[nextSeed, roll] = nextFloat(nextSeed)
  const variance = 0.92 + roll * 0.16
  const raw = (attacker.attack * power * 100) / (defender.defense + 100)
  return { damage: Math.max(1, Math.round(raw * variance * (crit ? 1.5 : 1))), crit, dodged: false, seed: nextSeed }
}

function initialStoreState() {
  return {
    screen: 'menu' as ScreenId,
    player: null as PlayerState | null,
    quests: EMPTY_QUESTS.map((quest) => ({ ...quest })),
    world: { ...EMPTY_WORLD },
    settings: { ...DEFAULT_SETTINGS },
    rngState: 987654321,
    battle: null as BattleState | null,
    activePanel: null as PanelId,
    activeDialogue: null as GameStore['activeDialogue'],
    narrator: null as string | null,
    temporaryMode: false,
    saveStatus: 'idle' as GameStore['saveStatus'],
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialStoreState(),
  setScreen: (screen) => set({ screen, activePanel: null, activeDialogue: null }),
  startNewGame: (name, talent) => {
    const player = makePlayer(name, talent)
    set({
      ...initialStoreState(),
      player,
      screen: 'jianghu',
      narrator: '说书人：一把菜刀，一袋盘缠，你的江湖看起来预算不太充足。',
    })
  },
  openDialogue: (activeDialogue) => set({ activeDialogue }),
  closeDialogue: () => set({ activeDialogue: null }),
  meetOldMan: () => {
    const state = get()
    if (state.world.oldManMet) return set({ activeDialogue: null })
    set({
      world: { ...state.world, oldManMet: true },
      quests: copyQuests(copyQuests(copyQuests(state.quests, 'firstSteps', { status: 'complete', progress: 1 }), 'findCat', { status: 'active' }), 'challengeBai', { status: 'active' }),
      activeDialogue: null,
      narrator: '说书人：这老头看着不正经，教的招倒挺疼。',
    })
  },
  acceptCatQuest: () => {
    const state = get()
    if (state.world.catQuestAccepted || !state.world.oldManMet) return
    set({
      world: { ...state.world, catQuestAccepted: true },
      quests: copyQuests(state.quests, 'findCat', { status: 'active', progress: 0 }),
      activeDialogue: null,
    })
  },
  resolveCatQuest: (choice) => {
    const state = get()
    const player = state.player
    if (!player || !state.world.catQuestAccepted || state.world.catResolved) return
    let nextPlayer: PlayerState = { ...player }
    if (choice === 'coax') nextPlayer = { ...nextPlayer, moral: nextPlayer.moral + 2, experience: nextPlayer.experience + 12 }
    if (choice === 'bribe') nextPlayer = { ...nextPlayer, silver: Math.max(0, nextPlayer.silver - 8), experience: nextPlayer.experience + 8 }
    if (choice === 'grab') {
      nextPlayer = addTitle({ ...nextPlayer, hp: Math.max(1, nextPlayer.hp - 4), moral: nextPlayer.moral - 1, experience: nextPlayer.experience + 10 }, 'catScratchTrial')
    }
    set({
      player: nextPlayer,
      world: { ...state.world, catChoice: choice, catResolved: true },
      quests: copyQuests(state.quests, 'findCat', { status: 'complete', progress: 1 }),
      activeDialogue: null,
      narrator: choice === 'grab' ? '说书人：猫没回家，你先收获了江湖第一道伤。' : '说书人：大黄猫勉强同意，给你一个台阶下。',
    })
  },
  startBattle: () => {
    const state = get()
    if (!state.player || !state.world.oldManMet || state.world.baiDefeated) return
    set({ screen: 'battle', battle: makeBattle(), activeDialogue: null, activePanel: null })
  },
  useSkill: (skillId) => {
    const state = get()
    const player = state.player
    const battle = state.battle
    if (!player || !battle || battle.turn !== 'player') return
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
    let logs = [...battle.logs]
    let cooldowns = { ...battle.playerCooldowns }
    if (definition.cooldown) cooldowns[skillId] = definition.cooldown

    if (skillId === 'playDead') {
      playerStatuses = [{ id: 'feignedDeath', turns: 1 }]
      logs = appendLog(logs, `${player.name}往地上一躺，演技让路边石头都想鼓掌。`, 'player')
    } else {
      const hit = calculateDamage(nextPlayer.stats, nextEnemy.stats, definition.power, seed)
      seed = hit.seed
      if (hit.dodged) {
        logs = appendLog(logs, `${player.name}一刀劈空，白大侠的发型毫发无伤。`, 'status')
      } else {
        nextEnemy = { ...nextEnemy, hp: Math.max(0, nextEnemy.hp - hit.damage) }
        logs = appendLog(logs, `${player.name}使出${skillId === 'mockery' ? '「嘴遁」' : skillId === 'cleaverWhirl' ? '「菜刀乱舞」' : '「普通攻击」'}，白大侠受到 ${hit.damage} 点伤害。${hit.crit ? ' 暴击，确实有点疼！' : ''}`, hit.crit ? 'critical' : 'player')
        if (skillId === 'mockery' && nextEnemy.hp > 0) {
          nextEnemy.statuses = [{ id: 'dazed', turns: 1 }]
          logs = appendLog(logs, '白大侠陷入沉思：他说得好像也有点道理？', 'status')
        }
      }
    }

    if (nextEnemy.hp <= 0) {
      const earnedPlayer = addTitle({
        ...nextPlayer,
        experience: nextPlayer.experience + 42,
        silver: nextPlayer.silver + 50,
        inventory: nextPlayer.inventory.includes('rustyCleaver') ? nextPlayer.inventory : [...nextPlayer.inventory, 'rustyCleaver' as ItemId],
        equippedWeapon: 'rustyCleaver',
      }, 'cleaverNovice')
      set({
        player: earnedPlayer,
        world: { ...state.world, baiDefeated: true },
        quests: copyQuests(state.quests, 'challengeBai', { status: 'complete', progress: 1 }),
        rngState: seed,
        battle: { ...battle, enemy: nextEnemy, playerCooldowns: cooldowns, playerStatuses, turn: 'victory', logs: appendLog(logs, '白大侠抱拳认输：这把菜刀，讲道理。', 'system'), rewardGranted: true },
        narrator: '说书人：恭喜，你终于从“会挥刀”升级成“差点会挥刀”。',
      })
      return
    }

    if (nextEnemy.phase === 1 && nextEnemy.hp <= nextEnemy.maxHp / 2) {
      nextEnemy = { ...nextEnemy, phase: 2 }
      logs = appendLog(logs, '白大侠脸色一沉：看来得拿出三成实力了！', 'system')
    }

    if (hasStatus(nextEnemy.statuses, 'dazed')) {
      nextEnemy = { ...nextEnemy, statuses: removeStatus(nextEnemy.statuses, 'dazed') }
      logs = appendLog(logs, '白大侠还在琢磨你的歪理，错过了出手时机。', 'status')
    } else {
      let roll: number
      ;[seed, roll] = nextFloat(seed)
      const feigning = hasStatus(playerStatuses, 'feignedDeath')
      if (feigning && roll < 0.72) {
        playerStatuses = removeStatus(playerStatuses, 'feignedDeath')
        logs = appendLog(logs, '白大侠踢了踢你：演得不错，下次别眨眼。', 'status')
      } else if (roll < 0.18) {
        nextEnemy = { ...nextEnemy, statuses: [{ id: 'dazed', turns: 1 }] }
        logs = appendLog(logs, '白大侠使出「无敌风火轮」，先把自己转晕了。', 'enemy')
      } else {
        const power = nextEnemy.phase === 2 ? 1.32 : 1.05
        const hit = calculateDamage(nextEnemy.stats, nextPlayer.stats, power, seed)
        seed = hit.seed
        if (hit.dodged) {
          logs = appendLog(logs, '白大侠一掌拍空，你靠本能躲开了。', 'status')
        } else {
          nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - hit.damage) }
          logs = appendLog(logs, `白大侠使出「降龙十巴掌」，你受到 ${hit.damage} 点伤害。${hit.crit ? ' 这一下挺有排面。' : ''}`, hit.crit ? 'critical' : 'enemy')
        }
      }
    }

    cooldowns = Object.fromEntries(Object.entries(cooldowns).map(([id, turns]) => [id, Math.max(0, turns - 1)]))
    const defeated = nextPlayer.hp <= 0
    const damageTakenHits = state.world.damageTakenHits + (nextPlayer.hp < player.hp ? 1 : 0)
    if (damageTakenHits >= 3) nextPlayer = addTitle(nextPlayer, 'punchingBag')
    set({
      player: nextPlayer,
      world: { ...state.world, damageTakenHits },
      rngState: seed,
      battle: {
        ...battle,
        enemy: nextEnemy,
        playerCooldowns: cooldowns,
        playerStatuses,
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
      battle: makeBattle(),
      narrator: '说书人：来，站起来，重新组织一下语言和骨头。',
    })
  },
  leaveBattle: () => set({ screen: 'jianghu', battle: null }),
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
    set({ player, world: { ...state.world, npcClickCounts: counts }, narrator })
  },
  setPanel: (activePanel) => set({ activePanel }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
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
      screen: state.screen === 'battle' ? 'jianghu' : state.screen,
      player: state.player,
      quests: state.quests,
      world: state.world,
      settings: state.settings,
      rngState: state.rngState,
    }
  },
  hydrateSave: (save) => set({
    screen: save.screen,
    player: save.player,
    quests: save.quests,
    world: save.world,
    settings: save.settings,
    rngState: save.rngState,
    battle: null,
    activeDialogue: null,
    activePanel: null,
    saveStatus: 'saved',
  }),
  importSave: (save) => get().hydrateSave(save),
}))

