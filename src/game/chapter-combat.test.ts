import { beforeEach, describe, expect, it } from 'vitest'
import { settleCh01BossVictory } from './chapter-combat'
import { useGameStore } from './store'

describe('第 1 章白大侠胜利事务', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('试刀客', 'reckless')
  })

  it('一次性发放奖励、系统解锁、章节开放和自动档检查点', () => {
    const state = useGameStore.getState()
    const result = settleCh01BossVictory({ player: state.player!, quests: state.quests, world: state.world })
    expect(result.status).toBe('settled')
    expect(result.player.experience).toBe(42)
    expect(result.player.silver).toBe(70)
    expect(result.player.inventory).toContain('rustyCleaver')
    expect(result.player.titles).toContain('cleaverNovice')
    expect(result.world).toMatchObject({ baiDefeated: true, nextChapterUnlocked: true, endingEligible: true, ch01AutosaveCheckpoint: true, systemUnlocks: { dialogue: true, basicCombat: true, inventory: true } })
    expect(result.events.map((event) => event.type)).toEqual(expect.arrayContaining(['battle.won', 'enemy.defeated', 'quest.completed', 'autosave.checkpoint']))
    expect(result.autoSaveTrigger).toBe('battle_won')
  })

  it('重复结算不会重复发奖励或追加事件', () => {
    const state = useGameStore.getState()
    const first = settleCh01BossVictory({ player: state.player!, quests: state.quests, world: state.world })
    const second = settleCh01BossVictory({ player: first.player, quests: first.quests, world: first.world })
    expect(second.status).toBe('already_settled')
    expect(second.player).toEqual(first.player)
    expect(second.quests).toEqual(first.quests)
    expect(second.events).toEqual([])
    expect(second.autoSaveTrigger).toBeNull()
  })
})
