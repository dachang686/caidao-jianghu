import type { EventSubscription } from '../events/event-bus'
import { EventBus } from '../events/event-bus'
import { DeterministicRng } from '../rng'
import type {
  BattleCompletedEvent,
  BattleCompletedPayload,
  DispatchAdvanceResult,
  DispatchClaim,
  DispatchClaimResult,
  DispatchRngSnapshot,
  DispatchStartRequest,
  DispatchStartResult,
  DispatchTask,
  SectDispatchSnapshot,
} from '../../types/dispatch'
import { MAX_DISPATCH_TEAMS } from '../../types/dispatch'
import type { DiscipleDispatchModifiers } from '../../types/disciple'

export const BATTLE_COMPLETED_EVENT = 'battle.completed'

export class DispatchEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DispatchEngineError'
  }
}

function cloneTask(task: DispatchTask): DispatchTask {
  return {
    ...task,
    discipleIds: [...task.discipleIds],
    rng: { ...task.rng },
    modifiers: { ...task.modifiers },
    ...(task.claim ? { claim: { ...task.claim } } : {}),
  }
}

function cloneSnapshot(snapshot: SectDispatchSnapshot): SectDispatchSnapshot {
  return {
    battleTick: snapshot.battleTick,
    tasks: snapshot.tasks.map(cloneTask),
    processedBattleEventIds: [...snapshot.processedBattleEventIds],
  }
}

function validRng(snapshot: DispatchRngSnapshot): boolean {
  return Number.isInteger(snapshot.seed) && snapshot.seed >= 0 && snapshot.seed <= 0xffffffff
    && Number.isInteger(snapshot.state) && snapshot.state >= 0 && snapshot.state <= 0xffffffff
}

function normalizeModifiers(modifiers: DiscipleDispatchModifiers | undefined): DiscipleDispatchModifiers | null {
  const value = modifiers ?? {}
  if (value.durationTicksDelta !== undefined && (!Number.isInteger(value.durationTicksDelta) || Math.abs(value.durationTicksDelta) > 2)) return null
  if (value.successChanceDelta !== undefined && (!Number.isFinite(value.successChanceDelta) || Math.abs(value.successChanceDelta) > 0.4)) return null
  if (value.qualityDelta !== undefined && (!Number.isInteger(value.qualityDelta) || Math.abs(value.qualityDelta) > 2)) return null
  return {
    durationTicksDelta: value.durationTicksDelta ?? 0,
    successChanceDelta: value.successChanceDelta ?? 0,
    qualityDelta: value.qualityDelta ?? 0,
  }
}

function validPayload(payload: unknown): payload is BattleCompletedPayload {
  if (!payload || typeof payload !== 'object') return false
  const value = payload as Partial<BattleCompletedPayload>
  if (typeof value.battleId !== 'string' || !value.battleId.trim()) return false
  if (value.isRetry === true || value.isSimulation === true || value.mode === 'retry' || value.mode === 'simulation' || value.mode === 'preview') return false
  const outcome = value.outcome ?? value.result
  return outcome === undefined || outcome === 'won' || outcome === 'win' || outcome === 'completed'
}

export function isEligibleBattleCompletedEvent(event: { readonly type: string; readonly payload: unknown }): event is BattleCompletedEvent {
  return event.type === BATTLE_COMPLETED_EVENT && validPayload(event.payload)
}

function result(status: DispatchStartResult['status'], dispatchId: string, state: SectDispatchSnapshot, message: string, task?: DispatchTask): DispatchStartResult {
  return { status, dispatchId, state, message, ...(task ? { task } : {}) }
}

export class SectDispatchEngine {
  private state: SectDispatchSnapshot

  constructor(initialState: SectDispatchSnapshot = { battleTick: 0, tasks: [], processedBattleEventIds: [] }) {
    if (!Number.isInteger(initialState.battleTick) || initialState.battleTick < 0) throw new DispatchEngineError('battleTick 必须是非负整数。')
    if (initialState.tasks.length > MAX_DISPATCH_TEAMS) throw new DispatchEngineError(`派遣队伍不能超过 ${MAX_DISPATCH_TEAMS} 队。`)
    const occupied = new Set<string>()
    initialState.tasks.forEach((task) => {
      if (!task.dispatchId.trim() || task.discipleIds.length === 0 || new Set(task.discipleIds).size !== task.discipleIds.length) throw new DispatchEngineError('派遣快照包含无效队伍。')
      if (task.status !== 'claimed') task.discipleIds.forEach((discipleId) => {
        if (occupied.has(discipleId)) throw new DispatchEngineError(`门人「${discipleId}」在多个派遣队伍中。`)
        occupied.add(discipleId)
      })
      if (!validRng(task.rng)) throw new DispatchEngineError(`派遣「${task.dispatchId}」的 RNG 快照无效。`)
    })
    this.state = cloneSnapshot(initialState)
  }

  getState(): SectDispatchSnapshot {
    return cloneSnapshot(this.state)
  }

  snapshot(): SectDispatchSnapshot {
    return this.getState()
  }

  start(request: DispatchStartRequest): DispatchStartResult {
    if (!request.dispatchId.trim() || request.discipleIds.length === 0 || new Set(request.discipleIds).size !== request.discipleIds.length || !Number.isInteger(request.baseDurationTicks) || request.baseDurationTicks <= 0 || !validRng(request.rng)) {
      return result('invalid_request', request.dispatchId, this.getState(), '派遣创建参数无效。')
    }
    if (this.state.tasks.some((task) => task.dispatchId === request.dispatchId)) return result('duplicate_id', request.dispatchId, this.getState(), '该派遣任务已经创建。')
    if (this.state.tasks.filter((task) => task.status !== 'claimed').length >= MAX_DISPATCH_TEAMS) return result('team_limit', request.dispatchId, this.getState(), `同时最多派遣 ${MAX_DISPATCH_TEAMS} 队。`)
    const occupied = new Set(this.state.tasks.filter((task) => task.status !== 'claimed').flatMap((task) => task.discipleIds))
    if (request.discipleIds.some((discipleId) => occupied.has(discipleId))) return result('disciple_occupied', request.dispatchId, this.getState(), '有门人正在其他派遣队伍中。')
    const modifiers = normalizeModifiers(request.modifiers)
    if (!modifiers) return result('invalid_request', request.dispatchId, this.getState(), '派遣性格修正超出安全范围。')
    const expectedTicks = Math.max(1, request.baseDurationTicks + (modifiers.durationTicksDelta ?? 0))
    const fork = new DeterministicRng(request.rng.seed, request.rng.state).fork(`sect-dispatch:${request.dispatchId}`)
    const task: DispatchTask = {
      dispatchId: request.dispatchId,
      discipleIds: [...request.discipleIds],
      expectedTicks,
      remainingTicks: expectedTicks,
      createdAtBattleTick: this.state.battleTick,
      rng: fork.snapshot(),
      modifiers,
      status: 'active',
    }
    this.state = { ...this.state, tasks: [...this.state.tasks, task] }
    return result('started', request.dispatchId, this.getState(), `派遣已创建，预计需要 ${expectedTicks} 场有效战斗。`, task)
  }

  advance(event: BattleCompletedEvent): DispatchAdvanceResult {
    if (!isEligibleBattleCompletedEvent(event)) return { status: 'ignored_event', state: this.getState(), advancedTaskIds: [], message: '该事件不是可计入派遣的有效战斗完成。' }
    if (this.state.processedBattleEventIds.includes(event.id)) return { status: 'duplicate_event', state: this.getState(), advancedTaskIds: [], message: '该战斗完成事件已经计入过。' }
    const advancedTaskIds: string[] = []
    const tasks = this.state.tasks.map((task) => {
      if (task.status !== 'active') return task
      const remainingTicks = task.remainingTicks - 1
      if (remainingTicks <= 0) {
        advancedTaskIds.push(task.dispatchId)
        return { ...task, remainingTicks: 0, status: 'ready' as const }
      }
      return { ...task, remainingTicks }
    })
    this.state = {
      battleTick: this.state.battleTick + 1,
      tasks,
      processedBattleEventIds: [...this.state.processedBattleEventIds, event.id],
    }
    return { status: 'advanced', state: this.getState(), advancedTaskIds, message: advancedTaskIds.length ? `战斗场次 +1，${advancedTaskIds.join('、')} 已完成。` : '战斗场次 +1。' }
  }

  claim(dispatchId: string): DispatchClaimResult {
    const task = this.state.tasks.find((candidate) => candidate.dispatchId === dispatchId)
    if (!task) return { status: 'unknown_dispatch', dispatchId, state: this.getState(), message: '找不到派遣任务。' }
    if (task.status === 'claimed') return { status: 'already_claimed', dispatchId, state: this.getState(), claim: task.claim, message: '该派遣结果已经领取过。' }
    if (task.status !== 'ready') return { status: 'not_ready', dispatchId, state: this.getState(), message: '派遣尚未完成。' }
    const rng = DeterministicRng.fromSnapshot(task.rng)
    const qualityScore = Math.max(0, Math.min(100, Math.round(rng.nextFloat() * 100) + (task.modifiers.qualityDelta ?? 0) * 5))
    const claim: DispatchClaim = { dispatchId, qualityScore, resultSeed: rng.state }
    this.state = { ...this.state, tasks: this.state.tasks.map((candidate) => candidate.dispatchId === dispatchId ? { ...candidate, status: 'claimed' as const, claim } : candidate) }
    return { status: 'claimed', dispatchId, state: this.getState(), claim, message: '派遣结果已领取。' }
  }

  subscribe(eventBus: EventBus): EventSubscription {
    return eventBus.subscribe(BATTLE_COMPLETED_EVENT, (event) => {
      this.advance(event as BattleCompletedEvent)
    })
  }
}

export function createDispatchEngine(initialState?: SectDispatchSnapshot): SectDispatchEngine {
  return new SectDispatchEngine(initialState)
}

export function startDispatch(engine: SectDispatchEngine, request: DispatchStartRequest): DispatchStartResult {
  return engine.start(request)
}

export function advanceDispatch(engine: SectDispatchEngine, event: BattleCompletedEvent): DispatchAdvanceResult {
  return engine.advance(event)
}

export function claimDispatch(engine: SectDispatchEngine, dispatchId: string): DispatchClaimResult {
  return engine.claim(dispatchId)
}

export function serializeDispatchSnapshot(snapshot: SectDispatchSnapshot): string {
  return JSON.stringify(snapshot)
}

export function parseDispatchSnapshot(input: string): SectDispatchSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new DispatchEngineError('派遣快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new DispatchEngineError('派遣快照必须是对象。')
  const value = parsed as Partial<SectDispatchSnapshot>
  if (!Number.isInteger(value.battleTick) || (value.battleTick ?? -1) < 0 || !Array.isArray(value.tasks) || !Array.isArray(value.processedBattleEventIds)) throw new DispatchEngineError('派遣快照缺少必要字段。')
  return value as SectDispatchSnapshot
}

export function restoreDispatchSnapshot(snapshot: SectDispatchSnapshot): SectDispatchEngine {
  return createDispatchEngine(snapshot)
}
