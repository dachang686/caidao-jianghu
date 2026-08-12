import type { SkillDefinition } from '../../types/skill'

export type SkillValidationCode = 'duplicate_id' | 'missing_prerequisite' | 'prerequisite_cycle' | 'invalid_value'

export interface SkillValidationIssue {
  readonly code: SkillValidationCode
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface SkillValidationResult {
  readonly valid: boolean
  readonly issues: readonly SkillValidationIssue[]
}

export class SkillRegistryError extends Error {
  readonly issues: readonly SkillValidationIssue[]

  constructor(issues: readonly SkillValidationIssue[]) {
    super(issues.map((issue) => `${issue.path} [${issue.code}] ${issue.message}`).join('\n'))
    this.name = 'SkillRegistryError'
    this.issues = issues
  }
}

function requireNumber(value: number, path: string, min: number, issues: SkillValidationIssue[]): void {
  if (!Number.isFinite(value) || value < min) {
    issues.push({ code: 'invalid_value', path, message: `必须是大于等于 ${min} 的有限数字` })
  }
}

export function validateSkillDefinitions(definitions: readonly SkillDefinition[]): SkillValidationResult {
  const issues: SkillValidationIssue[] = []
  const byId = new Map<string, SkillDefinition>()
  definitions.forEach((definition, index) => {
    const id = String(definition.id)
    if (byId.has(id)) issues.push({ code: 'duplicate_id', path: `skills[${index}].id`, message: `重复技能 ID「${id}」`, id })
    byId.set(id, definition)
    if (!id.trim()) issues.push({ code: 'invalid_value', path: `skills[${index}].id`, message: '技能 ID 不能为空' })
    if (!definition.name.trim()) issues.push({ code: 'invalid_value', path: `skills[${index}].name`, message: '技能名称不能为空', id })
    requireNumber(definition.qiCost, `skills[${index}].qiCost`, 0, issues)
    requireNumber(definition.cooldown, `skills[${index}].cooldown`, 0, issues)
    if (definition.requiredLevel !== undefined) requireNumber(definition.requiredLevel, `skills[${index}].requiredLevel`, 1, issues)
    if (definition.maxRank !== undefined) requireNumber(definition.maxRank, `skills[${index}].maxRank`, 1, issues)
    definition.prerequisiteIds?.forEach((prerequisiteId, prerequisiteIndex) => {
      const prerequisite = String(prerequisiteId)
      if (!byId.has(prerequisite) && !definitions.some((item) => String(item.id) === prerequisite)) {
        issues.push({
          code: 'missing_prerequisite',
          path: `skills[${index}].prerequisiteIds[${prerequisiteIndex}]`,
          message: `找不到前置技能「${prerequisite}」`,
          id: prerequisite,
        })
      }
    })
  })

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const reportCycle = (id: string) => {
    issues.push({ code: 'prerequisite_cycle', path: `skills.${id}`, message: `技能前置存在循环「${id}」`, id })
  }
  const visit = (id: string, path: Set<string>): void => {
    if (path.has(id)) {
      reportCycle(id)
      return
    }
    if (visited.has(id) || visiting.has(id)) return
    const definition = byId.get(id)
    if (!definition) return
    visiting.add(id)
    const nextPath = new Set(path)
    nextPath.add(id)
    definition.prerequisiteIds?.forEach((prerequisiteId) => visit(String(prerequisiteId), nextPath))
    visiting.delete(id)
    visited.add(id)
  }
  definitions.forEach((definition) => visit(String(definition.id), new Set()))

  return { valid: issues.length === 0, issues }
}

export class SkillRegistry {
  private readonly definitions: ReadonlyMap<string, SkillDefinition>

  constructor(definitions: readonly SkillDefinition[]) {
    const validation = validateSkillDefinitions(definitions)
    if (!validation.valid) throw new SkillRegistryError(validation.issues)
    this.definitions = new Map(definitions.map((definition) => [String(definition.id), definition]))
  }

  get(skillId: string): SkillDefinition {
    const skill = this.definitions.get(skillId)
    if (!skill) throw new SkillRegistryError([{ code: 'missing_prerequisite', path: `skill:${skillId}`, message: `未知技能「${skillId}」`, id: skillId }])
    return skill
  }

  has(skillId: string): boolean {
    return this.definitions.has(skillId)
  }

  list(): readonly SkillDefinition[] {
    return [...this.definitions.values()]
  }

  validate(): SkillValidationResult {
    return { valid: true, issues: [] }
  }
}

