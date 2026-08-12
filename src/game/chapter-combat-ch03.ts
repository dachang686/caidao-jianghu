import { CH03_BOSS_REWARD } from '../content/chapters/ch03-combat'
import type { DomainEvent } from '../types/events'
import type { ItemId, PlayerState, QuestState, WorldState } from './types'

const BLACKWIND_LEADER_ENEMY_ID = 'blackwind-leader'
const BLACKWIND_LEADER_ITEM_ID = CH03_BOSS_REWARD.itemId as ItemId

export interface Ch03BossVictoryInput {
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
}

export interface Ch03BossVictoryResult {
  readonly status: 'settled' | 'already_settled'
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
  readonly events: readonly DomainEvent[]
  readonly autoSaveTrigger: 'battle_won' | null
}

function event(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 0, sourceActionId: CH03_BOSS_REWARD.grantKey }
}

export function settleCh03BossVictory(input: Ch03BossVictoryInput): Ch03BossVictoryResult {
  if (input.world.ch03BlackwindLeaderDefeated) {
    return { status: 'already_settled', player: input.player, quests: input.quests, world: input.world, events: [], autoSaveTrigger: null }
  }

  const inventory = input.player.inventory.includes(BLACKWIND_LEADER_ITEM_ID)
    ? [...input.player.inventory]
    : [...input.player.inventory, BLACKWIND_LEADER_ITEM_ID]
  const nextPlayer: PlayerState = {
    ...input.player,
    experience: input.player.experience + CH03_BOSS_REWARD.experience,
    silver: input.player.silver + CH03_BOSS_REWARD.silver,
    inventory,
  }
  const nextWorld: WorldState = {
    ...input.world,
    currentChapter: 'ch03',
    ch03MainlineComplete: true,
    ch03BossReady: true,
    ch03BlackwindLeaderDefeated: true,
    ch03AutosaveCheckpoint: true,
    systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false },
    nextChapterUnlocked: true,
    endingEligible: true,
  }
  const events = [
    event('battle.won:ch03:blackwind-leader', 'battle.won', { enemyId: BLACKWIND_LEADER_ENEMY_ID }),
    event('enemy.defeated:ch03:blackwind-leader', 'enemy.defeated', { enemyId: BLACKWIND_LEADER_ENEMY_ID }),
    event('quest.completed:ch03:mainline:roll-call', 'quest.completed', { questId: 'ch03:mainline:roll-call' }),
    event('item.granted:ch03:blackwind-seal', 'item.granted', { itemId: BLACKWIND_LEADER_ITEM_ID, grantKey: CH03_BOSS_REWARD.grantKey }),
    event('system.unlocked:ch03:skill-tree', 'system.unlocked', { systemId: 'skillTree' }),
    event('system.unlocked:ch03:cooking', 'system.unlocked', { systemId: 'cooking' }),
    event('chapter.unlocked:ch04', 'chapter.unlocked', { chapterId: 'ch04' }),
    event('ending.eligible:ch03', 'ending.eligible', { chapterId: 'ch03' }),
    event('autosave.checkpoint:ch03:blackwind-leader', 'autosave.checkpoint', { trigger: 'battle_won' }),
  ]
  return { status: 'settled', player: nextPlayer, quests: input.quests.map((quest) => ({ ...quest })), world: nextWorld, events, autoSaveTrigger: 'battle_won' }
}
