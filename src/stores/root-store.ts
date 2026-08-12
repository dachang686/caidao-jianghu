import { create } from 'zustand'
import { CHAPTER_GATHERING_ITEMS, activateChapterHotspot, chooseChapterDialogue, collectChapterNode, createChapterRuntimeSnapshot, getChapterDialogueView, interactWithChapterNpc, isRuntimeChapterId } from './chapter-runtime'
import type { ChapterRuntimeSnapshot } from './chapter-runtime'
import { CORE_ENDINGS } from '../content/endings/core'
import { contentManifest } from '../content/manifest'
import { coreCookingItems, coreCookingRecipes, coreFoodBuffs } from '../content/recipes/cooking'
import { coreForgingEquipment, coreForgingItems, coreForgingRecipes } from '../content/recipes/forging'
import { coreActiveSkills } from '../content/skills'
import { CH01_ENEMY_DEFINITIONS } from '../content/enemies/ch01'
import { CH02_ENEMY_DEFINITIONS } from '../content/enemies/ch02'
import { CH03_ENEMY_DEFINITIONS } from '../content/enemies/ch03'
import { CH04_ENEMY_DEFINITIONS } from '../content/enemies/ch04'
import { CH05_ENEMY_DEFINITIONS } from '../content/enemies/ch05'
import { CH06_ENEMY_DEFINITIONS } from '../content/enemies/ch06'
import { CH07_ENEMY_DEFINITIONS } from '../content/enemies/ch07'
import { CH08_ENEMY_DEFINITIONS } from '../content/enemies/ch08'
import { discipleDefinitions, discipleTraitDefinitions } from '../content/sect/disciples'
import { sectFacilityDefinitions } from '../content/sect/facilities'
import { ALL_UNLOCKABLES } from '../content/unlockables'
import { POSTGAME_COMMISSION_PACK } from '../content/commissions/postgame'
import { EMPTY_UNLOCKABLE_SNAPSHOT, createUnlockableEngine, deriveTitleCombatStats } from '../systems/unlocks'
import { DEFAULT_KEY_BINDINGS, updateGameSettings } from '../systems/input'
import { applyEndingChoice, createEndingState, selectEnding } from '../systems/endings'
import { createCookingEngine } from '../systems/crafting/cooking'
import { createForgingEngine } from '../systems/crafting/forging'
import { CombatTurnEngine, createFoodBuffEngine } from '../systems/combat'
import { createPostgameLoopEngine } from '../systems/postgame'
import { advanceDispatch, claimDispatch, createDispatchEngine, previewDiscipleDispatch, recruitDisciple, upgradeFacility } from '../systems/sect'
import { addItem, createEquipmentLoadout, createInventoryState, equipEquipment, recalculateEquipmentStats, removeItem, unequipEquipment } from '../systems/inventory'
import { applyStrengtheningBonuses, attemptStrengthening, createStrengtheningState } from '../systems/equipment'
import { SkillLoadoutError, SkillRegistry, createSkillProgressState, equipSkill, reorderSkillSlots, resetSkillPoints, unlockSkill, unequipSkill } from '../systems/skills'
import type { DomainEvent } from '../types/events'
import type { DialogueView } from '../types/dialogue'
import type { UnlockableSnapshot } from '../types/unlockable'
import type { ConditionContext } from '../types/conditions'
import type { EndingRecordResult, EndingRecordState, EndingSelection } from '../types/ending'
import { BASE_STATS, ITEMS, SKILLS, TALENTS } from '../game/data'
import { settleCh01BossVictory } from '../game/chapter-combat'
import { settleCh02BossVictory } from '../game/chapter-combat-ch02'
import { settleCh03BossVictory } from '../game/chapter-combat-ch03'
import { settleCh04BossVictory } from '../game/chapter-combat-ch04'
import { settleCh05BossVictory } from '../game/chapter-combat-ch05'
import { settleCh06BossVictory } from '../game/chapter-combat-ch06'
import { settleCh07BossVictory } from '../game/chapter-combat-ch07'
import { settleCh08BossVictory } from '../game/chapter-combat-ch08'
import { makeGameSaveV2 } from './save-bridge'
import type { GameSaveV2 } from '../types/save'
import { createWorldContentCatalog, enterRegion as enterWorldRegionState, getLocationAvailability, listRegionAvailability, restoreWorldNavigationState } from '../systems/world'
import { getStoreServices } from './services'
import type { WorldConditionContext, WorldLocationRecord, WorldNavigationState, RegionLoadError } from '../types/world'
import type { WorldRegionId } from '../types/ids'
import type { GatheringNodeId, HotspotId, NpcId } from '../types/ids'
import type { EquipmentLoadout, EquipmentSlot } from '../types/equipment'
import type { InventoryState, ItemDefinition } from '../types/item'
import type { CookResult, CookingSnapshot, ForgeResult, ForgingSnapshot } from '../types/recipe'
import type { DerivedCombatStats, SkillDefinition as ActiveSkillDefinition, SkillProgressState } from '../types/skill'
import type { FoodBuffSnapshot } from '../types/food'
import type { ChapterEnemyDefinition } from '../types/chapter-combat'
import type { StrengtheningState } from '../types/strengthening'
import { createSectState } from '../types/sect'
import type { SectFacilityId, SectState } from '../types/sect'
import type { SectDispatchSnapshot } from '../types/dispatch'
import type { PostgameDifficulty, PostgameState } from '../types/postgame'
import type {
  BattleLogEntry,
  BattleState,
  BattleStatus,
  CombatStats,
  EnemyState,
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
  worldNavigation: WorldNavigationState
  worldLocation: WorldLocationRecord | null
  worldLocationLoadState: 'idle' | 'loading' | 'ready' | 'error'
  worldLocationError: RegionLoadError | null
  chapterRuntime: ChapterRuntimeSnapshot
  settings: GameSettings
  rngState: number
  battle: BattleState | null
  skillProgress: SkillProgressState
  inventoryState: InventoryState
  equipmentLoadout: EquipmentLoadout
  equipmentIds: readonly string[]
  equipmentStrengthening: Readonly<Record<string, StrengtheningState>>
  forgingSnapshot: ForgingSnapshot
  cookingSnapshot: CookingSnapshot
  foodBuffSnapshot: FoodBuffSnapshot
  workshopMessage: string
  sect: SectState
  dispatch: SectDispatchSnapshot
  postgame: PostgameState
  sectMessage: string
  activePanel: PanelId
  activeDialogue: 'oldMan' | 'aunt' | 'cat' | 'bai' | null
  activeChapterDialogue: import('./chapter-runtime').RuntimeChapterId | null
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
  openChapterDialogue: () => void
  closeChapterDialogue: () => void
  getActiveChapterDialogueView: () => DialogueView | null
  chooseChapterDialogue: (choiceId: string, confirmed?: boolean) => void
  meetOldMan: () => void
  acceptCatQuest: () => void
  resolveCatQuest: (choice: CatChoice) => void
  startChapterTwo: () => void
  startChapterThree: () => void
  startChapterFour: () => void
  startChapterFive: () => void
  startChapterSix: () => void
  startChapterSeven: () => void
  startChapterEight: () => void
  interactWithChapterNpc: (npcId: string) => void
  activateChapterHotspot: (hotspotId: string) => void
  collectChapterNode: (nodeId: string) => void
  startBattle: (battleId?: StoreBattleId) => void
  useSkill: (skillId: string) => void
  retryBattle: () => void
  leaveBattle: () => void
  recordEndingChoice: (choiceId: string, confirmed: boolean) => EndingRecordResult | null
  continuePostgame: () => void
  setPostgameDifficulty: (difficulty: PostgameDifficulty) => void
  generatePostgameCommission: () => void
  completePostgameCommission: (instanceId: string) => void
  claimPostgameCommission: (instanceId: string) => void
  recordNpcClick: (npcId: string) => void
  setPanel: (panel: PanelId) => void
  setSettings: (settings: Partial<GameSettings>) => void
  useItem: (itemId: ItemId) => void
  equipWeapon: (itemId: ItemId) => void
  openCrafting: () => void
  openCooking: () => void
  closeWorkshop: () => void
  craftRecipe: (recipeId: string) => ForgeResult | null
  cookRecipe: (recipeId: string) => CookResult | null
  consumeFoodItem: (itemId: string) => void
  unlockActiveSkill: (skillId: string) => void
  equipActiveSkill: (skillId: string, slot: number) => void
  unequipActiveSkill: (slot: number) => void
  reorderActiveSkills: (from: number, to: number) => void
  resetActiveSkills: () => void
  equipInventoryEquipment: (equipmentId: string) => void
  unequipInventoryEquipment: (slot: EquipmentSlot) => void
  strengthenInventoryEquipment: (equipmentId: string) => void
  upgradeSectFacility: (facilityId: SectFacilityId) => void
  recruitSectDisciple: (discipleId: string) => void
  startSectDispatch: (discipleIds: readonly string[]) => void
  claimSectDispatch: (dispatchId: string) => void
  toggleBossKey: () => void
  setSaveStatus: (status: RootGameStore['saveStatus']) => void
  maybeNarrate: (id: string, text: string) => void
  dismissNarrator: () => void
  openWorldMap: () => void
  getWorldRegions: () => ReturnType<typeof listRegionAvailability>
  enterWorldRegion: (regionId: WorldRegionId) => Promise<void>
  retryWorldRegion: () => Promise<void>
  returnToWorldMap: () => void
  resumeWorldChapter: () => void
  makeSaveV2: () => GameSaveV2 | null
  hydrateSaveV2: (save: GameSaveV2) => void
  importSaveV2: (save: GameSaveV2) => void
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

const gameplayItems: readonly ItemDefinition[] = Array.from(new Map([...coreForgingItems, ...coreCookingItems, ...CHAPTER_GATHERING_ITEMS].map((item) => [String(item.id), item])).values())
const starterSkills: readonly ActiveSkillDefinition[] = Object.values(SKILLS).map((skill) => ({
  id: skill.id,
  name: skill.name,
  description: skill.description,
  school: skill.kind === 'attack' ? 'dao' : skill.kind === 'control' ? 'mouth' : 'survival',
  target: skill.kind === 'defend' ? 'self' : 'enemy',
  qiCost: skill.qiCost,
  cooldown: skill.cooldown,
  effects: skill.power ? [{ type: 'damage', power: skill.power }] : [{ type: 'guard', ratio: 0.5, turns: 1 }],
  preview: { summary: skill.description, values: {} },
}))
const coreSkillRegistry = new SkillRegistry([...coreActiveSkills, ...starterSkills])
const STARTER_SKILL_IDS = ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'] as const
const STARTER_ITEM_COUNTS: Readonly<Record<string, number>> = {
  'item:iron-scrap': 8,
  'item:spirit-stone': 4,
  'item:herb': 8,
  'item:wood': 4,
  'item:grain': 6,
  'item:spice': 6,
  'item:fish': 4,
}

function createPlayerInventory(): InventoryState {
  let inventory = createInventoryState(24)
  Object.entries(STARTER_ITEM_COUNTS).forEach(([itemId, count]) => {
    const item = gameplayItems.find((candidate) => String(candidate.id) === itemId)
    if (item) inventory = addItem(inventory, item, count)
  })
  return inventory
}

function restorePlayerInventory(stacks: readonly { readonly itemId: string; readonly count: number }[]): InventoryState {
  let inventory = createInventoryState(24)
  stacks.forEach((stack) => {
    const item = gameplayItems.find((candidate) => String(candidate.id) === stack.itemId)
    if (item && Number.isInteger(stack.count) && stack.count > 0) inventory = addItem(inventory, item, stack.count)
  })
  return inventory
}

function strengtheningMaterials(inventory: InventoryState): Readonly<Record<string, number>> {
  return Object.fromEntries(inventory.stacks.map((stack) => [stack.itemId, stack.count]))
}

function restoreStrengtheningState(
  equipmentId: string,
  saved: Pick<StrengtheningState, 'level' | 'bonus' | 'attemptCount' | 'history'>,
  player: PlayerState,
  inventory: InventoryState,
): StrengtheningState {
  return createStrengtheningState(equipmentId, { ...saved, silver: player.silver, materials: strengtheningMaterials(inventory) })
}

function createInitialSkillProgress(level = 1): SkillProgressState {
  const state = createSkillProgressState(level)
  return {
    ...state,
    unlockedSkillIds: [...STARTER_SKILL_IDS],
    loadout: [...STARTER_SKILL_IDS, null, null],
  }
}

function toPlayerActiveSkills(progress: SkillProgressState): string[] {
  return progress.loadout.filter((skillId): skillId is string => skillId !== null)
}

function restoreSkillProgress(level: number, skills: { readonly unlockedSkillIds: readonly string[]; readonly activeSkillIds: readonly string[]; readonly skillPoints: number }): SkillProgressState {
  const base = createSkillProgressState(level)
  const unlockedSkillIds = skills.unlockedSkillIds.filter((skillId) => coreSkillRegistry.has(skillId))
  const loadout = [...skills.activeSkillIds.filter((skillId) => unlockedSkillIds.includes(skillId)).slice(0, 6), null, null, null, null, null].slice(0, 6)
  const spentSkillPoints = Math.max(0, Math.min(base.earnedSkillPoints, base.earnedSkillPoints - Math.max(0, skills.skillPoints)))
  return { ...base, unlockedSkillIds, loadout, spentSkillPoints, ranks: Object.fromEntries(unlockedSkillIds.map((skillId) => [skillId, 1])) }
}

function baseDerivedCombatStats(player: PlayerState): DerivedCombatStats {
  return {
    maxHp: player.maxHp,
    maxQi: player.maxQi,
    attack: player.stats.attack,
    defense: player.stats.defense,
    posture: 25,
    accuracy: player.stats.accuracy,
    dodge: player.stats.dodge,
    crit: player.stats.crit,
    qiRecovery: 3,
    healingMultiplier: 1,
    damageWhenPostureBroken: 0,
  }
}

function deriveEquipmentCombatStats(player: PlayerState, loadout: EquipmentLoadout, foodBuffSnapshot: FoodBuffSnapshot, equipmentStrengthening: Readonly<Record<string, StrengtheningState>>, sect: SectState): DerivedCombatStats {
  const equipped = applyStrengtheningBonuses(
    recalculateEquipmentStats(baseDerivedCombatStats(player), loadout, coreForgingEquipment),
    Object.values(loadout).flatMap((equipmentId) => equipmentId ? [equipmentStrengthening[equipmentId]?.bonus ?? {}] : []),
  )
  const modifiers = createFoodBuffEngine({ foods: coreFoodBuffs, items: gameplayItems }, foodBuffSnapshot).getModifiers()
  return {
    ...equipped,
    attack: Math.max(0, (equipped.attack + sect.benefits.combatAttackBonus) * modifiers.attackMultiplier),
    defense: Math.max(0, equipped.defense + sect.benefits.combatDefenseBonus + modifiers.defenseDelta),
    accuracy: Math.max(0, Math.min(1, equipped.accuracy + modifiers.accuracyDelta)),
    crit: Math.max(0, Math.min(1, equipped.crit + modifiers.critDelta)),
    qiRecovery: Math.max(0, equipped.qiRecovery + modifiers.qiRecoveryDelta),
    healingMultiplier: Math.max(0, equipped.healingMultiplier * modifiers.healingMultiplier),
  }
}

function combatStatsWithEquipment(player: PlayerState, loadout: EquipmentLoadout, foodBuffSnapshot: FoodBuffSnapshot, equipmentStrengthening: Readonly<Record<string, StrengtheningState>>, sect: SectState): CombatStats {
  const derived = deriveEquipmentCombatStats(player, loadout, foodBuffSnapshot, equipmentStrengthening, sect)
  return {
    ...player.stats,
    attack: derived.attack,
    defense: derived.defense,
    accuracy: derived.accuracy,
    dodge: derived.dodge,
    crit: derived.crit,
  }
}

function advanceFoodBuffSnapshot(snapshot: FoodBuffSnapshot, battleId: string, outcome: 'won' | 'lost'): FoodBuffSnapshot {
  const engine = createFoodBuffEngine({ foods: coreFoodBuffs, items: gameplayItems }, snapshot)
  return engine.advanceBattle({ id: `battle:completed:${battleId}`, type: 'battle.completed', occurredAtTick: snapshot.battleTick, sourceActionId: `battle:completed:${battleId}`, payload: { battleId, outcome } }).state
}

function advanceSectDispatchSnapshot(snapshot: SectDispatchSnapshot, battleId: string): SectDispatchSnapshot {
  const engine = createDispatchEngine(snapshot)
  return advanceDispatch(engine, {
    id: `battle:completed:${battleId}`,
    type: 'battle.completed',
    occurredAtTick: snapshot.battleTick,
    sourceActionId: `battle:completed:${battleId}`,
    payload: { battleId, outcome: 'won' },
  }).state
}

function chapterNumber(chapterId: WorldState['currentChapter']): number {
  return Number(chapterId.slice(2))
}

function gameplayConditionContext(state: Pick<RootGameStore, 'inventoryState' | 'player' | 'quests' | 'world'>): ConditionContext {
  return {
    quests: Object.fromEntries(state.quests.map((quest) => [quest.id, quest.status])),
    inventory: Object.fromEntries(state.inventoryState.stacks.map((stack) => [stack.itemId, stack.count])),
    stats: { moral: state.player?.moral ?? 0, wealth: state.player?.silver ?? 0 },
    flags: { forgingUnlocked: state.world.systemUnlocks.forging, cookingUnlocked: state.world.systemUnlocks.cooking },
  }
}

function sectConditionContext(state: Pick<RootGameStore, 'inventoryState' | 'player' | 'quests' | 'world' | 'sect'>): ConditionContext {
  const base = gameplayConditionContext(state)
  const chapterFiveComplete = state.world.ch05TwinBanditsDefeated
  return {
    ...base,
    stats: {
      moral: state.player?.moral ?? 0,
      fame: state.sect.benefits.fameBonus,
      wealth: state.player?.silver ?? 0,
      sectProsperity: Object.values(state.sect.facilities).reduce((total, level) => total + level, 0),
    },
    flags: {
      ...base.flags,
      met_showoff_runner: chapterFiveComplete,
      met_forge_keeper: chapterFiveComplete,
      met_kitchen_helper: chapterFiveComplete,
      heard_rumor_network: chapterFiveComplete,
      settled_sect_ledger: chapterFiveComplete,
    },
  }
}

function makeEndingContext(player: PlayerState, world: WorldState, sect: SectState = createSectState()): ConditionContext {
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
  const fame = defeatedBosses * 5 + player.titles.length * 2 + sect.benefits.fameBonus
  return {
    quests: {},
    inventory: player.inventory,
    stats: {
      moral: player.moral,
      fame,
      wealth: player.silver,
      sectProsperity: Object.values(sect.facilities).reduce((total, level) => total + level, 0),
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
type StoreNormalBattleId =
  | 'ch01:river-thug' | 'ch01:pantry-pickpocket'
  | 'ch02:ranking-scribe' | 'ch02:bridge-skulker'
  | 'ch03:fortress-scout' | 'ch03:kitchen-raider'
  | 'ch04:gate-disciple' | 'ch04:mist-sword-disciple'
  | 'ch05:road-raider' | 'ch05:masked-raider'
  | 'ch06:dock-smuggler' | 'ch06:hook-raider'
  | 'ch07:archive-guard' | 'ch07:ranking-enforcer'
  | 'ch08:rival-martialist' | 'ch08:convention-enforcer'
type StoreBattleId = StoreChapterId | StoreNormalBattleId

interface NormalEncounterProfile {
  readonly battleId: StoreNormalBattleId
  readonly runtimeId: EnemyState['id']
  readonly chapterId: StoreChapterId
  readonly contentEnemyId: string
  readonly definitions: readonly ChapterEnemyDefinition[]
}

const NORMAL_ENCOUNTERS: readonly NormalEncounterProfile[] = [
  { battleId: 'ch01:river-thug', runtimeId: 'riverThug', chapterId: 'ch01', contentEnemyId: 'enemy:ch01:river-thug', definitions: CH01_ENEMY_DEFINITIONS },
  { battleId: 'ch01:pantry-pickpocket', runtimeId: 'pantryPickpocket', chapterId: 'ch01', contentEnemyId: 'enemy:ch01:pantry-pickpocket', definitions: CH01_ENEMY_DEFINITIONS },
  { battleId: 'ch02:ranking-scribe', runtimeId: 'rankingScribe', chapterId: 'ch02', contentEnemyId: 'enemy:ch02:ranking-scribe', definitions: CH02_ENEMY_DEFINITIONS },
  { battleId: 'ch02:bridge-skulker', runtimeId: 'bridgeSkulker', chapterId: 'ch02', contentEnemyId: 'enemy:ch02:bridge-skulker', definitions: CH02_ENEMY_DEFINITIONS },
  { battleId: 'ch03:fortress-scout', runtimeId: 'fortressScout', chapterId: 'ch03', contentEnemyId: 'enemy:ch03:fortress-scout', definitions: CH03_ENEMY_DEFINITIONS },
  { battleId: 'ch03:kitchen-raider', runtimeId: 'kitchenRaider', chapterId: 'ch03', contentEnemyId: 'enemy:ch03:kitchen-raider', definitions: CH03_ENEMY_DEFINITIONS },
  { battleId: 'ch04:gate-disciple', runtimeId: 'gateDisciple', chapterId: 'ch04', contentEnemyId: 'enemy:ch04:gate-disciple', definitions: CH04_ENEMY_DEFINITIONS },
  { battleId: 'ch04:mist-sword-disciple', runtimeId: 'mistSwordDisciple', chapterId: 'ch04', contentEnemyId: 'enemy:ch04:mist-sword-disciple', definitions: CH04_ENEMY_DEFINITIONS },
  { battleId: 'ch05:road-raider', runtimeId: 'roadRaider', chapterId: 'ch05', contentEnemyId: 'enemy:ch05:road-raider', definitions: CH05_ENEMY_DEFINITIONS },
  { battleId: 'ch05:masked-raider', runtimeId: 'maskedRaider', chapterId: 'ch05', contentEnemyId: 'enemy:ch05:masked-raider', definitions: CH05_ENEMY_DEFINITIONS },
  { battleId: 'ch06:dock-smuggler', runtimeId: 'dockSmuggler', chapterId: 'ch06', contentEnemyId: 'enemy:ch06:dock-smuggler', definitions: CH06_ENEMY_DEFINITIONS },
  { battleId: 'ch06:hook-raider', runtimeId: 'hookRaider', chapterId: 'ch06', contentEnemyId: 'enemy:ch06:hook-raider', definitions: CH06_ENEMY_DEFINITIONS },
  { battleId: 'ch07:archive-guard', runtimeId: 'archiveGuard', chapterId: 'ch07', contentEnemyId: 'enemy:ch07:archive-guard', definitions: CH07_ENEMY_DEFINITIONS },
  { battleId: 'ch07:ranking-enforcer', runtimeId: 'rankingEnforcer', chapterId: 'ch07', contentEnemyId: 'enemy:ch07:ranking-enforcer', definitions: CH07_ENEMY_DEFINITIONS },
  { battleId: 'ch08:rival-martialist', runtimeId: 'rivalMartialist', chapterId: 'ch08', contentEnemyId: 'enemy:ch08:rival-martialist', definitions: CH08_ENEMY_DEFINITIONS },
  { battleId: 'ch08:convention-enforcer', runtimeId: 'conventionEnforcer', chapterId: 'ch08', contentEnemyId: 'enemy:ch08:convention-enforcer', definitions: CH08_ENEMY_DEFINITIONS },
]

function normalEncounterForBattle(battleId: StoreBattleId): NormalEncounterProfile | undefined {
  return NORMAL_ENCOUNTERS.find((encounter) => encounter.battleId === battleId)
}

function normalEncounterForEnemy(enemyId: EnemyState['id']): NormalEncounterProfile | undefined {
  return NORMAL_ENCOUNTERS.find((encounter) => encounter.runtimeId === enemyId)
}

function normalOffensiveMove(profile: NormalEncounterProfile) {
  const definition = profile.definitions.find((candidate) => String(candidate.id) === profile.contentEnemyId)
  const move = definition?.moves.find((candidate) => typeof candidate.power === 'number' && candidate.power > 0)
  if (!definition || !move) throw new Error(`缺少普通敌人「${profile.contentEnemyId}」的可执行招式。`)
  return { definition, move }
}

function chapterForBattle(battleId: StoreBattleId): StoreChapterId {
  return normalEncounterForBattle(battleId)?.chapterId ?? battleId as StoreChapterId
}

function isChapterBoss(enemyId: EnemyState['id']): boolean {
  return ['baiDaxia', 'bangsi', 'blackwindLeader', 'qingyunMaster', 'twinBandits', 'tideMaster', 'rankingGovernor', 'rankingMaster'].includes(enemyId)
}

function makeNormalEnemy(profile: NormalEncounterProfile): EnemyState {
  const { definition } = normalOffensiveMove(profile)
  const curve = definition.curve
  const maxHp = curve.maxHp.base
  const maxQi = curve.maxQi.base
  return {
    id: profile.runtimeId,
    normalChapter: profile.chapterId,
    name: definition.name,
    hp: maxHp,
    maxHp,
    qi: maxQi,
    maxQi,
    stats: { attack: curve.attack.base, defense: curve.defense.base, speed: 7, crit: curve.crit?.base ?? 0, dodge: curve.dodge?.base ?? 0, accuracy: curve.accuracy?.base ?? 0.85 },
    phase: 1,
    statuses: [],
  }
}

function makeEnemy(battleId: StoreBattleId = 'ch01'): EnemyState {
  const normalEncounter = normalEncounterForBattle(battleId)
  if (normalEncounter) return makeNormalEnemy(normalEncounter)
  const chapterId = battleId
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
  const normalEncounter = normalEncounterForEnemy(enemy.id)
  if (normalEncounter) {
    const { move } = normalOffensiveMove(normalEncounter)
    const power = move.power ?? 1
    const posture = move.posturePower ?? 0
    const expectedDamage = Math.max(1, Math.round((enemy.stats.attack * power * 100) / (player.stats.defense + 100)))
    return {
      id: `intent:${normalEncounter.battleId}:${move.id}`,
      label: move.name,
      summary: `预计造成约 ${expectedDamage} 点伤害，并削减 ${posture} 点架势。`,
      expectedDamage,
      expectedPostureDamage: posture,
      honest: true,
    }
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

function makeBattle(battleId: StoreBattleId = 'ch01'): BattleState {
  const enemy = makeEnemy(battleId)
  const isBangsi = enemy.id === 'bangsi'
  const isBlackwindLeader = enemy.id === 'blackwindLeader'
  const isQingyunMaster = enemy.id === 'qingyunMaster'
  const isLateBoss = ['twinBandits', 'tideMaster', 'rankingGovernor', 'rankingMaster'].includes(enemy.id)
  const isNormalEncounter = !isChapterBoss(enemy.id)
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
      summary: isNormalEncounter ? `${enemy.name}的招式会提前明示，先看清再出刀。` : isBangsi ? '榜下捕快正在摊开卷宗，下一步大概率是红印落榜。空白卷宗也会提前明示。' : isBlackwindLeader ? '黑风寨主正在抖空旗，下一步大概率是旗影断粮。空旗反卷也会提前明示。' : isQingyunMaster ? '青云掌门正在展开剑谱，下一步大概率是门规点名。礼法反噬也会提前明示。' : isLateBoss ? `${lateBossName}正在准备第一份公开意图，特殊规则也会提前明示。` : '白大侠正在摆架势，下一步大概率是降龙十巴掌。',
      expectedDamage: isNormalEncounter ? Math.max(1, Math.round((enemy.stats.attack * (enemy.id === 'riverThug' ? .9 : .82) * 100) / 115)) : isBangsi ? 19 : isBlackwindLeader ? 22 : isQingyunMaster ? 23 : enemy.id === 'twinBandits' ? 25 : enemy.id === 'tideMaster' ? 26 : enemy.id === 'rankingGovernor' ? 28 : enemy.id === 'rankingMaster' ? 30 : 18,
      expectedPostureDamage: isNormalEncounter ? (enemy.id === 'riverThug' ? 6 : 4) : isBlackwindLeader ? 11 : isQingyunMaster ? 11 : isLateBoss ? 12 : 10,
      honest: true,
    },
    turn: 'player',
    round: 1,
    logs: [{ id: 'opening', text: isNormalEncounter ? `${enemy.name}摆开架势：招式写在脸上，别说我没提前通知。` : isBangsi ? '榜下捕快抖了抖卷宗：今天让你见识一下什么叫公文正派。' : isBlackwindLeader ? '黑风寨主抖了抖空旗：今天让你见识一下什么叫山寨冲榜。' : isQingyunMaster ? '青云掌门展开剑谱：今天让你见识一下什么叫门面工程。' : isLateBoss ? `${lateBossName}把证据摆上台面：今天让你见识一下什么叫公开验收。` : '白大侠掸了掸衣角：今天让你见识一下什么叫名门正派。', kind: 'system' }],
    rewardGranted: false,
  }
}

const starterBattleSkillConfigs = {
  basicSlash: { qi: 0, cooldown: 0, power: 1 },
  cleaverWhirl: { qi: 12, cooldown: 2, power: 1.55 },
  mockery: { qi: 10, cooldown: 3, power: 0.55 },
  playDead: { qi: 8, cooldown: 3, power: 0 },
} as const

function battleSkillConfig(skillId: string): { qi: number; cooldown: number; power: number } | null {
  const coreSkill = coreActiveSkills.find((candidate) => String(candidate.id) === skillId)
  if (coreSkill) {
    const damageEffect = coreSkill.effects.find((effect) => effect.type === 'damage')
    return { qi: coreSkill.qiCost, cooldown: coreSkill.cooldown, power: damageEffect?.type === 'damage' ? damageEffect.power : 0 }
  }
  return starterBattleSkillConfigs[skillId as keyof typeof starterBattleSkillConfigs] ?? null
}

let combatTurnEngine: CombatTurnEngine | null = null

function createBattleTurnEngine(player: PlayerState, battle: BattleState, rngState: number, loadout: EquipmentLoadout, foodBuffSnapshot: FoodBuffSnapshot, equipmentStrengthening: Readonly<Record<string, StrengtheningState>>, sect: SectState): CombatTurnEngine {
  const stats = deriveEquipmentCombatStats(player, loadout, foodBuffSnapshot, equipmentStrengthening, sect)
  const engine = new CombatTurnEngine({
    player: {
      id: 'player', name: player.name, hp: player.hp, maxHp: player.maxHp, qi: player.qi, maxQi: player.maxQi,
      attack: stats.attack, defense: stats.defense, statuses: battle.playerStatuses,
    },
    enemy: {
      id: battle.enemy.id, name: battle.enemy.name, hp: battle.enemy.hp, maxHp: battle.enemy.maxHp, qi: battle.enemy.qi, maxQi: battle.enemy.maxQi,
      attack: battle.enemy.stats.attack, defense: battle.enemy.stats.defense, statuses: battle.enemy.statuses,
    },
    skills: player.activeSkills.flatMap((skillId) => {
      const config = battleSkillConfig(skillId)
      return config ? [{ id: skillId, qiCost: config.qi, cooldown: config.cooldown }] : []
    }),
    rng: { seed: 987654321, state: rngState },
  })
  engine.start()
  return engine
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

function worldConditionContext(state: Pick<RootGameStore, 'player' | 'quests' | 'world' | 'worldNavigation'>): WorldConditionContext {
  const player = state.player
  const flags: Record<string, boolean> = {
    ch01_mainline_complete: state.world.baiDefeated,
    ch02_mainline_complete: state.world.ch02BangsiDefeated,
    ch03_mainline_complete: state.world.ch03BlackwindLeaderDefeated,
    ch04_mainline_complete: state.world.ch04QingyunMasterDefeated,
    ch05_mainline_complete: state.world.ch05TwinBanditsDefeated,
    ch06_mainline_complete: state.world.ch06TideMasterDefeated,
    ch07_mainline_complete: state.world.ch07RankingGovernorDefeated,
  }
  return {
    quests: Object.fromEntries(state.quests.map((quest) => [quest.id, quest.status])),
    inventory: player?.inventory ?? [],
    stats: { moral: player?.moral ?? 0, fame: 0, wealth: player?.silver ?? 0, sectProsperity: state.world.systemUnlocks.sectCreation ? 8 : 0 },
    flags,
    currentRegionId: state.worldNavigation.currentRegionId,
    currentLocationId: state.worldNavigation.currentLocationId,
  }
}

function chapterRuntimeContext(state: Pick<RootGameStore, 'inventoryState' | 'world'>) {
  return {
    inventory: state.inventoryState,
    flags: {
      ch01_mainline_complete: state.world.baiDefeated,
      ch02_mainline_complete: state.world.ch02MainlineComplete,
      ch03_mainline_complete: state.world.ch03MainlineComplete,
      ch04_mainline_complete: state.world.ch04MainlineComplete,
      ch05_mainline_complete: state.world.ch05MainlineComplete,
      ch06_mainline_complete: state.world.ch06MainlineComplete,
      ch07_mainline_complete: state.world.ch07MainlineComplete,
    },
  }
}

function postgameProsperity(state: Pick<RootGameStore, 'sect'>): number {
  return Object.values(state.sect.facilities).reduce((total, level) => total + level, 0)
}

function postgameContext(state: Pick<RootGameStore, 'worldNavigation' | 'postgame' | 'rngState' | 'endingRecordState' | 'sect'>) {
  return {
    chapter: 8,
    unlockedRegionIds: state.worldNavigation.unlockedRegionIds,
    progress: state.postgame.commission.progress + 1,
    rng: { seed: 987654321, state: state.rngState },
    completedEndingIds: state.endingRecordState.seenIds,
    prosperity: postgameProsperity(state),
  }
}

function worldFromChapterRuntime(world: WorldState, runtime: ChapterRuntimeSnapshot): WorldState {
  const flags = runtime.effects.flags
  const updates: Partial<WorldState> = {}
  for (const chapter of ['ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08'] as const) {
    const chapterNumber = chapter.slice(2)
    const mainlineKey = `ch${chapterNumber}MainlineComplete` as keyof WorldState
    const readyKey = `ch${chapterNumber}BossReady` as keyof WorldState
    const autosaveKey = `ch${chapterNumber}AutosaveCheckpoint` as keyof WorldState
    if (flags[`${chapter}_mainline_complete`] === true) (updates as Record<string, boolean>)[mainlineKey] = true
    if (flags[`${chapter}_boss_ready`] === true) (updates as Record<string, boolean>)[readyKey] = true
    if (flags[`${chapter}_autosave_checkpoint`] === true) (updates as Record<string, boolean>)[autosaveKey] = true
  }
  return { ...world, ...updates }
}

function navigationForChapter(state: RootGameStore, chapterId: WorldState['currentChapter']): WorldNavigationState {
  const region = contentManifest.regions.find((candidate) => candidate.chapterId === chapterId)
  if (!region) return state.worldNavigation
  return {
    unlockedRegionIds: state.worldNavigation.unlockedRegionIds.includes(region.id)
      ? state.worldNavigation.unlockedRegionIds
      : [...state.worldNavigation.unlockedRegionIds, region.id],
    currentRegionId: region.id,
    currentLocationId: region.entryLocationId,
    returnPath: [],
  }
}

function createPlayerSliceState(): Pick<RootGameStore, 'player' | 'rngState'> {
  return {
    player: null,
    rngState: 987654321,
  }
}

function createQuestSliceState(): Pick<RootGameStore, 'quests'> {
  return {
    quests: EMPTY_QUESTS.map((quest) => ({ ...quest })),
  }
}

function createBattleSliceState(): Pick<RootGameStore, 'battle'> {
  return {
    battle: null,
  }
}

function createGameplaySliceState(): Pick<RootGameStore, 'skillProgress' | 'inventoryState' | 'equipmentLoadout' | 'equipmentIds' | 'equipmentStrengthening' | 'forgingSnapshot' | 'cookingSnapshot' | 'foodBuffSnapshot' | 'workshopMessage' | 'sect' | 'dispatch' | 'postgame' | 'sectMessage'> {
  return {
    skillProgress: createInitialSkillProgress(),
    inventoryState: createPlayerInventory(),
    equipmentLoadout: createEquipmentLoadout(),
    equipmentIds: [],
    equipmentStrengthening: {},
    forgingSnapshot: { version: 1, craftedCounts: {}, processedActionIds: [] },
    cookingSnapshot: { version: 1, cookedCounts: {}, processedActionIds: [] },
    foodBuffSnapshot: { version: 1, active: [], battleTick: 0, processedBattleEventIds: [], processedActionIds: [] },
    workshopMessage: '',
    sect: createSectState(),
    dispatch: { battleTick: 0, tasks: [], processedBattleEventIds: [] },
    postgame: createPostgameLoopEngine(POSTGAME_COMMISSION_PACK).snapshot(),
    sectMessage: '',
  }
}

function createWorldSliceState(): Pick<RootGameStore, 'world' | 'worldNavigation' | 'worldLocation' | 'worldLocationLoadState' | 'worldLocationError' | 'chapterRuntime' | 'activeDialogue' | 'activeChapterDialogue' | 'narrator' | 'unlockables' | 'endingSelection' | 'endingRecordState'> {
  return {
    world: { ...EMPTY_WORLD },
    worldNavigation: restoreWorldNavigationState(contentManifest, null),
    worldLocation: null,
    worldLocationLoadState: 'idle',
    worldLocationError: null,
    chapterRuntime: createChapterRuntimeSnapshot(),
    activeDialogue: null,
    activeChapterDialogue: null,
    narrator: null,
    unlockables: { ...EMPTY_UNLOCKABLE_SNAPSHOT },
    endingSelection: null,
    endingRecordState: createEndingState(),
  }
}

function createSettingsSliceState(): Pick<RootGameStore, 'settings'> {
  return {
    settings: { ...DEFAULT_SETTINGS },
  }
}

function createShellSliceState(): Pick<RootGameStore, 'screen' | 'activePanel' | 'temporaryMode' | 'saveStatus'> {
  return {
    screen: 'menu',
    activePanel: null,
    temporaryMode: false,
    saveStatus: 'idle',
  }
}

function initialStoreState(): Pick<RootGameStore, 'screen' | 'player' | 'quests' | 'world' | 'worldNavigation' | 'worldLocation' | 'worldLocationLoadState' | 'worldLocationError' | 'chapterRuntime' | 'settings' | 'rngState' | 'battle' | 'skillProgress' | 'inventoryState' | 'equipmentLoadout' | 'equipmentIds' | 'equipmentStrengthening' | 'forgingSnapshot' | 'cookingSnapshot' | 'foodBuffSnapshot' | 'workshopMessage' | 'sect' | 'dispatch' | 'postgame' | 'sectMessage' | 'activePanel' | 'activeDialogue' | 'activeChapterDialogue' | 'narrator' | 'temporaryMode' | 'unlockables' | 'saveStatus' | 'endingSelection' | 'endingRecordState'> {
  return {
    ...createPlayerSliceState(),
    ...createQuestSliceState(),
    ...createBattleSliceState(),
    ...createGameplaySliceState(),
    ...createWorldSliceState(),
    ...createSettingsSliceState(),
    ...createShellSliceState(),
  }
}

/** 运行时唯一的 Zustand 实例。 */
export const useRootGameStore = create<RootGameStore>((set, get) => ({
  ...initialStoreState(),
  setScreen: (screen) => set({ screen, activePanel: null, activeDialogue: null, activeChapterDialogue: null }),
  startNewGame: (name, talent) => {
    const initial = initialStoreState()
    const skillProgress = createInitialSkillProgress()
    const player = makePlayer(name, talent)
    const unlockables = applyUnlockableEvents(
      EMPTY_UNLOCKABLE_SNAPSHOT,
      player.activeSkills.map((skillId) => unlockableEvent(`new-game:skill:${skillId}`, 'skill.obtained', { skillId })),
    )
    set({ ...initial, player, skillProgress, unlockables, screen: 'jianghu', narrator: '说书人：一把菜刀，一袋盘缠，你的江湖看起来预算不太充足。' })
  },
  openDialogue: (activeDialogue) => {
    const state = get()
    const npcId = activeDialogue === 'oldMan' ? 'old-man' : activeDialogue === 'aunt' ? 'aunt' : activeDialogue === 'cat' ? 'cat' : activeDialogue === 'bai' ? 'bai' : null
    const unlockables = npcId
      ? applyUnlockableEvents(state.unlockables, [unlockableEvent(`npc:first-seen:${npcId}`, 'npc.first_seen', { npcId })])
      : state.unlockables
    set({ activeDialogue, activeChapterDialogue: null, activePanel: null, unlockables })
  },
  closeDialogue: () => set({ activeDialogue: null }),
  openChapterDialogue: () => {
    const state = get()
    if (!isRuntimeChapterId(state.world.currentChapter)) return
    set({ activeChapterDialogue: state.world.currentChapter, activeDialogue: null, activePanel: null })
  },
  closeChapterDialogue: () => set({ activeChapterDialogue: null }),
  getActiveChapterDialogueView: () => {
    const state = get()
    return state.activeChapterDialogue
      ? getChapterDialogueView(state.activeChapterDialogue, state.chapterRuntime, chapterRuntimeContext(state))
      : null
  },
  chooseChapterDialogue: (choiceId, confirmed = false) => {
    const state = get()
    const chapterId = state.activeChapterDialogue
    if (!chapterId || !state.player) return
    const result = chooseChapterDialogue(chapterId, state.chapterRuntime, chapterRuntimeContext(state), choiceId, confirmed)
    const world = worldFromChapterRuntime(state.world, result.runtime)
    set({
      chapterRuntime: result.runtime,
      world,
      player: result.gainedExperience > 0 ? { ...state.player, experience: state.player.experience + result.gainedExperience } : state.player,
      activeChapterDialogue: result.status === 'completed' ? null : chapterId,
      narrator: result.message,
    })
  },
  meetOldMan: () => {
    const state = get()
    if (state.world.oldManMet) return set({ activeDialogue: null })
    const unlockables = applyUnlockableEvents(state.unlockables, [
      unlockableEvent('npc:first-seen:old-man', 'npc.first_seen', { npcId: 'old-man' }),
      unlockableEvent('quest:completed:firstSteps', 'quest.completed', { questId: 'firstSteps' }),
    ])
    set({
      world: { ...state.world, oldManMet: true },
      quests: copyQuests(copyQuests(copyQuests(state.quests, 'firstSteps', { status: 'complete', progress: 1 }), 'findCat', { status: 'active' }), 'challengeBai', { status: 'active' }),
      unlockables,
      activeDialogue: null,
      narrator: '说书人：这老头看着不正经，教的招倒挺疼。',
    })
  },
  acceptCatQuest: () => {
    const state = get()
    if (state.world.catQuestAccepted || !state.world.oldManMet) return
    const unlockables = applyUnlockableEvents(state.unlockables, [
      unlockableEvent('npc:first-seen:aunt', 'npc.first_seen', { npcId: 'aunt' }),
      unlockableEvent('npc:first-seen:cat', 'npc.first_seen', { npcId: 'cat' }),
    ])
    set({ world: { ...state.world, catQuestAccepted: true }, quests: copyQuests(state.quests, 'findCat', { status: 'active', progress: 0 }), unlockables, activeDialogue: null })
  },
  resolveCatQuest: (choice) => {
    const state = get()
    const player = state.player
    if (!player || !state.world.catQuestAccepted || state.world.catResolved) return
    let nextPlayer: PlayerState = { ...player }
    if (choice === 'coax') nextPlayer = { ...nextPlayer, moral: nextPlayer.moral + 2, experience: nextPlayer.experience + 12 }
    if (choice === 'bribe') nextPlayer = { ...nextPlayer, silver: Math.max(0, nextPlayer.silver - 8), experience: nextPlayer.experience + 8 }
    if (choice === 'grab') nextPlayer = addTitle({ ...nextPlayer, hp: Math.max(1, nextPlayer.hp - 4), moral: nextPlayer.moral - 1, experience: nextPlayer.experience + 10 }, 'catScratchTrial')
    const unlockEvents = [
      unlockableEvent('quest:completed:findCat', 'quest.completed', { questId: 'findCat' }),
      ...(choice === 'grab' ? [unlockableEvent('title:earned:catScratchTrial', 'title.earned', { titleId: 'catScratchTrial' })] : []),
    ]
    set({
      player: nextPlayer,
      world: { ...state.world, catChoice: choice, catResolved: true },
      quests: copyQuests(state.quests, 'findCat', { status: 'complete', progress: 1 }),
      unlockables: applyUnlockableEvents(state.unlockables, unlockEvents),
      activeDialogue: null,
      narrator: choice === 'grab' ? '说书人：猫没回家，你先收获了江湖第一道伤。' : '说书人：大黄猫勉强同意，给你一个台阶下。',
    })
  },
  startChapterTwo: () => {
    const state = get()
    if (!state.player || !state.world.baiDefeated || state.world.currentChapter !== 'ch01') return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch02', ch02MainlineComplete: false, ch02BossReady: false, ch02BangsiDefeated: false, ch02AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch02'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：清河县的榜单缺了一页，刚好够你把下一章写上去。' })
  },
  startChapterThree: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch02' || !state.world.ch02BangsiDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch03', ch03MainlineComplete: false, ch03BossReady: false, ch03BlackwindLeaderDefeated: false, ch03AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch03'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：黑风寨的空旗正在冲榜，先去门口登记你的刀谱名号。' })
  },
  startChapterFour: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch03' || !state.world.ch03BlackwindLeaderDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch04', ch04MainlineComplete: false, ch04BossReady: false, ch04QingyunMasterDefeated: false, ch04AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch04'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：青云山的门规写得比山路还长，先去山门登记你的菜刀来历。' })
  },
  startChapterFive: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch04' || !state.world.ch04QingyunMasterDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch05', ch05MainlineComplete: false, ch05BossReady: false, ch05TwinBanditsDefeated: false, ch05AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch05'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：西域驿路的货单被风吹成了谜语，先去驿站把刀谱签收回来。' })
  },
  startChapterSix: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch05' || !state.world.ch05TwinBanditsDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch06', ch06MainlineComplete: false, ch06BossReady: false, ch06TideMasterDefeated: false, ch06AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch06'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：东海镇的留影石只拍得到浪花，先去码头找一份有重量的船单。' })
  },
  startChapterSeven: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch06' || !state.world.ch06TideMasterDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch07', ch07MainlineComplete: false, ch07BossReady: false, ch07RankingGovernorDefeated: false, ch07AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch07'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：京城榜单把价格写得比正文清楚，先去城门拿一块合法入场牌。' })
  },
  startChapterEight: () => {
    const state = get()
    if (!state.player || state.world.currentChapter !== 'ch07' || !state.world.ch07RankingGovernorDefeated) return
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: 'ch08', ch08MainlineComplete: false, ch08BossReady: false, ch08RankingMasterDefeated: false, ch08AutosaveCheckpoint: false }, worldNavigation: navigationForChapter(state, 'ch08'), battle: null, activeDialogue: null, activePanel: null, narrator: '说书人：武林大会给每个人一张定义表，先去入口登记谁有资格落款。' })
  },
  interactWithChapterNpc: (npcId) => {
    const state = get()
    if (!state.player || !isRuntimeChapterId(state.world.currentChapter)) return
    const result = interactWithChapterNpc(state.world.currentChapter, state.chapterRuntime, chapterRuntimeContext(state), npcId as NpcId)
    set({
      chapterRuntime: result.runtime,
      inventoryState: result.inventory,
      player: { ...state.player, experience: state.player.experience + result.gainedExperience },
      world: worldFromChapterRuntime(state.world, result.runtime),
      narrator: `说书人：${result.message}`,
    })
  },
  activateChapterHotspot: (hotspotId) => {
    const state = get()
    if (!state.player || !isRuntimeChapterId(state.world.currentChapter)) return
    const result = activateChapterHotspot(state.world.currentChapter, state.chapterRuntime, chapterRuntimeContext(state), hotspotId as HotspotId)
    set({
      chapterRuntime: result.runtime,
      inventoryState: result.inventory,
      player: { ...state.player, experience: state.player.experience + result.gainedExperience },
      world: worldFromChapterRuntime(state.world, result.runtime),
      narrator: `说书人：${result.message}`,
    })
  },
  collectChapterNode: (nodeId) => {
    const state = get()
    if (!state.player || !isRuntimeChapterId(state.world.currentChapter)) return
    const result = collectChapterNode(state.world.currentChapter, state.chapterRuntime, chapterRuntimeContext(state), nodeId as GatheringNodeId)
    set({
      chapterRuntime: result.runtime,
      inventoryState: result.inventory,
      player: { ...state.player, experience: state.player.experience + result.gainedExperience },
      world: worldFromChapterRuntime(state.world, result.runtime),
      narrator: `说书人：${result.message}`,
    })
  },
  startBattle: (battleId = get().world.currentChapter) => {
    const state = get()
    if (!state.player) return
    const chapterId = chapterForBattle(battleId)
    const normalEncounter = normalEncounterForBattle(battleId)
    if (normalEncounter && state.world.currentChapter !== normalEncounter.chapterId) return
    if (normalEncounter?.chapterId === 'ch01' && !state.world.oldManMet) return
    if (!normalEncounter && chapterId === 'ch01' && (!state.world.oldManMet || state.world.baiDefeated)) return
    if (!normalEncounter && chapterId === 'ch02' && (state.world.currentChapter !== 'ch02' || !state.world.ch02BossReady || state.world.ch02BangsiDefeated)) return
    if (!normalEncounter && chapterId === 'ch03' && (state.world.currentChapter !== 'ch03' || !state.world.ch03BossReady || state.world.ch03BlackwindLeaderDefeated)) return
    if (!normalEncounter && chapterId === 'ch04' && (state.world.currentChapter !== 'ch04' || !state.world.ch04BossReady || state.world.ch04QingyunMasterDefeated)) return
    if (!normalEncounter && chapterId === 'ch05' && (state.world.currentChapter !== 'ch05' || !state.world.ch05BossReady || state.world.ch05TwinBanditsDefeated)) return
    if (!normalEncounter && chapterId === 'ch06' && (state.world.currentChapter !== 'ch06' || !state.world.ch06BossReady || state.world.ch06TideMasterDefeated)) return
    if (!normalEncounter && chapterId === 'ch07' && (state.world.currentChapter !== 'ch07' || !state.world.ch07BossReady || state.world.ch07RankingGovernorDefeated)) return
    if (!normalEncounter && chapterId === 'ch08' && (state.world.currentChapter !== 'ch08' || !state.world.ch08BossReady || state.world.ch08RankingMasterDefeated)) return
    const battle = makeBattle(battleId)
    battle.enemyIntent = makeEnemyIntent(battle.enemy, state.player)
    if (state.world.tipsyNextBattle) {
      battle.playerStatuses = [{ id: 'tipsy', turns: 99 }]
      battle.logs = appendLog(battle.logs, '二锅头的勇气上头了：攻击更猛，准头随缘。', 'status')
    }
    combatTurnEngine = createBattleTurnEngine(state.player, battle, state.rngState, state.equipmentLoadout, state.foodBuffSnapshot, state.equipmentStrengthening, state.sect)
    set({
      screen: 'battle',
      battle,
      world: { ...state.world, currentChapter: chapterId, tipsyNextBattle: false },
      unlockables: applyUnlockableEvents(state.unlockables, [unlockableEvent(`npc:first-seen:${battle.enemy.id}`, 'npc.first_seen', { npcId: normalEncounter ? normalEncounter.runtimeId : chapterId === 'ch02' ? 'bangsi' : chapterId === 'ch03' ? 'blackwind-leader' : chapterId === 'ch04' ? 'qingyun-master' : chapterId === 'ch05' ? 'twin-bandits' : chapterId === 'ch06' ? 'tide-master' : chapterId === 'ch07' ? 'ranking-governor' : chapterId === 'ch08' ? 'ranking-master' : 'bai' })]),
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
    const isNormalEncounter = !isChapterBoss(battle.enemy.id)
    const enemyName = isBangsi ? '榜下捕快' : isBlackwindLeader ? '黑风寨主' : isQingyunMaster ? '青云掌门' : isTwinBandits ? '驿路双煞' : isTideMaster ? '海潮帮主' : isRankingGovernor ? '榜司督主' : isRankingMaster ? '百晓榜主' : isNormalEncounter ? battle.enemy.name : '白大侠'
    const coreSkill = coreActiveSkills.find((candidate) => String(candidate.id) === skillId)
    const definition = battleSkillConfig(skillId)
    if (!definition) return
    const equippedStats = combatStatsWithEquipment(player, state.equipmentLoadout, state.foodBuffSnapshot, state.equipmentStrengthening, state.sect)
    const engine = combatTurnEngine ?? createBattleTurnEngine(player, battle, state.rngState, state.equipmentLoadout, state.foodBuffSnapshot, state.equipmentStrengthening, state.sect)
    combatTurnEngine = engine
    const actionId = `battle:${battle.round}:${skillId}:${state.rngState}`
    try {
      engine.chooseSkill(actionId, skillId)
    } catch (error) {
      set({ battle: { ...battle, logs: appendLog(battle.logs, error instanceof Error ? error.message : '这招现在用不了。', 'status') } })
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

    if (skillId === 'playDead' || skillId === 'survival:play-dead') {
      playerStatuses = [{ id: 'feignedDeath', turns: 1 }]
      logs = appendLog(logs, `${player.name}往地上一躺，演技让路边石头都想鼓掌。`, 'player')
    } else {
      let attackStats = equippedStats
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
        const skillName = coreSkill?.name ?? (skillId === 'mockery' ? '嘴遁' : skillId === 'cleaverWhirl' ? '菜刀乱舞' : '普通攻击')
        logs = appendLog(logs, `${player.name}使出「${skillName}」，${enemyName}受到 ${hit.damage} 点伤害。${hit.crit ? ' 暴击，确实有点疼！' : ''}`, hit.crit ? 'critical' : 'player')
        const postureHit = applyBattlePosture(enemyPosture, coreSkill?.effects.reduce((total, effect) => total + (effect.type === 'damage' ? effect.posturePower ?? 0 : effect.type === 'posture_damage' ? effect.amount ?? 0 : 0), 0) ?? (skillId === 'mockery' ? 14 : skillId === 'cleaverWhirl' ? 22 : 10))
        enemyPosture = postureHit.posture
        if (postureHit.brokeNow) logs = appendLog(logs, `${enemyName}的架势被劈开，下一回合会更容易吃痛。`, 'status')
        if ((skillId === 'mockery' || coreSkill?.school === 'mouth') && nextEnemy.hp > 0) {
          nextEnemy.statuses = [{ id: 'dazed', turns: 1 }]
          logs = appendLog(logs, `${enemyName}陷入沉思：他说得好像也有点道理？`, 'status')
        }
      }
    }

    if (nextEnemy.hp <= 0) {
      const engineState = engine.resolvePlayerAction(actionId, {
        player: { hp: nextPlayer.hp, qi: nextPlayer.qi, statuses: playerStatuses },
        enemy: { hp: nextEnemy.hp, statuses: nextEnemy.statuses },
        rng: { seed: 987654321, state: seed },
      })
      const settlement = isNormalEncounter
        ? { status: 'settled' as const, player: { ...nextPlayer, experience: nextPlayer.experience + 6, silver: nextPlayer.silver + 6 }, quests: state.quests, world: state.world, events: [] as DomainEvent[], autoSaveTrigger: null }
        : isBangsi
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
      const battleId = `${battle.enemy.id}:${battle.round}:${state.rngState}`
      const foodBuffSnapshot = advanceFoodBuffSnapshot(state.foodBuffSnapshot, battleId, 'won')
      const sect = settlement.world.systemUnlocks.sectCreation && !state.sect.unlocked
        ? { ...state.sect, unlocked: true }
        : state.sect
      const dispatch = state.sect.unlocked && state.world.systemUnlocks.tickDispatch
        ? advanceSectDispatchSnapshot(state.dispatch, battleId)
        : state.dispatch
      set({
        player: settlement.player,
        world: settlement.world,
        quests: settlement.quests as QuestState[],
        unlockables,
        foodBuffSnapshot,
        sect,
        dispatch,
        sectMessage: dispatch !== state.dispatch && dispatch.tasks.some((task) => task.status === 'ready')
          ? '有效战斗已计入派遣；有队伍可以领取经营收益。'
          : state.sectMessage,
        rngState: seed,
        battle: { ...battle, enemy: nextEnemy, playerCooldowns: engineState.cooldowns, playerStatuses, playerPosture, enemyPosture, enemyIntent: makeEnemyIntent(nextEnemy, settlement.player), turn: 'victory', logs: appendLog(logs, isNormalEncounter ? `${enemyName}认了输：招式虽然明示，菜刀还是比锅铲快。` : isBangsi ? '榜下捕快盖章认输：这份结果，暂时可以上榜。' : isBlackwindLeader ? '黑风寨主收起空旗：这次败北，算山风的。' : isQingyunMaster ? '青云掌门收起折扇：门面验收通过，规则终于写短了。' : isLateBoss ? `${enemyName}收起证据：这次败北，终于可以公开复核。` : '白大侠抱拳认输：这把菜刀，讲道理。', 'system'), rewardGranted: true },
        narrator: isNormalEncounter ? `说书人：${enemyName}留下了 6 两银子，至少没留下锅铲。` : isBangsi ? '说书人：清河县核验完毕，你的菜刀终于拿到了一块不太空白的榜牌。' : isBlackwindLeader ? '说书人：黑风寨验收完毕，技能树和烹饪终于不再只是菜单上的远景。' : isQingyunMaster ? '说书人：青云山验收完毕，意图进阶和装备强化已从门面工程里落地。' : isTwinBandits ? '说书人：西域驿路签收完毕，门派创建与 Tick 派遣终于不再只是远景。' : isTideMaster ? '说书人：东海镇核验完毕，进阶委托与门人事件开始按潮汐运行。' : isRankingGovernor ? '说书人：京城账本核验完毕，结局路线锁定已写进可复核规则。' : isRankingMaster ? '说书人：武林大会落幕，四种结局与通关后继续都已打开。' : '说书人：恭喜，你终于从“会挥刀”升级成“差点会挥刀”。',
      })
      return
    }

    if (nextEnemy.phase === 1 && nextEnemy.hp <= nextEnemy.maxHp / 2) {
      nextEnemy = { ...nextEnemy, phase: 2 }
      logs = appendLog(logs, isBangsi ? '榜下捕快翻到卷宗背面：看来得拿出反盖一印了！' : isBlackwindLeader ? '黑风寨主把空旗一拧：看来得拿出反卷山河了！' : isQingyunMaster ? '青云掌门翻开剑谱背面：看来得拿出剑谱纠错了！' : isLateBoss ? `${enemyName}翻开第二页证据：看来得把特殊规则写得更大。` : '白大侠脸色一沉：看来得拿出三成实力了！', 'system')
    }

    engine.resolvePlayerAction(actionId, {
      player: { hp: nextPlayer.hp, qi: nextPlayer.qi, statuses: playerStatuses },
      enemy: { hp: nextEnemy.hp, statuses: nextEnemy.statuses },
      rng: { seed: 987654321, state: seed },
    })
    const enemyActionId = `battle:${battle.round}:enemy:${state.rngState}`
    engine.startEnemyTurn(enemyActionId)

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
        const normalMove = normalEncounterForEnemy(nextEnemy.id)
          ? normalOffensiveMove(normalEncounterForEnemy(nextEnemy.id)!).move
          : null
        const power = normalMove?.power ?? (isBangsi ? (nextEnemy.phase === 2 ? 1.32 : 1.05) : isBlackwindLeader ? (nextEnemy.phase === 2 ? 1.34 : 1.08) : isQingyunMaster ? (nextEnemy.phase === 2 ? 1.34 : 1.08) : isTwinBandits ? (nextEnemy.phase === 2 ? 1.38 : 1.12) : isTideMaster ? (nextEnemy.phase === 2 ? 1.4 : 1.14) : isRankingGovernor ? (nextEnemy.phase === 2 ? 1.42 : 1.16) : isRankingMaster ? (nextEnemy.phase === 2 ? 1.45 : 1.18) : (nextEnemy.phase === 2 ? 1.32 : 1.05))
        const hit = calculateDamage(nextEnemy.stats, equippedStats, power, seed)
        seed = hit.seed
        if (hit.dodged) {
          logs = appendLog(logs, `${enemyName}一招拍空，你靠本能躲开了。`, 'status')
        } else {
          nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - hit.damage) }
          const moveLabel = normalMove?.name ?? (isBangsi ? (nextEnemy.phase === 2 ? '反盖一印' : '红印落榜') : isBlackwindLeader ? (nextEnemy.phase === 2 ? '反卷山河' : '旗影断粮') : isQingyunMaster ? (nextEnemy.phase === 2 ? '剑谱纠错' : '门规点名') : isTwinBandits ? (nextEnemy.phase === 2 ? '一明一暗' : '双线封条') : isTideMaster ? (nextEnemy.phase === 2 ? '回流压岸' : '潮钟点名') : isRankingGovernor ? (nextEnemy.phase === 2 ? '热榜发布' : '印章定价') : isRankingMaster ? (nextEnemy.phase === 2 ? '终局判词' : '评审落笔') : '降龙十巴掌')
          logs = appendLog(logs, `${enemyName}使出「${moveLabel}」，你受到 ${hit.damage} 点伤害。${hit.crit ? ' 这一下挺有排面。' : ''}`, hit.crit ? 'critical' : 'enemy')
          const postureHit = applyBattlePosture(playerPosture, normalMove?.posturePower ?? (isBlackwindLeader || isQingyunMaster ? (nextEnemy.phase === 2 ? 13 : 11) : isTwinBandits ? (nextEnemy.phase === 2 ? 13 : 11) : isTideMaster ? (nextEnemy.phase === 2 ? 14 : 11) : isRankingGovernor ? (nextEnemy.phase === 2 ? 15 : 12) : isRankingMaster ? (nextEnemy.phase === 2 ? 16 : 12) : 10))
          playerPosture = postureHit.posture
          if (postureHit.brokeNow) logs = appendLog(logs, '你的架势被拍散了，下一回合要小心易伤。', 'status')
        }
      }
    }

    const engineState = engine.resolveEnemyAction(enemyActionId, {
      player: { hp: nextPlayer.hp, qi: nextPlayer.qi, statuses: playerStatuses },
      enemy: { hp: nextEnemy.hp, statuses: nextEnemy.statuses },
      rng: { seed: 987654321, state: seed },
    })
    cooldowns = engineState.cooldowns
    const defeated = nextPlayer.hp <= 0
    const foodBuffSnapshot = defeated
      ? advanceFoodBuffSnapshot(state.foodBuffSnapshot, `${battle.enemy.id}:${battle.round}:${state.rngState}`, 'lost')
      : state.foodBuffSnapshot
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
      foodBuffSnapshot,
      rngState: seed,
      battle: {
        ...battle,
        enemy: nextEnemy,
        playerCooldowns: cooldowns,
        playerStatuses,
        playerPosture,
        enemyPosture,
        enemyIntent: makeEnemyIntent(nextEnemy, nextPlayer),
        turn: engineState.phase === 'defeat' ? 'defeat' : 'player',
        round: engineState.round,
        logs: defeated ? appendLog(logs, '你倒下了，但菜刀还很倔强地指着天。', 'system') : logs,
      },
      narrator: defeated ? '说书人：挨打不丢人，丢人的是挨完还没记住招式。' : state.narrator,
    })
  },
  retryBattle: () => {
    const state = get()
    if (!state.player) return
    const player = {
      ...state.player,
      hp: state.player.maxHp,
      qi: state.player.maxQi,
    }
    const battleId: StoreBattleId = state.battle
      ? normalEncounterForEnemy(state.battle.enemy.id)?.battleId ?? state.world.currentChapter
      : state.world.currentChapter
    const battle = makeBattle(battleId)
    combatTurnEngine = createBattleTurnEngine(player, battle, state.rngState, state.equipmentLoadout, state.foodBuffSnapshot, state.equipmentStrengthening, state.sect)
    set({
      player,
      battle,
      narrator: '说书人：来，站起来，重新组织一下语言和骨头。',
    })
  },
  leaveBattle: () => {
    const state = get()
    if (state.battle?.turn === 'victory' && state.world.ch08RankingMasterDefeated && state.player) {
      const endingSelection = selectEnding(CORE_ENDINGS, makeEndingContext(state.player, state.world, state.sect))
      combatTurnEngine = null
      set({ screen: 'ending', battle: null, endingSelection, activePanel: null, activeDialogue: null, narrator: endingSelection.reason })
      return
    }
    combatTurnEngine = null
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
    const postgame = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK, state.postgame).unlock(state.endingRecordState.seenIds, postgameProsperity(state))
    set({ screen: 'jianghu', battle: null, activePanel: null, activeDialogue: null, activeChapterDialogue: null, postgame, narrator: state.endingSelection?.ending?.postgameLabel ?? '原档已保留，继续经营你的江湖。' })
  },
  setPostgameDifficulty: (difficulty) => {
    const state = get()
    try {
      const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK, state.postgame)
      set({ postgame: engine.setDifficulty(difficulty), sectMessage: `通关后委托已切换为${difficulty === 'ordinary' ? '普通' : difficulty === 'elite' ? '精英' : '传说'}难度。` })
    } catch (error) {
      set({ sectMessage: error instanceof Error ? error.message : '暂时无法切换委托难度。' })
    }
  },
  generatePostgameCommission: () => {
    const state = get()
    const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK, state.postgame)
    const result = engine.generate(postgameContext(state))
    set({ postgame: result.state, sectMessage: result.message })
  },
  completePostgameCommission: (instanceId) => {
    const state = get()
    try {
      const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK, state.postgame)
      set({ postgame: engine.markReady(instanceId), sectMessage: '委托已完成，可领取经营收益。' })
    } catch (error) {
      set({ sectMessage: error instanceof Error ? error.message : '无法完成这项委托。' })
    }
  },
  claimPostgameCommission: (instanceId) => {
    const state = get()
    const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK, state.postgame)
    const result = engine.claim(instanceId)
    set({
      postgame: result.state,
      player: state.player ? { ...state.player, silver: state.player.silver + result.wealthDelta } : state.player,
      sectMessage: result.message,
    })
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
  setPanel: (activePanel) => set({ activePanel, activeDialogue: null, activeChapterDialogue: null }),
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
  openCrafting: () => {
    const state = get()
    if (!state.player) return
    set({ screen: 'crafting', activePanel: null, activeDialogue: null, workshopMessage: '' })
  },
  openCooking: () => {
    const state = get()
    if (!state.player) return
    set({ screen: 'cooking', activePanel: null, activeDialogue: null, workshopMessage: '' })
  },
  closeWorkshop: () => set({ screen: 'jianghu', workshopMessage: '' }),
  craftRecipe: (recipeId) => {
    const state = get()
    if (!state.player) return null
    const recipe = coreForgingRecipes.find((candidate) => String(candidate.id) === recipeId)
    if (!recipe) {
      set({ workshopMessage: '没有找到这张锻造配方。' })
      return null
    }
    const engine = createForgingEngine(coreForgingRecipes, { items: gameplayItems, equipment: coreForgingEquipment }, state.forgingSnapshot, getStoreServices()?.eventBus)
    const result = engine.craft({
      recipeId: recipe.id,
      chapter: chapterNumber(state.world.currentChapter),
      inventory: state.inventoryState,
      equipmentIds: state.equipmentIds,
      conditionContext: gameplayConditionContext(state),
      actionId: `ui:forge:${recipeId}:${(state.forgingSnapshot.craftedCounts[recipeId] ?? 0) + 1}`,
    })
    set({ inventoryState: result.inventory, equipmentIds: result.equipmentIds, forgingSnapshot: result.state, workshopMessage: result.message })
    return result
  },
  cookRecipe: (recipeId) => {
    const state = get()
    if (!state.player) return null
    const recipe = coreCookingRecipes.find((candidate) => String(candidate.id) === recipeId)
    if (!recipe) {
      set({ workshopMessage: '没有找到这张烹饪菜谱。' })
      return null
    }
    const engine = createCookingEngine(coreCookingRecipes, { items: gameplayItems }, state.cookingSnapshot, getStoreServices()?.eventBus)
    const result = engine.cook({
      recipeId: recipe.id,
      chapter: chapterNumber(state.world.currentChapter),
      inventory: state.inventoryState,
      conditionContext: gameplayConditionContext(state),
      actionId: `ui:cook:${recipeId}:${(state.cookingSnapshot.cookedCounts[recipeId] ?? 0) + 1}`,
    })
    set({ inventoryState: result.inventory, cookingSnapshot: result.state, workshopMessage: result.message })
    return result
  },
  consumeFoodItem: (itemId) => {
    const state = get()
    if (!state.player) return
    if (state.screen === 'battle') return set({ workshopMessage: '战斗中不能从背包食用，先结束当前回合。' })
    const engine = createFoodBuffEngine({ foods: coreFoodBuffs, items: gameplayItems }, state.foodBuffSnapshot)
    const result = engine.consume({
      foodItemId: itemId,
      inventory: state.inventoryState,
      currentHp: state.player.hp,
      maxHp: state.player.maxHp,
      actionId: `ui:food:${itemId}:${state.foodBuffSnapshot.processedActionIds.length + 1}`,
    }, state.settings.memeDensity)
    set({ inventoryState: result.inventory, foodBuffSnapshot: result.state, player: { ...state.player, hp: result.hp }, workshopMessage: result.message })
  },
  unlockActiveSkill: (skillId) => {
    const state = get()
    try {
      const skillProgress = unlockSkill(state.skillProgress, coreSkillRegistry, skillId)
      set({ skillProgress, player: state.player ? { ...state.player, activeSkills: toPlayerActiveSkills(skillProgress) } : null, narrator: '武学已记入当前存档。' })
    } catch (error) {
      set({ narrator: error instanceof SkillLoadoutError ? error.message : '武学操作失败。' })
    }
  },
  equipActiveSkill: (skillId, slot) => {
    const state = get()
    try {
      const skillProgress = equipSkill(state.skillProgress, coreSkillRegistry, skillId, slot)
      set({ skillProgress, player: state.player ? { ...state.player, activeSkills: toPlayerActiveSkills(skillProgress) } : null })
    } catch (error) {
      set({ narrator: error instanceof SkillLoadoutError ? error.message : '装配武学失败。' })
    }
  },
  unequipActiveSkill: (slot) => {
    const state = get()
    try {
      const skillProgress = unequipSkill(state.skillProgress, slot)
      set({ skillProgress, player: state.player ? { ...state.player, activeSkills: toPlayerActiveSkills(skillProgress) } : null })
    } catch (error) {
      set({ narrator: error instanceof SkillLoadoutError ? error.message : '卸下武学失败。' })
    }
  },
  reorderActiveSkills: (from, to) => {
    const state = get()
    try {
      const skillProgress = reorderSkillSlots(state.skillProgress, from, to)
      set({ skillProgress, player: state.player ? { ...state.player, activeSkills: toPlayerActiveSkills(skillProgress) } : null })
    } catch (error) {
      set({ narrator: error instanceof SkillLoadoutError ? error.message : '调整技能槽失败。' })
    }
  },
  resetActiveSkills: () => {
    const state = get()
    try {
      const skillProgress = resetSkillPoints(state.skillProgress, state.screen === 'battle')
      set({ skillProgress, player: state.player ? { ...state.player, activeSkills: toPlayerActiveSkills(skillProgress) } : null, narrator: '技能点已免费重置。' })
    } catch (error) {
      set({ narrator: error instanceof SkillLoadoutError ? error.message : '重置技能失败。' })
    }
  },
  equipInventoryEquipment: (equipmentId) => {
    const state = get()
    const definition = coreForgingEquipment.find((item) => String(item.id) === equipmentId)
    if (!definition || !state.equipmentIds.includes(equipmentId)) return set({ workshopMessage: '这件装备尚未拥有。' })
    try {
      const result = equipEquipment(state.inventoryState, state.equipmentLoadout, definition, { items: gameplayItems, equipment: coreForgingEquipment })
      set({ inventoryState: result.inventory, equipmentLoadout: result.loadout, workshopMessage: `已装备「${definition.name}」。` })
    } catch (error) {
      set({ workshopMessage: error instanceof Error ? error.message : '装备失败。' })
    }
  },
  unequipInventoryEquipment: (slot) => {
    const state = get()
    try {
      const result = unequipEquipment(state.inventoryState, state.equipmentLoadout, slot, { items: gameplayItems, equipment: coreForgingEquipment })
      set({ inventoryState: result.inventory, equipmentLoadout: result.loadout, workshopMessage: '装备已放回背包。' })
    } catch (error) {
      set({ workshopMessage: error instanceof Error ? error.message : '卸下装备失败。' })
    }
  },
  strengthenInventoryEquipment: (equipmentId) => {
    const state = get()
    if (!state.player) return
    if (!state.world.systemUnlocks.equipmentStrengthening) return set({ workshopMessage: '完成青云山主线后才能使用强化台。' })
    if (!state.equipmentIds.includes(equipmentId)) return set({ workshopMessage: '这件装备尚未拥有，不能强化。' })
    const previous = state.equipmentStrengthening[equipmentId]
    const strengtheningState = restoreStrengtheningState(equipmentId, previous ?? createStrengtheningState(equipmentId), state.player, state.inventoryState)
    const attempt = attemptStrengthening(strengtheningState, state.rngState)
    if (attempt.result.outcome === 'insufficient_resources') return set({ workshopMessage: '银两或材料不足，强化没有开始。' })
    if (attempt.result.outcome === 'capped') return set({ workshopMessage: '这件装备已经强化至 +5。' })
    if (attempt.result.outcome === 'duplicate') return set({ workshopMessage: '这次强化已经结算，无需重复提交。' })
    const cost = attempt.result.cost
    const material = cost ? gameplayItems.find((item) => String(item.id) === cost.materialId) : undefined
    if (!cost || !material) return set({ workshopMessage: '强化配置缺少有效材料。' })
    try {
      const inventoryState = removeItem(state.inventoryState, cost.materialId, cost.materialCount, material)
      set({
        player: { ...state.player, silver: attempt.state.silver },
        inventoryState,
        equipmentStrengthening: { ...state.equipmentStrengthening, [equipmentId]: attempt.state },
        workshopMessage: attempt.result.outcome === 'success'
          ? `强化成功：${equipmentId} 已提升至 +${attempt.state.level}。`
          : '强化失败：已扣除本次成本，装备不会降级或损坏。',
      })
    } catch (error) {
      set({ workshopMessage: error instanceof Error ? error.message : '强化提交失败，材料未扣除。' })
    }
  },
  upgradeSectFacility: (facilityId) => {
    const state = get()
    if (!state.player) return
    const prosperity = Object.values(state.sect.facilities).reduce((total, level) => total + level, 0)
    const result = upgradeFacility({
      sect: state.sect,
      wealth: state.player.silver,
      inventory: state.inventoryState,
      effectState: {
        inventory: Object.fromEntries(state.inventoryState.stacks.map((stack) => [stack.itemId, stack.count])),
        experience: state.player.experience,
        stats: { moral: state.player.moral, fame: state.sect.benefits.fameBonus, wealth: state.player.silver, sectProsperity: prosperity },
        flags: {},
        quests: {},
        claimedGrantKeys: state.sect.claimedUpgradeGrantKeys,
      },
    }, facilityId, sectFacilityDefinitions, chapterNumber(state.world.currentChapter))
    const effectState = result.state.effectState
    set({
      sect: result.state.sect,
      inventoryState: result.state.inventory,
      player: {
        ...state.player,
        silver: result.state.wealth,
        experience: effectState.experience,
        moral: effectState.stats.moral,
      },
      worldNavigation: {
        ...state.worldNavigation,
        unlockedRegionIds: [...new Set([...state.worldNavigation.unlockedRegionIds, ...result.state.sect.benefits.revealedRegionIds])],
      },
      sectMessage: result.message,
    })
  },
  recruitSectDisciple: (discipleId) => {
    const state = get()
    const definition = discipleDefinitions.find((candidate) => String(candidate.id) === discipleId)
    if (!definition) return set({ sectMessage: '找不到要招募的门人。' })
    const result = recruitDisciple(
      state.sect,
      definition.id,
      discipleDefinitions,
      chapterNumber(state.world.currentChapter),
      sectConditionContext(state),
    )
    set({ sect: result.state, sectMessage: result.message })
  },
  startSectDispatch: (discipleIds) => {
    const state = get()
    const uniqueIds = [...new Set(discipleIds)]
    const selectedIds = uniqueIds.flatMap((discipleId) => {
      const definition = discipleDefinitions.find((candidate) => String(candidate.id) === discipleId)
      return definition ? [definition.id] : []
    })
    if (!state.sect.unlocked) return set({ sectMessage: '完成第五章主线后才能派遣门人。' })
    if (selectedIds.length !== uniqueIds.length || selectedIds.some((discipleId) => !state.sect.discipleIds.includes(discipleId))) return set({ sectMessage: '只能派遣已经招募的门人。' })
    if (selectedIds.length === 0) return set({ sectMessage: '请先选择至少一名门人。' })
    try {
      const preview = previewDiscipleDispatch(selectedIds, discipleDefinitions, discipleTraitDefinitions)
      const engine = createDispatchEngine(state.dispatch)
      const dispatchId = `dispatch:${state.dispatch.battleTick}:${state.rngState}:${selectedIds.join('+')}`
      const result = engine.start({
        dispatchId,
        discipleIds: selectedIds,
        baseDurationTicks: 3,
        modifiers: preview,
        rng: { seed: 987654321, state: state.rngState },
      })
      set({ dispatch: result.state, sectMessage: result.message })
    } catch (error) {
      set({ sectMessage: error instanceof Error ? error.message : '派遣创建失败。' })
    }
  },
  claimSectDispatch: (dispatchId) => {
    const state = get()
    const result = claimDispatch(createDispatchEngine(state.dispatch), dispatchId)
    if (result.status !== 'claimed' || !result.claim || !state.player) return set({ dispatch: result.state, sectMessage: result.message })
    const silver = 8 + Math.ceil(result.claim.qualityScore / 10) + state.sect.benefits.commissionQualityBonus
    set({
      dispatch: result.state,
      player: { ...state.player, silver: state.player.silver + silver },
      sectMessage: `${result.message} 经营收益：${silver} 两（质量 ${result.claim.qualityScore}）。`,
    })
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
  getWorldRegions: () => {
    const state = get()
    return listRegionAvailability(contentManifest, state.worldNavigation, worldConditionContext(state))
  },
  openWorldMap: () => set({ screen: 'worldMap', activePanel: null, activeDialogue: null, worldLocationError: null }),
  enterWorldRegion: async (regionId) => {
    const state = get()
    const entered = enterWorldRegionState(contentManifest, state.worldNavigation, regionId, worldConditionContext(state))
    if (!entered.ok) {
      set({ narrator: entered.error.message, worldLocationError: null })
      return
    }
    const loader = getStoreServices()?.regionLoader
    if (!loader) {
      set({ worldLocationLoadState: 'error', worldLocationError: { code: 'missing_loader', regionId, message: '区域加载器尚未初始化，请重试。', recoverable: true } })
      return
    }
    set({ worldNavigation: entered.value, worldLocation: null, worldLocationLoadState: 'loading', worldLocationError: null })
    const loaded = await loader.load(regionId)
    if (loaded.status === 'error') {
      set({ worldLocationLoadState: 'error', worldLocationError: loaded.error })
      return
    }
    const catalog = createWorldContentCatalog(contentManifest, [loaded.content])
    const location = getLocationAvailability(catalog, entered.value, entered.value.currentLocationId!, worldConditionContext(get()))
    if (!location.ok) {
      set({ worldLocationLoadState: 'error', worldLocationError: { code: 'invalid_content', regionId, message: location.error.message, recoverable: location.error.recoverable } })
      return
    }
    await getStoreServices()?.assetManager?.enterRegion(regionId)
    set({ screen: 'location', worldNavigation: entered.value, worldLocation: location.value.location, worldLocationLoadState: 'ready', worldLocationError: null })
  },
  retryWorldRegion: async () => {
    const regionId = get().worldNavigation.currentRegionId
    if (regionId) await get().enterWorldRegion(regionId)
  },
  returnToWorldMap: () => set({ screen: 'worldMap', worldLocationError: null }),
  resumeWorldChapter: () => {
    const state = get()
    const chapterId = state.worldNavigation.currentRegionId
      ? contentManifest.regions.find((region) => region.id === state.worldNavigation.currentRegionId)?.chapterId
      : undefined
    if (!chapterId) return set({ screen: 'worldMap', narrator: '当前地点没有对应章节，请从地图重新选择。' })
    set({ screen: 'jianghu', world: { ...state.world, currentChapter: chapterId as WorldState['currentChapter'] }, worldLocationError: null })
  },
  makeSaveV2: () => {
    const state = get()
    return makeGameSaveV2(state)
  },
  hydrateSaveV2: (save) => {
    const runtime = save.runtime
    const resumeRegionId = save.flags['ui:location_open'] ? save.world.currentRegionId : null
    set((state) => {
      const worldNavigation = restoreWorldNavigationState(contentManifest, save.world, worldConditionContext({
        ...state,
        player: runtime.player,
        quests: [...runtime.quests],
        world: runtime.world,
        worldNavigation: state.worldNavigation,
      }))
      const inventoryState = restorePlayerInventory(save.items)
      const skillProgress = restoreSkillProgress(runtime.player.level, save.skills)
      const equipmentLoadout = save.equipmentLoadout
      const equipmentStrengthening = Object.fromEntries(save.equipmentStrengthening.map((entry) => [
        entry.equipmentId,
        restoreStrengtheningState(entry.equipmentId, entry, runtime.player, inventoryState),
      ]))
      const equipmentIds = coreForgingEquipment
        .filter((definition) => inventoryState.stacks.some((stack) => stack.itemId === definition.itemId && stack.count > 0) || Object.values(equipmentLoadout).includes(String(definition.id)))
        .map((definition) => String(definition.id))
      const forgedRecipeIds = new Set(coreForgingRecipes.map((recipe) => String(recipe.id)))
      const cookedRecipeIds = new Set(coreCookingRecipes.map((recipe) => String(recipe.id)))
      const sect: SectState = {
        unlocked: save.sect.unlocked,
        facilities: save.sect.facilities as SectState['facilities'],
        discipleIds: save.sect.discipleIds as SectState['discipleIds'],
        seenDiscipleDialogueIds: save.sect.seenDiscipleDialogueIds as SectState['seenDiscipleDialogueIds'],
        benefits: save.sect.benefits as SectState['benefits'],
        claimedUpgradeGrantKeys: save.sect.claimedUpgradeGrantKeys,
      }
      return {
        screen: runtime.screen,
        quests: [...runtime.quests],
        world: runtime.world,
        worldNavigation,
        worldLocation: null,
        worldLocationLoadState: 'idle',
        worldLocationError: null,
        settings: save.settings,
        rngState: save.rng.state,
        unlockables: save.unlockables,
        battle: null,
        activeDialogue: null,
        activeChapterDialogue: null,
        activePanel: null,
        saveStatus: 'saved',
        endingRecordState: createEndingState(runtime.ending),
        endingSelection: runtime.screen === 'ending' && runtime.world.ch08RankingMasterDefeated
          ? selectEnding(CORE_ENDINGS, makeEndingContext(runtime.player, runtime.world))
          : null,
        chapterRuntime: save.chapterRuntime,
        player: { ...runtime.player, activeSkills: toPlayerActiveSkills(skillProgress) },
        inventoryState,
        skillProgress,
        equipmentLoadout,
        equipmentIds,
        equipmentStrengthening,
        forgingSnapshot: { version: 1, craftedCounts: Object.fromEntries(save.recipeIds.filter((recipeId) => forgedRecipeIds.has(recipeId)).map((recipeId) => [recipeId, 1])), processedActionIds: [] },
        cookingSnapshot: { version: 1, cookedCounts: Object.fromEntries(save.recipeIds.filter((recipeId) => cookedRecipeIds.has(recipeId)).map((recipeId) => [recipeId, 1])), processedActionIds: [] },
        foodBuffSnapshot: save.foodBuffs,
        sect,
        dispatch: save.sect.dispatch,
        postgame: save.postgame,
        sectMessage: '',
        workshopMessage: '',
        ...(resumeRegionId ? { screen: 'location' as const, worldLocationLoadState: 'loading' as const } : {}),
      }
    })
    if (resumeRegionId) void get().enterWorldRegion(resumeRegionId)
  },
  importSaveV2: (save) => get().hydrateSaveV2(save),
}))


export function getRootGameStore(): RootGameStore {
  return useRootGameStore.getState()
}
