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

  it('战败后可以恢复资源并原地重试', () => {
    let store = useGameStore.getState()
    store.meetOldMan()
    store.startBattle()

    useGameStore.setState((state) => ({
      ...state,
      player: state.player ? {
        ...state.player,
        hp: 1,
        qi: 0,
        stats: { ...state.player.stats, dodge: 0 },
      } : null,
      battle: state.battle ? {
        ...state.battle,
        enemy: {
          ...state.battle.enemy,
          stats: { ...state.battle.enemy.stats, attack: 999, crit: 0 },
        },
      } : null,
    }))

    store = useGameStore.getState()
    store.useSkill('basicSlash')
    expect(useGameStore.getState().battle?.turn).toBe('defeat')

    useGameStore.getState().retryBattle()
    const retried = useGameStore.getState()
    expect(retried.battle?.turn).toBe('player')
    expect(retried.player?.hp).toBe(retried.player?.maxHp)
    expect(retried.player?.qi).toBe(retried.player?.maxQi)
  })

  it('战斗状态提供架势和诚实意图，日志不会超过 50 条', () => {
    let store = useGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    const initial = useGameStore.getState().battle
    expect(initial?.playerPosture).toMatchObject({ current: 100, max: 100, broken: false })
    expect(initial?.enemyPosture).toMatchObject({ current: 100, max: 100, broken: false })
    expect(initial?.enemyIntent).toMatchObject({ honest: true, expectedPostureDamage: 10 })

    useGameStore.setState((state) => ({ ...state, battle: state.battle ? { ...state.battle, playerCooldowns: { cleaverWhirl: 1 } } : null }))
    for (let index = 0; index < 60; index += 1) useGameStore.getState().useSkill('cleaverWhirl')
    expect(useGameStore.getState().battle?.logs).toHaveLength(50)
  })

  it('白大侠的专属风火轮会在意图说明中提前提示，且不改变阶段或奖励', () => {
    let store = useGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    useGameStore.getState().useSkill('basicSlash')
    store = useGameStore.getState()
    expect(store.battle?.enemyIntent).toMatchObject({ id: 'intent:palm', honest: true })
    expect(store.battle?.enemyIntent.summary).toContain('风火轮')
    expect(store.battle?.enemy.phase).toBe(1)
    expect(store.world.baiDefeated).toBe(false)
  })

  it('白大侠胜利会在同一状态事务中交付奖励、写检查点并开放后续门槛', () => {
    let store = useGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    useGameStore.setState((state) => ({
      ...state,
      battle: state.battle ? { ...state.battle, enemy: { ...state.battle.enemy, hp: 1 } } : null,
    }))
    useGameStore.getState().useSkill('basicSlash')
    store = useGameStore.getState()
    expect(store.battle?.turn).toBe('victory')
    expect(store.player).toMatchObject({ experience: 42, silver: 70, equippedWeapon: 'rustyCleaver' })
    expect(store.world).toMatchObject({ baiDefeated: true, ch01AutosaveCheckpoint: true, nextChapterUnlocked: true, endingEligible: true, systemUnlocks: { dialogue: true, basicCombat: true, inventory: true } })
    expect(store.makeSave()?.world.ch01AutosaveCheckpoint).toBe(true)
  })

  it('梗密度只更新体验设置，战斗中难度保持锁定', () => {
    const initial = useGameStore.getState()
    const before = { player: initial.player, quests: initial.quests, world: initial.world, unlockables: initial.unlockables }
    initial.setSettings({ memeDensity: 'spicy', textSpeed: 'fast' })
    const adjusted = useGameStore.getState()
    expect(adjusted.settings.memeDensity).toBe('spicy')
    expect(adjusted.settings.textSpeed).toBe('fast')
    expect({ player: adjusted.player, quests: adjusted.quests, world: adjusted.world, unlockables: adjusted.unlockables }).toEqual(before)

    adjusted.meetOldMan()
    useGameStore.getState().startBattle()
    const battleState = useGameStore.getState()
    battleState.setSettings({ difficulty: 'expert' })
    expect(useGameStore.getState().settings.difficulty).toBe('standard')
    expect(useGameStore.getState().narrator).toContain('战斗中不能切换难度')
  })

  it('第八章胜利离场后进入可确认、可续玩的结局页', () => {
    useGameStore.setState((state) => ({
      ...state,
      world: {
        ...state.world,
        currentChapter: 'ch08',
        ch07MainlineComplete: true,
        ch07RankingGovernorDefeated: true,
        ch08MainlineComplete: true,
        ch08BossReady: true,
        ch08RankingMasterDefeated: false,
      },
      player: state.player ? { ...state.player, silver: 220 } : state.player,
    }))
    useGameStore.getState().startBattle('ch08')
    useGameStore.setState((state) => ({
      ...state,
      world: {
        ...state.world,
        baiDefeated: true,
        ch02BangsiDefeated: true,
        ch03BlackwindLeaderDefeated: true,
        ch04QingyunMasterDefeated: true,
        ch05TwinBanditsDefeated: true,
        ch06TideMasterDefeated: true,
        ch07RankingGovernorDefeated: true,
        ch08RankingMasterDefeated: true,
      },
      battle: state.battle ? { ...state.battle, turn: 'victory' } : null,
    }))

    useGameStore.getState().leaveBattle()
    let state = useGameStore.getState()
    expect(state.screen).toBe('ending')
    expect(state.endingSelection?.ending?.id).toBe('ending:hot-list-leader')

    const choiceId = state.endingSelection?.ending?.choices[0]?.id
    expect(choiceId).toBeDefined()
    expect(useGameStore.getState().recordEndingChoice(choiceId!, false)?.status).toBe('confirmation_required')
    expect(useGameStore.getState().recordEndingChoice(choiceId!, true)?.status).toBe('recorded')
    state = useGameStore.getState()
    expect(state.endingRecordState.seenIds).toContain('ending:hot-list-leader')
    expect(state.makeSave()?.ending?.seenIds).toContain('ending:hot-list-leader')

    state.continuePostgame()
    expect(useGameStore.getState().screen).toBe('jianghu')
  })
})
