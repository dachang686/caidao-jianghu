import type { CoreEnemyBehaviorTemplate, CoreEnemyEncounterTable, CoreEnemyVariant } from '../../types/enemy'

export interface EnemyRosterValidationIssue {
  readonly code: 'duplicate_id' | 'missing_reference' | 'invalid_value' | 'insufficient_count'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface EnemyRosterValidationResult {
  readonly valid: boolean
  readonly issues: readonly EnemyRosterValidationIssue[]
}

export function validateCoreEnemyRoster(
  templates: readonly CoreEnemyBehaviorTemplate[],
  variants: readonly CoreEnemyVariant[],
  encounters: readonly CoreEnemyEncounterTable[],
): EnemyRosterValidationResult {
  const issues: EnemyRosterValidationIssue[] = []
  const templateIds = new Set<string>()
  templates.forEach((template, index) => {
    const id = String(template.id)
    if (templateIds.has(id)) issues.push({ code: 'duplicate_id', path: `templates.${index}.id`, message: `重复敌人模板 ID「${id}」`, id })
    templateIds.add(id)
    if (!template.readableIntent || template.moveIds.length < 2 || template.resourcePressure.length === 0) issues.push({ code: 'invalid_value', path: `templates.${index}`, message: '模板必须有可读意图、至少两种招式和资源压力标签', id })
  })
  const variantIds = new Set<string>()
  const encounterIds = new Set(encounters.map((encounter) => encounter.id))
  const commissionIds = new Set<string>()
  variants.forEach((variant, index) => {
    const id = String(variant.id)
    if (variantIds.has(id)) issues.push({ code: 'duplicate_id', path: `variants.${index}.id`, message: `重复 Core 敌人变体 ID「${id}」`, id })
    variantIds.add(id)
    if (!templateIds.has(variant.templateId)) issues.push({ code: 'missing_reference', path: `variants.${index}.templateId`, message: `找不到行为模板「${variant.templateId}」`, id })
    if (!variant.readableIntent || variant.moveSet.length < 2) issues.push({ code: 'invalid_value', path: `variants.${index}`, message: '普通敌人变体必须有诚实意图和可辨认招式组', id })
    if (variant.encounterIds.length === 0 || variant.commissionIds.length === 0) issues.push({ code: 'missing_reference', path: `variants.${index}`, message: '敌人变体必须进入遭遇表和委托目标表', id })
    variant.encounterIds.forEach((encounterId) => { if (!encounterIds.has(encounterId)) issues.push({ code: 'missing_reference', path: `variants.${index}.encounterIds`, message: `找不到遭遇表「${encounterId}」`, id: encounterId }) })
    variant.commissionIds.forEach((commissionId) => commissionIds.add(commissionId))
  })
  if (templates.length < 12) issues.push({ code: 'insufficient_count', path: 'templates', message: `Core 行为模板需要至少12个，当前${templates.length}` })
  if (variants.length < 24) issues.push({ code: 'insufficient_count', path: 'variants', message: `Core 普通敌人变体需要至少24个，当前${variants.length}` })
  for (let chapter = 1; chapter <= 8; chapter += 1) {
    const count = variants.filter((variant) => variant.chapterId === `ch0${chapter}`).length
    if (count < 2) issues.push({ code: 'insufficient_count', path: `variants.ch0${chapter}`, message: `第${chapter}章普通敌人变体至少需要2个` })
  }
  return { valid: issues.length === 0, issues }
}

export function assertValidCoreEnemyRoster(templates: readonly CoreEnemyBehaviorTemplate[], variants: readonly CoreEnemyVariant[], encounters: readonly CoreEnemyEncounterTable[]): void {
  const result = validateCoreEnemyRoster(templates, variants, encounters)
  if (!result.valid) throw new Error(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
}
