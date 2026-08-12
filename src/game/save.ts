import { z } from 'zod'
import type { GameSaveV1 } from './types'

const statsSchema = z.object({
  attack: z.number(),
  defense: z.number(),
  speed: z.number(),
  crit: z.number(),
  dodge: z.number(),
  accuracy: z.number(),
})

const playerSchema = z.object({
  name: z.string().min(1).max(12),
  talent: z.enum(['reckless', 'clever', 'thickSkinned']),
  level: z.number().int().positive(),
  experience: z.number().nonnegative(),
  nextLevelExperience: z.number().positive(),
  hp: z.number().nonnegative(),
  maxHp: z.number().positive(),
  qi: z.number().nonnegative(),
  maxQi: z.number().positive(),
  silver: z.number().nonnegative(),
  moral: z.number(),
  stats: statsSchema,
  inventory: z.array(z.enum(['rustyCleaver', 'stalePill', 'erguotou', 'saltedFish', 'qingheBadge', 'blackwindSeal', 'qingyunMark', 'westernSeal', 'tidePearl', 'capitalWrit', 'conventionCrest'])),
  equippedWeapon: z.enum(['rustyCleaver', 'stalePill', 'erguotou', 'saltedFish', 'qingheBadge', 'blackwindSeal', 'qingyunMark', 'westernSeal', 'tidePearl', 'capitalWrit', 'conventionCrest']).nullable(),
  activeSkills: z.array(z.enum(['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'])).length(4),
  titles: z.array(z.enum(['cleaverNovice', 'catScratchTrial', 'chatterboxBane', 'punchingBag'])),
})

const keyBindingsSchema = z.object({
  confirm: z.array(z.string().min(1)).default(['Enter', 'Space']),
  cancel: z.array(z.string().min(1)).default(['Escape']),
  nextTab: z.array(z.string().min(1)).default(['Tab']),
  skill1: z.array(z.string().min(1)).default(['Digit1']),
  skill2: z.array(z.string().min(1)).default(['Digit2']),
  skill3: z.array(z.string().min(1)).default(['Digit3']),
  skill4: z.array(z.string().min(1)).default(['Digit4']),
  skill5: z.array(z.string().min(1)).default(['Digit5']),
  skill6: z.array(z.string().min(1)).default(['Digit6']),
}).strict().default({
  confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'],
})

export const gameSaveSchema = z.object({
  version: z.literal(1),
  savedAt: z.string().datetime(),
  screen: z.enum(['menu', 'creation', 'jianghu', 'ending']),
  player: playerSchema,
  quests: z.array(z.object({
    id: z.enum(['firstSteps', 'findCat', 'challengeBai']),
    status: z.enum(['locked', 'active', 'complete']),
    progress: z.number().int().nonnegative(),
  })),
  world: z.object({
    currentChapter: z.enum(['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08']).default('ch01'),
    oldManMet: z.boolean(),
    catQuestAccepted: z.boolean(),
    catChoice: z.enum(['coax', 'bribe', 'grab']).nullable(),
    catResolved: z.boolean(),
    baiDefeated: z.boolean(),
    npcClickCounts: z.record(z.string(), z.number().int().nonnegative()),
    damageTakenHits: z.number().int().nonnegative(),
    narratorSeen: z.array(z.string()),
    lastNarratorAt: z.number().nonnegative(),
    tipsyNextBattle: z.boolean().default(false),
    systemUnlocks: z.object({
      dialogue: z.boolean(),
      basicCombat: z.boolean(),
      inventory: z.boolean(),
      equipment: z.boolean().default(false),
      gathering: z.boolean().default(false),
      forging: z.boolean().default(false),
      skillTree: z.boolean().default(false),
      cooking: z.boolean().default(false),
      advancedIntent: z.boolean().default(false),
      equipmentStrengthening: z.boolean().default(false),
      sectCreation: z.boolean().default(false),
      tickDispatch: z.boolean().default(false),
      advancedCommissions: z.boolean().default(false),
      discipleEvents: z.boolean().default(false),
      endingRouteLock: z.boolean().default(false),
      fourEndings: z.boolean().default(false),
      postgameContinue: z.boolean().default(false),
    }).default({ dialogue: false, basicCombat: false, inventory: false, equipment: false, gathering: false, forging: false, skillTree: false, cooking: false, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false }),
    nextChapterUnlocked: z.boolean().default(false),
    endingEligible: z.boolean().default(false),
    ch01AutosaveCheckpoint: z.boolean().default(false),
    ch02MainlineComplete: z.boolean().default(false),
    ch02BossReady: z.boolean().default(false),
    ch02BangsiDefeated: z.boolean().default(false),
    ch02AutosaveCheckpoint: z.boolean().default(false),
    ch03MainlineComplete: z.boolean().default(false),
    ch03BossReady: z.boolean().default(false),
    ch03BlackwindLeaderDefeated: z.boolean().default(false),
    ch03AutosaveCheckpoint: z.boolean().default(false),
    ch04MainlineComplete: z.boolean().default(false),
    ch04BossReady: z.boolean().default(false),
    ch04QingyunMasterDefeated: z.boolean().default(false),
    ch04AutosaveCheckpoint: z.boolean().default(false),
    ch05MainlineComplete: z.boolean().default(false),
    ch05BossReady: z.boolean().default(false),
    ch05TwinBanditsDefeated: z.boolean().default(false),
    ch05AutosaveCheckpoint: z.boolean().default(false),
    ch06MainlineComplete: z.boolean().default(false),
    ch06BossReady: z.boolean().default(false),
    ch06TideMasterDefeated: z.boolean().default(false),
    ch06AutosaveCheckpoint: z.boolean().default(false),
    ch07MainlineComplete: z.boolean().default(false),
    ch07BossReady: z.boolean().default(false),
    ch07RankingGovernorDefeated: z.boolean().default(false),
    ch07AutosaveCheckpoint: z.boolean().default(false),
    ch08MainlineComplete: z.boolean().default(false),
    ch08BossReady: z.boolean().default(false),
    ch08RankingMasterDefeated: z.boolean().default(false),
    ch08AutosaveCheckpoint: z.boolean().default(false),
  }),
  settings: z.object({
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
    keyBindings: keyBindingsSchema,
    aiEnhancement: z.object({ enabled: z.literal(false), provider: z.literal('none') }).strict().default({ enabled: false, provider: 'none' }),
  }).strict(),
  rngState: z.number().int().nonnegative(),
  unlockables: z.object({
    version: z.literal(1),
    unlockedIds: z.array(z.string().min(1)),
    claimedRewardIds: z.array(z.string().min(1)),
    processedEventIds: z.array(z.string().min(1)),
  }).default({ version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] }),
  ending: z.object({
    seenIds: z.array(z.string().min(1)),
    chosenId: z.string().min(1).nullable(),
    claimedGrantKeys: z.array(z.string().min(1)),
    postgameContinues: z.boolean(),
  }).optional(),
})

const DB_NAME = 'caidao-jianghu'
const STORE_NAME = 'saves'
const SAVE_KEY = 'slot-1'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB 不可用'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error ?? new Error('无法打开江湖账本'))
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
  })
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase()
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = action(transaction.objectStore(STORE_NAME))
    request.onerror = () => reject(request.error ?? new Error('江湖账本写入失败'))
    request.onsuccess = () => resolve(request.result)
    transaction.oncomplete = () => database.close()
  })
}

export async function loadSave(): Promise<GameSaveV1 | null> {
  const raw = await withStore<unknown>('readonly', (store) => store.get(SAVE_KEY))
  if (!raw) return null
  const parsed = gameSaveSchema.safeParse(raw)
  if (!parsed.success) throw new Error('存档格式不对，掌柜的也看不懂。')
  return parsed.data
}

export async function persistSave(save: GameSaveV1): Promise<void> {
  await withStore<IDBValidKey>('readwrite', (store) => store.put(save, SAVE_KEY))
}

export async function deleteSave(): Promise<void> {
  await withStore<undefined>('readwrite', (store) => store.delete(SAVE_KEY))
}

export function exportSave(save: GameSaveV1): string {
  return JSON.stringify(save, null, 2)
}

export function parseImportedSave(text: string): GameSaveV1 {
  const parsed = gameSaveSchema.safeParse(JSON.parse(text))
  if (!parsed.success) throw new Error('这份江湖账本缺页了，不能导入。')
  return parsed.data
}
