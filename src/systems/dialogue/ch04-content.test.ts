import { describe, expect, it } from 'vitest'
import { CH04_DIALOGUE_GRAPH } from '../../content/dialogues/ch04'
import { asChoiceId } from '../../types/ids'
import { DialogueEngine, validateDialogueGraph } from './engine'

describe('C332 青云山对白图', () => {
  it('覆盖三个状态 NPC，迷惑分支最多两步回到可推进主线', () => {
    const validation = validateDialogueGraph(CH04_DIALOGUE_GRAPH)
    expect(validation.valid).toBe(true)
    const speakerIds = new Set(CH04_DIALOGUE_GRAPH.nodes.map((node) => String(node.speakerNpcId)))
    expect(speakerIds).toEqual(new Set(['qingyun-gate-disciple', 'qingyun-herbalist', 'qingyun-bell-keeper']))
    expect(CH04_DIALOGUE_GRAPH.maxConfusingHops).toBe(2)
    expect(CH04_DIALOGUE_GRAPH.nodes.flatMap((node) => node.choices).filter((choice) => choice.branch === 'confusing')).toHaveLength(6)
  })

  it('不可逆递交选项需要二次确认，确认后只写入可诊断 flag', () => {
    const engine = new DialogueEngine(CH04_DIALOGUE_GRAPH)
    engine.choose(asChoiceId('choice:ch04:hub-gate'))
    engine.choose(asChoiceId('choice:ch04:gate-clue'))
    const notice = engine.choose(asChoiceId('choice:ch04:gate-serious-review'))
    expect(notice.status).toBe('requires_confirmation')
    const confirmed = engine.choose(asChoiceId('choice:ch04:gate-serious-review'), { confirm: true, actionId: 'ch04:review-confirmed' })
    expect(confirmed.status).toBe('advanced')
    expect(confirmed.effectResult?.state.flags).toMatchObject({ ch04_review_notice: true })
  })
})
