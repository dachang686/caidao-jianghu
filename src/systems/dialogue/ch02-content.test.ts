import { describe, expect, it } from 'vitest'
import { CH02_DIALOGUE_GRAPH } from '../../content/dialogues/ch02'
import { asChoiceId } from '../../types/ids'
import { DialogueEngine, validateDialogueGraph } from './engine'

describe('C312 清河县对白图', () => {
  it('至少覆盖三名状态 NPC，迷惑分支两步内回到主线', () => {
    const validation = validateDialogueGraph(CH02_DIALOGUE_GRAPH)
    expect(validation.valid).toBe(true)
    const speakerIds = new Set(CH02_DIALOGUE_GRAPH.nodes.map((node) => String(node.speakerNpcId)))
    expect(speakerIds).toEqual(new Set(['qinghe-registrar', 'qinghe-boatwoman', 'qinghe-tea-keeper', 'qinghe-bangsi']))
    expect(CH02_DIALOGUE_GRAPH.maxConfusingHops).toBe(2)
    expect(CH02_DIALOGUE_GRAPH.nodes.flatMap((node) => node.choices).filter((choice) => choice.branch === 'confusing')).toHaveLength(6)
  })

  it('不可逆交证选项必须二次确认，确认后只写入可诊断 flag', () => {
    const engine = new DialogueEngine(CH02_DIALOGUE_GRAPH)
    engine.choose(asChoiceId('choice:ch02:hub-registrar'))
    engine.choose(asChoiceId('choice:ch02:registrar-clue'))
    const notice = engine.choose(asChoiceId('choice:ch02:registrar-notice-bangsi'))
    expect(notice.status).toBe('requires_confirmation')
    const confirmed = engine.choose(asChoiceId('choice:ch02:registrar-notice-bangsi'), { confirm: true, actionId: 'ch02:notice-confirmed' })
    expect(confirmed.status).toBe('advanced')
    expect(confirmed.effectResult?.state.flags).toMatchObject({ ch02_bangsi_notice: true })
  })
})
