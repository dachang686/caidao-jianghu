import { executeEffects } from '../effects/execute'
import { getItemCount, removeItem } from '../inventory/inventory'
import type { SectBenefit, SectFacilityDefinition, SectFacilityId, SectFacilityLevel, SectState, SectUpgradeResult, SectUpgradeState } from '../../types/sect'
import { createSectState } from '../../types/sect'

export interface SectFacilityValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_level' | 'invalid_cost' | 'duplicate_grant_key' | 'missing_benefit'
  readonly path: string
  readonly message: string
}

export interface SectFacilityValidationResult {
  readonly valid: boolean
  readonly issues: readonly SectFacilityValidationIssue[]
}

export class SectFacilityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SectFacilityError'
  }
}

export function validateSectFacilityDefinitions(definitions: readonly SectFacilityDefinition[]): SectFacilityValidationResult {
  const issues: SectFacilityValidationIssue[] = []
  const ids = new Set<string>()
  const grantKeys = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    if (ids.has(definition.id)) issues.push({ code: 'duplicate_id', path: `facilities[${definitionIndex}].id`, message: `重复设施 ID「${definition.id}」` })
    ids.add(definition.id)
    if (definition.levels.length !== 3) issues.push({ code: 'invalid_level', path: `facilities[${definitionIndex}].levels`, message: '每项设施必须配置三级。' })
    definition.levels.forEach((level, levelIndex) => {
      if (level.level !== levelIndex + 1) issues.push({ code: 'invalid_level', path: `facilities[${definitionIndex}].levels[${levelIndex}].level`, message: '设施等级必须连续为 1、2、3。' })
      if (!validateCost(level.cost)) issues.push({ code: 'invalid_cost', path: `facilities[${definitionIndex}].levels[${levelIndex}].cost`, message: '设施升级成本无效。' })
      if (!level.grantKey.trim() || grantKeys.has(level.grantKey)) issues.push({ code: 'duplicate_grant_key', path: `facilities[${definitionIndex}].levels[${levelIndex}].grantKey`, message: `奖励幂等键无效或重复「${level.grantKey}」。` })
      grantKeys.add(level.grantKey)
      if (level.benefits.length === 0) issues.push({ code: 'missing_benefit', path: `facilities[${definitionIndex}].levels[${levelIndex}].benefits`, message: '每次升级至少要影响一个非经营系统。' })
    })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidSectFacilityDefinitions(definitions: readonly SectFacilityDefinition[]): void {
  const result = validateSectFacilityDefinitions(definitions)
  if (!result.valid) throw new SectFacilityError(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
}

function facilityDefinition(definitions: readonly SectFacilityDefinition[], facilityId: SectFacilityId): SectFacilityDefinition | undefined {
  return definitions.find((definition) => definition.id === facilityId)
}

function currentLevel(state: SectState, facilityId: SectFacilityId): SectFacilityLevel {
  return state.facilities[facilityId]
}

function nextLevelDefinition(definition: SectFacilityDefinition, level: SectFacilityLevel): SectFacilityDefinition['levels'][number] | undefined {
  return definition.levels.find((candidate) => candidate.level === level + 1)
}

function result(status: SectUpgradeResult['status'], state: SectUpgradeState, facilityId: SectFacilityId, targetLevel: SectFacilityLevel | null, message: string, extra: Partial<SectUpgradeResult> = {}): SectUpgradeResult {
  return { status, state, facilityId, targetLevel, message, ...extra }
}

function applyBenefit(benefits: SectState['benefits'], benefit: SectBenefit): SectState['benefits'] {
  switch (benefit.type) {
    case 'combat_stat_bonus':
      return benefit.stat === 'attack'
        ? { ...benefits, combatAttackBonus: benefits.combatAttackBonus + benefit.delta }
        : { ...benefits, combatDefenseBonus: benefits.combatDefenseBonus + benefit.delta }
    case 'unlock_recipe':
      return benefits.unlockedRecipeIds.includes(benefit.recipeId) ? benefits : { ...benefits, unlockedRecipeIds: [...benefits.unlockedRecipeIds, benefit.recipeId] }
    case 'strengthening_chance_bonus':
      return { ...benefits, strengtheningChanceBonus: benefits.strengtheningChanceBonus + benefit.delta }
    case 'reveal_region':
      return benefits.revealedRegionIds.includes(benefit.regionId) ? benefits : { ...benefits, revealedRegionIds: [...benefits.revealedRegionIds, benefit.regionId] }
    case 'commission_quality_bonus':
      return { ...benefits, commissionQualityBonus: benefits.commissionQualityBonus + benefit.delta }
    case 'fame_bonus':
      return { ...benefits, fameBonus: benefits.fameBonus + benefit.delta }
    default:
      return benefits
  }
}

function applyBenefits(state: SectState, benefits: readonly SectBenefit[]): SectState {
  return { ...state, benefits: benefits.reduce(applyBenefit, state.benefits) }
}

function validateCost(cost: SectFacilityDefinition['levels'][number]['cost']): boolean {
  return Number.isInteger(cost.silver) && cost.silver >= 0 && cost.materials.every((material) => Number.isInteger(material.count) && material.count > 0 && String(material.itemId).trim().length > 0)
}

export function upgradeFacility(
  initialState: SectUpgradeState,
  facilityId: SectFacilityId,
  definitions: readonly SectFacilityDefinition[],
  chapter: number,
): SectUpgradeResult {
  const definition = facilityDefinition(definitions, facilityId)
  if (!definition) throw new SectFacilityError(`未注册设施「${facilityId}」。`)
  if (!initialState.sect.unlocked) return result('sect_locked', initialState, facilityId, null, '门派尚未解锁。')
  const level = currentLevel(initialState.sect, facilityId)
  const target = nextLevelDefinition(definition, level)
  if (!target) return result('max_level', initialState, facilityId, null, '该设施已达到三级。')
  if (initialState.sect.claimedUpgradeGrantKeys.includes(target.grantKey)) {
    return result('already_upgraded', initialState, facilityId, target.level, '该设施升级已经结算过。', { grantKey: target.grantKey })
  }
  if (chapter < target.requiredChapter) return result('chapter_locked', initialState, facilityId, target.level, `第 ${target.requiredChapter} 章后才能升级该设施。`, { grantKey: target.grantKey })
  if (target.prerequisite && currentLevel(initialState.sect, target.prerequisite.facilityId) < target.prerequisite.level) {
    return result('prerequisite_locked', initialState, facilityId, target.level, `需要先将${target.prerequisite.facilityId}升到 ${target.prerequisite.level} 级。`, { grantKey: target.grantKey })
  }
  if (!validateCost(target.cost)) return result('invalid_cost', initialState, facilityId, target.level, '设施升级成本配置无效。', { grantKey: target.grantKey })
  if (initialState.wealth < target.cost.silver) return result('insufficient_wealth', initialState, facilityId, target.level, `银两不足，需要 ${target.cost.silver} 两。`, { grantKey: target.grantKey })
  if (target.cost.materials.some((material) => getItemCount(initialState.inventory, material.itemId) < material.count)) {
    return result('insufficient_materials', initialState, facilityId, target.level, '升级材料不足。', { grantKey: target.grantKey })
  }

  let inventory = initialState.inventory
  try {
    for (const material of target.cost.materials) inventory = removeItem(inventory, material.itemId, material.count)
  } catch (error) {
    throw new SectFacilityError(error instanceof Error ? error.message : '升级材料扣除失败。')
  }
  const effectResult = executeEffects(target.effects, initialState.effectState, { sourceActionId: target.grantKey, occurredAtTick: target.level })
  const nextSect: SectState = applyBenefits({
    ...initialState.sect,
    facilities: { ...initialState.sect.facilities, [facilityId]: target.level },
    claimedUpgradeGrantKeys: [...initialState.sect.claimedUpgradeGrantKeys, target.grantKey],
  }, target.benefits)
  return result('upgraded', {
    sect: nextSect,
    wealth: initialState.wealth - target.cost.silver,
    inventory,
    effectState: effectResult.state,
  }, facilityId, target.level, `${definition.name}已升级到 ${target.level} 级。`, { grantKey: target.grantKey, effectResult })
}

export function createInitialSectUpgradeState(overrides: Partial<SectUpgradeState> = {}): SectUpgradeState {
  return {
    sect: createSectState(),
    wealth: 0,
    inventory: { capacity: 20, stacks: [], protectedItemIds: [] },
    effectState: { inventory: {}, experience: 0, stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 }, flags: {}, quests: {}, claimedGrantKeys: [] },
    ...overrides,
  }
}
