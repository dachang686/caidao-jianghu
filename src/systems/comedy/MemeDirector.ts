import type { DomainEvent } from '../../types/events'
import type { MemeDefinition, MemeDirectorSnapshot, MemeSelection, MemeSelectionContext, MemeValidationIssue, MemeValidationResult } from '../../types/meme'
import type { MemeDensity } from '../../types/text-provider'

const DENSITY_RANK: Record<MemeDensity, number> = { mild: 0, standard: 1, spicy: 2 }
const CATEGORIES = new Set(['workplace', 'delivery', 'livestream', 'hotlist', 'social', 'emotion', 'jianghu'])
const SENSITIVE_TERMS = ['政治', '种族', '性别歧视', '习近平', '特朗普', '微信', '抖音', '微博', '淘宝', '美团', '支付宝']

export const EMPTY_MEME_DIRECTOR_SNAPSHOT: MemeDirectorSnapshot = {
  version: 1,
  consumedByGroup: {},
  cooldowns: {},
  processedEventIds: [],
}

export class MemeDirectorError extends Error {
  readonly issues?: readonly MemeValidationIssue[]

  constructor(message: string, issues?: readonly MemeValidationIssue[]) {
    super(message)
    this.name = 'MemeDirectorError'
    this.issues = issues
  }
}

export class MemeDirectorSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MemeDirectorSnapshotError'
  }
}

function issue(code: MemeValidationIssue['code'], path: string, message: string, id?: string): MemeValidationIssue {
  return { code, path, message, ...(id ? { id } : {}) }
}

function requireText(value: unknown, path: string, issues: MemeValidationIssue[], id?: string): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(issue('invalid_value', path, '值不能为空', id))
}

export function validateMemePackDefinitions(definitions: readonly MemeDefinition[]): MemeValidationResult {
  const issues: MemeValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, index) => {
    const path = `memes[${index}]`
    if (seen.has(definition.id)) issues.push(issue('duplicate_id', `${path}.id`, `重复梗条目 ID「${definition.id}」`, definition.id))
    seen.add(definition.id)
    requireText(definition.id, `${path}.id`, issues, definition.id)
    if (!CATEGORIES.has(definition.category)) issues.push(issue('invalid_value', `${path}.category`, `未知梗分类「${String(definition.category)}」`, definition.id))
    requireText(definition.triggerEvent, `${path}.triggerEvent`, issues, definition.id)
    requireText(definition.text, `${path}.text`, issues, definition.id)
    if (!(definition.minDensity in DENSITY_RANK)) issues.push(issue('invalid_value', `${path}.minDensity`, `未知梗密度「${String(definition.minDensity)}」`, definition.id))
    if (!definition.cooldownGroup?.trim()) issues.push(issue('missing_cooldown', `${path}.cooldownGroup`, '梗条目必须声明冷却组', definition.id))
    if (definition.cooldownTicks !== undefined && (!Number.isInteger(definition.cooldownTicks) || definition.cooldownTicks < 0)) issues.push(issue('invalid_value', `${path}.cooldownTicks`, '冷却 tick 必须是非负整数', definition.id))
    const combinedText = `${definition.text} ${definition.modernMapping ?? ''}`
    SENSITIVE_TERMS.filter((term) => combinedText.includes(term)).forEach((term) => issues.push(issue('sensitive_text', `${path}.text`, `命中敏感语境词「${term}」，需人工确认或改写`, definition.id)))
  })
  if (definitions.length > 0) {
    const modernRatio = definitions.filter((definition) => Boolean(definition.modernMapping)).length / definitions.length
    if (modernRatio < .25 || modernRatio > .55) issues.push(issue('modern_ratio', 'memes', `现代映射占比 ${(modernRatio * 100).toFixed(0)}%，应控制在约 40% 的审查区间内`))
  }
  return { valid: issues.length === 0, issues }
}

export function assertValidMemePackDefinitions(definitions: readonly MemeDefinition[]): void {
  const result = validateMemePackDefinitions(definitions)
  if (!result.valid) throw new MemeDirectorError(`memePack 校验失败：${result.issues.map((item) => item.message).join('；')}`, result.issues)
}

function nextFloat(seed: number): [number, number] {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0
  let value = nextSeed
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return [nextSeed, ((value ^ (value >>> 14)) >>> 0) / 4294967296]
}

function cloneSnapshot(snapshot: MemeDirectorSnapshot): MemeDirectorSnapshot {
  return {
    version: 1,
    consumedByGroup: Object.fromEntries(Object.entries(snapshot.consumedByGroup).map(([group, ids]) => [group, [...ids]])),
    cooldowns: { ...snapshot.cooldowns },
    processedEventIds: [...snapshot.processedEventIds],
  }
}

function normalizeSnapshot(snapshot?: Partial<MemeDirectorSnapshot>): MemeDirectorSnapshot {
  if (snapshot?.version !== undefined && snapshot.version !== 1) throw new MemeDirectorSnapshotError(`不支持的 memePack 快照版本「${String(snapshot.version)}」`)
  return {
    version: 1,
    consumedByGroup: Object.fromEntries(Object.entries(snapshot?.consumedByGroup ?? {}).map(([group, ids]) => [group, [...new Set(ids ?? [])]])),
    cooldowns: { ...(snapshot?.cooldowns ?? {}) },
    processedEventIds: [...new Set(snapshot?.processedEventIds ?? [])],
  }
}

function densityAllows(minDensity: MemeDensity, density: MemeDensity): boolean {
  return DENSITY_RANK[density] >= DENSITY_RANK[minDensity]
}

function hasTags(definition: MemeDefinition, tags: ReadonlySet<string>): boolean {
  return (definition.requiredTags ?? []).every((tag) => tags.has(tag))
}

export class MemeDirector {
  private readonly definitions: readonly MemeDefinition[]
  private state: MemeDirectorSnapshot

  constructor(definitions: readonly MemeDefinition[], snapshot?: Partial<MemeDirectorSnapshot>) {
    assertValidMemePackDefinitions(definitions)
    this.definitions = [...definitions]
    this.state = normalizeSnapshot(snapshot)
  }

  getState(): MemeDirectorSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): MemeDirectorSnapshot {
    return this.getState()
  }

  select(event: DomainEvent, context: MemeSelectionContext): MemeSelection {
    if (!event.id.trim() || !event.type.trim() || !event.sourceActionId.trim()) throw new MemeDirectorError('梗事件缺少有效 ID、类型或来源动作。')
    if (!Number.isInteger(context.tick) || context.tick < 0) throw new MemeDirectorError('梗 tick 必须是非负整数。')
    if (!context.actionId.trim()) throw new MemeDirectorError('梗 actionId 不能为空。')
    if (!Number.isInteger(context.rngState) || context.rngState < 0) throw new MemeDirectorError('梗 rngState 必须是非负整数。')
    if (this.state.processedEventIds.includes(event.id)) return this.outcome('duplicate_event', null, false, context.rngState >>> 0, '该事件的补充文案已经处理过。')

    const tags = new Set(context.tags ?? [])
    const sameEvent = this.definitions.filter((definition) => definition.triggerEvent === event.type && densityAllows(definition.minDensity, context.density))
    const tagged = sameEvent.filter((definition) => hasTags(definition, tags))
    const processedEventIds = [...this.state.processedEventIds, event.id]
    if (tagged.length === 0) {
      this.state = { ...this.state, processedEventIds }
      return this.outcome(sameEvent.length > 0 ? 'missing_tags' : 'none', null, false, context.rngState >>> 0, sameEvent.length > 0 ? '缺少该补充文案所需语境标签。' : '没有匹配的补充文案。')
    }

    const available = tagged.filter((definition) => {
      const lastTick = this.state.cooldowns[definition.cooldownGroup]
      return lastTick === undefined || context.tick - lastTick >= (definition.cooldownTicks ?? 1)
    })
    if (available.length === 0) {
      this.state = { ...this.state, processedEventIds }
      return this.outcome('cooldown', null, false, context.rngState >>> 0, '补充文案仍在冷却中。')
    }

    const fresh = available.filter((definition) => !this.state.consumedByGroup[definition.cooldownGroup]?.includes(definition.id))
    const pool = fresh.length > 0 ? fresh : available
    let rngState: number
    let roll: number
    ;[rngState, roll] = nextFloat(context.rngState >>> 0)
    const selected = pool[Math.min(pool.length - 1, Math.floor(roll * pool.length))]!
    const consumedByGroup: Record<string, readonly string[]> = { ...this.state.consumedByGroup }
    const previous = fresh.length > 0 ? (consumedByGroup[selected.cooldownGroup] ?? []) : []
    consumedByGroup[selected.cooldownGroup] = [...new Set([...previous, selected.id])]
    this.state = {
      version: 1,
      consumedByGroup,
      cooldowns: { ...this.state.cooldowns, [selected.cooldownGroup]: context.tick },
      processedEventIds,
    }
    return this.outcome('selected', selected, false, rngState, '已选择本地补充文案。')
  }

  reset(): void {
    this.state = { ...EMPTY_MEME_DIRECTOR_SNAPSHOT, consumedByGroup: {}, cooldowns: {}, processedEventIds: [] }
  }

  private outcome(status: MemeSelection['status'], selected: MemeDefinition | null, repeat: boolean, rngState: number, message: string): MemeSelection {
    return { status, memeId: selected?.id ?? null, text: selected?.text ?? null, repeat, rngState, state: this.getState(), message }
  }
}

export function createMemeDirector(definitions: readonly MemeDefinition[], snapshot?: Partial<MemeDirectorSnapshot>): MemeDirector {
  return new MemeDirector(definitions, snapshot)
}

export function selectMeme(director: MemeDirector, event: DomainEvent, context: MemeSelectionContext): MemeSelection {
  return director.select(event, context)
}

export function serializeMemeDirectorSnapshot(snapshot: MemeDirectorSnapshot): string {
  try {
    return JSON.stringify(snapshot)
  } catch (error) {
    throw new MemeDirectorSnapshotError(`memePack 快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseMemeDirectorSnapshot(input: string): MemeDirectorSnapshot {
  let parsed: unknown
  try { parsed = JSON.parse(input) } catch { throw new MemeDirectorSnapshotError('memePack 快照 JSON 无效。') }
  if (!parsed || typeof parsed !== 'object') throw new MemeDirectorSnapshotError('memePack 快照必须是对象。')
  const value = parsed as Partial<MemeDirectorSnapshot>
  if (value.version !== 1 || !value.consumedByGroup || !value.cooldowns || !Array.isArray(value.processedEventIds)) throw new MemeDirectorSnapshotError('memePack 快照缺少必要字段。')
  return normalizeSnapshot(value)
}

export function restoreMemeDirectorSnapshot(definitions: readonly MemeDefinition[], snapshot: MemeDirectorSnapshot): MemeDirector {
  return createMemeDirector(definitions, snapshot)
}
