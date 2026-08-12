import type {
  PresentationCueDefinition,
  PresentationCuePhase,
  PresentationCueSnapshot,
  PresentationCueStatus,
} from '../../types/comedy'

const MAX_BLOCKING_MS = 1200
const STEP_TYPES = new Set(['anticipation', 'action', 'pause', 'reaction'])

export interface PresentationCueValidationIssue {
  readonly code: 'duplicate_id' | 'invalid_value' | 'step_order' | 'duration_limit'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface PresentationCueValidationResult {
  readonly valid: boolean
  readonly issues: readonly PresentationCueValidationIssue[]
}

export interface PresentationCuePlayRequest {
  readonly definition: PresentationCueDefinition
  readonly actionId: string
  readonly cueId?: string
  readonly isRepeat?: boolean
  readonly reducedMotion?: boolean
  readonly muted?: boolean
}

export type PresentationCuePlayStatus = 'started' | 'short' | 'static'

export interface PresentationCuePlayResult {
  readonly status: PresentationCuePlayStatus
  readonly snapshot: PresentationCueSnapshot
}

export type PresentationCueListener = (snapshot: PresentationCueSnapshot) => void

export class PresentationCueRuntimeError extends Error {
  readonly issues?: readonly PresentationCueValidationIssue[]

  constructor(message: string, issues?: readonly PresentationCueValidationIssue[]) {
    super(message)
    this.name = 'PresentationCueRuntimeError'
    this.issues = issues
  }
}

function issue(
  code: PresentationCueValidationIssue['code'],
  path: string,
  message: string,
  id?: string,
): PresentationCueValidationIssue {
  return { code, path, message, ...(id ? { id } : {}) }
}

function requireText(value: unknown, path: string, issues: PresentationCueValidationIssue[], id: string): void {
  if (typeof value !== 'string' || !value.trim()) issues.push(issue('invalid_value', path, '值不能为空', id))
}

export function validatePresentationCueDefinitions(definitions: readonly PresentationCueDefinition[]): PresentationCueValidationResult {
  const issues: PresentationCueValidationIssue[] = []
  const seen = new Set<string>()
  definitions.forEach((definition, definitionIndex) => {
    const path = `cues[${definitionIndex}]`
    if (seen.has(definition.id)) issues.push(issue('duplicate_id', `${path}.id`, `重复演出 cue ID「${definition.id}」`, definition.id))
    seen.add(definition.id)
    requireText(definition.id, `${path}.id`, issues, definition.id)
    requireText(definition.shortCueId, `${path}.shortCueId`, issues, definition.id)
    requireText(definition.reducedMotionCueId, `${path}.reducedMotionCueId`, issues, definition.id)
    if (!Array.isArray(definition.steps) || definition.steps.length === 0) {
      issues.push(issue('invalid_value', `${path}.steps`, '演出 cue 至少需要一个阶段', definition.id))
      return
    }
    let totalDuration = 0
    let previousOrder = -1
    definition.steps.forEach((step, stepIndex) => {
      const stepPath = `${path}.steps[${stepIndex}]`
      const order = ['anticipation', 'action', 'pause', 'reaction'].indexOf(step.type)
      if (!STEP_TYPES.has(step.type)) issues.push(issue('invalid_value', `${stepPath}.type`, `未知演出阶段「${String(step.type)}」`, definition.id))
      if (order < previousOrder) issues.push(issue('step_order', `${stepPath}.type`, '演出阶段必须按铺垫、动作、停顿、反应顺序排列', definition.id))
      previousOrder = Math.max(previousOrder, order)
      if (!Number.isInteger(step.durationMs) || step.durationMs < 0) {
        issues.push(issue('invalid_value', `${stepPath}.durationMs`, '阶段时长必须是非负整数', definition.id))
      } else {
        totalDuration += step.durationMs
      }
    })
    if (totalDuration > MAX_BLOCKING_MS) {
      issues.push(issue('duration_limit', `${path}.steps`, `单次演出阻塞时长不能超过 ${MAX_BLOCKING_MS}ms`, definition.id))
    }
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidPresentationCueDefinitions(definitions: readonly PresentationCueDefinition[]): void {
  const result = validatePresentationCueDefinitions(definitions)
  if (!result.valid) throw new PresentationCueRuntimeError('演出 cue 定义校验失败。', result.issues)
}

const EMPTY_SNAPSHOT: PresentationCueSnapshot = {
  status: 'idle',
  phase: 'idle',
  stepIndex: -1,
  cueId: null,
  actionId: null,
  isRepeat: false,
  reducedMotion: false,
  muted: false,
}

function cloneSnapshot(snapshot: PresentationCueSnapshot): PresentationCueSnapshot {
  return { ...snapshot }
}

function phaseForStep(type: PresentationCueDefinition['steps'][number]['type']): PresentationCuePhase {
  return type
}

export class PresentationCueRuntime {
  private readonly definitions: ReadonlyMap<string, PresentationCueDefinition>
  private readonly listeners = new Set<PresentationCueListener>()
  private readonly majorActionIds = new Set<string>()
  private snapshotState: PresentationCueSnapshot = EMPTY_SNAPSHOT
  private activeRequest: PresentationCuePlayRequest | null = null
  private timer: ReturnType<typeof globalThis.setTimeout> | null = null
  private disposed = false

  constructor(definitions: readonly PresentationCueDefinition[]) {
    assertValidPresentationCueDefinitions(definitions)
    this.definitions = new Map(definitions.map((definition) => [definition.id, definition]))
  }

  getSnapshot(): PresentationCueSnapshot {
    return cloneSnapshot(this.snapshotState)
  }

  snapshot(): PresentationCueSnapshot {
    return this.getSnapshot()
  }

  subscribe(listener: PresentationCueListener): () => void {
    if (this.disposed) return () => undefined
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  play(request: PresentationCuePlayRequest): PresentationCuePlayResult {
    this.ensureActive()
    if (!request.actionId.trim()) throw new PresentationCueRuntimeError('演出 actionId 不能为空。')
    const definition = this.definitions.get(request.definition.id)
    if (!definition) throw new PresentationCueRuntimeError(`演出 cue 未注册「${request.definition.id}」。`)

    const duplicateAction = this.majorActionIds.has(request.actionId)
    if (this.snapshotState.status === 'running') this.cancel()

    if (duplicateAction || request.isRepeat === true) {
      return this.showStatic('short', definition.shortCueId, request, true)
    }

    this.majorActionIds.add(request.actionId)
    if (request.reducedMotion === true || request.muted === true) {
      return this.showStatic('static', definition.reducedMotionCueId, request, false)
    }

    this.activeRequest = { ...request, definition }
    const firstStep = definition.steps[0]!
    this.snapshotState = {
      status: 'running',
      phase: phaseForStep(firstStep.type),
      stepIndex: 0,
      cueId: request.cueId ?? definition.id,
      actionId: request.actionId,
      isRepeat: false,
      reducedMotion: false,
      muted: false,
    }
    this.emit()
    this.scheduleNext(firstStep.durationMs)
    return { status: 'started', snapshot: this.getSnapshot() }
  }

  skip(): PresentationCueSnapshot {
    if (this.snapshotState.status !== 'running') return this.getSnapshot()
    this.clearTimer()
    this.activeRequest = null
    this.snapshotState = { ...this.snapshotState, status: 'skipped' }
    this.emit()
    return this.getSnapshot()
  }

  cancel(): PresentationCueSnapshot {
    this.clearTimer()
    this.activeRequest = null
    if (this.snapshotState.status === 'running') {
      this.snapshotState = { ...this.snapshotState, status: 'cancelled' }
      this.emit()
    }
    return this.getSnapshot()
  }

  reset(): PresentationCueSnapshot {
    this.cancel()
    this.majorActionIds.clear()
    this.snapshotState = EMPTY_SNAPSHOT
    this.emit()
    return this.getSnapshot()
  }

  dispose(): void {
    if (this.disposed) return
    this.clearTimer()
    this.activeRequest = null
    this.disposed = true
    this.listeners.clear()
  }

  private showStatic(status: 'short' | 'static', cueId: string, request: PresentationCuePlayRequest, isRepeat: boolean): PresentationCuePlayResult {
    this.clearTimer()
    this.activeRequest = null
    this.snapshotState = {
      status,
      phase: status,
      stepIndex: -1,
      cueId,
      actionId: request.actionId,
      isRepeat,
      reducedMotion: request.reducedMotion === true,
      muted: request.muted === true,
    }
    this.emit()
    return { status, snapshot: this.getSnapshot() }
  }

  private scheduleNext(durationMs: number): void {
    this.clearTimer()
    this.timer = globalThis.setTimeout(() => {
      this.timer = null
      this.advance()
    }, durationMs)
  }

  private advance(): void {
    const request = this.activeRequest
    if (!request || this.snapshotState.status !== 'running') return
    const nextIndex = this.snapshotState.stepIndex + 1
    const nextStep = request.definition.steps[nextIndex]
    if (!nextStep) {
      this.activeRequest = null
      this.snapshotState = { ...this.snapshotState, status: 'completed', phase: 'reaction' }
      this.emit()
      return
    }
    this.snapshotState = { ...this.snapshotState, stepIndex: nextIndex, phase: phaseForStep(nextStep.type) }
    this.emit()
    this.scheduleNext(nextStep.durationMs)
  }

  private clearTimer(): void {
    if (this.timer === null) return
    globalThis.clearTimeout(this.timer)
    this.timer = null
  }

  private emit(): void {
    const snapshot = this.getSnapshot()
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private ensureActive(): void {
    if (this.disposed) throw new PresentationCueRuntimeError('演出 cue runtime 已释放。')
  }
}

export function createPresentationCueRuntime(definitions: readonly PresentationCueDefinition[]): PresentationCueRuntime {
  return new PresentationCueRuntime(definitions)
}

