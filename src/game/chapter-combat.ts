import { CH01_BOSS_REWARD } from '../content/chapters/ch01-combat'
import { CORE_UNLOCKABLES } from '../content/unlockables'
import { deriveTitleCombatStats } from '../systems/unlocks'
import type { DomainEvent } from '../types/events'
import { BASE_STATS, TALENTS } from './data'
import type { CombatStats, ItemId, PlayerState, QuestState, TitleId, WorldState } from './types'

const BAI_ENEMY_ID = 'bai-daxia'
const BAI_QUEST_ID = 'challengeBai'
const BAI_TITLE_ID = CH01_BOSS_REWARD.titleId as TitleId
const BAI_ITEM_ID = CH01_BOSS_REWARD.itemId as ItemId

export interface Ch01BossVictoryInput {
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
}

export interface Ch01BossVictoryResult {
  readonly status: 'settled' | 'already_settled'
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
  readonly events: readonly DomainEvent[]
  readonly autoSaveTrigger: 'battle_won' | null
}

function makeBaseCombatStats(talent: PlayerState['talent']): CombatStats {
  const bonus = TALENTS.find((item) => item.id === talent)!.statBonus
  return {
    attack: BASE_STATS.attack + (bonus.attack ?? 0),
    defense: BASE_STATS.defense + (bonus.defense ?? 0),
    speed: BASE_STATS.speed + (bonus.speed ?? 0),
    crit: BASE_STATS.crit + (bonus.crit ?? 0),
    dodge: BASE_STATS.dodge + (bonus.dodge ?? 0),
    accuracy: BASE_STATS.accuracy + (bonus.accuracy ?? 0),
  }
}

function event(id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent {
  return { id, type, payload, occurredAtTick: 0, sourceActionId: CH01_BOSS_REWARD.grantKey }
}

export function settleCh01BossVictory(input: Ch01BossVictoryInput): Ch01BossVictoryResult {
  if (input.world.baiDefeated) {
    return { status: 'already_settled', player: input.player, quests: input.quests, world: input.world, events: [], autoSaveTrigger: null }
  }

  const titles = input.player.titles.includes(BAI_TITLE_ID) ? [...input.player.titles] : [...input.player.titles, BAI_TITLE_ID]
  const inventory = input.player.inventory.includes(BAI_ITEM_ID) ? [...input.player.inventory] : [...input.player.inventory, BAI_ITEM_ID]
  const nextPlayer: PlayerState = {
    ...input.player,
    experience: input.player.experience + CH01_BOSS_REWARD.experience,
    silver: input.player.silver + CH01_BOSS_REWARD.silver,
    inventory,
    equippedWeapon: BAI_ITEM_ID,
    titles,
    stats: deriveTitleCombatStats(makeBaseCombatStats(input.player.talent), CORE_UNLOCKABLES, titles.map((title) => `title:${title}`)),
  }
  const nextQuests = input.quests.map((quest) => quest.id === BAI_QUEST_ID ? { ...quest, status: 'complete' as const, progress: 1 } : { ...quest })
  const nextWorld: WorldState = {
    ...input.world,
    baiDefeated: true,
    systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: false, gathering: false, forging: false, skillTree: false, cooking: false, advancedIntent: false, equipmentStrengthening: false, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false },
    nextChapterUnlocked: true,
    endingEligible: true,
    ch01AutosaveCheckpoint: true,
  }
  const events = [
    event('battle.won:ch01:bai-daxia', 'battle.won', { enemyId: BAI_ENEMY_ID }),
    event('enemy.defeated:ch01:bai-daxia', 'enemy.defeated', { enemyId: BAI_ENEMY_ID }),
    event('quest.completed:ch01:challenge-bai', 'quest.completed', { questId: BAI_QUEST_ID }),
    event('title.earned:ch01:cleaver-novice', 'title.earned', { titleId: BAI_TITLE_ID }),
    event('system.unlocked:ch01:dialogue', 'system.unlocked', { systemId: 'dialogue' }),
    event('system.unlocked:ch01:basic-combat', 'system.unlocked', { systemId: 'basicCombat' }),
    event('system.unlocked:ch01:inventory', 'system.unlocked', { systemId: 'inventory' }),
    event('chapter.unlocked:ch02', 'chapter.unlocked', { chapterId: 'ch02' }),
    event('ending.eligible:ch01', 'ending.eligible', { chapterId: 'ch01' }),
    event('autosave.checkpoint:ch01:bai-daxia', 'autosave.checkpoint', { trigger: 'battle_won' }),
  ]
  return { status: 'settled', player: nextPlayer, quests: nextQuests, world: nextWorld, events, autoSaveTrigger: 'battle_won' }
}

export { settleCh02BossVictory } from './chapter-combat-ch02'
export { settleCh03BossVictory } from './chapter-combat-ch03'
export { settleCh04BossVictory } from './chapter-combat-ch04'
export { settleCh05BossVictory } from './chapter-combat-ch05'
export { settleCh06BossVictory } from './chapter-combat-ch06'
export { settleCh07BossVictory } from './chapter-combat-ch07'
export { settleCh08BossVictory } from './chapter-combat-ch08'
