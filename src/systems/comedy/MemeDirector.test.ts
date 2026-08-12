import { describe, expect, it } from 'vitest'
import { CORE_MEME_PACK } from '../../content/memes'
import type { DomainEvent } from '../../types/events'
import type { MemeDefinition } from '../../types/meme'
import { MemeDirector, parseMemeDirectorSnapshot, serializeMemeDirectorSnapshot, validateMemePackDefinitions } from './MemeDirector'

function event(id: string, type = 'battle_win'): DomainEvent {
  return { id, type, payload: {}, occurredAtTick: 0, sourceActionId: `action:${id}` }
}

const rotationPack: readonly MemeDefinition[] = [
  { id: 'meme:a', category: 'jianghu', triggerEvent: 'battle_win', text: '甲', minDensity: 'mild', cooldownGroup: 'result', cooldownTicks: 0 },
  { id: 'meme:b', category: 'hotlist', triggerEvent: 'battle_win', text: '乙', minDensity: 'mild', cooldownGroup: 'result', cooldownTicks: 0, modernMapping: '热榜' },
]

const context = { density: 'spicy' as const, tick: 0, actionId: 'action:test', rngState: 1234 }

describe('MemeDirector', () => {
  it('selects deterministically and does not repeat a pool before rotation completes', () => {
    const first = new MemeDirector(rotationPack)
    const second = new MemeDirector(rotationPack)
    const firstSelection = first.select(event('event-1'), context)
    const secondSelection = second.select(event('event-1'), context)
    const nextSelection = first.select(event('event-2'), { ...context, tick: 1, rngState: firstSelection.rngState })
    const afterRotation = first.select(event('event-3'), { ...context, tick: 2, rngState: nextSelection.rngState })

    expect(firstSelection.memeId).toBe(secondSelection.memeId)
    expect(firstSelection.text).toBe(secondSelection.text)
    expect(nextSelection.memeId).not.toBe(firstSelection.memeId)
    expect(afterRotation.status).toBe('selected')
  })

  it('deduplicates event IDs and round-trips a saveable snapshot', () => {
    const director = new MemeDirector(CORE_MEME_PACK)
    const selected = director.select(event('event-1'), context)
    const duplicate = director.select(event('event-1'), { ...context, density: 'mild' })
    const restored = new MemeDirector(CORE_MEME_PACK, parseMemeDirectorSnapshot(serializeMemeDirectorSnapshot(selected.state)))

    expect(selected.status).toBe('selected')
    expect(duplicate.status).toBe('duplicate_event')
    expect(restored.getState()).toEqual(selected.state)
  })

  it('reports sensitive text and missing cooldown groups', () => {
    const result = validateMemePackDefinitions([
      { ...rotationPack[0], text: '抖音热搜真好笑', cooldownGroup: '' },
      rotationPack[1],
    ])
    expect(result.valid).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['sensitive_text', 'missing_cooldown']))
  })
})
