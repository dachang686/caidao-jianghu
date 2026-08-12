import type { ConditionContext } from '../../types/conditions'
import type {
  DiscipleDefinition,
  DiscipleDispatchEventDefinition,
  DiscipleDispatchPreview,
  DiscipleDialogueResult,
  DiscipleRecruitmentResult,
  DiscipleSpecialty,
  DiscipleTraitDefinition,
  DiscipleTraitId,
  DiscipleValidationIssue,
  DiscipleValidationResult,
} from '../../types/disciple'
import { MAX_DISCIPLES } from '../../types/disciple'
import type { DialogueId, DiscipleId } from '../../types/ids'
import type { SectState } from '../../types/sect'
import { createSectState } from '../../types/sect'
import { evaluateCondition } from '../conditions/evaluate'

const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

const DISCIPLE_SPECIALTIES = new Set<DiscipleSpecialty>(['intel', 'forge', 'kitchen', 'management'])

export class DiscipleEngineError extends Error {
  readonly issues?: readonly DiscipleValidationIssue[]

  constructor(message: string, issues?: readonly DiscipleValidationIssue[]) {
    super(message)
    this.name = 'DiscipleEngineError'
    this.issues = issues
  }
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function validateTrait(trait: DiscipleTraitDefinition, path: string, issues: DiscipleValidationIssue[]): void {
  if (!trait.id.trim() || !trait.name.trim() || !trait.description.trim()) issues.push({ code: 'invalid_value', path, message: '性格 ID、名称和说明不能为空', id: trait.id })
  const modifiers = trait.modifiers
  if (modifiers.durationTicksDelta !== undefined && (!Number.isInteger(modifiers.durationTicksDelta) || Math.abs(modifiers.durationTicksDelta) > 2)) issues.push({ code: 'invalid_value', path: `${path}.modifiers.durationTicksDelta`, message: '派遣时长修正必须是 -2 到 2 的整数', id: trait.id })
  if (modifiers.successChanceDelta !== undefined && (!Number.isFinite(modifiers.successChanceDelta) || Math.abs(modifiers.successChanceDelta) > 0.2)) issues.push({ code: 'invalid_value', path: `${path}.modifiers.successChanceDelta`, message: '成功率修正必须在 -0.2 到 0.2 之间', id: trait.id })
  if (modifiers.qualityDelta !== undefined && (!Number.isInteger(modifiers.qualityDelta) || Math.abs(modifiers.qualityDelta) > 2)) issues.push({ code: 'invalid_value', path: `${path}.modifiers.qualityDelta`, message: '质量修正必须是 -2 到 2 的整数', id: trait.id })
}

export function validateDiscipleDefinitions(definitions: readonly DiscipleDefinition[], traits: readonly DiscipleTraitDefinition[] = []): DiscipleValidationResult {
  const issues: DiscipleValidationIssue[] = []
  const ids = new Set<string>()
  const traitIds = new Set<string>()
  traits.forEach((trait, traitIndex) => {
    if (traitIds.has(trait.id)) issues.push({ code: 'duplicate_id', path: `traits[${traitIndex}].id`, message: `重复性格 ID「${trait.id}」`, id: trait.id })
    traitIds.add(trait.id)
    validateTrait(trait, `traits[${traitIndex}]`, issues)
  })
  definitions.forEach((definition, definitionIndex) => {
    const path = `disciples[${definitionIndex}]`
    if (ids.has(definition.id)) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复门人 ID「${definition.id}」`, id: definition.id })
    ids.add(definition.id)
    if (!definition.id.trim() || !definition.name.trim() || !definition.description.trim()) issues.push({ code: 'invalid_value', path, message: '门人 ID、名称和说明不能为空', id: definition.id })
    if (definition.traitIds.length < 1 || definition.traitIds.length > 2) issues.push({ code: 'invalid_value', path: `${path}.traitIds`, message: '每名门人必须配置 1–2 个性格标签', id: definition.id })
    if (definition.specialty !== undefined && !DISCIPLE_SPECIALTIES.has(definition.specialty)) issues.push({ code: 'invalid_specialty', path: `${path}.specialty`, message: `门派经营倾向无效「${definition.specialty}」`, id: definition.id })
    const definitionTraits = new Set<string>()
    definition.traitIds.forEach((traitId, traitIndex) => {
      if (definitionTraits.has(traitId)) issues.push({ code: 'duplicate_trait', path: `${path}.traitIds[${traitIndex}]`, message: `门人性格不得重复「${traitId}」`, id: definition.id })
      definitionTraits.add(traitId)
      if (traits.length > 0 && !traitIds.has(traitId)) issues.push({ code: 'missing_trait', path: `${path}.traitIds[${traitIndex}]`, message: `找不到性格定义「${traitId}」`, id: definition.id })
    })
    if (definition.recruitment.requiredChapter !== undefined && (!Number.isInteger(definition.recruitment.requiredChapter) || definition.recruitment.requiredChapter < 1)) issues.push({ code: 'invalid_value', path: `${path}.recruitment.requiredChapter`, message: '招募章节必须是正整数', id: definition.id })
    const dialogueIds = [...(definition.recruitmentDialogueId ? [definition.recruitmentDialogueId] : []), ...(definition.dialogueIds ?? [])]
    if (new Set(dialogueIds).size !== dialogueIds.length) issues.push({ code: 'duplicate_id', path: `${path}.dialogueIds`, message: '门人对白 ID 不得重复', id: definition.id })
    if (definition.dispatchEventIds && new Set(definition.dispatchEventIds).size !== definition.dispatchEventIds.length) issues.push({ code: 'duplicate_event', path: `${path}.dispatchEventIds`, message: '门人派遣事件 ID 不得重复', id: definition.id })
  })
  if (definitions.length > MAX_DISCIPLES) issues.push({ code: 'invalid_value', path: 'disciples', message: `门人定义不能超过 ${MAX_DISCIPLES} 人` })
  return { valid: issues.length === 0, issues }
}

function validateDispatchEventEffect(effect: DiscipleDispatchEventDefinition['effect'], path: string, issues: DiscipleValidationIssue[], id: string): void {
  if (!effect) return
  if (effect.type === 'change_stat') {
    if (!['fame', 'wealth', 'sectProsperity'].includes(effect.stat) || !Number.isFinite(effect.delta) || effect.delta <= 0 || effect.delta > 2) {
      issues.push({ code: 'invalid_dispatch_event', path, message: '派遣事件只能通过领域 Effect 给予 0–2 的正向名望、财富或门派繁荣反馈', id })
    }
    return
  }
  if (effect.type === 'narrate') return
  issues.push({ code: 'invalid_dispatch_event', path, message: '派遣事件不得直接触发战斗、删除物品或执行未声明的状态操作', id })
}

export function validateDiscipleDispatchEventDefinitions(
  events: readonly DiscipleDispatchEventDefinition[],
  definitions: readonly DiscipleDefinition[],
  traits: readonly DiscipleTraitDefinition[] = [],
): DiscipleValidationResult {
  const issues: DiscipleValidationIssue[] = []
  const eventIds = new Set<string>()
  const definitionMap = new Map(definitions.map((definition) => [definition.id, definition]))
  const traitIds = new Set(traits.map((trait) => trait.id))

  events.forEach((event, eventIndex) => {
    const path = `dispatchEvents[${eventIndex}]`
    if (eventIds.has(event.id)) issues.push({ code: 'duplicate_event', path: `${path}.id`, message: `重复派遣事件 ID「${event.id}」`, id: event.id })
    eventIds.add(event.id)
    if (!event.id.trim() || !event.title.trim() || !event.description.trim() || !event.feedback.trim()) issues.push({ code: 'invalid_dispatch_event', path, message: '派遣事件 ID、标题、描述和反馈不能为空', id: event.id })
    if (event.triggerEvent !== 'sect.dispatch_completed') issues.push({ code: 'invalid_dispatch_event', path: `${path}.triggerEvent`, message: '派遣事件必须监听 sect.dispatch_completed', id: event.id })
    if (!DISCIPLE_SPECIALTIES.has(event.specialty)) issues.push({ code: 'invalid_specialty', path: `${path}.specialty`, message: `派遣事件倾向无效「${event.specialty}」`, id: event.id })
    const owner = definitionMap.get(event.discipleId)
    if (!owner) issues.push({ code: 'invalid_dispatch_event', path: `${path}.discipleId`, message: `派遣事件引用了不存在的门人「${event.discipleId}」`, id: event.id })
    else if (owner.specialty !== event.specialty) issues.push({ code: 'invalid_specialty', path: `${path}.specialty`, message: '派遣事件倾向必须与门人经营倾向一致', id: event.id })
    event.requiredTraitIds?.forEach((traitId, traitIndex) => {
      if (traits.length > 0 && !traitIds.has(traitId)) issues.push({ code: 'missing_trait', path: `${path}.requiredTraitIds[${traitIndex}]`, message: `找不到派遣事件性格「${traitId}」`, id: event.id })
      if (owner && !owner.traitIds.includes(traitId)) issues.push({ code: 'invalid_dispatch_event', path: `${path}.requiredTraitIds[${traitIndex}]`, message: '派遣事件所需性格必须属于事件门人', id: event.id })
    })
    validateDispatchEventEffect(event.effect, `${path}.effect`, issues, event.id)
  })

  definitions.forEach((definition, definitionIndex) => {
    const path = `disciples[${definitionIndex}]`
    if (!definition.specialty || !DISCIPLE_SPECIALTIES.has(definition.specialty)) issues.push({ code: 'invalid_specialty', path: `${path}.specialty`, message: 'Core 门人必须声明情报、锻造、烹饪或经营倾向', id: definition.id })
    const eventRefs = definition.dispatchEventIds ?? []
    if (eventRefs.length === 0) issues.push({ code: 'missing_event', path: `${path}.dispatchEventIds`, message: '每名 Core 门人至少需要一个专属派遣事件', id: definition.id })
    eventRefs.forEach((eventId, eventIndex) => {
      const event = events.find((candidate) => candidate.id === eventId)
      if (!event) issues.push({ code: 'missing_event', path: `${path}.dispatchEventIds[${eventIndex}]`, message: `找不到专属派遣事件「${eventId}」`, id: definition.id })
      else if (event.discipleId !== definition.id) issues.push({ code: 'invalid_dispatch_event', path: `${path}.dispatchEventIds[${eventIndex}]`, message: '门人不能引用其他门人的专属派遣事件', id: definition.id })
    })
  })

  return { valid: issues.length === 0, issues }
}

export function assertValidDiscipleDefinitions(definitions: readonly DiscipleDefinition[], traits: readonly DiscipleTraitDefinition[] = []): void {
  const result = validateDiscipleDefinitions(definitions, traits)
  if (!result.valid) throw new DiscipleEngineError(result.issues.map((item) => `${item.path}: ${item.message}`).join('\n'), result.issues)
}

function findDefinition(definitions: readonly DiscipleDefinition[], discipleId: DiscipleId): DiscipleDefinition | undefined {
  return definitions.find((definition) => definition.id === discipleId)
}

function recruitmentAvailable(definition: DiscipleDefinition, chapter: number, context: ConditionContext): boolean {
  if (definition.recruitment.requiredChapter !== undefined && chapter < definition.recruitment.requiredChapter) return false
  return (definition.recruitment.conditions ?? []).every((condition) => {
    try {
      return evaluateCondition(condition, context)
    } catch {
      return false
    }
  })
}

function result(status: DiscipleRecruitmentResult['status'], discipleId: DiscipleId, state: SectState, message: string): DiscipleRecruitmentResult {
  return { status, discipleId, state, message }
}

export function recruitDisciple(
  initialState: SectState,
  discipleId: DiscipleId,
  definitions: readonly DiscipleDefinition[],
  chapter: number,
  conditionContext: ConditionContext = EMPTY_CONTEXT,
): DiscipleRecruitmentResult {
  const definition = findDefinition(definitions, discipleId)
  if (!definition) return result('unknown_disciple', discipleId, initialState, `找不到门人「${discipleId}」。`)
  if (!initialState.unlocked) return result('sect_locked', discipleId, initialState, '门派尚未解锁。')
  if (initialState.discipleIds.includes(discipleId)) return result('already_recruited', discipleId, initialState, '该门人已经加入门派。')
  if (initialState.discipleIds.length >= MAX_DISCIPLES) return result('capacity_full', discipleId, initialState, `门人名册已满（最多 ${MAX_DISCIPLES} 人）。`)
  if (definition.recruitment.requiredChapter !== undefined && chapter < definition.recruitment.requiredChapter) return result('chapter_locked', discipleId, initialState, `第 ${definition.recruitment.requiredChapter} 章后才能招募该门人。`)
  if (!recruitmentAvailable(definition, chapter, conditionContext)) return result('condition_locked', discipleId, initialState, '招募条件尚未满足。')
  return result('recruited', discipleId, {
    ...initialState,
    discipleIds: [...initialState.discipleIds, discipleId],
  }, `${definition.name}已加入门派。`)
}

export function markDiscipleDialogueSeen(initialState: SectState, discipleId: DiscipleId, dialogueId: DialogueId, definitions: readonly DiscipleDefinition[]): DiscipleDialogueResult {
  const definition = findDefinition(definitions, discipleId)
  if (!definition || !initialState.discipleIds.includes(discipleId)) return { status: 'not_recruited', state: initialState, discipleId, dialogueId }
  const allowed = [ ...(definition.recruitmentDialogueId ? [definition.recruitmentDialogueId] : []), ...(definition.dialogueIds ?? []) ]
  if (!allowed.includes(dialogueId)) return { status: 'unknown_dialogue', state: initialState, discipleId, dialogueId }
  if (initialState.seenDiscipleDialogueIds.includes(dialogueId)) return { status: 'already_seen', state: initialState, discipleId, dialogueId }
  return { status: 'marked', state: { ...initialState, seenDiscipleDialogueIds: [...initialState.seenDiscipleDialogueIds, dialogueId] }, discipleId, dialogueId }
}

export function previewDiscipleDispatch(
  discipleIds: readonly DiscipleId[],
  definitions: readonly DiscipleDefinition[],
  traits: readonly DiscipleTraitDefinition[],
): DiscipleDispatchPreview {
  const traitMap = new Map(traits.map((trait) => [trait.id, trait]))
  const traitIds: DiscipleTraitId[] = []
  const notes: string[] = []
  let durationTicksDelta = 0
  let successChanceDelta = 0
  let qualityDelta = 0
  discipleIds.forEach((discipleId) => {
    const definition = findDefinition(definitions, discipleId)
    if (!definition) throw new DiscipleEngineError(`找不到门人「${discipleId}」。`)
    definition.traitIds.forEach((traitId) => {
      if (traitIds.includes(traitId)) return
      const trait = traitMap.get(traitId)
      if (!trait) throw new DiscipleEngineError(`找不到性格「${traitId}」。`)
      traitIds.push(traitId)
      durationTicksDelta += trait.modifiers.durationTicksDelta ?? 0
      successChanceDelta += trait.modifiers.successChanceDelta ?? 0
      qualityDelta += trait.modifiers.qualityDelta ?? 0
      notes.push(`${trait.name}：${trait.description}`)
    })
  })
  return {
    discipleIds: [...discipleIds],
    traitIds,
    durationTicksDelta,
    successChanceDelta: Math.max(-0.4, Math.min(0.4, successChanceDelta)),
    qualityDelta,
    notes,
  }
}

export class DiscipleRoster {
  private state: SectState
  readonly definitions: readonly DiscipleDefinition[]
  readonly traits: readonly DiscipleTraitDefinition[]

  constructor(
    definitions: readonly DiscipleDefinition[],
    traits: readonly DiscipleTraitDefinition[],
    initialState: SectState = createSectState(),
  ) {
    this.definitions = definitions
    this.traits = traits
    assertValidDiscipleDefinitions(definitions, traits)
    this.state = initialState
  }

  getState(): SectState {
    return {
      ...this.state,
      discipleIds: [...this.state.discipleIds],
      seenDiscipleDialogueIds: [...this.state.seenDiscipleDialogueIds],
    }
  }

  recruit(discipleId: DiscipleId, chapter: number, conditionContext: ConditionContext = EMPTY_CONTEXT): DiscipleRecruitmentResult {
    const outcome = recruitDisciple(this.state, discipleId, this.definitions, chapter, conditionContext)
    if (outcome.status === 'recruited') this.state = outcome.state
    return { ...outcome, state: this.getState() }
  }

  markDialogueSeen(discipleId: DiscipleId, dialogueId: DialogueId): DiscipleDialogueResult {
    const outcome = markDiscipleDialogueSeen(this.state, discipleId, dialogueId, this.definitions)
    if (outcome.status === 'marked') this.state = outcome.state
    return { ...outcome, state: this.getState() }
  }

  previewDispatch(discipleIds: readonly DiscipleId[]): DiscipleDispatchPreview {
    return previewDiscipleDispatch(discipleIds, this.definitions, this.traits)
  }
}

export function createDiscipleRoster(definitions: readonly DiscipleDefinition[], traits: readonly DiscipleTraitDefinition[], initialState: SectState = createSectState()): DiscipleRoster {
  return new DiscipleRoster(definitions, traits, initialState)
}
