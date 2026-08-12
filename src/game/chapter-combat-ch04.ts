import { CH04_BOSS_REWARD } from '../content/chapters/ch04-combat'
import type { DomainEvent } from '../types/events'
import type { ItemId, PlayerState, QuestState, WorldState } from './types'

const QINGYUN_MASTER_ENEMY_ID = 'qingyun-master'
const QINGYUN_MASTER_ITEM_ID = CH04_BOSS_REWARD.itemId as ItemId

export interface Ch04BossVictoryInput {
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
}

export interface Ch04BossVictoryResult {
  readonly status: 'settled' | 'already_settled'
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
  readonly events: readonly DomainEvent[]
  readonly autoSaveTrigger: 'battle_won' | null
}

function event(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 0, sourceActionId: CH04_BOSS_REWARD.grantKey }
}

export function settleCh04BossVictory(input: Ch04BossVictoryInput): Ch04BossVictoryResult {
  if (input.world.ch04QingyunMasterDefeated) {
    return { status: 'already_settled', player: input.player, quests: input.quests, world: input.world, events: [], autoSaveTrigger: null }
  }

  const inventory = input.player.inventory.includes(QINGYUN_MASTER_ITEM_ID)
    ? [...input.player.inventory]
    : [...input.player.inventory, QINGYUN_MASTER_ITEM_ID]
  const nextPlayer: PlayerState = {
    ...input.player,
    experience: input.player.experience + CH04_BOSS_REWARD.experience,
    silver: input.player.silver + CH04_BOSS_REWARD.silver,
    inventory,
  }
  const nextWorld: WorldState = {
    ...input.world,
    currentChapter: 'ch04',
    ch04MainlineComplete: true,
    ch04BossReady: true,
    ch04QingyunMasterDefeated: true,
    ch04AutosaveCheckpoint: true,
    systemUnlocks: {
      dialogue: true,
      basicCombat: true,
      inventory: true,
      equipment: true,
      gathering: true,
      forging: true,
      skillTree: true,
      cooking: true,
      advancedIntent: true,
      equipmentStrengthening: true,
      sectCreation: false,
      tickDispatch: false,
      advancedCommissions: false,
      discipleEvents: false,
      endingRouteLock: false,
      fourEndings: false,
      postgameContinue: false,
    },
    nextChapterUnlocked: true,
    endingEligible: true,
  }
  const events = [
    event('battle.won:ch04:qingyun-master', 'battle.won', { enemyId: QINGYUN_MASTER_ENEMY_ID }),
    event('enemy.defeated:ch04:qingyun-master', 'enemy.defeated', { enemyId: QINGYUN_MASTER_ENEMY_ID }),
    event('quest.completed:ch04:mainline:bell-judgment', 'quest.completed', { questId: 'ch04:mainline:bell-judgment' }),
    event('item.granted:ch04:qingyun-mark', 'item.granted', { itemId: QINGYUN_MASTER_ITEM_ID, grantKey: CH04_BOSS_REWARD.grantKey }),
    event('system.unlocked:ch04:advanced-intent', 'system.unlocked', { systemId: 'advancedIntent' }),
    event('system.unlocked:ch04:equipment-strengthening', 'system.unlocked', { systemId: 'equipmentStrengthening' }),
    event('chapter.unlocked:ch05', 'chapter.unlocked', { chapterId: 'ch05' }),
    event('ending.eligible:ch04', 'ending.eligible', { chapterId: 'ch04' }),
    event('autosave.checkpoint:ch04:qingyun-master', 'autosave.checkpoint', { trigger: 'battle_won' }),
  ]
  return { status: 'settled', player: nextPlayer, quests: input.quests.map((quest) => ({ ...quest })), world: nextWorld, events, autoSaveTrigger: 'battle_won' }
}
