import type { DomainEvent } from '../../types/events'
import type { Effect, EffectCatalog, EffectExecutionOptions, EffectExecutionResult, EffectState } from '../../types/effects'

export class EffectExecutionError extends Error {
  readonly path: string

  constructor(path: string, message: string) {
    super(`${path}: ${message}`)
    this.name = 'EffectExecutionError'
    this.path = path
  }
}

function isReadonlySet(value: readonly string[] | ReadonlySet<string>): value is ReadonlySet<string> {
  return typeof (value as ReadonlySet<string>).has === 'function'
}

function isKnown(collection: readonly string[] | ReadonlySet<string>, value: string): boolean {
  return isReadonlySet(collection) ? collection.has(value) : collection.includes(value)
}

function requireId(value: string, path: string, collection?: readonly string[] | ReadonlySet<string>): void {
  if (!value.trim()) throw new EffectExecutionError(path, 'ID 不能为空')
  if (collection && !isKnown(collection, value)) {
    throw new EffectExecutionError(path, `未知 ID「${value}」`)
  }
}

function requireFinite(value: number, path: string, minimum?: number): void {
  if (!Number.isFinite(value) || (minimum !== undefined && value < minimum)) {
    throw new EffectExecutionError(path, minimum === undefined ? '必须是有限数字' : `必须是大于等于 ${minimum} 的有限数字`)
  }
}

function requirePositiveInteger(value: number, path: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new EffectExecutionError(path, '必须是大于 0 的整数')
  }
}

function cloneState(state: EffectState): {
  inventory: Record<string, number>
  experience: number
  stats: Record<keyof EffectState['stats'], number>
  flags: Record<string, boolean>
  quests: Record<string, boolean>
  claimedGrantKeys: string[]
} {
  return {
    inventory: { ...state.inventory },
    experience: state.experience,
    stats: { ...state.stats },
    flags: { ...state.flags },
    quests: { ...state.quests },
    claimedGrantKeys: [...state.claimedGrantKeys],
  }
}

function makeEvent(type: string, payload: unknown, index: number, options: Required<Pick<EffectExecutionOptions, 'sourceActionId' | 'occurredAtTick'>>): DomainEvent {
  return {
    id: `${options.sourceActionId}:${index}`,
    type,
    occurredAtTick: options.occurredAtTick,
    payload,
    sourceActionId: options.sourceActionId,
  }
}

function claimGrant(state: { claimedGrantKeys: string[] }, grantKey: string | undefined, path: string): boolean {
  if (grantKey === undefined) return true
  requireId(grantKey, path)
  if (state.claimedGrantKeys.includes(grantKey)) return false
  state.claimedGrantKeys.push(grantKey)
  return true
}

function executeEffect(
  effect: Effect,
  index: number,
  state: ReturnType<typeof cloneState>,
  events: DomainEvent[],
  navigation: EffectExecutionResult['navigation'] extends readonly (infer Navigation)[] ? Navigation[] : never,
  options: Required<Pick<EffectExecutionOptions, 'sourceActionId' | 'occurredAtTick'>> & { catalog?: EffectCatalog },
): void {
  const path = `effects[${index}]`
  switch (effect.type) {
    case 'give_item': {
      requireId(effect.itemId, `${path}.itemId`, options.catalog?.itemIds)
      const count = effect.count ?? 1
      requirePositiveInteger(count, `${path}.count`)
      if (!claimGrant(state, effect.grantKey, `${path}.grantKey`)) return
      state.inventory[effect.itemId] = (state.inventory[effect.itemId] ?? 0) + count
      events.push(makeEvent('inventory.item_granted', { itemId: effect.itemId, count, grantKey: effect.grantKey }, index, options))
      return
    }
    case 'give_exp':
      requireFinite(effect.amount, `${path}.amount`, 0)
      if (!claimGrant(state, effect.grantKey, `${path}.grantKey`)) return
      state.experience += effect.amount
      events.push(makeEvent('player.experience_granted', { amount: effect.amount, grantKey: effect.grantKey }, index, options))
      return
    case 'set_flag':
      requireId(effect.flag, `${path}.flag`)
      state.flags[effect.flag] = effect.value
      events.push(makeEvent('world.flag_set', { flag: effect.flag, value: effect.value }, index, options))
      return
    case 'unlock_quest':
      requireId(effect.questId, `${path}.questId`, options.catalog?.questIds)
      state.quests[effect.questId] = true
      events.push(makeEvent('quest.unlocked', { questId: effect.questId }, index, options))
      return
    case 'change_stat':
      requireFinite(effect.delta, `${path}.delta`)
      state.stats[effect.stat] += effect.delta
      events.push(makeEvent('player.stat_changed', { stat: effect.stat, delta: effect.delta }, index, options))
      return
    case 'trigger_battle':
      requireId(effect.enemyId, `${path}.enemyId`, options.catalog?.enemyIds)
      navigation.push({ type: 'battle', enemyId: effect.enemyId })
      events.push(makeEvent('battle.requested', { enemyId: effect.enemyId }, index, options))
      return
    case 'narrate':
      requireId(effect.lineId, `${path}.lineId`, options.catalog?.lineIds)
      events.push(makeEvent('narration.requested', { lineId: effect.lineId }, index, options))
      return
    default:
      throw new EffectExecutionError(path, `未知 Effect 类型「${String((effect as { type?: unknown }).type)}」`)
  }
}

export function executeEffects(
  effects: readonly Effect[],
  state: EffectState,
  options: EffectExecutionOptions = {},
): EffectExecutionResult {
  const sourceActionId = options.sourceActionId ?? 'effect-action'
  const occurredAtTick = options.occurredAtTick ?? 0
  requireId(sourceActionId, 'sourceActionId')
  if (!Number.isInteger(occurredAtTick) || occurredAtTick < 0) {
    throw new EffectExecutionError('occurredAtTick', '必须是大于等于 0 的整数')
  }
  const next = cloneState(state)
  const events: DomainEvent[] = []
  const navigation: EffectExecutionResult['navigation'] extends readonly (infer Navigation)[] ? Navigation[] : never = []
  const executionOptions = { sourceActionId, occurredAtTick, catalog: options.catalog }
  effects.forEach((effect, index) => executeEffect(effect, index, next, events, navigation, executionOptions))
  return { state: next, events, navigation }
}

export const applyEffects = executeEffects
export const runEffects = executeEffects
