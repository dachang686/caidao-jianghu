import { evaluateCondition } from '../../systems/conditions/evaluate'
import { validateEndingDefinitions } from '../../systems/endings/engine'
import type { Condition, ConditionContext, QuestConditionStatus } from '../../types/conditions'
import type { EndingDefinition } from '../../types/ending'

export interface CoreEndingValidationIssue {
  readonly code: 'duplicate_id' | 'duplicate_priority' | 'duplicate_grant_key' | 'invalid_value' | 'missing_reference' | 'unreachable'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface CoreEndingValidationResult {
  readonly valid: boolean
  readonly issues: readonly CoreEndingValidationIssue[]
}

interface EndingComedyLine {
  readonly endingId: string
  readonly line: string
}

function addConditionRequirements(condition: Condition, context: { stats: Record<string, number>; flags: Record<string, boolean>; quests: Record<string, string>; inventory: string[] }): void {
  if (condition.type === 'stat_gte') {
    context.stats[condition.stat] = Math.max(context.stats[condition.stat] ?? 0, condition.value)
    return
  }
  if (condition.type === 'flag_equals') {
    context.flags[condition.flag] = condition.value
    return
  }
  if (condition.type === 'quest_complete') {
    context.quests[String(condition.questId)] = 'completed'
    return
  }
  if (condition.type === 'has_item') {
    const count = condition.count ?? 1
    for (let index = context.inventory.length; index < count; index += 1) context.inventory.push(String(condition.itemId))
    if (!context.inventory.includes(String(condition.itemId))) context.inventory.push(String(condition.itemId))
    return
  }
  if (condition.type === 'not') {
    return
  }
  condition.conditions.forEach((child) => addConditionRequirements(child, context))
}

function reachableContext(condition: Condition): ConditionContext {
  const draft = { stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 } as Record<string, number>, flags: {} as Record<string, boolean>, quests: {} as Record<string, QuestConditionStatus>, inventory: [] as string[] }
  addConditionRequirements(condition, draft)
  return { stats: draft.stats, flags: draft.flags, quests: draft.quests, inventory: draft.inventory }
}

export function validateCoreEndingContent(
  endings: readonly EndingDefinition[],
  presentationCueIds: readonly string[],
  dialogues: Readonly<Record<string, readonly string[]>>,
  comedy: readonly EndingComedyLine[],
): CoreEndingValidationResult {
  const issues: CoreEndingValidationIssue[] = []
  const base = validateEndingDefinitions(endings)
  base.issues.forEach((issue) => issues.push({ code: issue.code === 'invalid_value' ? 'invalid_value' : issue.code, path: issue.path, message: issue.message, id: issue.id }))
  if (endings.length !== 4) issues.push({ code: 'invalid_value', path: 'endings', message: `Core 结局数量必须为 4，当前为 ${endings.length}` })

  const cueIds = new Set(presentationCueIds)
  const comedyByEnding = new Map<string, EndingComedyLine[]>()
  comedy.forEach((line, index) => {
    const path = `comedy.${index}`
    if (!line.line.trim()) issues.push({ code: 'invalid_value', path: `${path}.line`, message: '结局喜剧收束文案不能为空', id: line.endingId })
    const entries = comedyByEnding.get(line.endingId) ?? []
    entries.push(line)
    comedyByEnding.set(line.endingId, entries)
  })
  endings.forEach((ending, index) => {
    const id = String(ending.id)
    if (!cueIds.has(ending.presentationCueId)) issues.push({ code: 'missing_reference', path: `endings.${index}.presentationCueId`, message: `找不到结局演出 cue「${ending.presentationCueId}」`, id })
    const lines = dialogues[id]
    if (!lines || lines.length < 2 || lines.some((line) => !line.trim())) issues.push({ code: 'missing_reference', path: `dialogues.${id}`, message: '每个结局必须有至少两句非空收束对白', id })
    if (!comedyByEnding.has(id)) issues.push({ code: 'missing_reference', path: `comedy.${id}`, message: '每个结局必须有一条喜剧收束文案', id })
    try {
      if (!evaluateCondition(ending.conditions, reachableContext(ending.conditions))) issues.push({ code: 'unreachable', path: `endings.${index}.conditions`, message: '结局条件没有可构造的静态可达路径', id })
    } catch {
      issues.push({ code: 'unreachable', path: `endings.${index}.conditions`, message: '结局条件求值失败，无法证明静态可达', id })
    }
  })
  return { valid: issues.length === 0, issues }
}
