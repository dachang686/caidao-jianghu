import { z } from 'zod'
import type { GameSaveV2 } from '../../types/save'
import { gameplayRuntimeSaveSchema } from '../../game/save'

const id = z.string().min(1)
function uniqueIdArray(max?: number) {
  const array = max === undefined ? z.array(id) : z.array(id).max(max)
  return array.superRefine((values, context) => {
    if (new Set(values).size !== values.length) context.addIssue({ code: z.ZodIssueCode.custom, message: 'ID 不得重复' })
  })
}

const uniqueIds = uniqueIdArray()

const taskSchema = z.object({
  questId: id,
  status: z.enum(['locked', 'available', 'active', 'ready', 'completed']),
  progress: z.number().int().nonnegative(),
}).strict()

const effectStateSchema = z.object({
  inventory: z.record(z.string(), z.number().int().nonnegative()),
  experience: z.number().nonnegative(),
  stats: z.object({
    moral: z.number(),
    fame: z.number(),
    wealth: z.number(),
    sectProsperity: z.number(),
  }).strict(),
  flags: z.record(z.string(), z.boolean()),
  quests: z.record(z.string(), z.boolean()),
  claimedGrantKeys: uniqueIds,
}).strict()

const domainEventSchema = z.object({
  id,
  type: id,
  occurredAtTick: z.number().int().nonnegative(),
  payload: z.unknown(),
  sourceActionId: id,
}).strict()

const questSnapshotSchema = z.object({
  tasks: z.array(z.object({
    questId: id,
    status: z.enum(['locked', 'available', 'active', 'ready', 'completed']),
    progress: z.number().int().nonnegative(),
    objectiveProgress: z.record(z.string(), z.number().int().nonnegative()),
    appliedEventIds: uniqueIds,
  }).strict()),
  processedEventIds: uniqueIds,
  pendingEvents: z.array(domainEventSchema),
  claimedRewardGrantKeys: uniqueIds,
}).strict()

const explorationSnapshotSchema = z.object({
  version: z.literal(1),
  hotspots: z.object({
    completedIds: uniqueIds,
    activationCounts: z.record(z.string(), z.number().int().nonnegative()),
    processedActionIds: uniqueIds,
  }).strict(),
  effects: effectStateSchema,
}).strict()

const gatheringSnapshotSchema = z.object({
  version: z.literal(1),
  battleTick: z.number().int().nonnegative(),
  collectedNodeIds: uniqueIds,
  lastCollectedAtTick: z.record(z.string(), z.number().int().nonnegative()),
  processedBattleEventIds: uniqueIds,
  processedActionIds: uniqueIds,
}).strict()

const dialogueSnapshotSchema = z.object({
  graphId: id,
  currentNodeId: id.nullable(),
  returnPath: uniqueIds,
  readNodeIds: uniqueIds,
  readOptionIds: uniqueIds,
  executedActionIds: uniqueIds,
  confusingHops: z.number().int().nonnegative(),
  mode: z.enum(['typewriter', 'instant']),
  auto: z.boolean(),
}).strict()

const chapterRuntimeSchema = z.object({
  quests: z.record(questSnapshotSchema),
  explorations: z.record(explorationSnapshotSchema),
  gatherings: z.record(gatheringSnapshotSchema),
  dialogues: z.record(dialogueSnapshotSchema),
  effects: effectStateSchema,
}).strict()

const itemStackSchema = z.object({
  itemId: id,
  count: z.number().int().positive(),
}).strict()

const playerSchema = z.object({
  level: z.number().int().positive(),
  experience: z.number().nonnegative(),
  moral: z.number(),
  fame: z.number(),
  wealth: z.number(),
  sectProsperity: z.number(),
}).strict()

const skillSchema = z.object({
  unlockedSkillIds: uniqueIds,
  activeSkillIds: uniqueIdArray(6),
  skillPoints: z.number().int().nonnegative(),
}).strict()

const equipmentLoadoutSchema = z.object({
  weapon: id.nullable(),
  head: id.nullable(),
  body: id.nullable(),
  feet: id.nullable(),
  accessory: id.nullable(),
  manual: id.nullable(),
}).strict()

const foodBuffSnapshotSchema = z.object({
  version: z.literal(1),
  active: z.array(z.object({
    buffId: id,
    remainingBattles: z.number().int().positive().max(3),
    negativeTurns: z.number().int().nonnegative().max(2),
  }).strict()),
  battleTick: z.number().int().nonnegative(),
  processedBattleEventIds: uniqueIds,
  processedActionIds: uniqueIds,
}).strict()

const strengtheningStatDeltaSchema = z.object({
  attack: z.number().optional(),
  defense: z.number().optional(),
  maxHp: z.number().optional(),
  maxQi: z.number().optional(),
  posture: z.number().optional(),
  accuracy: z.number().optional(),
  dodge: z.number().optional(),
  crit: z.number().optional(),
}).strict()

const strengtheningAttemptSchema = z.object({
  key: id,
  fromLevel: z.number().int().min(0).max(5),
  toLevel: z.number().int().min(0).max(5),
  success: z.boolean(),
  roll: z.number().min(0).max(1),
  cost: z.object({ silver: z.number().nonnegative(), materialId: id, materialCount: z.number().int().positive() }).strict(),
}).strict()

const equipmentStrengtheningSchema = z.array(z.object({
  equipmentId: id,
  level: z.number().int().min(0).max(5),
  bonus: strengtheningStatDeltaSchema,
  attemptCount: z.number().int().nonnegative(),
  history: z.array(strengtheningAttemptSchema),
}).strict()).superRefine((entries, context) => {
  if (new Set(entries.map((entry) => entry.equipmentId)).size !== entries.length) context.addIssue({ code: z.ZodIssueCode.custom, message: '装备强化记录不得重复' })
})

const sectSchema = z.object({
  unlocked: z.boolean(),
  facilities: z.object({
    training: z.number().int().min(0).max(3),
    kitchen: z.number().int().min(0).max(3),
    forge: z.number().int().min(0).max(3),
    intel: z.number().int().min(0).max(3),
  }).strict(),
  discipleIds: uniqueIds,
  seenDiscipleDialogueIds: uniqueIds.default([]),
  benefits: z.object({
    combatAttackBonus: z.number().nonnegative(),
    combatDefenseBonus: z.number().nonnegative(),
    unlockedRecipeIds: uniqueIds,
    strengtheningChanceBonus: z.number().nonnegative(),
    revealedRegionIds: uniqueIds,
    commissionQualityBonus: z.number().nonnegative(),
    fameBonus: z.number().nonnegative(),
  }).strict(),
  claimedUpgradeGrantKeys: uniqueIds,
  dispatch: z.object({
    battleTick: z.number().int().nonnegative(),
    tasks: z.array(z.object({
      dispatchId: id,
      discipleIds: uniqueIds,
      expectedTicks: z.number().int().positive(),
      remainingTicks: z.number().int().nonnegative(),
      createdAtBattleTick: z.number().int().nonnegative(),
      rng: z.object({ seed: z.number().int().nonnegative(), state: z.number().int().nonnegative() }).strict(),
      modifiers: z.object({
        durationTicksDelta: z.number().int().min(-2).max(2),
        successChanceDelta: z.number().min(-0.4).max(0.4),
        qualityDelta: z.number().int().min(-4).max(4),
      }).strict(),
      status: z.enum(['active', 'ready', 'claimed']),
      claim: z.object({ dispatchId: id, qualityScore: z.number().int().min(0).max(100), resultSeed: z.number().int().nonnegative() }).strict().optional(),
    }).strict()),
    processedBattleEventIds: uniqueIds,
  }).strict(),
}).strict()

const endingsSchema = z.object({
  seenIds: uniqueIds,
  chosenId: id.nullable(),
}).strict()

const commissionTargetSchema = z.object({
  kind: z.enum(['collect', 'defeat', 'deliver', 'investigate', 'help']),
  id,
  label: id,
  count: z.number().int().positive().optional(),
  enemyId: id.optional(),
  contextTags: uniqueIds,
}).strict()

const commissionRewardSchema = z.object({
  wealth: z.number().nonnegative(),
  fame: z.number().nonnegative(),
  itemIds: uniqueIds.optional(),
  grantKey: id,
}).strict()

const commissionSnapshotSchema = z.object({
  progress: z.number().int().nonnegative(),
  active: z.array(z.object({
    instanceId: id,
    templateId: id,
    title: id,
    description: id,
    tier: z.enum(['ordinary', 'elite', 'legendary']),
    regionId: id,
    target: commissionTargetSchema,
    reward: commissionRewardSchema,
    payoutMultiplier: z.number().positive(),
    generatedAtProgress: z.number().int().nonnegative(),
    rng: z.object({ seed: z.number().int().nonnegative(), state: z.number().int().nonnegative() }).strict(),
    status: z.enum(['active', 'ready', 'claimed']),
  }).strict()),
  templateUseCounts: z.record(z.string(), z.number().int().nonnegative()),
  completedTemplateIds: uniqueIds,
  claimedGrantKeys: uniqueIds,
  generatedRequestKeys: uniqueIds,
}).strict()

const postgameStateSchema = z.object({
  unlocked: z.boolean(),
  difficulty: z.enum(['ordinary', 'elite', 'legendary']),
  commission: commissionSnapshotSchema,
  completedEndingIds: uniqueIds,
  prosperity: z.number().nonnegative(),
  totalWealth: z.number().nonnegative(),
  totalFame: z.number().nonnegative(),
  claimedOneTimeTargetIds: uniqueIds,
}).strict()

const settingsSchema = z.object({
  reducedMotion: z.boolean(),
  masterMuted: z.boolean(),
  bgmEnabled: z.boolean(),
  sfxEnabled: z.boolean(),
  sillySfxEnabled: z.boolean(),
  masterVolume: z.number().min(0).max(1).default(1),
  musicVolume: z.number().min(0).max(1).default(.55),
  sfxVolume: z.number().min(0).max(1).default(.75),
  sillyVolume: z.number().min(0).max(1).default(.8),
  memeDensity: z.enum(['mild', 'standard', 'spicy']).default('standard'),
  textSpeed: z.enum(['slow', 'standard', 'fast']).default('standard'),
  difficulty: z.enum(['story', 'standard', 'expert']).default('standard'),
  keyBindings: z.object({
    confirm: uniqueIds.default(['Enter', 'Space']),
    cancel: uniqueIds.default(['Escape']),
    nextTab: uniqueIds.default(['Tab']),
    skill1: uniqueIds.default(['Digit1']),
    skill2: uniqueIds.default(['Digit2']),
    skill3: uniqueIds.default(['Digit3']),
    skill4: uniqueIds.default(['Digit4']),
    skill5: uniqueIds.default(['Digit5']),
    skill6: uniqueIds.default(['Digit6']),
  }).strict().default({ confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] }),
  aiEnhancement: z.object({
    enabled: z.literal(false),
    provider: z.literal('none'),
  }).strict(),
}).strict()

const worldNavigationSchema = z.object({
  unlockedRegionIds: uniqueIds,
  currentRegionId: id.nullable(),
  currentLocationId: id.nullable(),
  returnPath: uniqueIds,
}).strict()

const npcSnapshotSchema = z.object({
  states: z.array(z.object({
    npcId: id,
    favor: z.number(),
    irritation: z.number(),
    knownInfoIds: uniqueIds,
  }).strict()).superRefine((states, context) => {
    if (new Set(states.map((state) => state.npcId)).size !== states.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'NPC 状态不得重复' })
    }
  }),
  processedEventIds: uniqueIds,
}).strict()

const unlockableSnapshotSchema = z.object({
  version: z.literal(1),
  unlockedIds: uniqueIds,
  claimedRewardIds: uniqueIds,
  processedEventIds: uniqueIds,
}).strict()

export const gameSaveV2Schema = z.object({
  schemaVersion: z.literal(2),
  contentVersion: z.number().int().positive(),
  savedAt: z.string().datetime(),
  chapterId: id,
  world: worldNavigationSchema.default({
    unlockedRegionIds: ['xiaoyu-village'],
    currentRegionId: 'xiaoyu-village',
    currentLocationId: 'xiaoyu-village',
    returnPath: [],
  }),
  npcs: npcSnapshotSchema.default({ states: [], processedEventIds: [] }),
  unlockables: unlockableSnapshotSchema.default({ version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] }),
  player: playerSchema,
  tasks: z.array(taskSchema),
  chapterRuntime: chapterRuntimeSchema,
  items: z.array(itemStackSchema),
  skills: skillSchema,
  equipmentLoadout: equipmentLoadoutSchema,
  equipmentStrengthening: equipmentStrengtheningSchema,
  foodBuffs: foodBuffSnapshotSchema,
  recipeIds: uniqueIds,
  sect: sectSchema,
  commissions: z.object({ activeIds: uniqueIds, completedIds: uniqueIds }).strict(),
  postgame: postgameStateSchema,
  endings: endingsSchema,
  flags: z.record(z.string(), z.boolean()),
  rng: z.object({
    algorithm: z.literal('mulberry32'),
    seed: z.number().int().nonnegative().max(0xffffffff),
    state: z.number().int().nonnegative().max(0xffffffff),
  }).strict(),
  settings: settingsSchema,
  contentKeys: uniqueIds,
  defeatedEnemyIds: uniqueIds,
  runtime: gameplayRuntimeSaveSchema,
}).strict()

export type ParsedGameSaveV2 = z.infer<typeof gameSaveV2Schema>

export class GameSaveValidationError extends Error {
  readonly issues: readonly z.ZodIssue[]

  constructor(issues: readonly z.ZodIssue[]) {
    super(issues.map((issue) => `${issue.path.join('.')}：${issue.message}`).join('\n'))
    this.name = 'GameSaveValidationError'
    this.issues = issues
  }
}

export function parseGameSaveV2(input: unknown): GameSaveV2 {
  const result = gameSaveV2Schema.safeParse(input)
  if (!result.success) throw new GameSaveValidationError(result.error.issues)
  return result.data as unknown as GameSaveV2
}

export function createMinimalGameSaveV2(): GameSaveV2 {
  return {
    schemaVersion: 2,
    contentVersion: 1,
    savedAt: '2026-01-01T00:00:00.000Z',
    chapterId: 'ch01' as GameSaveV2['chapterId'],
    world: {
      unlockedRegionIds: ['xiaoyu-village'] as unknown as GameSaveV2['world']['unlockedRegionIds'],
      currentRegionId: 'xiaoyu-village' as GameSaveV2['world']['currentRegionId'],
      currentLocationId: 'xiaoyu-village' as GameSaveV2['world']['currentLocationId'],
      returnPath: [],
    },
    npcs: { states: [], processedEventIds: [] },
    unlockables: { version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] },
    player: { level: 1, experience: 0, moral: 0, fame: 0, wealth: 20, sectProsperity: 0 },
    tasks: [],
    chapterRuntime: {
      quests: {},
      explorations: {},
      gatherings: {},
      dialogues: {},
      effects: { inventory: {}, experience: 0, stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 }, flags: {}, quests: {}, claimedGrantKeys: [] },
    },
    items: [],
    skills: { unlockedSkillIds: [], activeSkillIds: [], skillPoints: 0 },
    equipmentLoadout: { weapon: null, head: null, body: null, feet: null, accessory: null, manual: null },
    equipmentStrengthening: [],
    foodBuffs: { version: 1, active: [], battleTick: 0, processedBattleEventIds: [], processedActionIds: [] },
    recipeIds: [],
    sect: {
      unlocked: false,
      facilities: { training: 0, kitchen: 0, forge: 0, intel: 0 },
      discipleIds: [],
      seenDiscipleDialogueIds: [],
      benefits: { combatAttackBonus: 0, combatDefenseBonus: 0, unlockedRecipeIds: [], strengtheningChanceBonus: 0, revealedRegionIds: [], commissionQualityBonus: 0, fameBonus: 0 },
      claimedUpgradeGrantKeys: [],
      dispatch: { battleTick: 0, tasks: [], processedBattleEventIds: [] },
    },
    commissions: { activeIds: [], completedIds: [] },
    postgame: { unlocked: false, difficulty: 'ordinary', commission: { progress: 0, active: [], templateUseCounts: {}, completedTemplateIds: [], claimedGrantKeys: [], generatedRequestKeys: [] }, completedEndingIds: [], prosperity: 0, totalWealth: 0, totalFame: 0, claimedOneTimeTargetIds: [] },
    endings: { seenIds: [], chosenId: null },
    flags: {},
    rng: { algorithm: 'mulberry32', seed: 987654321, state: 987654321 },
    settings: {
      reducedMotion: false,
      masterMuted: false,
      bgmEnabled: true,
      sfxEnabled: true,
      sillySfxEnabled: true,
      masterVolume: 1,
      musicVolume: .55,
      sfxVolume: .75,
      sillyVolume: .8,
      memeDensity: 'standard',
      textSpeed: 'standard',
      difficulty: 'standard',
      keyBindings: { confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] },
      aiEnhancement: { enabled: false, provider: 'none' },
    },
    contentKeys: [],
    defeatedEnemyIds: [],
    runtime: {
      screen: 'menu',
      player: {
        name: '新侠客',
        talent: 'thickSkinned',
        level: 1,
        experience: 0,
        nextLevelExperience: 100,
        hp: 100,
        maxHp: 100,
        qi: 30,
        maxQi: 30,
        silver: 20,
        moral: 0,
        stats: { attack: 10, defense: 5, speed: 10, crit: 0.05, dodge: 0.05, accuracy: 0.9 },
        inventory: [],
        equippedWeapon: null,
        activeSkills: ['basicSlash'],
        titles: [],
      },
      quests: [],
      world: {
        currentChapter: 'ch01', oldManMet: false, catQuestAccepted: false, catChoice: null, catResolved: false, baiDefeated: false,
        npcClickCounts: {}, damageTakenHits: 0, narratorSeen: [], lastNarratorAt: 0, tipsyNextBattle: false,
        systemUnlocks: { dialogue: false, basicCombat: false, inventory: false, equipment: false, gathering: false, forging: false, skillTree: false, cooking: false, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false },
        nextChapterUnlocked: false, endingEligible: false, ch01AutosaveCheckpoint: false,
        ch02MainlineComplete: false, ch02BossReady: false, ch02BangsiDefeated: false, ch02AutosaveCheckpoint: false,
        ch03MainlineComplete: false, ch03BossReady: false, ch03BlackwindLeaderDefeated: false, ch03AutosaveCheckpoint: false,
        ch04MainlineComplete: false, ch04BossReady: false, ch04QingyunMasterDefeated: false, ch04AutosaveCheckpoint: false,
        ch05MainlineComplete: false, ch05BossReady: false, ch05TwinBanditsDefeated: false, ch05AutosaveCheckpoint: false,
        ch06MainlineComplete: false, ch06BossReady: false, ch06TideMasterDefeated: false, ch06AutosaveCheckpoint: false,
        ch07MainlineComplete: false, ch07BossReady: false, ch07RankingGovernorDefeated: false, ch07AutosaveCheckpoint: false,
        ch08MainlineComplete: false, ch08BossReady: false, ch08RankingMasterDefeated: false, ch08AutosaveCheckpoint: false,
      },
      ending: { seenIds: [], chosenId: null, claimedGrantKeys: [], postgameContinues: false },
    },
  }
}

export const gameSaveSchema = gameSaveV2Schema
export const makeMinimalGameSaveV2 = createMinimalGameSaveV2
