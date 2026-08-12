import type { GameSaveV2 } from '../../types/save'
import { calculateSaveChecksum } from './import-export'
import { parseGameSaveV2 } from './schema'

const RECOVERY_KEY = 'caidao-jianghu:session-recovery'
const RECOVERY_TTL_MS = 30_000

interface RecoveryEnvelope {
  readonly savedAt: number
  readonly expiresAt: number
  readonly checksum: string
  readonly save: GameSaveV2
}

export type RecoveryStatus = 'available' | 'missing' | 'expired' | 'corrupt'

export interface RecoveryResult {
  readonly status: RecoveryStatus
  readonly save: GameSaveV2 | null
}

export class RecoveryError extends Error {
  readonly status: Exclude<RecoveryStatus, 'available' | 'missing'>

  constructor(status: Exclude<RecoveryStatus, 'available' | 'missing'>, message: string) {
    super(message)
    this.name = 'RecoveryError'
    this.status = status
  }
}

export interface RecoveryStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class SessionRecoveryStore {
  constructor(
    private readonly storage: RecoveryStorage = globalThis.sessionStorage,
    private readonly now: () => number = () => Date.now(),
  ) {}

  save(save: GameSaveV2): void {
    const parsed = parseGameSaveV2(save)
    const savedAt = this.now()
    const envelope: RecoveryEnvelope = {
      savedAt,
      expiresAt: savedAt + RECOVERY_TTL_MS,
      checksum: calculateSaveChecksum(parsed),
      save: parsed,
    }
    try {
      this.storage.setItem(RECOVERY_KEY, JSON.stringify(envelope))
    } catch (error) {
      throw new RecoveryError('corrupt', `无法写入临时恢复档：${error instanceof Error ? error.message : '存储不可用'}`)
    }
  }

  recover(): RecoveryResult {
    let raw: string | null
    try {
      raw = this.storage.getItem(RECOVERY_KEY)
    } catch (error) {
      throw new RecoveryError('corrupt', `无法读取临时恢复档：${error instanceof Error ? error.message : '存储不可用'}`)
    }
    if (!raw) return { status: 'missing', save: null }
    try {
      const envelope = JSON.parse(raw) as RecoveryEnvelope
      if (!Number.isFinite(envelope.expiresAt) || this.now() > envelope.expiresAt) {
        this.clear()
        return { status: 'expired', save: null }
      }
      const save = parseGameSaveV2(envelope.save)
      if (calculateSaveChecksum(save) !== envelope.checksum) throw new Error('校验和不匹配')
      return { status: 'available', save }
    } catch {
      this.clear()
      return { status: 'corrupt', save: null }
    }
  }

  restore(): GameSaveV2 | null {
    const result = this.recover()
    if (result.status === 'corrupt') throw new RecoveryError('corrupt', '临时恢复档已损坏，未覆盖任何有效存档。')
    return result.save
  }

  clear(): void {
    this.storage.removeItem(RECOVERY_KEY)
  }
}

export const SESSION_RECOVERY_KEY = RECOVERY_KEY
export const SESSION_RECOVERY_TTL_MS = RECOVERY_TTL_MS
