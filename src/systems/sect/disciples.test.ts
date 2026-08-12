import { describe, expect, it } from 'vitest'
import { discipleDefinitions, discipleDispatchEventDefinitions, discipleTraitDefinitions } from '../../content/sect/disciples'
import { discipleDialogueDefinitions } from '../../content/dialogues/disciples'
import { asDiscipleId } from '../../types/ids'
import { createSectState } from '../../types/sect'
import { validateDialogueGraph } from '../dialogue/engine'
import {
  createDiscipleRoster,
  previewDiscipleDispatch,
  recruitDisciple,
  validateDiscipleDefinitions,
  validateDiscipleDispatchEventDefinitions,
} from './disciples'

const shyId = discipleDefinitions[0]!.id
const showoffId = discipleDefinitions[1]!.id

describe('disciple roster', () => {
  it('测试门人定义保持 1–2 个性格且总容量上限为 12', () => {
    expect(validateDiscipleDefinitions(discipleDefinitions, discipleTraitDefinitions)).toEqual({ valid: true, issues: [] })
    expect(validateDiscipleDispatchEventDefinitions(discipleDispatchEventDefinitions, discipleDefinitions, discipleTraitDefinitions)).toEqual({ valid: true, issues: [] })
    expect(validateDialogueGraph({ id: 'content:disciple-dialogues', startNodeId: discipleDialogueDefinitions[0]!.id, nodes: discipleDialogueDefinitions, maxConfusingHops: 2 })).toEqual({ valid: true, issues: [] })
    expect(discipleDefinitions).toHaveLength(6)
    expect(discipleDefinitions.every((definition) => definition.traitIds.length >= 1 && definition.traitIds.length <= 2)).toBe(true)
    expect(new Set(discipleDefinitions.map((definition) => definition.specialty))).toEqual(new Set(['intel', 'forge', 'kitchen', 'management']))
    expect(discipleDefinitions.every((definition) => (definition.dispatchEventIds?.length ?? 0) >= 1)).toBe(true)
  })

  it('招募支持条件变化、重复幂等和容量满安全返回', () => {
    const locked = recruitDisciple(createSectState(), shyId, discipleDefinitions, 5)
    expect(locked.status).toBe('sect_locked')
    const chapterLocked = recruitDisciple(createSectState({ unlocked: true }), shyId, discipleDefinitions, 4)
    expect(chapterLocked.status).toBe('chapter_locked')
    const conditionLocked = recruitDisciple(createSectState({ unlocked: true }), showoffId, discipleDefinitions, 5)
    expect(conditionLocked.status).toBe('condition_locked')

    const roster = createDiscipleRoster(discipleDefinitions, discipleTraitDefinitions, createSectState({ unlocked: true }))
    const recruited = roster.recruit(shyId, 5)
    expect(recruited.status).toBe('recruited')
    expect(roster.recruit(shyId, 5).status).toBe('already_recruited')
    expect(roster.recruit(showoffId, 5, { quests: {}, inventory: {}, stats: {}, flags: { met_showoff_runner: true } }).status).toBe('recruited')

    const full = createSectState({ unlocked: true, discipleIds: Array.from({ length: 12 }, (_, index) => asDiscipleId(`disciple:existing-${index}`)) })
    expect(recruitDisciple(full, shyId, discipleDefinitions, 5).status).toBe('capacity_full')
  })

  it('记录专属对白并在派遣前提供小幅性格修正预览', () => {
    const roster = createDiscipleRoster(discipleDefinitions, discipleTraitDefinitions, createSectState({ unlocked: true }))
    roster.recruit(shyId, 5)
    const dialogueId = discipleDefinitions[0]!.recruitmentDialogueId!
    expect(roster.markDialogueSeen(shyId, dialogueId).status).toBe('marked')
    expect(roster.markDialogueSeen(shyId, dialogueId).status).toBe('already_seen')
    expect(roster.markDialogueSeen(shyId, 'dialogue:missing' as never).status).toBe('unknown_dialogue')

    const preview = previewDiscipleDispatch([shyId], discipleDefinitions, discipleTraitDefinitions)
    expect(preview.traitIds).toEqual(['shy', 'steady'])
    expect(preview.durationTicksDelta).toBe(1)
    expect(preview.successChanceDelta).toBeCloseTo(0.05)
    expect(preview.qualityDelta).toBe(1)
    expect(preview).not.toHaveProperty('combat')
  })

  it('六名 Core 门人都能在第五章主线/支线条件下招募', () => {
    const contexts: Readonly<Record<string, boolean>>[] = [
      {},
      { met_showoff_runner: true },
      { met_forge_keeper: true },
      { met_kitchen_helper: true },
      { heard_rumor_network: true },
      { settled_sect_ledger: true },
    ]
    let state = createSectState({ unlocked: true })
    discipleDefinitions.forEach((definition, index) => {
      const outcome = recruitDisciple(state, definition.id, discipleDefinitions, 5, { quests: {}, inventory: {}, stats: {}, flags: contexts[index] })
      expect(outcome.status).toBe('recruited')
      state = outcome.state
    })
    expect(state.discipleIds).toHaveLength(6)
  })
})
