import { beforeEach, describe, expect, it } from 'vitest'
import { settleCh02BossVictory } from './chapter-combat-ch02'
import { useGameStore } from './store'

describe('第 2 章榜下捕快胜利事务', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('清河试刀客', 'reckless')
  })

  it('一次性发放榜牌、装备/采集/锻造解锁、自动档和后续门槛', () => {
    const state = useGameStore.getState()
    const input = {
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch02' as const, ch02MainlineComplete: true, ch02BossReady: true },
    }
    const result = settleCh02BossVictory(input)
    expect(result.status).toBe('settled')
    expect(result.player.experience).toBe(58)
    expect(result.player.silver).toBe(92)
    expect(result.player.inventory).toContain('qingheBadge')
    expect(result.world).toMatchObject({
      currentChapter: 'ch02',
      ch02BangsiDefeated: true,
      ch02AutosaveCheckpoint: true,
      nextChapterUnlocked: true,
      endingEligible: true,
      systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true },
    })
    expect(result.events.map((event) => event.type)).toEqual(expect.arrayContaining(['battle.won', 'enemy.defeated', 'item.granted', 'autosave.checkpoint']))
    expect(result.autoSaveTrigger).toBe('battle_won')
  })

  it('重复结算不会重复增加奖励或事件', () => {
    const state = useGameStore.getState()
    const first = settleCh02BossVictory({
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch02' as const, ch02MainlineComplete: true, ch02BossReady: true },
    })
    const second = settleCh02BossVictory({ player: first.player, quests: first.quests, world: first.world })
    expect(second.status).toBe('already_settled')
    expect(second.player).toEqual(first.player)
    expect(second.events).toEqual([])
    expect(second.autoSaveTrigger).toBeNull()
  })

  it('清河县快照可以完成调查、进入 Boss、失败原地重试并胜利返回场景', () => {
    const state = useGameStore.getState()
    useGameStore.setState({
      ...state,
      world: { ...state.world, currentChapter: 'ch02', ch02MainlineComplete: false, ch02BossReady: false },
    })
    useGameStore.getState().completeChapterTwoInvestigation()
    useGameStore.getState().startBattle('ch02')
    expect(useGameStore.getState().battle?.enemy.id).toBe('bangsi')
    expect(useGameStore.getState().battle?.enemyIntent.summary).toContain('空白卷宗')

    useGameStore.setState((current) => ({
      ...current,
      player: current.player ? { ...current.player, hp: 1, stats: { ...current.player.stats, dodge: 0 } } : null,
      battle: current.battle ? { ...current.battle, enemy: { ...current.battle.enemy, stats: { ...current.battle.enemy.stats, attack: 999, crit: 0 } } } : null,
    }))
    useGameStore.getState().useSkill('basicSlash')
    expect(useGameStore.getState().battle?.turn).toBe('defeat')
    useGameStore.getState().retryBattle()
    expect(useGameStore.getState().battle?.turn).toBe('player')
    useGameStore.setState((current) => ({
      ...current,
      battle: current.battle ? { ...current.battle, enemy: { ...current.battle.enemy, hp: 1 } } : null,
    }))
    useGameStore.getState().useSkill('basicSlash')
    const settled = useGameStore.getState()
    expect(settled.battle?.turn).toBe('victory')
    expect(settled.world).toMatchObject({ ch02BangsiDefeated: true, ch02AutosaveCheckpoint: true })
    settled.leaveBattle()
    expect(useGameStore.getState().screen).toBe('jianghu')
    expect(useGameStore.getState().world.currentChapter).toBe('ch02')
  })
})
