import type { Condition, ConditionContext } from '../../types/conditions'
import type { Effect, EffectCatalog, EffectState } from '../../types/effects'
import type { DomainEvent } from '../../types/events'
import type {
  SituationComboDefinition,
  SituationComboEngineOptions,
  SituationComboOutcome,
  SituationComboSnapshot,
  SituationComboValidationIssue,
  SituationComboValidationResult,
} from '../../types/comedy'
import { createEffectState } from '../../types/effects'
import { evaluateCondition } from '../conditions/evaluate'
import { executeEffects } from '../effects/execute'

const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

export class SituationComboEngineError extends Error {
  readonly issues?: readonly SituationComboValidationIssue[]

  constructor(message: string, issues?: readonly SituationComboValidationIssue[]) {
    super(message)
    this.name = 'SituationComboEngineError'
    this.issues = issues
  }
}

export class SituationComboSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SituationComboSnapshotError'
  }
}

function issue(code: SituationComboValidationIssue['code'], path: string, message: string, id?: string): SituationComboValidationIssue {
  return { code, path, message, ...(id ? { id } : {}) }
}

function requireText(value: unknown, path: string, issues: SituationComboValidationIssue[], id: string): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(issue('invalid_value', path, '值不能为空', id))
}

function validateCondition(condition: unknown, path: string, issues: SituationComboValidationIssue[], id: string): void {
  if (!condition || typeof condition !== 'object') {
    issues.push(issue('invalid_value', path, 'Condition 必须是对象', id))
    return
  }
  const value = condition as Record<string, unknown>
  switch (value.type) {
    case 'quest_complete':
    case 'has_item':
      requireText(value.questId ?? value.itemId, `${path}.${value.type === 'quest_complete' ? 'questId' : 'itemId'}`, issues, id)
      if (value.type === 'has_item' && value.count !== undefined && (!Number.isInteger(value.count) || (value.count as number) <= 0)) issues.push(issue('invalid_value', `${path}.count`, '物品数量必须是正整数', id))
      return
    case 'stat_gte':
      requireText(value.stat, `${path}.stat`, issues, id)
      if (typeof value.value !== 'number' || !Number.isFinite(value.value)) issues.push(issue('invalid_value', `${path}.value`, '数值必须是有限数字', id))
      return
    case 'flag_equals':
      requireText(value.flag, `${path}.flag`, issues, id)
      if (typeof value.value !== 'boolean') issues.push(issue('invalid_value', `${path}.value`, 'Flag 值必须是布尔值', id))
      return
    case 'not':
      validateCondition(value.condition, `${path}.condition`, issues, id)
      return
    case 'all':
    case 'any':
      if (!Array.isArray(value.conditions)) {
        issues.push(issue('invalid_value', `${path}.conditions`, '组合条件必须是数组', id))
        return
      }
      value.conditions.forEach((child, index) => validateCondition(child, `${path}.conditions[${index}]`, issues, id))
      return
    default:
      issues.push(issue('invalid_value', `${path}.type`, `未知 Condition 类型「${String(value.type)}」`, id))
  }
}

function validateEffect(effect: unknown, path: string, issues: SituationComboValidationIssue[], id: string): void {
  if (!effect || typeof effect !== 'object') {
    issues.push(issue('invalid_value', path, 'Effect 必须是对象', id))
    return
  }
  const value = effect as Record<string, unknown>
  switch (value.type) {
    case 'give_item':
      requireText(value.itemId, `${path}.itemId`, issues, id)
      if (value.count !== undefined && (!Number.isInteger(value.count) || (value.count as number) <= 0)) issues.push(issue('invalid_value', `${path}.count`, '数量必须是正整数', id))
      break
    case 'give_exp':
      if (typeof value.amount !== 'number' || !Number.isFinite(value.amount) || value.amount < 0) issues.push(issue('invalid_value', `${path}.amount`, '经验必须是非负有限数字', id))
      break
    case 'set_flag':
      requireText(value.flag, `${path}.flag`, issues, id)
      if (typeof value.value !== 'boolean') issues.push(issue('invalid_value', `${path}.value`, 'Flag 值必须是布尔值', id))
      break
    case 'unlock_quest':
      requireText(value.questId, `${path}.questId`, issues, id)
      break
    case 'change_stat':
      requireText(value.stat, `${path}.stat`, issues, id)
      if (typeof value.delta !== 'number' || !Number.isFinite(value.delta)) issues.push(issue('invalid_value', `${path}.delta`, '属性变化必须是有限数字', id))
      break
    case 'trigger_battle':
      requireText(value.enemyId, `${path}.enemyId`, issues, id)
      break
    case 'narrate':
      requireText(value.lineId, `${path}.lineId`, issues, id)
      break
    default:
      issues.push(issue('invalid_value', `${path}.type`, `未知 Effect 类型「${String(value.type)}」`, id))
  }
  if (value.grantKey !== undefined) requireText(value.grantKey, `${path}.grantKey`, issues, id)
}

function validateDependencies(definitions: readonly SituationComboDefinition[], issues: SituationComboValidationIssue[]): void {
  const known = new Set(definitions.map((definition) => definition.id))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const walk = (definition: SituationComboDefinition, chain: readonly string[]) => {
    if (visiting.has(definition.id)) {
      issues.push(issue('dependency_cycle', `situations[${definitions.indexOf(definition)}].dependsOn`, `检测到依赖循环：${[...chain, definition.id].join(' -> ')}`, definition.id))
      return
    }
    if (visited.has(definition.id)) return
    visiting.add(definition.id)
    definition.dependsOn?.forEach((dependency) => {
      if (!known.has(dependency)) issues.push(issue('missing_dependency', `situations[${definitions.indexOf(definition)}].dependsOn`, `依赖不存在「${dependency}」`, definition.id))
      else walk(definitions.find((candidate) => candidate.id === dependency)!, [...chain, definition.id])
    })
    visiting.delete(definition.id)
    visited.add(definition.id)
  }
  definitions.forEach((definition) => walk(definition, []))
}

export function validateSituationComboDefinitions(definitions: readonly SituationComboDefinition[]): SituationComboValidationResult {
  const issues: SituationComboValidationIssue[] = []
  const seenIds = new Set<string>()
  const grantKeys = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    const path = `situations[${definitionIndex}]`
    if (seenIds.has(definition.id)) issues.push(issue('duplicate_id', `${path}.id`, `重复情境组合 ID「${definition.id}」`, definition.id))
    seenIds.add(definition.id)
    requireText(definition.id, `${path}.id`, issues, definition.id)
    requireText(definition.triggerEvent, `${path}.triggerEvent`, issues, definition.id)
    requireText(definition.cooldownGroup, `${path}.cooldownGroup`, issues, definition.id)
    requireText(definition.firstCueId, `${path}.firstCueId`, issues, definition.id)
    requireText(definition.repeatCueId, `${path}.repeatCueId`, issues, definition.id)
    requireText(definition.reducedMotionCueId, `${path}.reducedMotionCueId`, issues, definition.id)
    if (!Number.isFinite(definition.maxBlockingMs) || definition.maxBlockingMs < 0 || definition.maxBlockingMs > 1200) issues.push(issue('invalid_value', `${path}.maxBlockingMs`, '演出阻塞时间必须在 0–1200ms', definition.id))
    if (definition.cooldownTicks !== undefined && (!Number.isInteger(definition.cooldownTicks) || definition.cooldownTicks < 0)) issues.push(issue('invalid_value', `${path}.cooldownTicks`, '冷却 tick 必须是非负整数', definition.id))
    const tags = new Set<string>()
    definition.requiredTags.forEach((tag, tagIndex) => {
      requireText(tag, `${path}.requiredTags[${tagIndex}]`, issues, definition.id)
      if (tags.has(tag)) issues.push(issue('duplicate_id', `${path}.requiredTags[${tagIndex}]`, `重复标签「${tag}」`, definition.id))
      tags.add(tag)
    })
    definition.conditions.forEach((condition, conditionIndex) => validateCondition(condition, `${path}.conditions[${conditionIndex}]`, issues, definition.id))
    definition.effects.forEach((effect, effectIndex) => validateEffect(effect, `${path}.effects[${effectIndex}]`, issues, definition.id))
    if (definition.effects.length > 0 && !definition.firstDiscoveryGrantKey?.trim()) issues.push(issue('missing_grant_key', `${path}.firstDiscoveryGrantKey`, '带奖励的情境组合必须声明首次发现 grantKey', definition.id))
    if (definition.firstDiscoveryGrantKey) {
      if (grantKeys.has(definition.firstDiscoveryGrantKey)) issues.push(issue('duplicate_id', `${path}.firstDiscoveryGrantKey`, `重复 grantKey「${definition.firstDiscoveryGrantKey}」`, definition.id))
      grantKeys.add(definition.firstDiscoveryGrantKey)
    }
  })
  validateDependencies(definitions, issues)
  return { valid: issues.length === 0, issues }
}

export function assertValidSituationComboDefinitions(definitions: readonly SituationComboDefinition[]): void {
  const result = validateSituationComboDefinitions(definitions)
  if (!result.valid) throw new SituationComboEngineError(`情境组合校验失败：${result.issues.map((item) => item.message).join('；')}`, result.issues)
}

function nextFloat(seed: number): [number, number] {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0
  let value = nextSeed
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return [nextSeed, ((value ^ (value >>> 14)) >>> 0) / 4294967296]
}

function cloneSnapshot(snapshot: SituationComboSnapshot): SituationComboSnapshot {
  return {
    discoveredComboIds: [...snapshot.discoveredComboIds],
    claimedGrantKeys: [...snapshot.claimedGrantKeys],
    processedEventIds: [...snapshot.processedEventIds],
    cooldowns: { ...snapshot.cooldowns },
  }
}

function resolveContext(options: SituationComboEngineOptions, context: ConditionContext | undefined): ConditionContext {
  if (context) return context
  return typeof options.conditionContext === 'function' ? options.conditionContext() : options.conditionContext ?? EMPTY_CONTEXT
}

function hasRequiredTags(definition: SituationComboDefinition, tags: ReadonlySet<string>): boolean {
  return definition.requiredTags.every((tag) => tags.has(tag))
}

export class SituationComboEngine {
  private readonly definitions: readonly SituationComboDefinition[]
  private readonly options: SituationComboEngineOptions
  private state: SituationComboSnapshot
  private effectState: EffectState

  constructor(definitions: readonly SituationComboDefinition[], snapshot?: Partial<SituationComboSnapshot>, options: SituationComboEngineOptions = {}) {
    assertValidSituationComboDefinitions(definitions)
    this.definitions = [...definitions]
    this.options = options
    this.state = {
      discoveredComboIds: [...(snapshot?.discoveredComboIds ?? [])],
      claimedGrantKeys: [...(snapshot?.claimedGrantKeys ?? [])],
      processedEventIds: [...(snapshot?.processedEventIds ?? [])],
      cooldowns: { ...(snapshot?.cooldowns ?? {}) },
    }
    this.effectState = options.effectState ?? createEffectState()
  }

  getState(): SituationComboSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): SituationComboSnapshot {
    return this.getState()
  }

  getEffectState(): EffectState {
    return this.effectState
  }

  trigger(event: DomainEvent, context: { readonly conditionContext?: ConditionContext; readonly tags?: readonly string[]; readonly tick: number; readonly actionId: string; readonly rngState: number }): SituationComboOutcome {
    if (!Number.isInteger(context.tick) || context.tick < 0) throw new SituationComboEngineError('tick 必须是非负整数。')
    if (!context.actionId.trim()) throw new SituationComboEngineError('actionId 不能为空。')
    if (!Number.isInteger(context.rngState) || context.rngState < 0) throw new SituationComboEngineError('rngState 必须是非负整数。')
    let rngState = context.rngState >>> 0
    if (this.state.processedEventIds.includes(event.id)) return this.outcome('duplicate_event', null, false, rngState, '该事件已经处理过。')
    const nextProcessed = [...this.state.processedEventIds, event.id]
    const conditionContext = resolveContext(this.options, context.conditionContext)
    const tags = new Set(context.tags ?? [])
    const triggered = this.definitions.filter((definition) => definition.triggerEvent === event.type && definition.conditions.every((condition) => {
      try {
        return evaluateCondition(condition, conditionContext)
      } catch {
        return false
      }
    }))
    const tagged = triggered.filter((definition) => hasRequiredTags(definition, tags))
    if (tagged.length === 0) {
      this.state = { ...this.state, processedEventIds: nextProcessed }
      return this.outcome(triggered.length > 0 ? 'missing_tags' : 'none', null, false, rngState, triggered.length > 0 ? '缺少情境组合所需标签。' : '没有匹配的情境组合。')
    }
    const available = tagged.filter((definition) => {
      const lastTick = this.state.cooldowns[definition.cooldownGroup]
      return lastTick === undefined || context.tick - lastTick >= (definition.cooldownTicks ?? 1)
    })
    if (available.length === 0) {
      this.state = { ...this.state, processedEventIds: nextProcessed }
      return this.outcome('cooldown', null, false, rngState, '情境组合仍在冷却中。')
    }
    let roll: number
    ;[rngState, roll] = nextFloat(rngState)
    const definition = available[Math.min(available.length - 1, Math.floor(roll * available.length))]!
    const alreadyDiscovered = this.state.discoveredComboIds.includes(definition.id)
      || (definition.firstDiscoveryGrantKey !== undefined && this.state.claimedGrantKeys.includes(definition.firstDiscoveryGrantKey))
    const nextCooldowns = { ...this.state.cooldowns, [definition.cooldownGroup]: context.tick }
    if (alreadyDiscovered) {
      this.state = {
        ...this.state,
        processedEventIds: nextProcessed,
        cooldowns: nextCooldowns,
        discoveredComboIds: this.state.discoveredComboIds.includes(definition.id) ? this.state.discoveredComboIds : [...this.state.discoveredComboIds, definition.id],
      }
      return this.outcome('repeat', definition.id, true, rngState, '情境组合再次触发，仅保留短反馈。', definition.repeatCueId)
    }
    const effectResult = definition.effects.length > 0
      ? executeEffects(definition.effects as readonly Effect[], this.effectState, { sourceActionId: context.actionId, occurredAtTick: context.tick, catalog: this.options.effectCatalog })
      : undefined
    if (effectResult) this.effectState = effectResult.state
    this.state = {
      discoveredComboIds: [...this.state.discoveredComboIds, definition.id],
      claimedGrantKeys: definition.firstDiscoveryGrantKey ? [...this.state.claimedGrantKeys, definition.firstDiscoveryGrantKey] : [...this.state.claimedGrantKeys],
      processedEventIds: nextProcessed,
      cooldowns: nextCooldowns,
    }
    return this.outcome('triggered', definition.id, false, rngState, '首次发现情境组合。', definition.firstCueId, effectResult)
  }

  select(event: DomainEvent, context: { readonly conditionContext?: ConditionContext; readonly tags?: readonly string[]; readonly tick: number; readonly actionId: string; readonly rngState: number }): SituationComboOutcome {
    return this.trigger(event, context)
  }

  private outcome(status: SituationComboOutcome['status'], comboId: string | null, repeat: boolean, rngState: number, message: string, cueId?: string, effectResult?: SituationComboOutcome['effectResult']): SituationComboOutcome {
    this.state = { ...this.state }
    return { status, comboId, repeat, ...(cueId ? { cueId } : {}), ...(effectResult ? { effectResult, events: effectResult.events } : {}), state: this.getState(), rngState, message }
  }
}

export function createSituationComboEngine(definitions: readonly SituationComboDefinition[], snapshot?: Partial<SituationComboSnapshot>, options: SituationComboEngineOptions = {}): SituationComboEngine {
  return new SituationComboEngine(definitions, snapshot, options)
}

export function triggerSituationCombo(engine: SituationComboEngine, event: DomainEvent, context: { readonly conditionContext?: ConditionContext; readonly tags?: readonly string[]; readonly tick: number; readonly actionId: string; readonly rngState: number }): SituationComboOutcome {
  return engine.trigger(event, context)
}

export function serializeSituationComboSnapshot(snapshot: SituationComboSnapshot): string {
  try {
    const text = JSON.stringify(snapshot)
    if (text === undefined) throw new SituationComboSnapshotError('情境组合快照无法序列化。')
    return text
  } catch (error) {
    if (error instanceof SituationComboSnapshotError) throw error
    throw new SituationComboSnapshotError(`情境组合快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseSituationComboSnapshot(input: string): SituationComboSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new SituationComboSnapshotError('情境组合快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new SituationComboSnapshotError('情境组合快照必须是对象。')
  const value = parsed as Partial<SituationComboSnapshot>
  if (!Array.isArray(value.discoveredComboIds) || !Array.isArray(value.claimedGrantKeys) || !Array.isArray(value.processedEventIds) || !value.cooldowns || typeof value.cooldowns !== 'object') {
    throw new SituationComboSnapshotError('情境组合快照缺少必要字段。')
  }
  return value as SituationComboSnapshot
}

export function restoreSituationComboSnapshot(definitions: readonly SituationComboDefinition[], snapshot: SituationComboSnapshot, options: SituationComboEngineOptions = {}): SituationComboEngine {
  return createSituationComboEngine(definitions, snapshot, options)
}
