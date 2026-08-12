export interface CoreContentCountInput {
  readonly mainlineQuests: number
  readonly sideQuests: number
  readonly bosses: number
  readonly activeSkills: number
  readonly passiveSkills: number
  readonly equipment: number
  readonly forgingRecipes: number
  readonly cookingRecipes: number
  readonly disciples: number
  readonly commissionTemplates: number
  readonly endings: number
  readonly enemyTemplates: number
  readonly enemyVariants: number
}

export interface CoreContentCountIssue {
  readonly code: 'insufficient_count' | 'invalid_count'
  readonly path: string
  readonly message: string
}

export interface CoreContentCountResult {
  readonly valid: boolean
  readonly issues: readonly CoreContentCountIssue[]
}

const CORE_MINIMUMS: Readonly<Record<keyof CoreContentCountInput, number>> = {
  mainlineQuests: 28,
  sideQuests: 16,
  bosses: 8,
  activeSkills: 16,
  passiveSkills: 8,
  equipment: 48,
  forgingRecipes: 12,
  cookingRecipes: 8,
  disciples: 6,
  commissionTemplates: 12,
  endings: 4,
  enemyTemplates: 12,
  enemyVariants: 24,
}

export function validateCoreContentCounts(counts: CoreContentCountInput): CoreContentCountResult {
  const issues: CoreContentCountIssue[] = []
  Object.entries(CORE_MINIMUMS).forEach(([key, minimum]) => {
    const value = counts[key as keyof CoreContentCountInput]
    if (!Number.isInteger(value) || value < 0) issues.push({ code: 'invalid_count', path: `core.${key}`, message: `${key} 必须是非负整数` })
    else if (value < minimum) issues.push({ code: 'insufficient_count', path: `core.${key}`, message: `${key} 为 ${value}，低于 Core 最低值 ${minimum}` })
  })
  return { valid: issues.length === 0, issues }
}

export { CORE_MINIMUMS }

