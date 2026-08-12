import { describe, expect, it } from 'vitest'
import { OPTIONAL_POSTGAME_DUNGEONS } from '../../content/postgame'
import { createPostgameDungeonEngine } from './dungeon-engine'

describe('PostgameDungeonEngine', () => {
  it('requires ending unlock and preserves a safe checkpoint after defeat', () => {
    const engine = createPostgameDungeonEngine(OPTIONAL_POSTGAME_DUNGEONS)
    expect(engine.start(OPTIONAL_POSTGAME_DUNGEONS[0]!.id).status).toBe('locked')
    engine.unlock()
    expect(engine.start(OPTIONAL_POSTGAME_DUNGEONS[0]!.id, 'start-1').status).toBe('started')
    expect(engine.advance('victory', 'clear-1').status).toBe('advanced')
    const failed = engine.advance('defeat', 'fail-1')
    expect(failed.status).toBe('defeat_checkpoint')
    expect(failed.state.encounterIndex).toBe(failed.state.checkpointIndex)
  })

  it('records first clear once and makes repeat reward explicit', () => {
    const dungeon = OPTIONAL_POSTGAME_DUNGEONS[2]!
    const engine = createPostgameDungeonEngine([dungeon]).unlock()
    engine.start(dungeon.id, 'start-2')
    dungeon.encounters.forEach((_, index) => engine.advance('victory', `clear-2-${index}`))
    expect(engine.getState().claimedGrantKeys).toContain(dungeon.firstClearGrantKey)
    engine.start(dungeon.id, 'start-3')
    dungeon.encounters.forEach((_, index) => engine.advance('victory', `clear-3-${index}`))
    expect(engine.getState().completedDungeonIds).toEqual([dungeon.id])
  })
})

