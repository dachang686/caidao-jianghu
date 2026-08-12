import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import { evaluateCondition } from '../conditions/evaluate'
import type {
  UnlockableDefinition,
  UnlockableDiagnostics,
  UnlockableEventContext,
  UnlockableOutcome,
  UnlockableSnapshot,
  UnlockableTitleBonus,
  UnlockableTitleStat,
  UnlockableValidationIssue,
  UnlockableValidationResult,
  UnlockableView,
} from '../../types/unlockable'

const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

const KINDS = new Set(['npc', 'enemy', 'skill', 'title', 'achievement'])

export const EMPTY_UNLOCKABLE_SNAPSHOT: UnlockableSnapshot = {
  version: 1,
  unlockedIds: [],
  claimedRewardIds: [],
  processedEventIds: [],
}

export class UnlockableEngineError extends Error {
  readonly issues?: readonly UnlockableValidationIssue[]

  constructor(message: string, issues?: readonly UnlockableValidationIssue[]) {
    super(message)
    this.name = 'UnlockableEngineError'
    this.issues = issues
  }
}

export class UnlockableSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnlockableSnapshotError'
  }
}

function issue(code: UnlockableValidationIssue['code'], path: string, message: string, id?: string): UnlockableValidationIssue {
  return { code, path, message, ...(id ? { id } : {}) }
}

function text(value: unknown, path: string, issues: UnlockableValidationIssue[], id: string): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(issue('invalid_value', path, '值不能为空', id))
}

export function validateUnlockableDefinitions(definitions: readonly UnlockableDefinition[]): UnlockableValidationResult {
  const issues: UnlockableValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, index) => {
    const path = `unlockables[${index}]`
    if (seen.has(definition.id)) issues.push(issue('duplicate_id', `${path}.id`, `重复解锁条目 ID「${definition.id}」`, definition.id))
    seen.add(definition.id)
    text(definition.id, `${path}.id`, issues, definition.id)
    if (!KINDS.has(definition.kind)) issues.push(issue('invalid_kind', `${path}.kind`, `未知解锁条目类型「${String(definition.kind)}」`, definition.id))
    text(definition.name, `${path}.name`, issues, definition.id)
    text(definition.description, `${path}.description`, issues, definition.id)
    text(definition.clue, `${path}.clue`, issues, definition.id)
    if (!Array.isArray(definition.eventRules) || definition.eventRules.length === 0) issues.push(issue('invalid_event', `${path}.eventRules`, '至少需要一个事件规则', definition.id))
    definition.eventRules?.forEach((rule, ruleIndex) => {
      text(rule.type, `${path}.eventRules[${ruleIndex}].type`, issues, definition.id)
      Object.entries(rule.payload ?? {}).forEach(([key, value]) => {
        text(key, `${path}.eventRules[${ruleIndex}].payload`, issues, definition.id)
        if (!['string', 'number', 'boolean'].includes(typeof value)) issues.push(issue('invalid_event', `${path}.eventRules[${ruleIndex}].payload.${key}`, '事件匹配值必须是字符串、数字或布尔值', definition.id))
      })
    })
    if (definition.titleBonus && definition.kind !== 'title') issues.push(issue('invalid_value', `${path}.titleBonus`, '只有称号条目可以配置派生奖励', definition.id))
    Object.entries(definition.titleBonus ?? {}).forEach(([stat, value]) => {
      if (!Number.isFinite(value)) issues.push(issue('invalid_value', `${path}.titleBonus.${stat}`, '称号奖励必须是有限数字', definition.id))
    })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidUnlockableDefinitions(definitions: readonly UnlockableDefinition[]): void {
  const result = validateUnlockableDefinitions(definitions)
  if (!result.valid) throw new UnlockableEngineError(`解锁条目校验失败：${result.issues.map((item) => item.message).join('；')}`, result.issues)
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function cloneSnapshot(snapshot: UnlockableSnapshot): UnlockableSnapshot {
  return {
    version: 1,
    unlockedIds: [...snapshot.unlockedIds],
    claimedRewardIds: [...snapshot.claimedRewardIds],
    processedEventIds: [...snapshot.processedEventIds],
  }
}

function normalizeSnapshot(snapshot?: Partial<UnlockableSnapshot>): UnlockableSnapshot {
  if (snapshot?.version !== undefined && snapshot.version !== 1) throw new UnlockableSnapshotError(`不支持的解锁存档版本「${String(snapshot.version)}」`)
  return {
    version: 1,
    unlockedIds: unique(snapshot?.unlockedIds ?? []),
    claimedRewardIds: unique(snapshot?.claimedRewardIds ?? []),
    processedEventIds: unique(snapshot?.processedEventIds ?? []),
  }
}

function payloadMatches(event: DomainEvent, expected: Readonly<Record<string, string | number | boolean>> | undefined): boolean {
  if (!expected) return true
  if (!event.payload || typeof event.payload !== 'object') return false
  const payload = event.payload as Record<string, unknown>
  return Object.entries(expected).every(([key, value]) => Object.is(payload[key], value))
}

function eventMatches(definition: UnlockableDefinition, event: DomainEvent, conditionContext: ConditionContext): boolean {
  const ruleMatches = definition.eventRules.some((rule) => rule.type === event.type && payloadMatches(event, rule.payload))
  if (!ruleMatches) return false
  try {
    return (definition.conditions ?? []).every((condition) => evaluateCondition(condition, conditionContext))
  } catch {
    return false
  }
}

function rewardKey(id: string): string {
  return `title-reward:${id}`
}

export function calculateTitleBonuses(definitions: readonly UnlockableDefinition[], unlockedIds: readonly string[]): UnlockableTitleBonus {
  const unlocked = new Set(unlockedIds)
  const result: UnlockableTitleBonus = {}
  const applied = new Set<string>()
  definitions.forEach((definition) => {
    if (definition.kind !== 'title' || !unlocked.has(definition.id) || applied.has(definition.id)) return
    applied.add(definition.id)
    Object.entries(definition.titleBonus ?? {}).forEach(([stat, value]) => {
      const key = stat as UnlockableTitleStat
      result[key] = (result[key] ?? 0) + (value ?? 0)
    })
  })
  return result
}

export function deriveTitleCombatStats<T extends object>(
  base: T,
  definitions: readonly UnlockableDefinition[],
  unlockedIds: readonly string[],
): T {
  const next: Record<string, number> = { ...base } as Record<string, number>
  const bonuses = calculateTitleBonuses(definitions, unlockedIds)
  Object.entries(bonuses).forEach(([stat, value]) => { next[stat] = (next[stat] ?? 0) + (value ?? 0) })
  return next as unknown as T
}

export const deriveTitleStats = deriveTitleCombatStats

export class UnlockableEngine {
  private readonly definitions: readonly UnlockableDefinition[]
  private readonly definitionsById: ReadonlyMap<string, UnlockableDefinition>
  private state: UnlockableSnapshot

  constructor(definitions: readonly UnlockableDefinition[], snapshot?: Partial<UnlockableSnapshot>) {
    assertValidUnlockableDefinitions(definitions)
    this.definitions = definitions.map((definition) => ({ ...definition, eventRules: definition.eventRules.map((rule) => ({ ...rule, payload: rule.payload ? { ...rule.payload } : undefined })) }))
    this.definitionsById = new Map(this.definitions.map((definition) => [definition.id, definition]))
    this.state = normalizeSnapshot(snapshot)
  }

  getState(): UnlockableSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): UnlockableSnapshot {
    return this.getState()
  }

  getDiagnostics(): UnlockableDiagnostics {
    const definitionIds = new Set(this.definitions.map((definition) => definition.id))
    const missingDefinitionIds = this.state.unlockedIds.filter((id) => !definitionIds.has(id))
    const missingRewardIds = this.state.claimedRewardIds.filter((key) => key.startsWith('title-reward:') && !definitionIds.has(key.slice('title-reward:'.length)))
    return { missingDefinitionIds, missingRewardIds }
  }

  getView(id: string): UnlockableView {
    const definition = this.definitionsById.get(id)
    if (!definition) throw new UnlockableEngineError(`未知解锁条目「${id}」`)
    const unlocked = this.state.unlockedIds.includes(id)
    return {
      definition,
      unlocked,
      displayName: unlocked ? definition.name : '未解锁条目',
      displayDescription: unlocked ? definition.description : definition.clue,
      silhouette: !unlocked,
    }
  }

  listViews(kind?: UnlockableDefinition['kind']): readonly UnlockableView[] {
    return this.definitions.filter((definition) => kind === undefined || definition.kind === kind).map((definition) => this.getView(definition.id))
  }

  applyEvent(event: DomainEvent, context: UnlockableEventContext = {}): UnlockableOutcome {
    if (!event || !event.id.trim() || !event.type.trim() || !event.sourceActionId.trim()) throw new UnlockableEngineError('解锁事件缺少有效 ID、类型或来源动作。')
    if (this.state.processedEventIds.includes(event.id)) return { status: 'duplicate_event', unlockedIds: [], titleRewardIds: [], state: this.getState(), message: '该解锁事件已经处理过。' }
    const conditionContext = context.conditionContext ?? EMPTY_CONTEXT
    const matched = this.definitions.filter((definition) => eventMatches(definition, event, conditionContext))
    const available = matched.filter((definition) => !this.state.unlockedIds.includes(definition.id))
    const processedEventIds = [...this.state.processedEventIds, event.id]
    if (available.length === 0) {
      this.state = { ...this.state, processedEventIds }
      return { status: matched.length > 0 ? 'already_unlocked' : 'no_match', unlockedIds: [], titleRewardIds: [], state: this.getState(), message: matched.length > 0 ? '该条目已经解锁，不重复发放奖励。' : '没有匹配的解锁条目。' }
    }
    const unlockedIds = [...this.state.unlockedIds, ...available.map((definition) => definition.id)]
    const titleRewardIds = available.filter((definition) => definition.titleBonus && Object.keys(definition.titleBonus).length > 0).map((definition) => definition.id)
    const claimedRewardIds = titleRewardIds.reduce((ids, id) => ids.includes(rewardKey(id)) ? ids : [...ids, rewardKey(id)], [...this.state.claimedRewardIds])
    this.state = { version: 1, unlockedIds, claimedRewardIds, processedEventIds }
    return { status: 'unlocked', unlockedIds: available.map((definition) => definition.id), titleRewardIds, state: this.getState(), message: `解锁 ${available.map((definition) => definition.name).join('、')}。` }
  }

  unlock(event: DomainEvent, context: UnlockableEventContext = {}): UnlockableOutcome {
    return this.applyEvent(event, context)
  }
}

export function createUnlockableEngine(definitions: readonly UnlockableDefinition[], snapshot?: Partial<UnlockableSnapshot>): UnlockableEngine {
  return new UnlockableEngine(definitions, snapshot)
}

export function applyUnlockableEvent(engine: UnlockableEngine, event: DomainEvent, context: UnlockableEventContext = {}): UnlockableOutcome {
  return engine.applyEvent(event, context)
}

export function serializeUnlockableSnapshot(snapshot: UnlockableSnapshot): string {
  try {
    const text = JSON.stringify(snapshot)
    if (text === undefined) throw new UnlockableSnapshotError('解锁快照无法序列化。')
    return text
  } catch (error) {
    if (error instanceof UnlockableSnapshotError) throw error
    throw new UnlockableSnapshotError(`解锁快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseUnlockableSnapshot(input: string): UnlockableSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new UnlockableSnapshotError('解锁快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new UnlockableSnapshotError('解锁快照必须是对象。')
  const value = parsed as Partial<UnlockableSnapshot>
  if (value.version !== 1 || !Array.isArray(value.unlockedIds) || !Array.isArray(value.claimedRewardIds) || !Array.isArray(value.processedEventIds)) throw new UnlockableSnapshotError('解锁快照缺少必要字段。')
  return normalizeSnapshot(value)
}

export function restoreUnlockableSnapshot(definitions: readonly UnlockableDefinition[], snapshot: UnlockableSnapshot): UnlockableEngine {
  return createUnlockableEngine(definitions, snapshot)
}
