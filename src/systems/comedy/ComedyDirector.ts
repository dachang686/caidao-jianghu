import { evaluateCondition } from '../../systems/conditions'
import type { Effect } from '../../types/effects'
import type { DomainEvent } from '../../types/events'
import type { ComedyBeatDefinition, ComedyCueRequest, ComedySelection, ComedySelectionContext, SituationComboDefinition } from '../../types/comedy'

export class ComedyDirectorError extends Error {
  readonly definitionId?: string

  constructor(message: string, definitionId?: string) {
    super(definitionId ? `笑点「${definitionId}」：${message}` : message)
    this.name = 'ComedyDirectorError'
    this.definitionId = definitionId
  }
}

interface Candidate extends ComedyBeatDefinition {
  readonly effects?: readonly Effect[]
  readonly requiredTags?: readonly string[]
  readonly firstDiscoveryGrantKey?: string
}

function nextFloat(seed: number): [number, number] {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0
  let value = nextSeed
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return [nextSeed, ((value ^ (value >>> 14)) >>> 0) / 4294967296]
}

function requireText(value: string, field: string, definitionId: string): void {
  if (!value.trim()) throw new ComedyDirectorError(`${field} 不能为空`, definitionId)
}

function validateEffect(effect: Effect, definitionId: string, path: string): void {
  const value = effect as unknown as Record<string, unknown>
  if (!value.type || typeof value.type !== 'string') throw new ComedyDirectorError(`${path}.type 无效`, definitionId)
  switch (effect.type) {
    case 'give_item':
      requireText(effect.itemId, `${path}.itemId`, definitionId)
      if (effect.count !== undefined && (!Number.isInteger(effect.count) || effect.count <= 0)) throw new ComedyDirectorError(`${path}.count 必须是正整数`, definitionId)
      break
    case 'give_exp':
      if (!Number.isFinite(effect.amount) || effect.amount < 0) throw new ComedyDirectorError(`${path}.amount 不能为负数或非数字`, definitionId)
      break
    case 'set_flag':
      requireText(effect.flag, `${path}.flag`, definitionId)
      break
    case 'unlock_quest':
      requireText(effect.questId, `${path}.questId`, definitionId)
      break
    case 'change_stat':
      if (!Number.isFinite(effect.delta)) throw new ComedyDirectorError(`${path}.delta 必须是有限数字`, definitionId)
      break
    case 'trigger_battle':
      requireText(effect.enemyId, `${path}.enemyId`, definitionId)
      break
    case 'narrate':
      requireText(effect.lineId, `${path}.lineId`, definitionId)
      break
    default:
      throw new ComedyDirectorError(`${path} 包含不允许的 Effect 类型`, definitionId)
  }
}

function validateDefinition(definition: Candidate): void {
  requireText(definition.id, 'id', definition.id)
  requireText(definition.triggerEvent, 'triggerEvent', definition.id)
  requireText(definition.cooldownGroup, 'cooldownGroup', definition.id)
  requireText(definition.firstCueId, 'firstCueId', definition.id)
  requireText(definition.repeatCueId, 'repeatCueId', definition.id)
  requireText(definition.reducedMotionCueId, 'reducedMotionCueId', definition.id)
  if (!Number.isFinite(definition.maxBlockingMs) || definition.maxBlockingMs < 0 || definition.maxBlockingMs > 1200) throw new ComedyDirectorError('maxBlockingMs 必须在 0–1200 之间', definition.id)
  if (definition.cooldownTicks !== undefined && (!Number.isInteger(definition.cooldownTicks) || definition.cooldownTicks < 0)) throw new ComedyDirectorError('cooldownTicks 必须是非负整数', definition.id)
  definition.effects?.forEach((effect, index) => validateEffect(effect, definition.id, `effects[${index}]`))
  definition.requiredTags?.forEach((tag, index) => requireText(tag, `requiredTags[${index}]`, definition.id))
}

function validateGraph(definitions: readonly Candidate[]): void {
  const known = new Set(definitions.map((definition) => definition.id))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const walk = (definition: Candidate, chain: readonly string[]) => {
    if (visiting.has(definition.id)) throw new ComedyDirectorError(`检测到依赖循环：${[...chain, definition.id].join(' -> ')}`, definition.id)
    if (visited.has(definition.id)) return
    visiting.add(definition.id)
    for (const dependency of definition.dependsOn ?? []) {
      if (!known.has(dependency)) throw new ComedyDirectorError(`依赖不存在「${dependency}」`, definition.id)
      walk(definitions.find((item) => item.id === dependency)!, [...chain, definition.id])
    }
    visiting.delete(definition.id)
    visited.add(definition.id)
  }
  definitions.forEach((definition) => walk(definition, []))
}

export class ComedyDirector {
  private readonly definitions = new Map<string, Candidate>()
  private readonly lastTriggeredTick = new Map<string, number>()
  private readonly seenDefinitions = new Set<string>()

  constructor(definitions: readonly (ComedyBeatDefinition | SituationComboDefinition)[] = []) {
    definitions.forEach((definition) => {
      const candidate = definition as Candidate
      validateDefinition(candidate)
      if (this.definitions.has(definition.id)) throw new ComedyDirectorError('ID 重复注册', definition.id)
      this.definitions.set(definition.id, candidate)
    })
    validateGraph([...this.definitions.values()])
  }

  register(definition: ComedyBeatDefinition | SituationComboDefinition): () => void {
    const candidate = definition as Candidate
    validateDefinition(candidate)
    if (this.definitions.has(definition.id)) throw new ComedyDirectorError('ID 重复注册', definition.id)
    this.definitions.set(definition.id, candidate)
    try {
      validateGraph([...this.definitions.values()])
    } catch (error) {
      this.definitions.delete(definition.id)
      throw error
    }
    return () => {
      if (this.definitions.get(definition.id) === candidate) this.definitions.delete(definition.id)
    }
  }

  select(event: DomainEvent, context: ComedySelectionContext): ComedySelection {
    if (!Number.isInteger(context.tick) || context.tick < 0) throw new ComedyDirectorError('tick 必须是非负整数')
    if (!context.actionId.trim()) throw new ComedyDirectorError('actionId 不能为空')
    if (!Number.isInteger(context.rngState) || context.rngState < 0) throw new ComedyDirectorError('rngState 必须是非负整数')
    let rngState = context.rngState >>> 0
    const tags = new Set(context.tags ?? [])
    const candidates = [...this.definitions.values()].filter((definition) => {
      if (definition.triggerEvent !== event.type) return false
      if (definition.requiredTags && !definition.requiredTags.every((tag) => tags.has(tag))) return false
      const lastTick = this.lastTriggeredTick.get(definition.cooldownGroup)
      if (!definition.required && lastTick !== undefined && context.tick - lastTick < (definition.cooldownTicks ?? 1)) return false
      return definition.conditions.every((condition) => evaluateCondition(condition, context.conditionContext))
    })
    const majors = candidates.filter((candidate) => candidate.scale === 'major')
    const minors = candidates.filter((candidate) => candidate.scale === 'minor')
    let major: ComedyCueRequest | null = null
    if (majors.length) {
      let roll: number
      ;[rngState, roll] = nextFloat(rngState)
      const picked = majors[Math.min(majors.length - 1, Math.floor(roll * majors.length))]
      major = this.makeCue(picked, event, context)
      this.lastTriggeredTick.set(picked.cooldownGroup, context.tick)
    }
    const selectedMinor: ComedyCueRequest[] = []
    const minorPool = minors.filter((candidate) => candidate.id !== major?.definitionId)
    while (selectedMinor.length < 2 && minorPool.length > 0) {
      let roll: number
      ;[rngState, roll] = nextFloat(rngState)
      const index = Math.min(minorPool.length - 1, Math.floor(roll * minorPool.length))
      const [picked] = minorPool.splice(index, 1)
      selectedMinor.push(this.makeCue(picked, event, context))
      this.lastTriggeredTick.set(picked.cooldownGroup, context.tick)
    }
    return { major, minor: selectedMinor, rngState }
  }

  reset(): void {
    this.lastTriggeredTick.clear()
    this.seenDefinitions.clear()
  }

  private makeCue(definition: Candidate, event: DomainEvent, context: ComedySelectionContext): ComedyCueRequest {
    const isRepeat = this.seenDefinitions.has(definition.id)
    this.seenDefinitions.add(definition.id)
    const effects = isRepeat && definition.firstDiscoveryGrantKey ? [] : [...(definition.effects ?? [])]
    return {
      definitionId: definition.id,
      layer: definition.layer,
      scale: definition.scale,
      cueId: isRepeat ? definition.repeatCueId : definition.firstCueId,
      reducedMotionCueId: definition.reducedMotionCueId,
      maxBlockingMs: definition.maxBlockingMs,
      isRepeat,
      eventId: event.id,
      effectRequests: effects,
    }
  }
}

export const createComedyDirector = (definitions: readonly (ComedyBeatDefinition | SituationComboDefinition)[] = []) => new ComedyDirector(definitions)
