import { beforeEach, describe, expect, it } from 'vitest'
import { useRootGameStore } from '../stores'

describe('江湖状态机', () => {
  beforeEach(() => {
    useRootGameStore.getState().startNewGame('试刀客', 'reckless')
  })

  it('创角后进入小愚村并能完成老头教学', () => {
    const store = useRootGameStore.getState()
    expect(store.screen).toBe('jianghu')
    expect(store.player?.stats.attack).toBeGreaterThan(18)

    store.meetOldMan()
    const state = useRootGameStore.getState()
    expect(state.world.oldManMet).toBe(true)
    expect(state.quests.find((quest) => quest.id === 'firstSteps')?.status).toBe('complete')
    expect(state.quests.find((quest) => quest.id === 'challengeBai')?.status).toBe('active')
  })

  it('强抱大黄猫不会使角色在场景内倒下，并授予称号', () => {
    const store = useRootGameStore.getState()
    store.meetOldMan()
    store.acceptCatQuest()
    store.resolveCatQuest('grab')

    const state = useRootGameStore.getState()
    expect(state.world.catResolved).toBe(true)
    expect(state.player?.hp).toBeGreaterThanOrEqual(1)
    expect(state.player?.titles).toContain('catScratchTrial')
    expect(state.quests.find((quest) => quest.id === 'findCat')?.status).toBe('complete')
  })

  it('趣味消耗品会安全结算，二锅头只强化下一场战斗', () => {
    let store = useRootGameStore.getState()
    store.useItem('stalePill')
    expect(useRootGameStore.getState().player?.hp).toBeGreaterThanOrEqual(1)
    expect(useRootGameStore.getState().player?.inventory).not.toContain('stalePill')

    store = useRootGameStore.getState()
    store.useItem('erguotou')
    expect(useRootGameStore.getState().world.tipsyNextBattle).toBe(true)
    store.meetOldMan()
    store.startBattle()
    expect(useRootGameStore.getState().battle?.playerStatuses).toContainEqual({ id: 'tipsy', turns: 99 })
  })

  it('白大侠战斗只在完成教学后开启，且嘴遁产生战斗反馈', () => {
    let store = useRootGameStore.getState()
    store.startBattle()
    expect(useRootGameStore.getState().battle).toBeNull()

    store.meetOldMan()
    store = useRootGameStore.getState()
    store.startBattle()
    store = useRootGameStore.getState()
    expect(store.battle?.turn).toBe('player')

    store.useSkill('mockery')
    const battle = useRootGameStore.getState().battle
    expect(battle?.logs.some((entry) => entry.text.includes('嘴遁'))).toBe(true)
    expect(battle?.round).toBeGreaterThanOrEqual(1)
  })

  it('小愚村两类普通敌人使用同一战斗引擎，胜利不提前结算 Boss', () => {
    const store = useRootGameStore.getState()
    store.meetOldMan()
    const silverBefore = useRootGameStore.getState().player!.silver
    store.startBattle('ch01:river-thug')
    expect(useRootGameStore.getState().battle?.enemy).toMatchObject({ id: 'riverThug', name: '河边醉汉' })
    useRootGameStore.setState((state) => ({ battle: state.battle ? { ...state.battle, enemy: { ...state.battle.enemy, hp: 1 } } : null }))
    useRootGameStore.getState().useSkill('basicSlash')
    expect(useRootGameStore.getState().battle?.turn).toBe('victory')
    expect(useRootGameStore.getState().world.baiDefeated).toBe(false)
    expect(useRootGameStore.getState().player?.silver).toBe(silverBefore + 6)
  })

  it('清河县两类普通敌人读取章节配置，胜利不提前结算榜下捕快', () => {
    useRootGameStore.setState((state) => ({
      ...state,
      player: state.player ? { ...state.player, experience: 42, silver: 70 } : null,
      world: { ...state.world, currentChapter: 'ch02', baiDefeated: true, oldManMet: true },
    }))
    const store = useRootGameStore.getState()
    store.startBattle('ch02:ranking-scribe')
    expect(useRootGameStore.getState().battle?.enemy).toMatchObject({ id: 'rankingScribe', name: '榜纸抄手' })
    expect(useRootGameStore.getState().battle?.enemyIntent.label).toBe('朱笔横批')
    useRootGameStore.setState((state) => ({ battle: state.battle ? { ...state.battle, enemy: { ...state.battle.enemy, hp: 1 } } : null }))
    useRootGameStore.getState().useSkill('basicSlash')
    expect(useRootGameStore.getState().battle?.turn).toBe('victory')
    expect(useRootGameStore.getState().world.ch02BangsiDefeated).toBe(false)

    useRootGameStore.getState().leaveBattle()
    useRootGameStore.getState().startBattle('ch02:bridge-skulker')
    expect(useRootGameStore.getState().battle?.enemy).toMatchObject({ id: 'bridgeSkulker', name: '桥边扒手' })
    expect(useRootGameStore.getState().battle?.enemyIntent.label).toBe('油纸伞戳')
  })

  it('黑风寨两类普通敌人由同一内容驱动路径创建', () => {
    useRootGameStore.setState((state) => ({
      ...state,
      world: { ...state.world, currentChapter: 'ch03', ch02BangsiDefeated: true },
    }))
    useRootGameStore.getState().startBattle('ch03:fortress-scout')
    expect(useRootGameStore.getState().battle?.enemy).toMatchObject({ id: 'fortressScout', name: '山寨巡哨', normalChapter: 'ch03' })
    expect(useRootGameStore.getState().battle?.enemyIntent.label).toBe('木棍点名')
    useRootGameStore.getState().leaveBattle()
    useRootGameStore.getState().startBattle('ch03:kitchen-raider')
    expect(useRootGameStore.getState().battle?.enemy).toMatchObject({ id: 'kitchenRaider', name: '抢锅客', normalChapter: 'ch03' })
    expect(useRootGameStore.getState().battle?.enemyIntent.label).toBe('长勺横扫')
  })

  it('战败后可以恢复资源并原地重试', () => {
    let store = useRootGameStore.getState()
    store.meetOldMan()
    store.startBattle()

    useRootGameStore.setState((state) => ({
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

    store = useRootGameStore.getState()
    store.useSkill('basicSlash')
    expect(useRootGameStore.getState().battle?.turn).toBe('defeat')

    useRootGameStore.getState().retryBattle()
    const retried = useRootGameStore.getState()
    expect(retried.battle?.turn).toBe('player')
    expect(retried.player?.hp).toBe(retried.player?.maxHp)
    expect(retried.player?.qi).toBe(retried.player?.maxQi)
  })

  it('战斗状态提供架势和诚实意图，日志不会超过 50 条', () => {
    let store = useRootGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    const initial = useRootGameStore.getState().battle
    expect(initial?.playerPosture).toMatchObject({ current: 100, max: 100, broken: false })
    expect(initial?.enemyPosture).toMatchObject({ current: 100, max: 100, broken: false })
    expect(initial?.enemyIntent).toMatchObject({ honest: true, expectedPostureDamage: 10 })

    useRootGameStore.setState((state) => ({ ...state, battle: state.battle ? { ...state.battle, playerCooldowns: { cleaverWhirl: 1 } } : null }))
    for (let index = 0; index < 60; index += 1) useRootGameStore.getState().useSkill('cleaverWhirl')
    expect(useRootGameStore.getState().battle?.logs).toHaveLength(50)
  })

  it('白大侠的专属风火轮会在意图说明中提前提示，且不改变阶段或奖励', () => {
    let store = useRootGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    useRootGameStore.getState().useSkill('basicSlash')
    store = useRootGameStore.getState()
    expect(store.battle?.enemyIntent).toMatchObject({ id: 'intent:palm', honest: true })
    expect(store.battle?.enemyIntent.summary).toContain('风火轮')
    expect(store.battle?.enemy.phase).toBe(1)
    expect(store.world.baiDefeated).toBe(false)
  })

  it('白大侠胜利会在同一状态事务中交付奖励、写检查点并开放后续门槛', () => {
    let store = useRootGameStore.getState()
    store.meetOldMan()
    store.startBattle()
    useRootGameStore.setState((state) => ({
      ...state,
      battle: state.battle ? { ...state.battle, enemy: { ...state.battle.enemy, hp: 1 } } : null,
    }))
    useRootGameStore.getState().useSkill('basicSlash')
    store = useRootGameStore.getState()
    expect(store.battle?.turn).toBe('victory')
    expect(store.player).toMatchObject({ experience: 42, silver: 70, equippedWeapon: 'rustyCleaver' })
    expect(store.world).toMatchObject({ baiDefeated: true, ch01AutosaveCheckpoint: true, nextChapterUnlocked: true, endingEligible: true, systemUnlocks: { dialogue: true, basicCombat: true, inventory: true } })
    expect(store.makeSaveV2()?.runtime.world.ch01AutosaveCheckpoint).toBe(true)
  })

  it('梗密度只更新体验设置，战斗中难度保持锁定', () => {
    const initial = useRootGameStore.getState()
    const before = { player: initial.player, quests: initial.quests, world: initial.world, unlockables: initial.unlockables }
    initial.setSettings({ memeDensity: 'spicy', textSpeed: 'fast' })
    const adjusted = useRootGameStore.getState()
    expect(adjusted.settings.memeDensity).toBe('spicy')
    expect(adjusted.settings.textSpeed).toBe('fast')
    expect({ player: adjusted.player, quests: adjusted.quests, world: adjusted.world, unlockables: adjusted.unlockables }).toEqual(before)

    adjusted.meetOldMan()
    useRootGameStore.getState().startBattle()
    const battleState = useRootGameStore.getState()
    battleState.setSettings({ difficulty: 'expert' })
    expect(useRootGameStore.getState().settings.difficulty).toBe('standard')
    expect(useRootGameStore.getState().narrator).toContain('战斗中不能切换难度')
  })

  it('第八章胜利离场后进入可确认、可续玩的结局页', () => {
    useRootGameStore.setState((state) => ({
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
    useRootGameStore.getState().startBattle('ch08')
    useRootGameStore.setState((state) => ({
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

    useRootGameStore.getState().leaveBattle()
    let state = useRootGameStore.getState()
    expect(state.screen).toBe('ending')
    expect(state.endingSelection?.ending?.id).toBe('ending:hot-list-leader')

    const choiceId = state.endingSelection?.ending?.choices[0]?.id
    expect(choiceId).toBeDefined()
    expect(useRootGameStore.getState().recordEndingChoice(choiceId!, false)?.status).toBe('confirmation_required')
    expect(useRootGameStore.getState().recordEndingChoice(choiceId!, true)?.status).toBe('recorded')
    state = useRootGameStore.getState()
    expect(state.endingRecordState.seenIds).toContain('ending:hot-list-leader')
    expect(state.makeSaveV2()?.endings.seenIds).toContain('ending:hot-list-leader')

    state.continuePostgame()
    expect(useRootGameStore.getState().screen).toBe('jianghu')
  })
})
