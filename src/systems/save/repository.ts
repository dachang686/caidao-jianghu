import type { SaveSlotId, GameSaveV2 } from '../../types/save'
import { parseGameSaveV2 } from './schema'
import { calculateSaveChecksum, exportGameSave, parseGameSaveExport } from './import-export'

export const SAVE_SLOT_ORDER: readonly SaveSlotId[] = ['manual-1', 'manual-2', 'manual-3', 'auto', 'backup']

export interface SaveSummary {
  readonly slotId: SaveSlotId
  readonly savedAt: string
  readonly chapterId: string
  readonly level: number
  readonly itemCount: number
  readonly byteLength: number
}

export interface StoredSaveRecord {
  readonly save: GameSaveV2
  readonly checksum: string
  readonly summary: SaveSummary
}

export interface SaveStorage {
  get(slotId: SaveSlotId): Promise<StoredSaveRecord | null>
  put(slotId: SaveSlotId, record: StoredSaveRecord): Promise<void>
  delete(slotId: SaveSlotId): Promise<void>
  listSummaries(): Promise<readonly SaveSummary[]>
}

export class SaveRepositoryError extends Error {
  readonly code: 'invalid_slot' | 'storage_unavailable' | 'quota_exceeded' | 'corrupt_record'

  constructor(code: SaveRepositoryError['code'], message: string) {
    super(message)
    this.name = 'SaveRepositoryError'
    this.code = code
  }
}

function assertSlot(slotId: SaveSlotId): void {
  if (!SAVE_SLOT_ORDER.includes(slotId)) throw new SaveRepositoryError('invalid_slot', `未知存档槽位「${slotId}」。`)
}

function makeSummary(slotId: SaveSlotId, save: GameSaveV2): SaveSummary {
  const serialized = JSON.stringify(save)
  return {
    slotId,
    savedAt: save.savedAt,
    chapterId: save.chapterId,
    level: save.player.level,
    itemCount: save.items.reduce((sum, item) => sum + item.count, 0),
    byteLength: new TextEncoder().encode(serialized).byteLength,
  }
}

function recordFor(slotId: SaveSlotId, save: GameSaveV2): StoredSaveRecord {
  return { save, checksum: calculateSaveChecksum(save), summary: makeSummary(slotId, save) }
}

function wrapStorageError(error: unknown): SaveRepositoryError {
  const name = error instanceof DOMException ? error.name : error instanceof Error ? error.name : ''
  if (name === 'QuotaExceededError') return new SaveRepositoryError('quota_exceeded', '本地存储空间不足，未能保存江湖账本。')
  return new SaveRepositoryError('storage_unavailable', error instanceof Error ? error.message : '本地存储不可用。')
}

export class SaveRepository {
  constructor(private readonly storage: SaveStorage) {}

  async listSummaries(): Promise<readonly SaveSummary[]> {
    try {
      const summaries = await this.storage.listSummaries()
      return SAVE_SLOT_ORDER.flatMap((slotId) => summaries.filter((summary) => summary.slotId === slotId))
    } catch (error) {
      throw wrapStorageError(error)
    }
  }

  async load(slotId: SaveSlotId): Promise<GameSaveV2 | null> {
    assertSlot(slotId)
    try {
      const record = await this.storage.get(slotId)
      if (!record) return null
      const save = parseGameSaveV2(record.save)
      if (calculateSaveChecksum(save) !== record.checksum) throw new SaveRepositoryError('corrupt_record', `存档槽位「${slotId}」校验和不匹配。`)
      return save
    } catch (error) {
      if (error instanceof SaveRepositoryError) throw error
      throw wrapStorageError(error)
    }
  }

  async save(slotId: SaveSlotId, save: GameSaveV2): Promise<void> {
    assertSlot(slotId)
    const parsed = parseGameSaveV2(save)
    try {
      if (slotId !== 'backup') {
        const previous = await this.storage.get(slotId)
        if (previous) await this.storage.put('backup', previous)
      }
      await this.storage.put(slotId, recordFor(slotId, parsed))
    } catch (error) {
      throw wrapStorageError(error)
    }
  }

  async importSlot(slotId: SaveSlotId, text: string, expectedContentVersion?: number): Promise<void> {
    const save = parseGameSaveExport(text, expectedContentVersion)
    await this.save(slotId, save)
  }

  async exportSlot(slotId: SaveSlotId): Promise<string | null> {
    const save = await this.load(slotId)
    return save ? exportGameSave(save) : null
  }

  async delete(slotId: SaveSlotId): Promise<void> {
    assertSlot(slotId)
    try {
      await this.storage.delete(slotId)
    } catch (error) {
      throw wrapStorageError(error)
    }
  }
}

export function createMemorySaveStorage(): SaveStorage {
  const records = new Map<SaveSlotId, StoredSaveRecord>()
  return {
    async get(slotId) { return records.get(slotId) ?? null },
    async put(slotId, record) { records.set(slotId, record) },
    async delete(slotId) { records.delete(slotId) },
    async listSummaries() { return [...records.values()].map((record) => record.summary) },
  }
}

const DB_NAME = 'caidao-jianghu-v2'
const DB_VERSION = 1
const RECORD_STORE = 'save-records'
const SUMMARY_STORE = 'save-summaries'

export class IndexedDbSaveStorage implements SaveStorage {
  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private open(): Promise<IDBDatabase> {
    if (!this.factory) return Promise.reject(new Error('IndexedDB 不可用'))
    return new Promise((resolve, reject) => {
      const request = this.factory.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(RECORD_STORE)) database.createObjectStore(RECORD_STORE)
        if (!database.objectStoreNames.contains(SUMMARY_STORE)) database.createObjectStore(SUMMARY_STORE)
      }
      request.onerror = () => reject(request.error ?? new Error('无法打开存档数据库'))
      request.onsuccess = () => resolve(request.result)
    })
  }

  async get(slotId: SaveSlotId): Promise<StoredSaveRecord | null> {
    const database = await this.open()
    return new Promise((resolve, reject) => {
      const request = database.transaction(RECORD_STORE, 'readonly').objectStore(RECORD_STORE).get(slotId)
      request.onerror = () => reject(request.error ?? new Error('无法读取存档'))
      request.onsuccess = () => { database.close(); resolve((request.result as StoredSaveRecord | undefined) ?? null) }
    })
  }

  async put(slotId: SaveSlotId, record: StoredSaveRecord): Promise<void> {
    const database = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([RECORD_STORE, SUMMARY_STORE], 'readwrite')
      transaction.objectStore(RECORD_STORE).put(record, slotId)
      transaction.objectStore(SUMMARY_STORE).put(record.summary, slotId)
      transaction.onerror = () => reject(transaction.error ?? new Error('无法写入存档'))
      transaction.onabort = () => reject(transaction.error ?? new Error('存档写入已中止'))
      transaction.oncomplete = () => { database.close(); resolve() }
    })
  }

  async delete(slotId: SaveSlotId): Promise<void> {
    const database = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([RECORD_STORE, SUMMARY_STORE], 'readwrite')
      transaction.objectStore(RECORD_STORE).delete(slotId)
      transaction.objectStore(SUMMARY_STORE).delete(slotId)
      transaction.onerror = () => reject(transaction.error ?? new Error('无法删除存档'))
      transaction.oncomplete = () => { database.close(); resolve() }
    })
  }

  async listSummaries(): Promise<readonly SaveSummary[]> {
    const database = await this.open()
    return new Promise((resolve, reject) => {
      const request = database.transaction(SUMMARY_STORE, 'readonly').objectStore(SUMMARY_STORE).getAll()
      request.onerror = () => reject(request.error ?? new Error('无法读取存档摘要'))
      request.onsuccess = () => { database.close(); resolve(request.result as SaveSummary[]) }
    })
  }
}

export function createIndexedDbSaveRepository(factory?: IDBFactory): SaveRepository {
  return new SaveRepository(new IndexedDbSaveStorage(factory))
}
