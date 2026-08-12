import { beforeEach, describe, expect, it } from 'vitest'
import { settleCh03BossVictory } from './chapter-combat-ch03'
import { useGameStore } from './store'

describe('第 3 章黑风寨主胜利事务', () => {
  beforeEach(() => {
    useGameStore.getState().startNewGame('黑风快照客', 'reckless')
  })

  it('一次性发放黑风寨令、技能树/烹饪解锁、自动档和后续门槛', () => {
    const state = useGameStore.getState()
    const result = settleCh03BossVictory({
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch03' as const, ch03MainlineComplete: true, ch03BossReady: true },
    })
    expect(result.status).toBe('settled')
    expect(result.player.experience).toBe(72)
    expect(result.player.silver).toBe(110)
    expect(result.player.inventory).toContain('blackwindSeal')
    expect(result.world).toMatchObject({
      currentChapter: 'ch03',
      ch03MainlineComplete: true,
      ch03BossReady: true,
      ch03BlackwindLeaderDefeated: true,
      ch03AutosaveCheckpoint: true,
      nextChapterUnlocked: true,
      endingEligible: true,
      systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true },
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
    const first = settleCh03BossVictory({
      player: state.player!,
      quests: state.quests,
      world: { ...state.world, currentChapter: 'ch03' as const, ch03MainlineComplete: true, ch03BossReady: true },
    })
    const second = settleCh03BossVictory({ player: first.player, quests: first.quests, world: first.world })
    expect(second.status).toBe('already_settled')
    expect(second.player).toEqual(first.player)
    expect(second.events).toEqual([])
    expect(second.autoSaveTrigger).toBeNull()
  })
})
