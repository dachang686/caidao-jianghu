import { describe, expect, it } from 'vitest'
import { POSTGAME_COMMISSION_PACK } from '../../content/commissions/postgame'
import { createPostgameLoopEngine } from './engine'

const context = (progress: number) => ({ chapter: 8, unlockedRegionIds: ['martial-convention', 'capital-ranking', 'western-relay', 'donghai-town', 'xiaoyu-village'], progress, rng: { seed: 123, state: progress }, completedEndingIds: ['ending:sect-founder'], prosperity: 8 })

describe('postgame loop', () => {
  it('结局后开放三档委托，重复委托收益有下限', () => {
    const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK)
    expect(engine.generate(context(1)).status).toBe('locked')
    engine.unlock(['ending:sect-founder'], 8)
    expect(engine.setDifficulty('elite').difficulty).toBe('elite')
    const first = engine.generate(context(2))
    expect(first.status).toBe('generated')
    const task = first.task!
    engine.markReady(task.instanceId)
    expect(engine.claim(task.instanceId).status).toBe('claimed')
    expect(engine.claim(task.instanceId).status).toBe('already_claimed')
  })

  it('一次性门人目标只计入一次，且不依赖现实时间', () => {
    const engine = createPostgameLoopEngine(POSTGAME_COMMISSION_PACK)
    engine.unlock(['ending:sect-founder'])
    const state = engine.snapshot()
    expect(state.claimedOneTimeTargetIds).toEqual([])
    expect(POSTGAME_COMMISSION_PACK.oneTimeTargetIds.length).toBe(3)
  })
})
