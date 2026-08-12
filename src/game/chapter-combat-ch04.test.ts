import { beforeEach, describe, expect, it } from 'vitest'
import { settleCh04BossVictory } from './chapter-combat-ch04'
import { useGameStore } from './store'

describe('第 4 章青云掌门胜利事务', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('青云快照客', 'reckless')
  })

  it('一次性发放青云名帖、意图进阶/装备强化解锁、自动档和后续门槛', () => {
    const state = useGameStore.getState()
    const result = settleCh04BossVictory({
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch04' as const, ch04MainlineComplete: true, ch04BossReady: true },
    })
    expect(result.status).toBe('settled')
    expect(result.player.experience).toBe(86)
    expect(result.player.silver).toBe(130)
    expect(result.player.inventory).toContain('qingyunMark')
    expect(result.world).toMatchObject({
      currentChapter: 'ch04',
      ch04MainlineComplete: true,
      ch04BossReady: true,
      ch04QingyunMasterDefeated: true,
      ch04AutosaveCheckpoint: true,
      nextChapterUnlocked: true,
      endingEligible: true,
      systemUnlocks: { advancedIntent: true, equipmentStrengthening: true },
    })
    expect(result.events.map((event) => event.type)).toEqual(expect.arrayContaining([
      'battle.won',
      'enemy.defeated',
      'item.granted',
      'system.unlocked',
      'chapter.unlocked',
      'ending.eligible',
      'autosave.checkpoint',
    ]))
    expect(result.autoSaveTrigger).toBe('battle_won')
  })

  it('重复结算不会重复增加奖励或事件', () => {
    const state = useGameStore.getState()
    const first = settleCh04BossVictory({
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch04' as const, ch04MainlineComplete: true, ch04BossReady: true },
    })
    const second = settleCh04BossVictory({ player: first.player, quests: first.quests, world: first.world })
    expect(second.status).toBe('already_settled')
    expect(second.player).toEqual(first.player)
    expect(second.events).toEqual([])
    expect(second.autoSaveTrigger).toBeNull()
  })
})
