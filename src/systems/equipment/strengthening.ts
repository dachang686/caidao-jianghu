import { DeterministicRng } from '../rng'
import type {
  StrengtheningAttempt,
  StrengtheningCost,
  StrengtheningLevelConfig,
  StrengtheningResult,
  StrengtheningState,
  StrengtheningStatDelta,
} from '../../types/strengthening'
import type { DerivedCombatStats } from '../../types/skill'
import { strengtheningBalance } from '../../content/balance/strengthening'

export class StrengtheningError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StrengtheningError'
  }
}

function attemptKey(state: StrengtheningState): string {
  return `${state.equipmentInstanceId}:${state.attemptCount}`
}

function validateState(state: StrengtheningState): void {
  if (!state.equipmentInstanceId.trim()) throw new StrengtheningError('装备实例 ID 不能为空')
  if (!Number.isInteger(state.level) || state.level < 0 || state.level > 5) throw new StrengtheningError('强化等级必须在 0–5 之间')
  if (!Number.isInteger(state.attemptCount) || state.attemptCount < 0) throw new StrengtheningError('强化尝试序号必须是非负整数')
  if (!Number.isFinite(state.silver) || state.silver < 0) throw new StrengtheningError('银两必须是非负有限数字')
}

function getLevelConfig(level: number, balance: readonly StrengtheningLevelConfig[]): StrengtheningLevelConfig | undefined {
  return balance.find((config) => config.fromLevel === level)
}

function hasCost(state: StrengtheningState, cost: StrengtheningCost): boolean {
  return state.silver >= cost.silver && (state.materials[cost.materialId] ?? 0) >= cost.materialCount
}

function addDelta(current: StrengtheningStatDelta, delta: StrengtheningStatDelta): StrengtheningStatDelta {
  return {
    attack: (current.attack ?? 0) + (delta.attack ?? 0), defense: (current.defense ?? 0) + (delta.defense ?? 0), maxHp: (current.maxHp ?? 0) + (delta.maxHp ?? 0),
    maxQi: (current.maxQi ?? 0) + (delta.maxQi ?? 0), posture: (current.posture ?? 0) + (delta.posture ?? 0), accuracy: (current.accuracy ?? 0) + (delta.accuracy ?? 0),
    dodge: (current.dodge ?? 0) + (delta.dodge ?? 0), crit: (current.crit ?? 0) + (delta.crit ?? 0),
  }
}

function duplicateResult(state: StrengtheningState): StrengtheningResult | undefined {
  const key = attemptKey(state)
  const previous = state.history.find((attempt) => attempt.key === key)
  if (!previous) return undefined
  return { key, outcome: 'duplicate', fromLevel: previous.fromLevel, toLevel: previous.toLevel, roll: previous.roll, cost: previous.cost, statDelta: {} }
}

export function createStrengtheningState(equipmentInstanceId: string, overrides: Partial<StrengtheningState> = {}): StrengtheningState {
  if (!equipmentInstanceId.trim()) throw new StrengtheningError('装备实例 ID 不能为空')
  return {
    equipmentInstanceId,
    level: 0,
    silver: 0,
    materials: {},
    bonus: {},
    attemptCount: 0,
    history: [],
    ...overrides,
  }
}

export function rollStrengthening(
  state: StrengtheningState,
  saveSeed: number,
  balance: readonly StrengtheningLevelConfig[] = strengtheningBalance,
): StrengtheningResult {
  validateState(state)
  const duplicate = duplicateResult(state)
  if (duplicate) return duplicate
  const key = attemptKey(state)
  const config = getLevelConfig(state.level, balance)
  if (!config) return { key, outcome: 'capped', fromLevel: state.level, toLevel: state.level, roll: 0, cost: null, statDelta: {} }
  const rng = new DeterministicRng(saveSeed).fork(`strengthening:${state.equipmentInstanceId}:${state.attemptCount}`)
  const roll = rng.nextFloat()
  return {
    key,
    outcome: roll < config.successChance ? 'success' : 'failed',
    fromLevel: config.fromLevel,
    toLevel: roll < config.successChance ? config.toLevel : config.fromLevel,
    roll,
    cost: config.cost,
    statDelta: roll < config.successChance ? config.statDelta : {},
  }
}

export function applyStrengtheningResult(state: StrengtheningState, result: StrengtheningResult): StrengtheningState {
  validateState(state)
  if (result.key !== attemptKey(state)) {
    if (state.history.some((attempt) => attempt.key === result.key)) return state
    throw new StrengtheningError('强化结果与当前尝试序号不匹配')
  }
  if (result.outcome === 'capped' || result.outcome === 'duplicate') return state
  if (!result.cost || !hasCost(state, result.cost)) throw new StrengtheningError('强化材料或银两不足')
  const materials = { ...state.materials, [result.cost.materialId]: (state.materials[result.cost.materialId] ?? 0) - result.cost.materialCount }
  const attempt: StrengtheningAttempt = { key: result.key, fromLevel: result.fromLevel, toLevel: result.toLevel, success: result.outcome === 'success', roll: result.roll, cost: result.cost }
  return {
    ...state,
    level: result.toLevel,
    silver: state.silver - result.cost.silver,
    materials,
    bonus: addDelta(state.bonus, result.statDelta),
    attemptCount: state.attemptCount + 1,
    history: [...state.history, attempt],
  }
}

export function attemptStrengthening(
  state: StrengtheningState,
  saveSeed: number,
  balance: readonly StrengtheningLevelConfig[] = strengtheningBalance,
): { readonly state: StrengtheningState; readonly result: StrengtheningResult } {
  const result = rollStrengthening(state, saveSeed, balance)
  if (result.outcome === 'capped' || result.outcome === 'duplicate') return { state, result }
  if (!result.cost || !hasCost(state, result.cost)) return { state, result: { ...result, outcome: 'insufficient_resources', statDelta: {} } }
  return { state: applyStrengtheningResult(state, result), result }
}

export function applyStrengtheningBonuses(base: DerivedCombatStats, bonuses: readonly StrengtheningStatDelta[]): DerivedCombatStats {
  const next = { ...base }
  bonuses.forEach((bonus) => {
    ;(['attack', 'defense', 'maxHp', 'maxQi', 'posture', 'accuracy', 'dodge', 'crit'] as const).forEach((stat) => {
      next[stat] += bonus[stat] ?? 0
    })
  })
  return {
    ...next,
    maxHp: Math.max(1, next.maxHp), maxQi: Math.max(0, next.maxQi), attack: Math.max(0, next.attack), defense: Math.max(0, next.defense), posture: Math.max(1, next.posture),
    accuracy: Math.max(0, Math.min(1, next.accuracy)), dodge: Math.max(0, Math.min(1, next.dodge)), crit: Math.max(0, Math.min(1, next.crit)),
  }
}

export const strengthenEquipment = attemptStrengthening
export const applyStrengthening = applyStrengtheningResult
