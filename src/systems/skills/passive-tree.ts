import type {
  DerivedCombatStats,
  PassiveCalculationContext,
  PassiveCondition,
  PassiveDefinition,
  PassiveEffect,
  PassiveTreeState,
} from '../../types/skill'

export type PassiveValidationCode = 'duplicate_id' | 'missing_prerequisite' | 'prerequisite_cycle' | 'invalid_value'

export interface PassiveValidationIssue {
  readonly code: PassiveValidationCode
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface PassiveValidationResult {
  readonly valid: boolean
  readonly issues: readonly PassiveValidationIssue[]
}

export class PassiveTreeError extends Error {
  readonly issues: readonly PassiveValidationIssue[]

  constructor(message: string, issues: readonly PassiveValidationIssue[] = []) {
    super(message)
    this.name = 'PassiveTreeError'
    this.issues = issues
  }
}

export function validatePassiveDefinitions(definitions: readonly PassiveDefinition[]): PassiveValidationResult {
  const issues: PassiveValidationIssue[] = []
  const byId = new Map<string, PassiveDefinition>()
  definitions.forEach((definition, index) => {
    if (byId.has(definition.id)) issues.push({ code: 'duplicate_id', path: `passives[${index}].id`, message: `重复被动 ID「${definition.id}」`, id: definition.id })
    byId.set(definition.id, definition)
    if (!definition.id.trim() || !definition.name.trim()) issues.push({ code: 'invalid_value', path: `passives[${index}]`, message: '被动 ID 和名称不能为空', id: definition.id })
    definition.effects.forEach((effect, effectIndex) => {
      if (!Number.isFinite(effect.value)) issues.push({ code: 'invalid_value', path: `passives[${index}].effects[${effectIndex}].value`, message: '被动效果必须是有限数字', id: definition.id })
    })
    definition.prerequisiteIds?.forEach((prerequisiteId, prerequisiteIndex) => {
      if (!definitions.some((candidate) => candidate.id === prerequisiteId)) issues.push({ code: 'missing_prerequisite', path: `passives[${index}].prerequisiteIds[${prerequisiteIndex}]`, message: `找不到前置被动「${prerequisiteId}」`, id: prerequisiteId })
    })
    definition.mutuallyExclusiveIds?.forEach((exclusiveId) => {
      if (!definitions.some((candidate) => candidate.id === exclusiveId)) issues.push({ code: 'missing_prerequisite', path: `passives[${index}].mutuallyExclusiveIds`, message: `找不到互斥被动「${exclusiveId}」`, id: exclusiveId })
    })
  })

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (id: string, path: Set<string>): void => {
    if (path.has(id)) {
      issues.push({ code: 'prerequisite_cycle', path: `passives.${id}`, message: `被动前置存在循环「${id}」`, id })
      return
    }
    if (visited.has(id) || visiting.has(id)) return
    const definition = byId.get(id)
    if (!definition) return
    visiting.add(id)
    const nextPath = new Set(path)
    nextPath.add(id)
    definition.prerequisiteIds?.forEach((prerequisiteId) => visit(prerequisiteId, nextPath))
    visiting.delete(id)
    visited.add(id)
  }
  definitions.forEach((definition) => visit(definition.id, new Set()))
  return { valid: issues.length === 0, issues }
}

export function createPassiveTreeState(earnedSkillPoints = 0): PassiveTreeState {
  if (!Number.isInteger(earnedSkillPoints) || earnedSkillPoints < 0) throw new PassiveTreeError('已获得技能点必须是非负整数')
  return { earnedSkillPoints, spentSkillPoints: 0, unlockedPassiveIds: [] }
}

export function unlockPassive(state: PassiveTreeState, definitions: readonly PassiveDefinition[], passiveId: string): PassiveTreeState {
  const registry = new Map(definitions.map((definition) => [definition.id, definition]))
  const definition = registry.get(passiveId)
  if (!definition) throw new PassiveTreeError(`未知被动「${passiveId}」`)
  if (state.unlockedPassiveIds.includes(passiveId)) return state
  if (state.earnedSkillPoints - state.spentSkillPoints < 1) throw new PassiveTreeError('没有可用技能点')
  const missing = (definition.prerequisiteIds ?? []).filter((id) => !state.unlockedPassiveIds.includes(id))
  if (missing.length > 0) throw new PassiveTreeError(`被动「${passiveId}」缺少前置：${missing.join('、')}`)
  const exclusive = (definition.mutuallyExclusiveIds ?? []).find((id) => state.unlockedPassiveIds.includes(id))
  if (exclusive) throw new PassiveTreeError(`被动「${passiveId}」与「${exclusive}」互斥`)
  return { ...state, spentSkillPoints: state.spentSkillPoints + 1, unlockedPassiveIds: [...state.unlockedPassiveIds, passiveId] }
}

export function resetPassiveTree(state: PassiveTreeState): PassiveTreeState {
  return { ...state, spentSkillPoints: 0, unlockedPassiveIds: [] }
}

function conditionMet(condition: PassiveCondition | undefined, context: PassiveCalculationContext): boolean {
  switch (condition) {
    case undefined:
    case 'always': return true
    case 'low_hp': return (context.hpRatio ?? 1) <= 0.35
    case 'posture_broken': return context.postureBroken === true
    case 'control_failed': return context.controlFailed === true
    case 'out_of_combat': return context.outOfCombat === true
    default: return false
  }
}

export function recalculateDerivedStats(
  base: DerivedCombatStats,
  unlockedPassives: readonly PassiveDefinition[],
  context: PassiveCalculationContext = {},
): DerivedCombatStats {
  const next = { ...base }
  unlockedPassives.forEach((passive) => passive.effects.forEach((effect: PassiveEffect) => {
    if (!conditionMet(effect.condition, context)) return
    if (effect.operation === 'add') next[effect.stat] += effect.value
    else next[effect.stat] *= 1 + effect.value
  }))
  next.maxHp = Math.max(1, next.maxHp)
  next.maxQi = Math.max(0, next.maxQi)
  next.attack = Math.max(0, next.attack)
  next.defense = Math.max(0, next.defense)
  next.posture = Math.max(1, next.posture)
  next.accuracy = Math.max(0, Math.min(1, next.accuracy))
  next.dodge = Math.max(0, Math.min(1, next.dodge))
  next.crit = Math.max(0, Math.min(1, next.crit))
  next.qiRecovery = Math.max(0, next.qiRecovery)
  next.healingMultiplier = Math.max(0, next.healingMultiplier)
  next.damageWhenPostureBroken = Math.max(0, next.damageWhenPostureBroken)
  return next
}

export const recalculateStats = recalculateDerivedStats

