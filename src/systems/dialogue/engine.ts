import type { ConditionContext } from '../../types/conditions'
import type { DomainEvent } from '../../types/events'
import type { EffectCatalog, EffectState } from '../../types/effects'
import { createEffectState } from '../../types/effects'
import type {
  DialogueActionResult,
  DialogueChoice,
  DialogueChoiceView,
  DialogueEngineOptions,
  DialogueGraph,
  DialogueNode,
  DialoguePlaybackMode,
  DialogueSnapshot,
  DialogueValidationIssue,
  DialogueValidationResult,
  DialogueView,
} from '../../types/dialogue'
import type { DialogueCopyPatch } from '../../types/text-provider'
import type { ChoiceId, DialogueId } from '../../types/ids'
import { evaluateCondition } from '../conditions/evaluate'
import { executeEffects } from '../effects/execute'

const DEFAULT_MAX_CONFUSING_HOPS = 2
const EMPTY_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

export class DialogueEngineError extends Error {
  readonly issues?: readonly DialogueValidationIssue[]

  constructor(message: string, issues?: readonly DialogueValidationIssue[]) {
    super(message)
    this.name = 'DialogueEngineError'
    this.issues = issues
  }
}

export class DialogueSnapshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DialogueSnapshotError'
  }
}

function optionId(choice: DialogueChoice): ChoiceId {
  return choice.optionId ?? choice.id
}

function nodeMap(graph: DialogueGraph): ReadonlyMap<DialogueId, DialogueNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]))
}

export function validateDialogueGraph(graph: DialogueGraph): DialogueValidationResult {
  const issues: DialogueValidationIssue[] = []
  const nodes = new Map<DialogueId, DialogueNode>()
  graph.nodes.forEach((node, nodeIndex) => {
    if (nodes.has(node.id)) issues.push({ code: 'duplicate_id', path: `nodes[${nodeIndex}].id`, message: `重复对白节点 ID「${node.id}」` })
    nodes.set(node.id, node)
    const options = new Set<string>()
    node.choices.forEach((choice, choiceIndex) => {
      const stableId = String(optionId(choice))
      if (options.has(stableId)) issues.push({ code: 'duplicate_id', path: `nodes[${nodeIndex}].choices[${choiceIndex}].optionId`, message: `重复选项 ID「${stableId}」` })
      options.add(stableId)
      if (choice.nextNodeId && !graph.nodes.some((candidate) => candidate.id === choice.nextNodeId)) {
        issues.push({ code: 'missing_reference', path: `nodes[${nodeIndex}].choices[${choiceIndex}].nextNodeId`, message: `找不到对白节点「${choice.nextNodeId}」` })
      }
      if (choice.returnToNodeId && !graph.nodes.some((candidate) => candidate.id === choice.returnToNodeId)) {
        issues.push({ code: 'missing_reference', path: `nodes[${nodeIndex}].choices[${choiceIndex}].returnToNodeId`, message: `找不到返回节点「${choice.returnToNodeId}」` })
      }
      if (choice.irreversible && !choice.requiresConfirmation) {
        issues.push({ code: 'irreversible_without_confirmation', path: `nodes[${nodeIndex}].choices[${choiceIndex}]`, message: '不可逆选项必须配置二次确认。' })
      }
      if (choice.branch === 'confusing' && !choice.returnToNodeId) {
        issues.push({ code: 'confusing_branch_overflow', path: `nodes[${nodeIndex}].choices[${choiceIndex}]`, message: '迷惑分支必须声明回归主线节点。' })
      }
    })
    if (node.choices.length > 0 && node.choices.every((choice) => (choice.conditions?.length ?? 0) > 0)) {
      issues.push({ code: 'all_choices_locked', path: `nodes[${nodeIndex}].choices`, message: '节点所有可见选项都有条件锁，无法保证推进。' })
    }
    if (choiceHasConfusingBranchOutsideMainline(node, graph)) {
      issues.push({ code: 'confusing_branch_overflow', path: `nodes[${nodeIndex}].choices`, message: '迷惑分支必须回到主线节点。' })
    }
  })
  if (!nodes.has(graph.startNodeId)) issues.push({ code: 'missing_reference', path: 'startNodeId', message: `起始节点不存在「${graph.startNodeId}」` })
  graph.mainlineNodeIds?.forEach((nodeId, index) => {
    if (!nodes.has(nodeId)) issues.push({ code: 'missing_reference', path: `mainlineNodeIds[${index}]`, message: `找不到主线对白节点「${nodeId}」` })
  })
  if (graph.maxConfusingHops !== undefined && (!Number.isInteger(graph.maxConfusingHops) || graph.maxConfusingHops < 1 || graph.maxConfusingHops > DEFAULT_MAX_CONFUSING_HOPS)) {
    issues.push({ code: 'confusing_branch_overflow', path: 'maxConfusingHops', message: '迷惑分支最多允许两个节点后回归主线。' })
  }
  return { valid: issues.length === 0, issues }
}

function choiceHasConfusingBranchOutsideMainline(node: DialogueNode, graph: DialogueGraph): boolean {
  if (!graph.mainlineNodeIds) return false
  const mainline = new Set(graph.mainlineNodeIds)
  return node.choices.some((choice) => choice.branch === 'confusing' && choice.returnToNodeId !== undefined && !mainline.has(choice.returnToNodeId))
}

export function assertValidDialogueGraph(graph: DialogueGraph): void {
  const result = validateDialogueGraph(graph)
  if (!result.valid) throw new DialogueEngineError('对白图校验失败。', result.issues)
}

function currentContext(options: DialogueEngineOptions): ConditionContext {
  return typeof options.conditionContext === 'function' ? options.conditionContext() : options.conditionContext ?? EMPTY_CONTEXT
}

function choiceEnabled(choice: DialogueChoice, options: DialogueEngineOptions): boolean {
  try {
    return (choice.conditions ?? []).every((condition) => evaluateCondition(condition, currentContext(options)))
  } catch {
    return false
  }
}

function cloneSnapshot(snapshot: DialogueSnapshot): DialogueSnapshot {
  return {
    graphId: snapshot.graphId,
    currentNodeId: snapshot.currentNodeId,
    returnPath: [...snapshot.returnPath],
    readNodeIds: [...snapshot.readNodeIds],
    readOptionIds: [...snapshot.readOptionIds],
    executedActionIds: [...snapshot.executedActionIds],
    confusingHops: snapshot.confusingHops,
    mode: snapshot.mode,
    auto: snapshot.auto,
  }
}

function initialSnapshot(graph: DialogueGraph, snapshot?: Partial<DialogueSnapshot>): DialogueSnapshot {
  const sameGraph = snapshot?.graphId === graph.id
  const confusingHops = sameGraph && Number.isInteger(snapshot?.confusingHops) && (snapshot?.confusingHops ?? -1) >= 0
    ? snapshot?.confusingHops ?? 0
    : 0
  return {
    graphId: graph.id,
    currentNodeId: sameGraph ? (snapshot.currentNodeId === undefined ? graph.startNodeId : snapshot.currentNodeId) : graph.startNodeId,
    returnPath: sameGraph ? [...(snapshot.returnPath ?? [])] : [],
    readNodeIds: sameGraph ? [...(snapshot.readNodeIds ?? [])] : [],
    readOptionIds: sameGraph ? [...(snapshot.readOptionIds ?? [])] : [],
    executedActionIds: sameGraph ? [...(snapshot.executedActionIds ?? [])] : [],
    confusingHops,
    mode: sameGraph && snapshot.mode === 'instant' ? 'instant' : 'typewriter',
    auto: sameGraph ? snapshot.auto === true : false,
  }
}

export class DialogueEngine {
  private readonly graph: DialogueGraph
  private readonly nodes: ReadonlyMap<DialogueId, DialogueNode>
  private readonly options: DialogueEngineOptions
  private state: DialogueSnapshot
  private effectState: EffectState

  constructor(graph: DialogueGraph, snapshot?: Partial<DialogueSnapshot>, options: DialogueEngineOptions = {}) {
    const validation = validateDialogueGraph(graph)
    const blockingIssues = validation.issues.filter((issue) => issue.code !== 'all_choices_locked')
    if (blockingIssues.length > 0) throw new DialogueEngineError('对白图校验失败。', blockingIssues)
    this.graph = graph
    this.nodes = nodeMap(graph)
    this.options = options
    this.state = initialSnapshot(graph, snapshot)
    this.effectState = options.effectState ?? createEffectState()
  }

  getState(): DialogueSnapshot {
    return cloneSnapshot(this.state)
  }

  getEffectState(): EffectState {
    return this.effectState
  }

  getCurrentNode(): DialogueNode | null {
    return this.state.currentNodeId ? this.nodes.get(this.state.currentNodeId) ?? null : null
  }

  getView(): DialogueView {
    const node = this.getCurrentNode()
    if (!node) return { node: null, choices: [], status: 'completed' }
    const choices: DialogueChoiceView[] = node.choices.map((choice) => {
      const enabled = choiceEnabled(choice, this.options)
      return {
        choice,
        optionId: optionId(choice),
        enabled,
        ...(enabled ? {} : { reason: '条件尚未满足。' }),
        requiresConfirmation: choice.requiresConfirmation === true || choice.irreversible === true,
      }
    })
    const allLocked = choices.length > 0 && choices.every((choice) => !choice.enabled)
    return allLocked
      ? { node, choices, status: 'diagnostic', diagnostic: '当前没有可用选项；请检查任务条件或返回上一节点。' }
      : { node, choices, status: 'active' }
  }

  setPlaybackMode(mode: DialoguePlaybackMode): DialogueSnapshot {
    this.state = { ...this.state, mode }
    return this.getState()
  }

  setAuto(auto: boolean): DialogueSnapshot {
    this.state = { ...this.state, auto }
    return this.getState()
  }

  markCurrentNodeRead(): DialogueSnapshot {
    const nodeId = this.state.currentNodeId
    if (!nodeId || this.state.readNodeIds.includes(nodeId)) return this.getState()
    this.state = { ...this.state, readNodeIds: [...this.state.readNodeIds, nodeId] }
    return this.getState()
  }

  advanceText(): DialogueSnapshot {
    const node = this.getCurrentNode()
    if (!node) return this.getState()
    if (!this.state.readNodeIds.includes(node.id) && this.state.mode === 'typewriter') return this.markCurrentNodeRead()
    if (node.choices.length > 0) return this.getState()
    const target = node.returnToNodeId
    if (!target) {
      this.state = { ...this.state, currentNodeId: null }
      return this.getState()
    }
    this.state = { ...this.state, currentNodeId: target, confusingHops: 0, returnPath: this.state.returnPath.slice(0, -1) }
    return this.getState()
  }

  choose(choiceId: ChoiceId, options: { readonly actionId?: string; readonly confirm?: boolean } = {}): DialogueActionResult {
    if (options.actionId && this.state.executedActionIds.includes(options.actionId)) {
      return this.actionResult('duplicate_action', [], '该选项已经执行过。')
    }
    const view = this.getView()
    const selected = view.choices.find((choice) => choice.optionId === choiceId)
    if (!selected) return this.actionResult('unknown_choice', [], '当前节点没有该选项。')
    if (!selected.enabled) return this.actionResult('blocked', [], selected.reason ?? '该选项当前不可用。')
    if (selected.requiresConfirmation && options.confirm !== true) return this.actionResult('requires_confirmation', [], '这是不可逆选择，请再次确认。')
    const actionId = options.actionId ?? `${this.state.currentNodeId}:${selected.optionId}`
    if (this.state.executedActionIds.includes(actionId)) return this.actionResult('duplicate_action', [], '该选项已经执行过。')

    const effects = selected.choice.effects ?? []
    const effectResult = executeEffects(effects, this.effectState, {
      sourceActionId: actionId,
      occurredAtTick: this.state.readOptionIds.length,
      catalog: this.options.effectCatalog,
    })
    this.effectState = effectResult.state
    const current = view.node!
    const maxHops = this.options.maxConfusingHops ?? this.graph.maxConfusingHops ?? DEFAULT_MAX_CONFUSING_HOPS
    const confusingHops = selected.choice.branch === 'confusing' ? this.state.confusingHops + 1 : 0
    const overLimit = selected.choice.branch === 'confusing' && confusingHops > maxHops
    const target = overLimit ? selected.choice.returnToNodeId ?? null : selected.choice.nextNodeId ?? selected.choice.returnToNodeId ?? null
    const returningToMainline = selected.choice.returnToNodeId !== undefined && target === selected.choice.returnToNodeId
    const nextReturnPath = returningToMainline
      ? []
      : target && target !== selected.choice.returnToNodeId && target !== current.id
      ? [...this.state.returnPath, current.id]
      : this.state.returnPath
    const nextState: DialogueSnapshot = {
      ...this.state,
      currentNodeId: target,
      returnPath: nextReturnPath,
      readOptionIds: [...this.state.readOptionIds, selected.optionId],
      executedActionIds: [...this.state.executedActionIds, actionId],
      confusingHops: overLimit ? 0 : confusingHops,
    }
    this.state = nextState
    return {
      status: target ? 'advanced' : 'completed',
      state: this.getState(),
      view: this.getView(),
      effectResult,
      events: effectResult.events,
      message: target ? '对白已推进。' : '对白结束。',
    }
  }

  private actionResult(status: DialogueActionResult['status'], events: readonly DomainEvent[], message: string): DialogueActionResult {
    return { status, state: this.getState(), view: this.getView(), events, message }
  }
}

export function createDialogueEngine(graph: DialogueGraph, snapshot?: Partial<DialogueSnapshot>, options: DialogueEngineOptions = {}): DialogueEngine {
  return new DialogueEngine(graph, snapshot, options)
}

export function applyDialogueCopyPatches(view: DialogueView, patches: readonly DialogueCopyPatch[]): DialogueView {
  const labels = new Map(patches.map((patch) => [patch.optionId, patch.label]))
  return {
    ...view,
    choices: view.choices.map((choice) => ({ ...choice, choice: { ...choice.choice, label: labels.get(choice.optionId) ?? choice.choice.label } })),
  }
}

export function serializeDialogueSnapshot(snapshot: DialogueSnapshot): string {
  try {
    const text = JSON.stringify(snapshot)
    if (text === undefined) throw new DialogueSnapshotError('对白快照无法序列化。')
    return text
  } catch (error) {
    if (error instanceof DialogueSnapshotError) throw error
    throw new DialogueSnapshotError(`对白快照无法序列化：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export function parseDialogueSnapshot(input: string): DialogueSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    throw new DialogueSnapshotError('对白快照 JSON 无效。')
  }
  if (!parsed || typeof parsed !== 'object') throw new DialogueSnapshotError('对白快照必须是对象。')
  const value = parsed as Partial<DialogueSnapshot>
  if (typeof value.graphId !== 'string' || !Array.isArray(value.returnPath) || !Array.isArray(value.readNodeIds) || !Array.isArray(value.readOptionIds) || !Array.isArray(value.executedActionIds)) {
    throw new DialogueSnapshotError('对白快照缺少必要字段。')
  }
  return value as DialogueSnapshot
}

export function restoreDialogueSnapshot(graph: DialogueGraph, snapshot: DialogueSnapshot, options: DialogueEngineOptions = {}): DialogueEngine {
  return createDialogueEngine(graph, snapshot, options)
}
