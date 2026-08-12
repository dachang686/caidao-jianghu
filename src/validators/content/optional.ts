import type { CommissionTemplate } from '../../types/commission'
import type { DiscipleDefinition, DiscipleDispatchEventDefinition, DiscipleTraitDefinition } from '../../types/disciple'
import type { EquipmentDefinition } from '../../types/equipment'
import type { PresentationCueDefinition } from '../../types/comedy'
import type { ForgeRecipeDefinition, CookingRecipeDefinition } from '../../types/recipe'
import type { SkillDefinition, PassiveDefinition } from '../../types/skill'
import type { OptionalHiddenBossDefinition } from '../../content/enemies/optional-hidden'
import type { PostgameDungeonDefinition } from '../../types/postgame-dungeon'
import type { UnlockableDefinition } from '../../types/unlockable'

export interface OptionalContentValidationIssue {
  readonly code: 'duplicate_id' | 'missing_reference' | 'invalid_value' | 'insufficient_count' | 'separation_violation'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface OptionalContentValidationResult {
  readonly valid: boolean
  readonly issues: readonly OptionalContentValidationIssue[]
}

export interface OptionalContentInput {
  readonly activeSkills: readonly SkillDefinition[]
  readonly passiveSkills: readonly PassiveDefinition[]
  readonly equipment: readonly EquipmentDefinition[]
  readonly forgingRecipes: readonly ForgeRecipeDefinition[]
  readonly cookingRecipes: readonly CookingRecipeDefinition[]
  readonly disciples: readonly DiscipleDefinition[]
  readonly discipleTraits: readonly DiscipleTraitDefinition[]
  readonly discipleDispatchEvents: readonly DiscipleDispatchEventDefinition[]
  readonly commissions: readonly CommissionTemplate[]
  readonly hiddenBosses: readonly OptionalHiddenBossDefinition[]
  readonly hiddenBossCues: readonly PresentationCueDefinition[]
  readonly dungeons: readonly PostgameDungeonDefinition[]
  readonly unlockables: readonly UnlockableDefinition[]
  readonly coreIds?: ReadonlySet<string>
}

export const OPTIONAL_MINIMUMS = {
  activeSkills: 8,
  passiveSkills: 4,
  equipment: 32,
  forgingRecipes: 24,
  cookingRecipes: 16,
  disciples: 6,
  commissions: 10,
  hiddenBosses: 8,
  dungeons: 3,
  unlockables: 12,
} as const

const SKILL_SCHOOLS = ['dao', 'mouth', 'survival', 'misc'] as const
const EQUIPMENT_SLOTS = ['weapon', 'head', 'body', 'feet', 'accessory', 'manual'] as const
const SOURCE_TAGS = ['hidden-boss', 'postgame-dungeon', 'sect', 'advanced-forging'] as const

function countIssue(issues: OptionalContentValidationIssue[], path: string, label: string, actual: number, expected: number): void {
  if (actual < expected) issues.push({ code: 'insufficient_count', path, message: `${label} 为 ${actual}，低于 Optional 要求 ${expected}` })
}

function duplicateIds(values: ReadonlyArray<{ readonly id: string | number }>, path: string, issues: OptionalContentValidationIssue[]): void {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    const id = String(value.id)
    if (seen.has(id)) issues.push({ code: 'duplicate_id', path: `${path}[${index}].id`, message: `重复 Optional ID「${id}」`, id })
    seen.add(id)
  })
}

function validateSkillShape(skills: readonly SkillDefinition[], path: string, issues: OptionalContentValidationIssue[]): void {
  countIssue(issues, path, 'Optional 主动技能', skills.length, OPTIONAL_MINIMUMS.activeSkills)
  const counts = new Map<string, number>()
  skills.forEach((skill, index) => {
    const id = String(skill.id)
    const itemPath = `${path}[${index}]`
    counts.set(skill.school, (counts.get(skill.school) ?? 0) + 1)
    if (!skill.name.trim() || !skill.description.trim() || !skill.preview.summary.trim()) issues.push({ code: 'invalid_value', path: itemPath, message: 'Optional 主动技能必须有名称、说明和战斗前预览', id })
    if (skill.requiredLevel === undefined || skill.requiredLevel < 8) issues.push({ code: 'invalid_value', path: `${itemPath}.requiredLevel`, message: 'Optional 主动技能至少从第 8 级开放', id })
    if (skill.maxRank === undefined || skill.maxRank > 3) issues.push({ code: 'invalid_value', path: `${itemPath}.maxRank`, message: 'Optional 主动技能最大阶数不得超过 3', id })
    if (skill.aiLimit?.maxUsesPerTurn !== 1 || skill.safety?.grantsExtraTurns === true) issues.push({ code: 'invalid_value', path: itemPath, message: 'Optional 主动技能必须限制为每回合至多一次且不得额外获得回合', id })
  })
  SKILL_SCHOOLS.forEach((school) => {
    if ((counts.get(school) ?? 0) < 2) issues.push({ code: 'insufficient_count', path: `${path}.${school}`, message: `Optional 主动技能的${school}流派至少需要 2 个` })
  })
}

function validatePassiveShape(passives: readonly PassiveDefinition[], path: string, issues: OptionalContentValidationIssue[]): void {
  countIssue(issues, path, 'Optional 被动技能', passives.length, OPTIONAL_MINIMUMS.passiveSkills)
  const counts = new Map<string, number>()
  passives.forEach((passive, index) => {
    const itemPath = `${path}[${index}]`
    counts.set(passive.school, (counts.get(passive.school) ?? 0) + 1)
    if (!passive.name.trim() || !passive.description.trim() || !passive.preview.summary.trim()) issues.push({ code: 'invalid_value', path: itemPath, message: 'Optional 被动技能必须有名称、说明和战斗前预览', id: passive.id })
  })
  SKILL_SCHOOLS.forEach((school) => {
    if ((counts.get(school) ?? 0) < 1) issues.push({ code: 'insufficient_count', path: `${path}.${school}`, message: `Optional 被动技能的${school}流派至少需要 1 个` })
  })
}

function validateEquipmentShape(equipment: readonly EquipmentDefinition[], coreIds: ReadonlySet<string> | undefined, issues: OptionalContentValidationIssue[]): void {
  countIssue(issues, 'equipment', 'Optional 装备', equipment.length, OPTIONAL_MINIMUMS.equipment)
  const slotCounts = new Map<string, number>()
  const sourceCounts = new Map<string, number>()
  equipment.forEach((item, index) => {
    const id = String(item.id)
    const path = `equipment[${index}]`
    slotCounts.set(item.slot, (slotCounts.get(item.slot) ?? 0) + 1)
    if (coreIds?.has(id)) issues.push({ code: 'separation_violation', path: `${path}.id`, message: `Optional 装备不得复用 Core ID「${id}」`, id })
    if (!item.sources || item.sources.length === 0 || !item.upgradeCurve || item.upgradeCurve.length < 6) issues.push({ code: 'invalid_value', path, message: 'Optional 装备必须声明来源和 0–5 级强化曲线', id })
    item.sources?.forEach((source, sourceIndex) => {
      const sourceTag = SOURCE_TAGS.find((tag) => source.id.includes(`source:optional:${tag}:`))
      if (!sourceTag) issues.push({ code: 'missing_reference', path: `${path}.sources[${sourceIndex}]`, message: '装备来源必须落到隐藏 Boss、通关后秘境、门派或高级锻造', id })
      else sourceCounts.set(sourceTag, (sourceCounts.get(sourceTag) ?? 0) + 1)
    })
    const levels = item.upgradeCurve?.map((point) => point.level) ?? []
    if (![0, 1, 2, 3, 4, 5].every((level) => levels.includes(level))) issues.push({ code: 'invalid_value', path: `${path}.upgradeCurve`, message: '装备强化曲线必须覆盖 0–5 级', id })
  })
  EQUIPMENT_SLOTS.forEach((slot) => {
    if ((slotCounts.get(slot) ?? 0) < 1) issues.push({ code: 'insufficient_count', path: `equipment.slot.${slot}`, message: `Optional 装备缺少「${slot}」槽位` })
  })
  SOURCE_TAGS.forEach((tag) => {
    if ((sourceCounts.get(tag) ?? 0) < 1) issues.push({ code: 'insufficient_count', path: `equipment.source.${tag}`, message: `Optional 装备缺少「${tag}」来源` })
  })
}

function validateRecipeShape<T extends { id: string | number; materials: readonly { itemId: string | number; count: number }[]; output: { itemId: string | number; count: number } }>(recipes: readonly T[], path: string, expected: number, issues: OptionalContentValidationIssue[]): void {
  countIssue(issues, path, 'Optional 配方', recipes.length, expected)
  duplicateIds(recipes, path, issues)
  recipes.forEach((recipe, index) => {
    const itemPath = `${path}[${index}]`
    if (recipe.materials.length === 0 || recipe.materials.some((material) => !Number.isInteger(material.count) || material.count <= 0)) issues.push({ code: 'invalid_value', path: `${itemPath}.materials`, message: 'Optional 配方材料必须非空且为正整数', id: String(recipe.id) })
    if (!Number.isInteger(recipe.output.count) || recipe.output.count <= 0) issues.push({ code: 'invalid_value', path: `${itemPath}.output.count`, message: 'Optional 配方产物数量必须为正整数', id: String(recipe.id) })
    if (recipe.materials.some((material) => String(material.itemId) === String(recipe.output.itemId))) issues.push({ code: 'invalid_value', path: `${itemPath}.materials`, message: 'Optional 配方不得直接把产物作为自身材料', id: String(recipe.id) })
  })
}

export function validateOptionalContent(input: OptionalContentInput): OptionalContentValidationResult {
  const issues: OptionalContentValidationIssue[] = []
  duplicateIds(input.activeSkills, 'activeSkills', issues)
  duplicateIds(input.passiveSkills, 'passiveSkills', issues)
  duplicateIds(input.equipment, 'equipment', issues)
  duplicateIds(input.disciples, 'disciples', issues)
  duplicateIds(input.commissions, 'commissions', issues)
  duplicateIds(input.hiddenBosses, 'hiddenBosses', issues)
  duplicateIds(input.dungeons, 'dungeons', issues)
  validateSkillShape(input.activeSkills, 'activeSkills', issues)
  validatePassiveShape(input.passiveSkills, 'passiveSkills', issues)
  validateEquipmentShape(input.equipment, input.coreIds, issues)
  validateRecipeShape(input.forgingRecipes, 'forgingRecipes', OPTIONAL_MINIMUMS.forgingRecipes, issues)
  validateRecipeShape(input.cookingRecipes, 'cookingRecipes', OPTIONAL_MINIMUMS.cookingRecipes, issues)
  countIssue(issues, 'disciples', 'Optional 门人', input.disciples.length, OPTIONAL_MINIMUMS.disciples)
  countIssue(issues, 'commissions', 'Optional 委托', input.commissions.length, OPTIONAL_MINIMUMS.commissions)
  countIssue(issues, 'hiddenBosses', 'Optional 隐藏 Boss', input.hiddenBosses.length, OPTIONAL_MINIMUMS.hiddenBosses)
  countIssue(issues, 'dungeons', 'Optional 通关后秘境', input.dungeons.length, OPTIONAL_MINIMUMS.dungeons)
  countIssue(issues, 'unlockables', 'Optional 图鉴/成就', input.unlockables.length, OPTIONAL_MINIMUMS.unlockables)
  duplicateIds(input.unlockables, 'unlockables', issues)

  const cueIds = new Set(input.hiddenBossCues.map((cue) => String(cue.id)))
  const hiddenBossIds = new Set(input.hiddenBosses.map((boss) => String(boss.id)))
  input.unlockables.forEach((unlockable, index) => {
    const id = String(unlockable.id)
    if (!id.startsWith('enemy:optional:') && !id.startsWith('achievement:optional:')) issues.push({ code: 'separation_violation', path: `unlockables[${index}].id`, message: 'Optional 图鉴条目必须使用 Optional 命名空间', id })
    if (!unlockable.name.trim() || !unlockable.description.trim() || !unlockable.clue.trim() || unlockable.eventRules.length === 0) issues.push({ code: 'invalid_value', path: `unlockables[${index}]`, message: 'Optional 图鉴/成就必须有名称、说明、线索和事件规则', id })
  })
  const chapters = new Set<string>()
  input.hiddenBosses.forEach((boss, index) => {
    const id = String(boss.id)
    const path = `hiddenBosses[${index}]`
    if (boss.role !== 'boss' || !boss.optional || !boss.readableIntent || !boss.discoveryClue.trim() || !boss.firstRewardGrantKey.trim()) issues.push({ code: 'invalid_value', path, message: '隐藏 Boss 必须是可读意图的 Optional Boss，并声明线索和首胜奖励', id })
    const chapterId = String(boss.chapterId)
    if (chapters.has(chapterId)) issues.push({ code: 'invalid_value', path: `${path}.chapterId`, message: `每章最多配置一个 Optional 隐藏 Boss「${chapterId}」`, id })
    chapters.add(chapterId)
    if (boss.moves.length < 3 || boss.boss?.phases.length !== 2) issues.push({ code: 'invalid_value', path, message: '隐藏 Boss 至少需要 3 个可读招式和 2 个阶段', id })
    boss.behavior.moveIds.forEach((moveId) => { if (!boss.moves.some((move) => move.id === moveId)) issues.push({ code: 'missing_reference', path: `${path}.behavior.moveIds`, message: `找不到隐藏 Boss 招式「${moveId}」`, id }) })
    boss.presentationCueIds?.forEach((cueId) => { if (!cueIds.has(String(cueId))) issues.push({ code: 'missing_reference', path: `${path}.presentationCueIds`, message: `找不到隐藏 Boss 演出 cue「${cueId}」`, id }) })
    if (!boss.assetIds.length) issues.push({ code: 'missing_reference', path: `${path}.assetIds`, message: '隐藏 Boss 必须声明至少一个可复用资源', id })
  })
  if (chapters.size < 8) issues.push({ code: 'insufficient_count', path: 'hiddenBosses.chapters', message: 'Optional 隐藏 Boss 必须覆盖八章' })

  const encounterIds = new Set<string>()
  input.dungeons.forEach((dungeon, dungeonIndex) => {
    const path = `dungeons[${dungeonIndex}]`
    if (dungeon.encounters.length < 3 || dungeon.encounters.length > 5) issues.push({ code: 'invalid_value', path: `${path}.encounters`, message: '每个通关后秘境必须有 3–5 个遭遇节点', id: dungeon.id })
    if (dungeon.failurePolicy !== 'preserve_core_and_equipment' || dungeon.offlineSafe !== true || dungeon.repeatRewardMultiplier <= 0 || dungeon.repeatRewardMultiplier > 1) issues.push({ code: 'invalid_value', path, message: '秘境必须可离线安全运行、保留 Core/装备并声明 0–1 的重复收益倍率', id: dungeon.id })
    if (!dungeon.encounters.some((encounter) => encounter.canExitAfter)) issues.push({ code: 'invalid_value', path: `${path}.encounters`, message: '秘境至少需要一个可安全退出节点', id: dungeon.id })
    dungeon.encounters.forEach((encounter, encounterIndex) => {
      const encounterPath = `${path}.encounters[${encounterIndex}]`
      if (encounterIds.has(encounter.id)) issues.push({ code: 'duplicate_id', path: `${encounterPath}.id`, message: `重复秘境遭遇 ID「${encounter.id}」`, id: encounter.id })
      encounterIds.add(encounter.id)
      if (!Number.isInteger(encounter.resourceCost) || encounter.resourceCost <= 0) issues.push({ code: 'invalid_value', path: `${encounterPath}.resourceCost`, message: '秘境资源消耗必须为正整数', id: encounter.id })
      encounter.enemyIds.forEach((enemyId) => { if (!hiddenBossIds.has(enemyId)) issues.push({ code: 'missing_reference', path: `${encounterPath}.enemyIds`, message: `秘境遭遇引用了未知 Optional 敌人「${enemyId}」`, id: dungeon.id }) })
    })
  })

  return { valid: issues.length === 0, issues }
}
