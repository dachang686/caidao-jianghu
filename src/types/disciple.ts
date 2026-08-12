import type { Condition, ConditionContext } from './conditions'
import type { DialogueId, DiscipleId } from './ids'
import type { SectState } from './sect'
import type { Effect } from './effects'

export const MAX_DISCIPLES = 12

export type DiscipleTraitId = string

export interface DiscipleDispatchModifiers {
  /** 派遣耗时的可预览小幅修正；不会使用现实时间。 */
  readonly durationTicksDelta?: number
  /** 成功率小幅修正，领域层会限制在安全范围。 */
  readonly successChanceDelta?: number
  /** 委托质量修正。 */
  readonly qualityDelta?: number
}

export interface DiscipleTraitDefinition {
  readonly id: DiscipleTraitId
  readonly name: string
  readonly description: string
  readonly modifiers: DiscipleDispatchModifiers
}

export type DiscipleSpecialty = 'intel' | 'forge' | 'kitchen' | 'management'

/**
 * 门人专属派遣事件只声明领域层可执行的 Effect 请求；文本和奖励不直接修改 UI/store。
 */
export interface DiscipleDispatchEventDefinition {
  readonly id: string
  readonly discipleId: DiscipleId
  readonly title: string
  readonly description: string
  readonly triggerEvent: 'sect.dispatch_completed'
  readonly specialty: DiscipleSpecialty
  readonly requiredTraitIds?: readonly DiscipleTraitId[]
  readonly feedback: string
  readonly effect?: Effect
}

export interface DiscipleRecruitmentDefinition {
  readonly requiredChapter?: number
  readonly conditions?: readonly Condition[]
}

export interface DiscipleDefinition {
  readonly id: DiscipleId
  readonly name: string
  readonly description: string
  readonly recruitment: DiscipleRecruitmentDefinition
  /** 每名门人必须有 1–2 个性格标签。 */
  readonly traitIds: readonly DiscipleTraitId[]
  /** Core 内容用于把门人差异映射到四类门派经营倾向；旧存档/测试定义可暂缺。 */
  readonly specialty?: DiscipleSpecialty
  /** Core 内容至少配置一个与本人绑定的派遣事件。 */
  readonly dispatchEventIds?: readonly string[]
  readonly recruitmentDialogueId?: DialogueId
  readonly dialogueIds?: readonly DialogueId[]
}

export interface DiscipleRosterState {
  readonly recruitedIds: readonly DiscipleId[]
  readonly seenDialogueIds: readonly DialogueId[]
}

export interface DiscipleRecruitmentResult {
  readonly status: 'recruited' | 'already_recruited' | 'capacity_full' | 'sect_locked' | 'chapter_locked' | 'condition_locked' | 'unknown_disciple'
  readonly discipleId: DiscipleId
  readonly state: SectState
  readonly message: string
}

export interface DiscipleDialogueResult {
  readonly status: 'marked' | 'already_seen' | 'not_recruited' | 'unknown_dialogue'
  readonly state: SectState
  readonly discipleId: DiscipleId
  readonly dialogueId: DialogueId
}

export interface DiscipleDispatchPreview {
  readonly discipleIds: readonly DiscipleId[]
  readonly traitIds: readonly DiscipleTraitId[]
  readonly durationTicksDelta: number
  readonly successChanceDelta: number
  readonly qualityDelta: number
  readonly notes: readonly string[]
}

export interface DiscipleValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'duplicate_trait' | 'missing_trait' | 'duplicate_event' | 'missing_event' | 'invalid_specialty' | 'invalid_dispatch_event'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface DiscipleValidationResult {
  readonly valid: boolean
  readonly issues: readonly DiscipleValidationIssue[]
}

export interface DiscipleConditionContext {
  readonly conditionContext: ConditionContext
}
