import { CH02_BOSS_REWARD } from '../content/chapters/ch02-combat'
import type { DomainEvent } from '../types/events'
import type { ItemId, PlayerState, QuestState, WorldState } from './types'

const BANGSI_ENEMY_ID = 'bangsi'
const BANGSI_ITEM_ID = CH02_BOSS_REWARD.itemId as ItemId

export interface Ch02BossVictoryInput {
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
}

export interface Ch02BossVictoryResult {
  readonly status: 'settled' | 'already_settled'
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
  readonly events: readonly DomainEvent[]
  readonly autoSaveTrigger: 'battle_won' | null
}

function event(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 0, sourceActionId: CH02_BOSS_REWARD.grantKey }
}

export function settleCh02BossVictory(input: Ch02BossVictoryInput): Ch02BossVictoryResult {
  if (input.world.ch02BangsiDefeated) {
    return { status: 'already_settled', player: input.player, quests: input.quests, world: input.world, events: [], autoSaveTrigger: null }
  }

  const inventory = input.player.inventory.includes(BANGSI_ITEM_ID)
    ? [...input.player.inventory]
    : [...input.player.inventory, BANGSI_ITEM_ID]
  const nextPlayer: PlayerState = {
    ...input.player,
    experience: input.player.experience + CH02_BOSS_REWARD.experience,
    silver: input.player.silver + CH02_BOSS_REWARD.silver,
    inventory,
  }
  const nextWorld: WorldState = {
    ...input.world,
    currentChapter: 'ch02',
    ch02MainlineComplete: true,
    ch02BossReady: true,
    ch02BangsiDefeated: true,
    ch02AutosaveCheckpoint: true,
    systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: false, cooking: false, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false },
    nextChapterUnlocked: true,
    endingEligible: true,
  }
  const events = [
    event('battle.won:ch02:bangsi', 'battle.won', { enemyId: BANGSI_ENEMY_ID }),
    event('enemy.defeated:ch02:bangsi', 'enemy.defeated', { enemyId: BANGSI_ENEMY_ID }),
    event('quest.completed:ch02:evidence-ready', 'quest.completed', { questId: 'ch02:mainline:evidence-ready' }),
    event('item.granted:ch02:qinghe-badge', 'item.granted', { itemId: BANGSI_ITEM_ID, grantKey: CH02_BOSS_REWARD.grantKey }),
    event('system.unlocked:ch02:equipment', 'system.unlocked', { systemId: 'equipment' }),
    event('system.unlocked:ch02:gathering', 'system.unlocked', { systemId: 'gathering' }),
    event('system.unlocked:ch02:forging', 'system.unlocked', { systemId: 'forging' }),
    event('chapter.unlocked:ch03', 'chapter.unlocked', { chapterId: 'ch03' }),
    event('ending.eligible:ch02', 'ending.eligible', { chapterId: 'ch02' }),
    event('autosave.checkpoint:ch02:bangsi', 'autosave.checkpoint', { trigger: 'battle_won' }),
  ]
  return { status: 'settled', player: nextPlayer, quests: input.quests.map((quest) => ({ ...quest })), world: nextWorld, events, autoSaveTrigger: 'battle_won' }
}
