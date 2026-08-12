import { DeterministicRng } from '../rng/rng'
import type {
  CommissionActionResult,
  CommissionGenerationContext,
  CommissionGenerationResult,
  CommissionReward,
  CommissionRngSnapshot,
  CommissionSnapshot,
  CommissionTask,
  CommissionTemplate,
  CommissionValidationIssue,
  CommissionValidationResult,
} from '../../types/commission'

export const MAX_ACTIVE_COMMISSIONS = 3
export const MAX_ACTIVE_QUESTS = 6

export class CommissionEngineError extends Error {
  readonly issues?: readonly CommissionValidationIssue[]

  constructor(message: string, issues?: readonly CommissionValidationIssue[]) {
    super(message)
    this.name = 'CommissionEngineError'
    this.issues = issues
  }
}

function cloneTask(task: CommissionTask): CommissionTask {
  return {
    ...task,
    target: { ...task.target, contextTags: [...task.target.contextTags] },
    reward: { ...task.reward, ...(task.reward.itemIds ? { itemIds: [...task.reward.itemIds] } : {}) },
    rng: { ...task.rng },
  }
}

function cloneSnapshot(snapshot: CommissionSnapshot): CommissionSnapshot {
  return {
    progress: snapshot.progress,
    active: snapshot.active.map(cloneTask),
    templateUseCounts: { ...snapshot.templateUseCounts },
    completedTemplateIds: [...snapshot.completedTemplateIds],
    claimedGrantKeys: [...snapshot.claimedGrantKeys],
    generatedRequestKeys: [...snapshot.generatedRequestKeys],
  }
}

function validRng(rng: CommissionRngSnapshot): boolean {
  return Number.isInteger(rng.seed) && rng.seed >= 0 && rng.seed <= 0xffffffff && Number.isInteger(rng.state) && rng.state >= 0 && rng.state <= 0xffffffff
}

function pushIssue(issues: CommissionValidationIssue[], code: CommissionValidationIssue['code'], path: string, message: string, id?: string): void {
  issues.push({ code, path, message, ...(id ? { id } : {}) })
}

export function validateCommissionTemplates(templates: readonly CommissionTemplate[]): CommissionValidationResult {
  const issues: CommissionValidationIssue[] = []
  const ids = new Set<string>()
  const grantKeys = new Set<string>()
  templates.forEach((template, index) => {
    const path = `templates[${index}]`
    if (ids.has(template.id)) pushIssue(issues, 'duplicate_id', `${path}.id`, `重复委托模板 ID「${template.id}」`, template.id)
    ids.add(template.id)
    if (!template.id.trim() || !template.title.trim() || !template.description.trim()) pushIssue(issues, 'invalid_value', path, '委托 ID、标题和描述不能为空', template.id)
    if (!['ordinary', 'elite', 'legendary'].includes(template.tier)) pushIssue(issues, 'invalid_value', `${path}.tier`, '委托级别无效', template.id)
    if (!String(template.regionId).trim()) pushIssue(issues, 'invalid_value', `${path}.regionId`, '委托必须绑定区域', template.id)
    if (template.requiredChapter !== undefined && (!Number.isInteger(template.requiredChapter) || template.requiredChapter < 1)) pushIssue(issues, 'invalid_value', `${path}.requiredChapter`, '章节必须是正整数', template.id)
    if (!['collect', 'defeat', 'deliver', 'investigate', 'help'].includes(template.target.kind) || !template.target.id.trim() || !template.target.label.trim()) pushIssue(issues, 'invalid_value', `${path}.target`, '委托目标必须包含上下文目标类型、ID和说明', template.id)
    if (template.target.count !== undefined && (!Number.isInteger(template.target.count) || template.target.count <= 0)) pushIssue(issues, 'invalid_value', `${path}.target.count`, '目标数量必须是正整数', template.id)
    if (template.target.contextTags.length === 0 && !template.target.enemyId) pushIssue(issues, 'invalid_value', `${path}.target.contextTags`, '委托必须包含上下文标签或敌人引用，不能是纯数字跑腿', template.id)
    if (!Number.isFinite(template.reward.wealth) || template.reward.wealth < 0 || !Number.isFinite(template.reward.fame) || template.reward.fame < 0 || !template.reward.grantKey.trim()) pushIssue(issues, 'invalid_value', `${path}.reward`, '委托奖励必须是非负数并声明 grantKey', template.id)
    if (grantKeys.has(template.reward.grantKey)) pushIssue(issues, 'duplicate_grant_key', `${path}.reward.grantKey`, `重复奖励幂等键「${template.reward.grantKey}」`, template.id)
    grantKeys.add(template.reward.grantKey)
  })
  if (templates.length > 12) pushIssue(issues, 'invalid_value', 'templates', 'Core 委托模板不能超过 12 个', undefined)
  return { valid: issues.length === 0, issues }
}

export function assertValidCommissionTemplates(templates: readonly CommissionTemplate[]): void {
  const result = validateCommissionTemplates(templates)
  if (!result.valid) throw new CommissionEngineError(result.issues.map((item) => `${item.path}: ${item.message}`).join('\n'), result.issues)
}

function payoutMultiplier(useCount: number): number {
  return Math.max(0.5, Number((1 - useCount * 0.15).toFixed(2)))
}

function scaleReward(reward: CommissionReward, multiplier: number): CommissionReward {
  return {
    ...reward,
    wealth: Math.max(0, Math.round(reward.wealth * multiplier)),
    fame: Math.max(0, Math.round(reward.fame * multiplier)),
    ...(reward.itemIds ? { itemIds: [...reward.itemIds] } : {}),
  }
}

function requestKey(context: CommissionGenerationContext, index: number): string {
  return `${context.progress}:${context.rng.seed}:${context.rng.state}:${context.regionId ?? '*'}:${index}`
}

function selectTemplate(templates: readonly CommissionTemplate[], context: CommissionGenerationContext, index: number): CommissionTemplate | undefined {
  const rng = new DeterministicRng(context.rng.seed, context.rng.state).fork(`commission:${context.progress}:${index}`)
  return templates[rng.nextInt(0, templates.length)]
}

function action(status: CommissionActionResult['status'], state: CommissionSnapshot, message: string, task?: CommissionTask): CommissionActionResult {
  return { status, state, message, ...(task ? { task } : {}) }
}

export class CommissionEngine {
  private readonly templates: readonly CommissionTemplate[]
  private state: CommissionSnapshot

  constructor(templates: readonly CommissionTemplate[], snapshot?: Partial<CommissionSnapshot>) {
    assertValidCommissionTemplates(templates)
    this.templates = [...templates]
    this.state = {
      progress: snapshot?.progress ?? 0,
      active: (snapshot?.active ?? []).map(cloneTask),
      templateUseCounts: { ...(snapshot?.templateUseCounts ?? {}) },
      completedTemplateIds: [...(snapshot?.completedTemplateIds ?? [])],
      claimedGrantKeys: [...(snapshot?.claimedGrantKeys ?? [])],
      generatedRequestKeys: [...(snapshot?.generatedRequestKeys ?? [])],
    }
    if (!Number.isInteger(this.state.progress) || this.state.progress < 0 || this.state.active.length > MAX_ACTIVE_COMMISSIONS) throw new CommissionEngineError('委托快照无效。')
  }

  getState(): CommissionSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): CommissionSnapshot {
    return this.getState()
  }

  generate(context: CommissionGenerationContext): CommissionGenerationResult {
    if (!Number.isInteger(context.chapter) || context.chapter < 1 || !Number.isInteger(context.progress) || context.progress < 0 || !validRng(context.rng)) return { status: 'invalid_context', state: this.getState(), message: '委托生成上下文无效。' }
    if (this.state.active.filter((task) => task.status !== 'claimed').length >= MAX_ACTIVE_COMMISSIONS) return { status: 'limit_reached', state: this.getState(), message: `同时最多进行 ${MAX_ACTIVE_COMMISSIONS} 个程序委托。` }
    const index = this.state.generatedRequestKeys.length
    const key = requestKey(context, index)
    if (this.state.generatedRequestKeys.includes(key)) return { status: 'duplicate_request', state: this.getState(), message: '同一进度的委托生成请求已经处理过。' }
    const unlocked = new Set(context.unlockedRegionIds.map(String))
    const activeOneTimeIds = new Set(this.state.active.filter((task) => task.status !== 'claimed').map((task) => task.templateId))
    const eligible = this.templates.filter((template) => unlocked.has(String(template.regionId))
      && (context.regionId === undefined || String(template.regionId) === String(context.regionId))
      && (template.requiredChapter === undefined || context.chapter >= template.requiredChapter)
      && !(template.oneTime && (this.state.completedTemplateIds.includes(template.id) || activeOneTimeIds.has(template.id))))
    if (eligible.length === 0) return { status: 'no_eligible_template', state: { ...this.getState(), generatedRequestKeys: [...this.state.generatedRequestKeys, key] }, message: '当前没有满足区域和章节条件的委托模板。' }
    const template = selectTemplate(eligible, context, index)!
    const useCount = this.state.templateUseCounts[template.id] ?? 0
    const multiplier = payoutMultiplier(useCount)
    const fork = new DeterministicRng(context.rng.seed, context.rng.state).fork(`commission-task:${template.id}:${context.progress}:${index}`)
    const task: CommissionTask = {
      instanceId: `${template.id}:${context.progress}:${index}`,
      templateId: template.id,
      title: template.title,
      description: template.description,
      tier: template.tier,
      regionId: template.regionId,
      target: { ...template.target, contextTags: [...template.target.contextTags] },
      reward: scaleReward(template.reward, multiplier),
      payoutMultiplier: multiplier,
      generatedAtProgress: context.progress,
      rng: fork.snapshot(),
      status: 'active',
    }
    this.state = {
      progress: Math.max(this.state.progress, context.progress),
      active: [...this.state.active, task],
      templateUseCounts: { ...this.state.templateUseCounts, [template.id]: useCount + 1 },
      completedTemplateIds: [...this.state.completedTemplateIds],
      claimedGrantKeys: [...this.state.claimedGrantKeys],
      generatedRequestKeys: [...this.state.generatedRequestKeys, key],
    }
    return { status: 'generated', state: this.getState(), task, message: '委托已生成。' }
  }

  markReady(instanceId: string): CommissionActionResult {
    const task = this.state.active.find((candidate) => candidate.instanceId === instanceId)
    if (!task) return action('unknown_commission', this.getState(), '找不到委托。')
    if (task.status === 'claimed') return action('already_claimed', this.getState(), '委托结果已经领取。', task)
    if (task.status === 'ready') return action('already_ready', this.getState(), '委托已经可以领取。', task)
    const nextTask = { ...task, status: 'ready' as const }
    this.state = { ...this.state, active: this.state.active.map((candidate) => candidate.instanceId === instanceId ? nextTask : candidate) }
    return action('ready', this.getState(), '委托已完成，可以领取。', nextTask)
  }

  claim(instanceId: string): CommissionActionResult {
    const task = this.state.active.find((candidate) => candidate.instanceId === instanceId)
    if (!task) return action('unknown_commission', this.getState(), '找不到委托。')
    if (task.status === 'claimed') return action('already_claimed', this.getState(), '委托结果已经领取。', task)
    if (task.status !== 'ready') return action('not_ready', this.getState(), '委托尚未完成。', task)
    const nextTask = { ...task, status: 'claimed' as const }
    this.state = {
      ...this.state,
      active: this.state.active.map((candidate) => candidate.instanceId === instanceId ? nextTask : candidate),
      completedTemplateIds: task.reward.grantKey && this.templates.find((template) => template.id === task.templateId)?.oneTime
        ? [...this.state.completedTemplateIds, task.templateId]
        : [...this.state.completedTemplateIds],
      claimedGrantKeys: this.state.claimedGrantKeys.includes(task.reward.grantKey) ? [...this.state.claimedGrantKeys] : [...this.state.claimedGrantKeys, task.reward.grantKey],
    }
    return action('claimed', this.getState(), '委托奖励已领取。', nextTask)
  }
}

export function createCommissionEngine(templates: readonly CommissionTemplate[], snapshot?: Partial<CommissionSnapshot>): CommissionEngine {
  return new CommissionEngine(templates, snapshot)
}

export function generateCommission(engine: CommissionEngine, context: CommissionGenerationContext): CommissionGenerationResult {
  return engine.generate(context)
}

export function markCommissionReady(engine: CommissionEngine, instanceId: string): CommissionActionResult {
  return engine.markReady(instanceId)
}

export function claimCommission(engine: CommissionEngine, instanceId: string): CommissionActionResult {
  return engine.claim(instanceId)
}

export function serializeCommissionSnapshot(snapshot: CommissionSnapshot): string {
  return JSON.stringify(snapshot)
}

export function parseCommissionSnapshot(input: string): CommissionSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new CommissionEngineError('委托快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new CommissionEngineError('委托快照必须是对象。')
  const value = parsed as Partial<CommissionSnapshot>
  if (!Number.isInteger(value.progress) || (value.progress ?? -1) < 0 || !Array.isArray(value.active) || !value.templateUseCounts || !Array.isArray(value.completedTemplateIds) || !Array.isArray(value.claimedGrantKeys) || !Array.isArray(value.generatedRequestKeys)) throw new CommissionEngineError('委托快照缺少必要字段。')
  return value as CommissionSnapshot
}

export function restoreCommissionSnapshot(templates: readonly CommissionTemplate[], snapshot: CommissionSnapshot): CommissionEngine {
  return createCommissionEngine(templates, snapshot)
}
