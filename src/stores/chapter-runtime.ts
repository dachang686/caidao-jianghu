import { ch02GatheringItems, ch02GatheringNodes } from '../content/gathering/ch02'
import { ch03GatheringItems, ch03GatheringNodes } from '../content/gathering/ch03'
import { ch04GatheringItems, ch04GatheringNodes } from '../content/gathering/ch04'
import { ch05GatheringItems, ch05GatheringNodes } from '../content/gathering/ch05'
import { ch06GatheringItems, ch06GatheringNodes } from '../content/gathering/ch06'
import { ch07GatheringItems, ch07GatheringNodes } from '../content/gathering/ch07'
import { ch08GatheringItems, ch08GatheringNodes } from '../content/gathering/ch08'
import { ch02HotspotDefinitions } from '../content/hotspots/ch02'
import { ch03HotspotDefinitions } from '../content/hotspots/ch03'
import { ch04HotspotDefinitions } from '../content/hotspots/ch04'
import { ch05HotspotDefinitions } from '../content/hotspots/ch05'
import { ch06HotspotDefinitions } from '../content/hotspots/ch06'
import { ch07HotspotDefinitions } from '../content/hotspots/ch07'
import { ch08HotspotDefinitions } from '../content/hotspots/ch08'
import { CH02_DIALOGUE_GRAPH } from '../content/dialogues/ch02'
import { CH03_DIALOGUE_GRAPH } from '../content/dialogues/ch03'
import { CH04_DIALOGUE_GRAPH } from '../content/dialogues/ch04'
import { CH05_DIALOGUE_GRAPH } from '../content/dialogues/ch05'
import { CH06_DIALOGUE_GRAPH } from '../content/dialogues/ch06'
import { CH07_DIALOGUE_GRAPH } from '../content/dialogues/ch07'
import { CH08_DIALOGUE_GRAPH } from '../content/dialogues/ch08'
import { CH02_QUESTS } from '../content/quests/ch02'
import { CH03_QUESTS } from '../content/quests/ch03'
import { CH04_QUESTS } from '../content/quests/ch04'
import { CH05_QUESTS } from '../content/quests/ch05'
import { CH06_QUESTS } from '../content/quests/ch06'
import { CH07_QUESTS } from '../content/quests/ch07'
import { CH08_QUESTS } from '../content/quests/ch08'
import { createExplorationEngine } from '../systems/exploration'
import { createGatheringEngine } from '../systems/gathering'
import { createQuestEngine } from '../systems/quests'
import { createDialogueEngine } from '../systems/dialogue'
import { createEffectState } from '../types/effects'
import type { EffectState } from '../types/effects'
import type { ExplorationSnapshot } from '../types/hotspot'
import type { GatheringSnapshot } from '../types/gathering'
import type { InventoryState, ItemDefinition } from '../types/item'
import type { GatheringNodeId, HotspotId, NpcId } from '../types/ids'
import type { QuestDefinition, QuestSnapshot } from '../types/quest'
import type { DialogueGraph, DialogueSnapshot, DialogueView } from '../types/dialogue'
import type { ChoiceId } from '../types/ids'

export type RuntimeChapterId = 'ch02' | 'ch03' | 'ch04' | 'ch05' | 'ch06' | 'ch07' | 'ch08'

export interface ChapterRuntimeSnapshot {
  readonly quests: Partial<Record<RuntimeChapterId, QuestSnapshot>>
  readonly explorations: Partial<Record<RuntimeChapterId, ExplorationSnapshot>>
  readonly gatherings: Partial<Record<RuntimeChapterId, GatheringSnapshot>>
  readonly dialogues: Partial<Record<RuntimeChapterId, DialogueSnapshot>>
  readonly effects: EffectState
}

export interface ChapterRuntimeContext {
  readonly flags: Readonly<Record<string, boolean>>
  readonly inventory: InventoryState
}

export interface ChapterRuntimeResult {
  readonly runtime: ChapterRuntimeSnapshot
  readonly inventory: InventoryState
  readonly gainedExperience: number
  readonly completedQuestIds: readonly string[]
  readonly message: string
}

export interface ChapterDialogueResult {
  readonly runtime: ChapterRuntimeSnapshot
  readonly gainedExperience: number
  readonly view: DialogueView
  readonly status: 'advanced' | 'completed' | 'blocked' | 'requires_confirmation' | 'duplicate_action' | 'unknown_choice'
  readonly message: string
}

interface ChapterContent {
  readonly quests: readonly QuestDefinition[]
  readonly dialogue: DialogueGraph
  readonly hotspots: Parameters<typeof createExplorationEngine>[0]['definitions']
  readonly nodes: Parameters<typeof createGatheringEngine>[0]
  readonly items: readonly ItemDefinition[]
}

const CHAPTER_CONTENT: Readonly<Record<RuntimeChapterId, ChapterContent>> = {
  ch02: { quests: CH02_QUESTS, dialogue: CH02_DIALOGUE_GRAPH, hotspots: ch02HotspotDefinitions, nodes: ch02GatheringNodes, items: ch02GatheringItems },
  ch03: { quests: CH03_QUESTS, dialogue: CH03_DIALOGUE_GRAPH, hotspots: ch03HotspotDefinitions, nodes: ch03GatheringNodes, items: ch03GatheringItems },
  ch04: { quests: CH04_QUESTS, dialogue: CH04_DIALOGUE_GRAPH, hotspots: ch04HotspotDefinitions, nodes: ch04GatheringNodes, items: ch04GatheringItems },
  ch05: { quests: CH05_QUESTS, dialogue: CH05_DIALOGUE_GRAPH, hotspots: ch05HotspotDefinitions, nodes: ch05GatheringNodes, items: ch05GatheringItems },
  ch06: { quests: CH06_QUESTS, dialogue: CH06_DIALOGUE_GRAPH, hotspots: ch06HotspotDefinitions, nodes: ch06GatheringNodes, items: ch06GatheringItems },
  ch07: { quests: CH07_QUESTS, dialogue: CH07_DIALOGUE_GRAPH, hotspots: ch07HotspotDefinitions, nodes: ch07GatheringNodes, items: ch07GatheringItems },
  ch08: { quests: CH08_QUESTS, dialogue: CH08_DIALOGUE_GRAPH, hotspots: ch08HotspotDefinitions, nodes: ch08GatheringNodes, items: ch08GatheringItems },
}

export const CHAPTER_GATHERING_ITEMS: readonly ItemDefinition[] = Object.values(CHAPTER_CONTENT).flatMap((content) => content.items)

export function createChapterRuntimeSnapshot(): ChapterRuntimeSnapshot {
  return { quests: {}, explorations: {}, gatherings: {}, dialogues: {}, effects: createEffectState() }
}

export function isRuntimeChapterId(chapterId: string): chapterId is RuntimeChapterId {
  return Object.hasOwn(CHAPTER_CONTENT, chapterId)
}

function cloneEffects(effects: EffectState): EffectState {
  return createEffectState({
    inventory: { ...effects.inventory },
    experience: effects.experience,
    stats: { ...effects.stats },
    flags: { ...effects.flags },
    quests: { ...effects.quests },
    claimedGrantKeys: [...effects.claimedGrantKeys],
  })
}

function conditionContext(runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, snapshot: QuestSnapshot | undefined) {
  return {
    quests: Object.fromEntries((snapshot?.tasks ?? []).map((task) => [task.questId, task.status])),
    inventory: Object.fromEntries(context.inventory.stacks.map((stack) => [stack.itemId, stack.count])),
    stats: runtime.effects.stats,
    flags: { ...context.flags, ...runtime.effects.flags },
  }
}

function makeQuestEngine(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, snapshot = runtime.quests[chapterId]) {
  return createQuestEngine(CHAPTER_CONTENT[chapterId].quests, snapshot, {
    conditionContext: () => conditionContext(runtime, context, snapshot),
    effectState: runtime.effects,
  })
}

function makeDialogueEngine(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext) {
  return createDialogueEngine(CHAPTER_CONTENT[chapterId].dialogue, runtime.dialogues[chapterId], {
    conditionContext: () => conditionContext(runtime, context, runtime.quests[chapterId]),
    effectState: cloneEffects(runtime.effects),
  })
}

function activateAvailableSideQuests(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, snapshot: QuestSnapshot): QuestSnapshot {
  const engine = makeQuestEngine(chapterId, runtime, context, snapshot)
  engine.getState().tasks
    .filter((task) => task.status === 'available')
    .forEach((task) => engine.activate(task.questId))
  return engine.snapshot()
}

function deliverReadyQuests(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, initialSnapshot: QuestSnapshot): { runtime: ChapterRuntimeSnapshot; completedQuestIds: readonly string[] } {
  let nextRuntime = { ...runtime, effects: cloneEffects(runtime.effects), quests: { ...runtime.quests, [chapterId]: initialSnapshot } }
  const completedQuestIds: string[] = []
  let changed = true
  while (changed) {
    changed = false
    const currentSnapshot = nextRuntime.quests[chapterId] ?? initialSnapshot
    const snapshot = activateAvailableSideQuests(chapterId, nextRuntime, context, currentSnapshot)
    const engine = makeQuestEngine(chapterId, nextRuntime, context, snapshot)
    const ready = engine.getState().tasks.filter((task) => task.status === 'ready')
    if (ready.length === 0) {
      nextRuntime = { ...nextRuntime, quests: { ...nextRuntime.quests, [chapterId]: engine.snapshot() } }
      continue
    }
    ready.forEach((task) => {
      const result = engine.deliver(task.questId, { effectState: nextRuntime.effects })
      if (result.status === 'delivered') {
        completedQuestIds.push(String(task.questId))
        nextRuntime = { ...nextRuntime, effects: result.effectResult!.state }
      }
    })
    nextRuntime = { ...nextRuntime, quests: { ...nextRuntime.quests, [chapterId]: engine.snapshot() } }
    changed = true
  }
  return { runtime: nextRuntime, completedQuestIds }
}

function applyEvent(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, event: Parameters<ReturnType<typeof makeQuestEngine>['applyEvent']>[0]): ChapterRuntimeResult {
  const beforeExperience = runtime.effects.experience
  let nextRuntime = { ...runtime, effects: cloneEffects(runtime.effects), quests: { ...runtime.quests } }
  const initialized = activateAvailableSideQuests(chapterId, nextRuntime, context, nextRuntime.quests[chapterId] ?? makeQuestEngine(chapterId, nextRuntime, context).snapshot())
  const engine = makeQuestEngine(chapterId, nextRuntime, context, initialized)
  engine.applyEvent(event)
  nextRuntime = { ...nextRuntime, quests: { ...nextRuntime.quests, [chapterId]: engine.snapshot() } }
  const delivered = deliverReadyQuests(chapterId, nextRuntime, context, engine.snapshot())
  nextRuntime = delivered.runtime
  const completed = delivered.completedQuestIds
  return {
    runtime: nextRuntime,
    inventory: context.inventory,
    gainedExperience: nextRuntime.effects.experience - beforeExperience,
    completedQuestIds: completed,
    message: completed.length > 0 ? `完成任务：${completed.map((id) => CHAPTER_CONTENT[chapterId].quests.find((quest) => String(quest.id) === id)?.title ?? id).join('、')}` : '线索已记录，继续核对下一项。',
  }
}

export function interactWithChapterNpc(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, npcId: NpcId): ChapterRuntimeResult {
  const snapshot = runtime.quests[chapterId]
  const actionIndex = (snapshot?.processedEventIds.length ?? 0) + 1
  return applyEvent(chapterId, runtime, context, {
    id: `chapter:${chapterId}:npc:${npcId}:${actionIndex}`,
    type: 'npc.interaction',
    occurredAtTick: 0,
    payload: { npcId, kind: 'help' },
    sourceActionId: `chapter:${chapterId}:npc:${npcId}:${actionIndex}`,
  })
}

export function activateChapterHotspot(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, hotspotId: HotspotId): ChapterRuntimeResult {
  const content = CHAPTER_CONTENT[chapterId]
  const exploration = createExplorationEngine({ definitions: content.hotspots, state: runtime.explorations[chapterId] })
  const activated = exploration.activate(hotspotId, { conditionContext: conditionContext(runtime, context, runtime.quests[chapterId]) })
  const nextRuntime = { ...runtime, explorations: { ...runtime.explorations, [chapterId]: exploration.getSnapshot() } }
  if (activated.status !== 'activated' || activated.events.length === 0) {
    return { runtime: nextRuntime, inventory: context.inventory, gainedExperience: 0, completedQuestIds: [], message: activated.view.lockedReason ?? '这个地点暂时没有新的线索。' }
  }
  return applyEvent(chapterId, nextRuntime, context, activated.events[0])
}

export function collectChapterNode(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, nodeId: GatheringNodeId): ChapterRuntimeResult {
  const content = CHAPTER_CONTENT[chapterId]
  const node = content.nodes.find((candidate) => candidate.id === nodeId)
  if (!node) return { runtime, inventory: context.inventory, gainedExperience: 0, completedQuestIds: [], message: '这个采集点不属于当前章节。' }
  const gathering = createGatheringEngine(content.nodes, { items: content.items }, runtime.gatherings[chapterId])
  const collected = gathering.collect({
    nodeId,
    locationId: node.locationId,
    chapter: Number(chapterId.slice(2)),
    inventory: context.inventory,
    conditionContext: conditionContext(runtime, context, runtime.quests[chapterId]),
  })
  const nextRuntime = { ...runtime, gatherings: { ...runtime.gatherings, [chapterId]: gathering.snapshot() } }
  if (collected.status !== 'collected' || collected.events.length === 0) {
    return { runtime: nextRuntime, inventory: collected.inventory, gainedExperience: 0, completedQuestIds: [], message: collected.message }
  }
  const progressed = applyEvent(chapterId, nextRuntime, { ...context, inventory: collected.inventory }, collected.events[0])
  return { ...progressed, inventory: collected.inventory }
}

export function getChapterDialogueView(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext): DialogueView {
  return makeDialogueEngine(chapterId, runtime, context).getView()
}

export function chooseChapterDialogue(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext, choiceId: string, confirmed = false): ChapterDialogueResult {
  const beforeExperience = runtime.effects.experience
  const engine = makeDialogueEngine(chapterId, runtime, context)
  const actionIndex = (runtime.dialogues[chapterId]?.executedActionIds.length ?? 0) + 1
  const result = engine.choose(choiceId as ChoiceId, {
    actionId: `chapter:${chapterId}:dialogue:${choiceId}:${actionIndex}`,
    confirm: confirmed,
  })
  const nextRuntime: ChapterRuntimeSnapshot = {
    ...runtime,
    dialogues: { ...runtime.dialogues, [chapterId]: result.state },
    effects: engine.getEffectState(),
  }
  return {
    runtime: nextRuntime,
    gainedExperience: nextRuntime.effects.experience - beforeExperience,
    view: result.view,
    status: result.status,
    message: result.message,
  }
}

export function chapterMainObjective(chapterId: RuntimeChapterId, runtime: ChapterRuntimeSnapshot, context: ChapterRuntimeContext): string | null {
  const engine = makeQuestEngine(chapterId, runtime, context)
  const task = engine.getState().tasks.find((candidate) => {
    const definition = CHAPTER_CONTENT[chapterId].quests.find((quest) => quest.id === candidate.questId)
    return definition?.kind === 'main' && (candidate.status === 'active' || candidate.status === 'ready')
  })
  if (!task) return null
  const definition = CHAPTER_CONTENT[chapterId].quests.find((quest) => quest.id === task.questId)
  return definition?.objective ?? null
}
