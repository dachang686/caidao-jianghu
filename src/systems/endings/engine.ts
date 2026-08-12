import { evaluateCondition } from '../conditions/evaluate'
import type { ConditionContext } from '../../types/conditions'
import type { EndingDefinition, EndingRecordResult, EndingRecordState, EndingSelection, EndingValidationResult } from '../../types/ending'

export class EndingEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EndingEngineError'
  }
}

function cloneState(state: EndingRecordState): EndingRecordState {
  return {
    seenIds: [...state.seenIds],
    chosenId: state.chosenId,
    claimedGrantKeys: [...state.claimedGrantKeys],
    postgameContinues: state.postgameContinues,
  }
}

export function createEndingState(overrides: Partial<EndingRecordState> = {}): EndingRecordState {
  return { seenIds: [], chosenId: null, claimedGrantKeys: [], postgameContinues: true, ...overrides }
}

export function validateEndingDefinitions(definitions: readonly EndingDefinition[]): EndingValidationResult {
  const issues: EndingValidationResult['issues'] extends readonly (infer Issue)[] ? Issue[] : never = []
  const ids = new Set<string>()
  const priorities = new Set<number>()
  const grants = new Set<string>()
  definitions.forEach((ending, index) => {
    const id = String(ending.id)
    if (ids.has(id)) issues.push({ code: 'duplicate_id', path: `endings.${index}.id`, message: `重复结局 ID「${id}」`, id })
    ids.add(id)
    if (priorities.has(ending.priority)) issues.push({ code: 'duplicate_priority', path: `endings.${index}.priority`, message: `结局优先级重复「${ending.priority}」`, id })
    priorities.add(ending.priority)
    if (!Number.isInteger(ending.priority) || ending.priority < 1 || !ending.title.trim() || !ending.settlementSummary.trim() || !ending.grantKey.trim() || ending.choices.length === 0) issues.push({ code: 'invalid_value', path: `endings.${index}`, message: '结局必须有正整数优先级、标题、结算摘要、奖励键和最终选择', id })
    if (grants.has(ending.grantKey)) issues.push({ code: 'duplicate_grant_key', path: `endings.${index}.grantKey`, message: `重复结局奖励键「${ending.grantKey}」`, id })
    grants.add(ending.grantKey)
    const choiceIds = new Set<string>()
    ending.choices.forEach((choice, choiceIndex) => {
      if (choiceIds.has(choice.id)) issues.push({ code: 'duplicate_id', path: `endings.${index}.choices.${choiceIndex}.id`, message: `重复最终选择 ID「${choice.id}」`, id: choice.id })
      choiceIds.add(choice.id)
      if (!choice.label.trim() || !choice.summary.trim()) issues.push({ code: 'invalid_value', path: `endings.${index}.choices.${choiceIndex}`, message: '结局选择必须有标签和说明', id })
    })
    ending.finalChoiceIds.forEach((choiceId) => { if (!choiceIds.has(choiceId)) issues.push({ code: 'invalid_value', path: `endings.${index}.finalChoiceIds`, message: `最终选择「${choiceId}」未定义`, id }) })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidEndingDefinitions(definitions: readonly EndingDefinition[]): void {
  const result = validateEndingDefinitions(definitions)
  if (!result.valid) throw new EndingEngineError(result.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
}

export function selectEnding(definitions: readonly EndingDefinition[], context: ConditionContext): EndingSelection {
  assertValidEndingDefinitions(definitions)
  const candidates = definitions
    .filter((ending) => {
      try { return evaluateCondition(ending.conditions, context) } catch { return false }
    })
    .sort((left, right) => left.priority - right.priority)
  const ending = candidates[0] ?? null
  return ending
    ? { status: 'selected', ending, candidates, reason: `已按优先级 ${ending.priority} 锁定「${ending.title}」。` }
    : { status: 'none_available', ending: null, candidates: [], reason: '当前条件还不足以锁定结局；请回到章节状态和最终选择复核。' }
}

export function recordEnding(
  state: EndingRecordState,
  ending: EndingDefinition,
  choiceId: string,
  confirmed = false,
): EndingRecordResult {
  const next = cloneState(state)
  const choice = ending.choices.find((candidate) => candidate.id === choiceId)
  if (!choice || !ending.finalChoiceIds.includes(choiceId)) return { status: 'invalid_choice', state: next, ending, choiceId, message: '这个最终选择不属于当前结局。' }
  if (choice.seriousConfirmation && !confirmed) return { status: 'confirmation_required', state: next, ending, choiceId, message: '这是不可逆的结算选择，请再次确认。' }
  if (next.seenIds.includes(String(ending.id))) return { status: 'already_recorded', state: next, ending, choiceId, message: '该结局已经记录过，本次只回看演出，不重复发放奖励。' }
  const recordedState: EndingRecordState = {
    ...next,
    seenIds: [...next.seenIds, String(ending.id)],
    chosenId: next.chosenId ?? String(ending.id),
    claimedGrantKeys: next.claimedGrantKeys.includes(ending.grantKey) ? next.claimedGrantKeys : [...next.claimedGrantKeys, ending.grantKey],
    postgameContinues: true,
  }
  return { status: 'recorded', state: recordedState, ending, choiceId, message: `${ending.title}已记录，原档继续开放。` }
}

export const resolveEndingCandidates = selectEnding
export const applyEndingChoice = recordEnding
