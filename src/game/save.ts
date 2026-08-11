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
  inventory: z.array(z.enum(['rustyCleaver', 'stalePill', 'erguotou', 'saltedFish'])),
  equippedWeapon: z.enum(['rustyCleaver', 'stalePill', 'erguotou', 'saltedFish']).nullable(),
  activeSkills: z.array(z.enum(['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'])).length(4),
  titles: z.array(z.enum(['cleaverNovice', 'catScratchTrial', 'chatterboxBane', 'punchingBag'])),
})

export const gameSaveSchema = z.object({
  version: z.literal(1),
  savedAt: z.string().datetime(),
  screen: z.enum(['menu', 'creation', 'jianghu']),
  player: playerSchema,
  quests: z.array(z.object({
    id: z.enum(['firstSteps', 'findCat', 'challengeBai']),
    status: z.enum(['locked', 'active', 'complete']),
    progress: z.number().int().nonnegative(),
  })),
  world: z.object({
    oldManMet: z.boolean(),
    catQuestAccepted: z.boolean(),
    catChoice: z.enum(['coax', 'bribe', 'grab']).nullable(),
    catResolved: z.boolean(),
    baiDefeated: z.boolean(),
    npcClickCounts: z.record(z.string(), z.number().int().nonnegative()),
    damageTakenHits: z.number().int().nonnegative(),
    narratorSeen: z.array(z.string()),
    lastNarratorAt: z.number().nonnegative(),
  }),
  settings: z.object({
    reducedMotion: z.boolean(),
    masterMuted: z.boolean(),
    bgmEnabled: z.boolean(),
    sfxEnabled: z.boolean(),
    sillySfxEnabled: z.boolean(),
  }),
  rngState: z.number().int().nonnegative(),
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

