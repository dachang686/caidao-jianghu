import type {
  ChapterComedyCoverage,
  ComedyCoverageDefinition,
  ComedyCoverageLayer,
  CoreComedyMinimums,
} from '../../types/comedy-coverage'

export const CORE_COMEDY_MINIMUMS: CoreComedyMinimums = {
  rule: 8,
  situation: 12,
  interaction: 10,
  presentation: 8,
}

const LAYERS: readonly ComedyCoverageLayer[] = ['rule', 'situation', 'interaction', 'presentation']
const MAX_BLOCKING_MS = 1200
const FORBIDDEN_EFFECT_TYPES = new Set(['delete_item', 'remove_item', 'destroy_item', 'consume_key_item', 'permanent_debuff'])
const FORBIDDEN_SETTLEMENT_TERMS = /system[-_ ]?error|payment|save[-_ ]?(?:corrupt|deleted|lost)|browser[-_ ]?warning|delete[-_ ]?progress|系统故障|支付失败|存档(?:损坏|丢失)|浏览器警告|删除进度/i

export type ComedyCoverageIssueCode =
  | 'duplicate_id'
  | 'invalid_value'
  | 'missing_layer'
  | 'missing_cooldown'
  | 'missing_feedback'
  | 'missing_preview'
  | 'duration_limit'
  | 'forbidden_effect'
  | 'fake_settlement'
  | 'multiple_major'
  | 'core_count'
  | 'boss_cue_count'

export interface ComedyCoverageValidationIssue {
  readonly code: ComedyCoverageIssueCode
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface ComedyCoverageCounts extends CoreComedyMinimums {
  readonly bossCues: number
}

export interface ComedyCoverageValidationResult {
  readonly valid: boolean
  readonly issues: readonly ComedyCoverageValidationIssue[]
  readonly counts: ComedyCoverageCounts
}

export interface ComedyCoverageValidationOptions {
  /** 发布门禁开启后，才要求累计 Core 达到 8/12/10/8 和 8 个 Boss cue。 */
  readonly enforceCoreMinimums?: boolean
  /** Optional 关闭时不参与章节覆盖和 Core 数量；安全字段仍会被检查。 */
  readonly includeOptional?: boolean
  readonly coreMinimums?: CoreComedyMinimums
}

function addIssue(
  issues: ComedyCoverageValidationIssue[],
  code: ComedyCoverageIssueCode,
  path: string,
  message: string,
  id?: string,
): void {
  issues.push({ code, path, message, ...(id ? { id } : {}) })
}

function requiredEntry(entry: ComedyCoverageDefinition, includeOptional: boolean): boolean {
  return includeOptional || entry.required !== false
}

function requireText(value: unknown, path: string, issues: ComedyCoverageValidationIssue[], id: string, code: ComedyCoverageIssueCode = 'invalid_value'): void {
  if (typeof value !== 'string' || !value.trim()) addIssue(issues, code, path, '值不能为空', id)
}

function searchableText(entry: ComedyCoverageDefinition): string {
  const effectText = (entry.effects ?? []).map((effect) => {
    const value = effect as unknown as Record<string, unknown>
    return Object.values(value).filter((item): item is string => typeof item === 'string').join(' ')
  }).join(' ')
  return [entry.id, entry.firstCueId, entry.repeatCueId, entry.reducedMotionCueId, entry.copy ?? '', effectText].join(' ')
}

function validateEffectSafety(entry: ComedyCoverageDefinition, path: string, issues: ComedyCoverageValidationIssue[]): void {
  entry.effects?.forEach((effect, effectIndex) => {
    const value = effect as unknown as Record<string, unknown>
    const type = typeof value.type === 'string' ? value.type : ''
    if (!type) {
      addIssue(issues, 'invalid_value', `${path}.effects[${effectIndex}].type`, 'Effect 类型不能为空', entry.id)
      return
    }
    if (FORBIDDEN_EFFECT_TYPES.has(type)) {
      addIssue(issues, 'forbidden_effect', `${path}.effects[${effectIndex}].type`, '幽默 Effect 不得删除关键物品或施加永久减益', entry.id)
    }
    if (type === 'give_item' && typeof value.count === 'number' && value.count <= 0) {
      addIssue(issues, 'forbidden_effect', `${path}.effects[${effectIndex}].count`, '幽默不得用非正数量变相删除物品', entry.id)
    }
    if (type === 'change_stat' && typeof value.delta === 'number' && value.delta < 0) {
      addIssue(issues, 'forbidden_effect', `${path}.effects[${effectIndex}].delta`, '幽默不得施加永久属性下降', entry.id)
    }
    if ((type === 'give_item' || type === 'give_exp') && value.grantKey !== undefined && (typeof value.grantKey !== 'string' || !value.grantKey.trim())) {
      addIssue(issues, 'invalid_value', `${path}.effects[${effectIndex}].grantKey`, '奖励 Effect 的 grantKey 不能为空', entry.id)
    }
  })
  if (FORBIDDEN_SETTLEMENT_TERMS.test(searchableText(entry))) {
    addIssue(issues, 'fake_settlement', path, '演出文案不得伪造系统故障、支付失败、存档损坏或删除进度', entry.id)
  }
}

function validateEntry(entry: ComedyCoverageDefinition, path: string, issues: ComedyCoverageValidationIssue[]): void {
  requireText(entry.id, `${path}.id`, issues, entry.id)
  requireText(entry.triggerEvent, `${path}.triggerEvent`, issues, entry.id)
  requireText(entry.cooldownGroup, `${path}.cooldownGroup`, issues, entry.id, 'missing_cooldown')
  requireText(entry.firstCueId, `${path}.firstCueId`, issues, entry.id, 'missing_feedback')
  requireText(entry.repeatCueId, `${path}.repeatCueId`, issues, entry.id, 'missing_feedback')
  requireText(entry.reducedMotionCueId, `${path}.reducedMotionCueId`, issues, entry.id, 'missing_feedback')
  if (!LAYERS.includes(entry.layer)) addIssue(issues, 'invalid_value', `${path}.layer`, `未知幽默层「${String(entry.layer)}」`, entry.id)
  if (entry.scale !== 'major' && entry.scale !== 'minor') addIssue(issues, 'invalid_value', `${path}.scale`, `未知幽默强度「${String(entry.scale)}」`, entry.id)
  if (!Number.isInteger(entry.maxBlockingMs) || entry.maxBlockingMs < 0 || entry.maxBlockingMs > MAX_BLOCKING_MS) {
    addIssue(issues, 'duration_limit', `${path}.maxBlockingMs`, `阻塞时长必须在 0–${MAX_BLOCKING_MS}ms 内`, entry.id)
  }
  if (entry.layer === 'rule' && (!entry.previewStatKeys || entry.previewStatKeys.length === 0)) {
    addIssue(issues, 'missing_preview', `${path}.previewStatKeys`, '规则幽默必须声明数值预览字段', entry.id)
  }
  if (entry.layer === 'presentation' && entry.bossCue === true) requireText(entry.bossId, `${path}.bossId`, issues, entry.id)
  validateEffectSafety(entry, path, issues)
}

function countEntries(entries: readonly ComedyCoverageDefinition[], includeOptional: boolean): ComedyCoverageCounts {
  const active = entries.filter((entry) => requiredEntry(entry, includeOptional))
  return {
    rule: active.filter((entry) => entry.layer === 'rule').length,
    situation: active.filter((entry) => entry.layer === 'situation').length,
    interaction: active.filter((entry) => entry.layer === 'interaction').length,
    presentation: active.filter((entry) => entry.layer === 'presentation').length,
    bossCues: active.filter((entry) => entry.layer === 'presentation' && entry.bossCue === true).length,
  }
}

export function validateComedyCoverage(
  chapters: readonly ChapterComedyCoverage[],
  options: ComedyCoverageValidationOptions = {},
): ComedyCoverageValidationResult {
  const issues: ComedyCoverageValidationIssue[] = []
  const includeOptional = options.includeOptional === true
  const allEntries = chapters.flatMap((chapter) => chapter.entries)
  const seen = new Set<string>()
  chapters.forEach((chapter, chapterIndex) => {
    const chapterPath = `chapters[${chapterIndex}]`
    requireText(chapter.chapterId, `${chapterPath}.chapterId`, issues, chapter.chapterId)
    const activeEntries = chapter.entries.filter((entry) => requiredEntry(entry, includeOptional))
    const layers = new Set(activeEntries.map((entry) => entry.layer))
    LAYERS.forEach((layer) => {
      if (!layers.has(layer)) addIssue(issues, 'missing_layer', `${chapterPath}.entries`, `章节缺少「${layer}」层 Core 幽默`, chapter.chapterId)
    })
    chapter.entries.forEach((entry, entryIndex) => {
      const path = `${chapterPath}.entries[${entryIndex}]`
      if (seen.has(entry.id)) addIssue(issues, 'duplicate_id', `${path}.id`, `幽默覆盖 ID 重复「${entry.id}」`, entry.id)
      seen.add(entry.id)
      validateEntry(entry, path, issues)
    })
    const majorByEvent = new Map<string, ComedyCoverageDefinition[]>()
    activeEntries.filter((entry) => entry.scale === 'major').forEach((entry) => {
      const group = majorByEvent.get(entry.triggerEvent) ?? []
      group.push(entry)
      majorByEvent.set(entry.triggerEvent, group)
    })
    majorByEvent.forEach((entries, triggerEvent) => {
      if (entries.length > 1) entries.forEach((entry) => addIssue(issues, 'multiple_major', `${chapterPath}.entries`, `事件「${triggerEvent}」配置了多个 major cue`, entry.id))
    })
  })

  const counts = countEntries(allEntries, includeOptional)
  const minimums = options.coreMinimums ?? CORE_COMEDY_MINIMUMS
  if (options.enforceCoreMinimums === true) {
    ;(['rule', 'situation', 'interaction', 'presentation'] as const).forEach((layer) => {
      if (counts[layer] < minimums[layer]) addIssue(issues, 'core_count', `core.${layer}`, `Core ${layer} 数量 ${counts[layer]}，低于最低值 ${minimums[layer]}`)
    })
    if (counts.bossCues < minimums.presentation) addIssue(issues, 'boss_cue_count', 'core.bossCues', `Boss 专属演出 cue 数量 ${counts.bossCues}，低于最低值 ${minimums.presentation}`)
  }
  return { valid: issues.length === 0, issues, counts }
}

export function assertValidComedyCoverage(chapters: readonly ChapterComedyCoverage[], options: ComedyCoverageValidationOptions = {}): void {
  const result = validateComedyCoverage(chapters, options)
  if (!result.valid) throw new Error(`四层幽默内容校验失败：${result.issues.map((issue) => `${issue.path} ${issue.message}`).join('；')}`)
}
