import { z } from 'zod'
import type { GameSaveV2 } from '../../types/save'
import { gameSaveV2Schema, parseGameSaveV2 } from './schema'

const exportEnvelopeSchema = z.object({
  format: z.literal('caidao-jianghu-save'),
  schemaVersion: z.literal(2),
  contentVersion: z.number().int().positive(),
  checksum: z.string().regex(/^[0-9a-f]{8}$/),
  save: z.unknown(),
}).strict()

export class SaveImportError extends Error {
  readonly code: 'invalid_json' | 'invalid_envelope' | 'schema_mismatch' | 'content_version_mismatch' | 'checksum_mismatch'

  constructor(code: SaveImportError['code'], message: string) {
    super(message)
    this.name = 'SaveImportError'
    this.code = code
  }
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function calculateSaveChecksum(save: GameSaveV2): string {
  let hash = 2166136261
  for (const character of stableSerialize(save)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function exportGameSave(save: GameSaveV2): string {
  const parsed = gameSaveV2Schema.parse(save)
  const envelope = {
    format: 'caidao-jianghu-save' as const,
    schemaVersion: 2 as const,
    contentVersion: parsed.contentVersion,
    checksum: calculateSaveChecksum(parsed as unknown as GameSaveV2),
    save: parsed,
  }
  return JSON.stringify(envelope, null, 2)
}

export function parseGameSaveExport(text: string, expectedContentVersion?: number): GameSaveV2 {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new SaveImportError('invalid_json', '导入数据不是有效 JSON。')
  }
  const envelope = exportEnvelopeSchema.safeParse(raw)
  if (!envelope.success) throw new SaveImportError('invalid_envelope', `导入结构不完整：${envelope.error.issues.map((issue) => issue.path.join('.')).join(', ')}`)
  if (expectedContentVersion !== undefined && envelope.data.contentVersion !== expectedContentVersion) {
    throw new SaveImportError('content_version_mismatch', `内容版本不匹配：需要 ${expectedContentVersion}，收到 ${envelope.data.contentVersion}。`)
  }
  let save: GameSaveV2
  try {
    save = parseGameSaveV2(envelope.data.save)
  } catch (error) {
    throw new SaveImportError('schema_mismatch', error instanceof Error ? error.message : '存档 schema 校验失败。')
  }
  if (envelope.data.schemaVersion !== save.schemaVersion || envelope.data.contentVersion !== save.contentVersion) {
    throw new SaveImportError('schema_mismatch', '导出信封与存档版本不一致。')
  }
  if (calculateSaveChecksum(save) !== envelope.data.checksum) {
    throw new SaveImportError('checksum_mismatch', '存档校验和不匹配，数据可能已损坏。')
  }
  return save
}

export const exportSaveV2 = exportGameSave
export const importSaveV2 = parseGameSaveExport
