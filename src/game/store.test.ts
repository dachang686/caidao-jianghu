import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './store'

describe('江湖状态机', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('试刀客', 'reckless')
  })

  it('创角后进入小愚村并能完成老头教学', () => {
    const store = useGameStore.getState()
    expect(store.screen).toBe('jianghu')
    expect(store.player?.stats.attack).toBeGreaterThan(18)

    store.meetOldMan()
    const state = useGameStore.getState()
    expect(state.world.oldManMet).toBe(true)
    expect(state.quests.find((quest) => quest.id === 'firstSteps')?.status).toBe('complete')
    expect(state.quests.find((quest) => quest.id === 'challengeBai')?.status).toBe('active')
  })

  it('强抱大黄猫不会使角色在场景内倒下，并授予称号', () => {
    const store = useGameStore.getState()
    store.meetOldMan()
    store.acceptCatQuest()
    store.resolveCatQuest('grab')

    const state = useGameStore.getState()
    expect(state.world.catResolved).toBe(true)
    expect(state.player?.hp).toBeGreaterThanOrEqual(1)
    expect(state.player?.titles).toContain('catScratchTrial')
    expect(state.quests.find((quest) => quest.id === 'findCat')?.status).toBe('complete')
  })

  it('趣味消耗品会安全结算，二锅头只强化下一场战斗', () => {
    let store = useGameStore.getState()
    store.useItem('stalePill')
    expect(useGameStore.getState().player?.hp).toBeGreaterThanOrEqual(1)
    expect(useGameStore.getState().player?.inventory).not.toContain('stalePill')

    store = useGameStore.getState()
    store.useItem('erguotou')
    expect(useGameStore.getState().world.tipsyNextBattle).toBe(true)
    store.meetOldMan()
    store.startBattle()
    expect(useGameStore.getState().battle?.playerStatuses).toContainEqual({ id: 'tipsy', turns: 99 })
  })

  it('白大侠战斗只在完成教学后开启，且嘴遁产生战斗反馈', () => {
    let store = useGameStore.getState()
    store.startBattle()
    expect(useGameStore.getState().battle).toBeNull()

    store.meetOldMan()
    store = useGameStore.getState()
    store.startBattle()
    store = useGameStore.getState()
    expect(store.battle?.turn).toBe('player')

    store.useSkill('mockery')
    const battle = useGameStore.getState().battle
    expect(battle?.logs.some((entry) => entry.text.includes('嘴遁'))).toBe(true)
    expect(battle?.round).toBeGreaterThanOrEqual(1)
  })
})
