import { createCommissionEngine, markCommissionReady, claimCommission, generateCommission, validateCommissionTemplates } from '../commissions'
import type { CommissionEngine } from '../commissions'
import type { CommissionTemplate } from '../../types/commission'
import type { PostgameClaimResult, PostgameContext, PostgameGenerationResult, PostgameState, PostgameTemplatePack } from '../../types/postgame'

export class PostgameEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PostgameEngineError'
  }
}

function cloneState(state: PostgameState): PostgameState {
  return { ...state, commission: { ...state.commission, active: state.commission.active.map((task) => ({ ...task, target: { ...task.target }, reward: { ...task.reward }, rng: { ...task.rng } })), templateUseCounts: { ...state.commission.templateUseCounts }, completedTemplateIds: [...state.commission.completedTemplateIds], claimedGrantKeys: [...state.commission.claimedGrantKeys], generatedRequestKeys: [...state.commission.generatedRequestKeys] }, completedEndingIds: [...state.completedEndingIds], claimedOneTimeTargetIds: [...state.claimedOneTimeTargetIds] }
}

function initialSnapshot(snapshot?: Partial<PostgameState>): PostgameState {
  return {
    unlocked: snapshot?.unlocked ?? false,
    difficulty: snapshot?.difficulty ?? 'ordinary',
    commission: snapshot?.commission ?? { progress: 0, active: [], templateUseCounts: {}, completedTemplateIds: [], claimedGrantKeys: [], generatedRequestKeys: [] },
    completedEndingIds: [...(snapshot?.completedEndingIds ?? [])],
    prosperity: snapshot?.prosperity ?? 0,
    totalWealth: snapshot?.totalWealth ?? 0,
    totalFame: snapshot?.totalFame ?? 0,
    claimedOneTimeTargetIds: [...(snapshot?.claimedOneTimeTargetIds ?? [])],
  }
}

export class PostgameLoopEngine {
  private commission: CommissionEngine
  private readonly pack: PostgameTemplatePack
  private state: PostgameState

  constructor(pack: PostgameTemplatePack, snapshot?: Partial<PostgameState>) {
    const validation = validateCommissionTemplates(pack.templates)
    if (!validation.valid) throw new PostgameEngineError(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
    this.pack = pack
    this.state = initialSnapshot(snapshot)
    this.commission = createCommissionEngine(this.templatesForDifficulty(), this.state.commission)
  }

  private templatesForDifficulty(): readonly CommissionTemplate[] {
    const maxTier = this.state.difficulty === 'ordinary' ? 1 : this.state.difficulty === 'elite' ? 2 : 3
    const tierRank: Record<CommissionTemplate['tier'], number> = { ordinary: 1, elite: 2, legendary: 3 }
    return this.pack.templates.filter((template) => tierRank[template.tier] <= maxTier)
  }

  snapshot(): PostgameState { return cloneState({ ...this.state, commission: this.commission.snapshot() }) }

  unlock(completedEndingIds: readonly string[], prosperity = this.state.prosperity): PostgameState {
    this.state = { ...this.state, unlocked: true, completedEndingIds: [...new Set(completedEndingIds)], prosperity: Math.max(this.state.prosperity, prosperity) }
    return this.snapshot()
  }

  setDifficulty(difficulty: PostgameState['difficulty']): PostgameState {
    if (!this.state.unlocked && difficulty !== 'ordinary') throw new PostgameEngineError('结局后继续尚未开放。')
    this.state = { ...this.state, difficulty, commission: this.commission.snapshot() }
    this.commission = createCommissionEngine(this.templatesForDifficulty(), this.state.commission)
    return this.snapshot()
  }

  generate(context: PostgameContext): PostgameGenerationResult {
    if (!this.state.unlocked) return { status: 'locked', state: this.snapshot(), message: '完成任一结局后，原档才会开放通关后委托。' }
    const result = generateCommission(this.commission, { ...context, chapter: Math.max(8, context.chapter) })
    this.state = { ...this.state, prosperity: Math.max(this.state.prosperity, context.prosperity) }
    return { status: result.status, state: this.snapshot(), ...(result.task ? { task: result.task } : {}), message: result.message }
  }

  markReady(instanceId: string): PostgameState {
    const result = markCommissionReady(this.commission, instanceId)
    if (result.status === 'unknown_commission') throw new PostgameEngineError(result.message)
    return this.snapshot()
  }

  claim(instanceId: string): PostgameClaimResult {
    if (!this.state.unlocked) return { status: 'locked', state: this.snapshot(), wealthDelta: 0, fameDelta: 0, prosperityDelta: 0, message: '通关后循环尚未开放。' }
    const result = claimCommission(this.commission, instanceId)
    const status: PostgameClaimResult['status'] = result.status === 'claimed' ? 'claimed' : result.status === 'already_claimed' ? 'already_claimed' : result.status === 'unknown_commission' ? 'unknown_commission' : 'not_ready'
    if (!result.task) return { status, state: this.snapshot(), wealthDelta: 0, fameDelta: 0, prosperityDelta: 0, message: result.message }
    if (status !== 'claimed') return { status, state: this.snapshot(), task: result.task, wealthDelta: 0, fameDelta: 0, prosperityDelta: 0, message: result.message }
    const task = result.task
    const prosperityDelta = task.tier === 'legendary' ? 2 : task.tier === 'elite' ? 1 : 0
    const nextOneTime = task.target.contextTags.includes('one-time') && !this.state.claimedOneTimeTargetIds.includes(task.target.id) ? [...this.state.claimedOneTimeTargetIds, task.target.id] : [...this.state.claimedOneTimeTargetIds]
    this.state = { ...this.state, commission: this.commission.snapshot(), totalWealth: this.state.totalWealth + task.reward.wealth, totalFame: this.state.totalFame + task.reward.fame, prosperity: this.state.prosperity + prosperityDelta, claimedOneTimeTargetIds: nextOneTime }
    return { status: 'claimed', state: this.snapshot(), task, wealthDelta: task.reward.wealth, fameDelta: task.reward.fame, prosperityDelta, message: `${task.title}已结算：收益回流到门派经营。` }
  }
}

export function createPostgameLoopEngine(pack: PostgameTemplatePack, snapshot?: Partial<PostgameState>): PostgameLoopEngine { return new PostgameLoopEngine(pack, snapshot) }
export const createPostgameEngine = createPostgameLoopEngine
