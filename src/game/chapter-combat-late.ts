import type { DomainEvent } from '../types/events'
import type { ItemId, PlayerState, QuestState, WorldState } from './types'

export type LateChapterId = 'ch05' | 'ch06' | 'ch07' | 'ch08'
export interface LateBossVictoryInput { readonly player: PlayerState; readonly quests: readonly QuestState[]; readonly world: WorldState }
export interface LateBossVictoryResult { readonly status: 'settled' | 'already_settled'; readonly player: PlayerState; readonly quests: readonly QuestState[]; readonly world: WorldState; readonly events: readonly DomainEvent[]; readonly autoSaveTrigger: 'battle_won' | null }
interface LateBossConfig {
  readonly chapterId: LateChapterId
  readonly enemyId: string
  readonly itemId: ItemId
  readonly experience: number
  readonly silver: number
  readonly rewardKey: string
  readonly defeatedFlag: keyof WorldState
  readonly mainlineFlag: keyof WorldState
  readonly bossReadyFlag: keyof WorldState
  readonly autosaveFlag: keyof WorldState
  readonly nextChapterId?: LateChapterId
  readonly unlocks: Partial<WorldState['systemUnlocks']>
}

const BASE_UNLOCKS: WorldState['systemUnlocks'] = { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true, advancedIntent: true, equipmentStrengthening: true, sectCreation: false, tickDispatch: false, advancedCommissions: false, discipleEvents: false, endingRouteLock: false, fourEndings: false, postgameContinue: false }
const CONFIGS: Record<LateChapterId, LateBossConfig> = {
  ch05: { chapterId: 'ch05', enemyId: 'twin-bandits', itemId: 'westernSeal', experience: 96, silver: 130, rewardKey: 'reward:ch05:twin-bandits', defeatedFlag: 'ch05TwinBanditsDefeated', mainlineFlag: 'ch05MainlineComplete', bossReadyFlag: 'ch05BossReady', autosaveFlag: 'ch05AutosaveCheckpoint', nextChapterId: 'ch06', unlocks: { sectCreation: true, tickDispatch: true } },
  ch06: { chapterId: 'ch06', enemyId: 'tide-master', itemId: 'tidePearl', experience: 108, silver: 150, rewardKey: 'reward:ch06:tide-master', defeatedFlag: 'ch06TideMasterDefeated', mainlineFlag: 'ch06MainlineComplete', bossReadyFlag: 'ch06BossReady', autosaveFlag: 'ch06AutosaveCheckpoint', nextChapterId: 'ch07', unlocks: { sectCreation: true, tickDispatch: true, advancedCommissions: true, discipleEvents: true } },
  ch07: { chapterId: 'ch07', enemyId: 'ranking-governor', itemId: 'capitalWrit', experience: 120, silver: 180, rewardKey: 'reward:ch07:ranking-governor', defeatedFlag: 'ch07RankingGovernorDefeated', mainlineFlag: 'ch07MainlineComplete', bossReadyFlag: 'ch07BossReady', autosaveFlag: 'ch07AutosaveCheckpoint', nextChapterId: 'ch08', unlocks: { sectCreation: true, tickDispatch: true, advancedCommissions: true, discipleEvents: true, endingRouteLock: true } },
  ch08: { chapterId: 'ch08', enemyId: 'ranking-master', itemId: 'conventionCrest', experience: 150, silver: 220, rewardKey: 'reward:ch08:ranking-master', defeatedFlag: 'ch08RankingMasterDefeated', mainlineFlag: 'ch08MainlineComplete', bossReadyFlag: 'ch08BossReady', autosaveFlag: 'ch08AutosaveCheckpoint', unlocks: { sectCreation: true, tickDispatch: true, advancedCommissions: true, discipleEvents: true, endingRouteLock: true, fourEndings: true, postgameContinue: true } },
}

function event(config: LateBossConfig, id: string, type: string, payload: Record<string, string | number | boolean>): DomainEvent { return { id, type, payload, occurredAtTick: 0, sourceActionId: config.rewardKey } }

export function settleLateChapterBossVictory(chapterId: LateChapterId, input: LateBossVictoryInput): LateBossVictoryResult {
  const config = CONFIGS[chapterId]
  if (input.world[config.defeatedFlag] === true) return { status: 'already_settled', player: input.player, quests: input.quests, world: input.world, events: [], autoSaveTrigger: null }
  const inventory = input.player.inventory.includes(config.itemId) ? [...input.player.inventory] : [...input.player.inventory, config.itemId]
  const nextPlayer: PlayerState = { ...input.player, experience: input.player.experience + config.experience, silver: input.player.silver + config.silver, inventory }
  const nextWorld: WorldState = {
    ...input.world,
    currentChapter: config.chapterId,
    [config.mainlineFlag]: true,
    [config.bossReadyFlag]: true,
    [config.defeatedFlag]: true,
    [config.autosaveFlag]: true,
    systemUnlocks: { ...BASE_UNLOCKS, ...input.world.systemUnlocks, ...config.unlocks },
    nextChapterUnlocked: true,
    endingEligible: true,
  }
  const nextChapterEvent = config.nextChapterId ? [event(config, `chapter.unlocked:${config.nextChapterId}`, 'chapter.unlocked', { chapterId: config.nextChapterId })] : []
  const events = [
    event(config, `battle.won:${config.chapterId}:${config.enemyId}`, 'battle.won', { enemyId: config.enemyId }),
    event(config, `enemy.defeated:${config.chapterId}:${config.enemyId}`, 'enemy.defeated', { enemyId: config.enemyId }),
    event(config, `item.granted:${config.chapterId}:${String(config.itemId)}`, 'item.granted', { itemId: config.itemId, grantKey: config.rewardKey }),
    ...Object.entries(config.unlocks).filter(([, value]) => value).map(([systemId]) => event(config, `system.unlocked:${config.chapterId}:${systemId}`, 'system.unlocked', { systemId })),
    ...nextChapterEvent,
    ...(chapterId === 'ch08' ? [event(config, 'ending.eligible:ch08', 'ending.eligible', { chapterId: 'ch08' })] : []),
    event(config, `autosave.checkpoint:${config.chapterId}:${config.enemyId}`, 'autosave.checkpoint', { trigger: 'battle_won' }),
  ]
  return { status: 'settled', player: nextPlayer, quests: input.quests.map((quest) => ({ ...quest })), world: nextWorld, events, autoSaveTrigger: 'battle_won' }
}

export const settleCh05BossVictory = (input: LateBossVictoryInput) => settleLateChapterBossVictory('ch05', input)
export const settleCh06BossVictory = (input: LateBossVictoryInput) => settleLateChapterBossVictory('ch06', input)
export const settleCh07BossVictory = (input: LateBossVictoryInput) => settleLateChapterBossVictory('ch07', input)
export const settleCh08BossVictory = (input: LateBossVictoryInput) => settleLateChapterBossVictory('ch08', input)
