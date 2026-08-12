import { describe, expect, it } from 'vitest'
import { createFoundationRuntime } from './runtime'
import { useRootGameStore } from '../stores'

describe('M1 foundation runtime', () => {
  it('注册当前小愚村并提供本地文本、事件和 V2 存档边界', async () => {
    const runtime = await createFoundationRuntime()
    expect(runtime.chapter.chapter.title).toBe('小愚村')
    expect(runtime.eventBus).toBeDefined()
    expect(runtime.saveRepository).toBeDefined()
    expect(runtime.textProvider.getNarration({ requestId: 'm1', trigger: 'load', player: { level: 1, titleIds: [], moralBand: 'mid', fameBand: 'unknown', recentActionTags: [] }, memeDensity: 'mild' }).source).toBe('local')
    expect(useRootGameStore.getState()).not.toHaveProperty('textProvider')
  })

  it('旧 Demo 主线仍可稳定走到白大侠胜利', () => {
    useRootGameStore.getState().startNewGame('M1侠客', 'reckless')
    useRootGameStore.getState().meetOldMan()
    useRootGameStore.getState().startBattle()
    useRootGameStore.setState((state) => ({
      ...state,
      battle: state.battle ? { ...state.battle, enemy: { ...state.battle.enemy, hp: 1 } } : null,
    }))
    useRootGameStore.getState().useSkill('basicSlash')
    expect(useRootGameStore.getState().world.baiDefeated).toBe(true)
  })
})
