import { describe, expect, it } from 'vitest'
import { validateContent } from '../../validators/content/validate'
import { contentManifest } from '../../content/manifest'
import { loadChapterSync } from '../../content/sync-loader'
import { createEffectState } from '../../types/effects'
import { asChoiceId, asDialogueId, asItemId } from '../../types/ids'
import type { DialogueGraph } from '../../types/dialogue'
import {
  applyDialogueCopyPatches,
  createDialogueEngine,
  parseDialogueSnapshot,
  serializeDialogueSnapshot,
  validateDialogueGraph,
} from './engine'

const mainId = asDialogueId('dialogue:main')
const branchOneId = asDialogueId('dialogue:confusing-1')
const branchTwoId = asDialogueId('dialogue:confusing-2')
const endingId = asDialogueId('dialogue:ending')
const goId = asChoiceId('choice:go')
const confuseOneId = asChoiceId('choice:confuse-1')
const confuseTwoId = asChoiceId('choice:confuse-2')
const confuseThreeId = asChoiceId('choice:confuse-3')
const itemId = asItemId('item:token')

function makeGraph(): DialogueGraph {
  return {
    id: 'dialogue:test',
    startNodeId: mainId,
    mainlineNodeIds: [mainId, endingId],
    maxConfusingHops: 2,
    nodes: [
      {
        id: mainId,
        text: '主线',
        choices: [
          { id: goId, optionId: asChoiceId('option:go'), label: '前进', nextNodeId: endingId, semanticTag: 'main.advance' },
          { id: asChoiceId('choice:confuse-start'), label: '绕路', branch: 'confusing', nextNodeId: branchOneId, returnToNodeId: mainId },
        ],
      },
      {
        id: branchOneId,
        text: '迷惑分支一',
        choices: [{ id: confuseOneId, label: '继续绕路', branch: 'confusing', nextNodeId: branchTwoId, returnToNodeId: mainId }],
      },
      {
        id: branchTwoId,
        text: '迷惑分支二',
        choices: [{ id: confuseTwoId, label: '再绕一次', branch: 'confusing', nextNodeId: mainId, returnToNodeId: mainId }],
      },
      { id: endingId, text: '结束', choices: [] },
    ],
  }
}

describe('dialogue engine', () => {
  it('支持稳定 optionId、逐字/立即、已读状态和展示文案补丁', () => {
    const engine = createDialogueEngine(makeGraph())
    expect(engine.getView().choices[0]?.optionId).toBe(asChoiceId('option:go'))
    expect(engine.getState().mode).toBe('typewriter')
    engine.advanceText()
    expect(engine.getState().readNodeIds).toContain(mainId)
    engine.setPlaybackMode('instant')
    engine.setAuto(true)
    expect(engine.getState()).toMatchObject({ mode: 'instant', auto: true })
    const patched = applyDialogueCopyPatches(engine.getView(), [{ optionId: asChoiceId('option:go'), label: '出发' }])
    expect(patched.choices[0]?.choice.label).toBe('出发')
  })

  it('所有条件选项锁定时保留运行时诊断，而静态 validator 失败', () => {
    const lockedGraph: DialogueGraph = {
      id: 'dialogue:locked',
      startNodeId: mainId,
      nodes: [{
        id: mainId,
        text: '锁定',
        choices: [
          { id: asChoiceId('choice:locked-a'), label: '甲', conditions: [{ type: 'flag_equals', flag: 'a', value: true }] },
          { id: asChoiceId('choice:locked-b'), label: '乙', conditions: [{ type: 'flag_equals', flag: 'b', value: true }] },
        ],
      }],
    }
    const validation = validateDialogueGraph(lockedGraph)
    expect(validation.valid).toBe(false)
    expect(validation.issues.some((issue) => issue.code === 'all_choices_locked')).toBe(true)
    const engine = createDialogueEngine(lockedGraph, undefined, { conditionContext: { quests: {}, inventory: {}, stats: {}, flags: {} } })
    expect(engine.getView().status).toBe('diagnostic')
    expect(engine.getView().choices.every((choice) => !choice.enabled)).toBe(true)

    const chapter = loadChapterSync(contentManifest.chapters[0].id)
    const contentResult = validateContent(contentManifest, [{
      ...chapter,
      dialogues: lockedGraph.nodes,
    }])
    expect(contentResult.issues.some((issue) => issue.code === 'invalid_value' && issue.path.includes('dialogues'))).toBe(true)
  })

  it('迷惑分支最多两个节点后回到主线', () => {
    const engine = createDialogueEngine(makeGraph())
    engine.choose(asChoiceId('choice:confuse-start'), { actionId: 'dialogue:confuse:start' })
    engine.choose(confuseOneId, { actionId: 'dialogue:confuse:one' })
    const result = engine.choose(confuseTwoId, { actionId: 'dialogue:confuse:two' })
    expect(result.status).toBe('advanced')
    expect(result.state.currentNodeId).toBe(mainId)
    expect(result.state.confusingHops).toBe(0)
    expect(result.state.returnPath).toEqual([])
  })

  it('快速重复输入不会重复执行 Effect，且不可逆选择需要确认', () => {
    const graph: DialogueGraph = {
      id: 'dialogue:effect',
      startNodeId: mainId,
      nodes: [
        {
          id: mainId,
          text: '奖励',
          choices: [{ id: goId, optionId: asChoiceId('option:reward'), label: '领取', nextNodeId: endingId, effects: [{ type: 'give_item', itemId, count: 1, grantKey: 'dialogue:reward' }] }],
        },
        { id: endingId, text: '结束', choices: [] },
      ],
    }
    const engine = createDialogueEngine(graph, undefined, { effectState: createEffectState() })
    const first = engine.choose(asChoiceId('option:reward'), { actionId: 'dialogue:reward:1' })
    const duplicate = engine.choose(asChoiceId('option:reward'), { actionId: 'dialogue:reward:1' })
    expect(first.effectResult?.state.inventory[itemId]).toBe(1)
    expect(first.events).toHaveLength(1)
    expect(duplicate.status).toBe('duplicate_action')
    expect(engine.getEffectState().inventory[itemId]).toBe(1)

    const confirmGraph: DialogueGraph = {
      id: 'dialogue:confirm',
      startNodeId: mainId,
      nodes: [{
        id: mainId,
        text: '确认',
        choices: [{ id: goId, label: '销毁', irreversible: true, requiresConfirmation: true, effects: [{ type: 'set_flag', flag: 'irreversibleDone', value: true }] }],
      }],
    }
    const confirmEngine = createDialogueEngine(confirmGraph)
    expect(confirmEngine.choose(goId, { actionId: 'dialogue:confirm:1' }).status).toBe('requires_confirmation')
    expect(confirmEngine.choose(goId, { actionId: 'dialogue:confirm:1', confirm: true }).status).toBe('completed')
    expect(confirmEngine.getEffectState().flags.irreversibleDone).toBe(true)
  })

  it('快照可以 JSON 化并恢复播放状态', () => {
    const engine = createDialogueEngine(makeGraph())
    engine.setPlaybackMode('instant')
    engine.setAuto(true)
    engine.markCurrentNodeRead()
    const snapshot = parseDialogueSnapshot(serializeDialogueSnapshot(engine.getState()))
    const restored = createDialogueEngine(makeGraph(), snapshot)
    expect(restored.getState()).toEqual(snapshot)
  })
})
