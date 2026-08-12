import type { QuestState, WorldState } from '../game/types'
import { createMinimalGameSaveV2, parseGameSaveV2 } from '../systems/save'
import type { GameSaveV2 } from '../types/save'
import type { RootGameStore } from './root-store'

function taskStatus(status: QuestState['status']): 'locked' | 'available' | 'active' | 'ready' | 'completed' {
  return status === 'complete' ? 'completed' : status
}

function worldFlags(world: WorldState, playerTitles: readonly string[]): Record<string, boolean> {
  const flags: Record<string, boolean> = {}
  Object.entries(world).forEach(([key, value]) => {
    if (typeof value === 'boolean') flags['world:' + key] = value
  })
  Object.entries(world.systemUnlocks).forEach(([key, value]) => {
    flags['unlock:' + key] = value
  })
  playerTitles.forEach((titleId) => { flags['title:' + titleId] = true })
  return flags
}

function defeatedEnemyIds(world: WorldState): string[] {
  const enemies: readonly [string, boolean][] = [
    ['enemy:bai-daxia', world.baiDefeated],
    ['enemy:bangsi', world.ch02BangsiDefeated],
    ['enemy:blackwind-leader', world.ch03BlackwindLeaderDefeated],
    ['enemy:qingyun-master', world.ch04QingyunMasterDefeated],
    ['enemy:twin-bandits', world.ch05TwinBanditsDefeated],
    ['enemy:tide-master', world.ch06TideMasterDefeated],
    ['enemy:ranking-governor', world.ch07RankingGovernorDefeated],
    ['enemy:ranking-master', world.ch08RankingMasterDefeated],
  ]
  return enemies.flatMap(([enemyId, defeated]) => defeated ? [enemyId] : [])
}

/**
 * 将当前运行态编码进受 schema 约束的 V2 存档。
 * 服务对象不参与序列化；章节任务、探索与采集状态写入 V2 存档。
 */
function persistedScreen(screen: RootGameStore['screen']): GameSaveV2['runtime']['screen'] {
  return screen === 'battle' || screen === 'crafting' || screen === 'cooking' || screen === 'sect' || screen === 'worldMap' || screen === 'location'
    ? 'jianghu'
    : screen
}

export function makeGameSaveV2(state: RootGameStore): GameSaveV2 | null {
  if (!state.player) return null
  const base = createMinimalGameSaveV2()
  const defeated = defeatedEnemyIds(state.world)
  return parseGameSaveV2({
    ...base,
    savedAt: new Date().toISOString(),
    chapterId: state.world.currentChapter,
    world: state.worldNavigation,
    npcs: {
      states: Object.entries(state.world.npcClickCounts).map(([npcId, count]) => ({
        npcId,
        favor: 0,
        irritation: count,
        knownInfoIds: [],
      })),
      processedEventIds: state.unlockables.processedEventIds,
    },
    unlockables: state.unlockables,
    player: {
      level: state.player.level,
      experience: state.player.experience,
      moral: state.player.moral,
      fame: defeated.length * 5 + state.player.titles.length * 2,
      wealth: state.player.silver,
      sectProsperity: Object.values(state.sect.facilities).reduce((total, level) => total + level, 0),
    },
    tasks: state.quests.map((quest) => ({ questId: quest.id, status: taskStatus(quest.status), progress: quest.progress })),
    chapterRuntime: state.chapterRuntime,
    items: state.inventoryState.stacks,
    skills: {
      unlockedSkillIds: state.skillProgress.unlockedSkillIds,
      activeSkillIds: state.skillProgress.loadout.filter((skillId): skillId is string => skillId !== null),
      skillPoints: state.skillProgress.earnedSkillPoints - state.skillProgress.spentSkillPoints,
    },
    equipmentLoadout: state.equipmentLoadout,
    equipmentStrengthening: Object.entries(state.equipmentStrengthening).map(([equipmentId, strengthening]) => ({
      equipmentId,
      level: strengthening.level,
      bonus: strengthening.bonus,
      attemptCount: strengthening.attemptCount,
      history: strengthening.history,
    })),
    foodBuffs: state.foodBuffSnapshot,
    recipeIds: [...Object.keys(state.forgingSnapshot.craftedCounts), ...Object.keys(state.cookingSnapshot.cookedCounts)],
    sect: {
      unlocked: state.sect.unlocked,
      facilities: state.sect.facilities,
      discipleIds: state.sect.discipleIds,
      seenDiscipleDialogueIds: state.sect.seenDiscipleDialogueIds,
      benefits: state.sect.benefits,
      claimedUpgradeGrantKeys: state.sect.claimedUpgradeGrantKeys,
      dispatch: state.dispatch,
    },
    commissions: {
      activeIds: state.postgame.commission.active.filter((task) => task.status !== 'claimed').map((task) => task.instanceId),
      completedIds: state.postgame.commission.active.filter((task) => task.status === 'claimed').map((task) => task.instanceId),
    },
    postgame: state.postgame,
    endings: {
      seenIds: state.endingRecordState.seenIds,
      chosenId: state.endingRecordState.chosenId,
    },
    flags: {
      ...worldFlags(state.world, state.player.titles),
      'ui:location_open': state.screen === 'location',
    },
    rng: { algorithm: 'mulberry32', seed: 987654321, state: state.rngState },
    settings: state.settings,
    contentKeys: state.unlockables.unlockedIds,
    defeatedEnemyIds: defeated,
    runtime: {
      screen: persistedScreen(state.screen),
      player: state.player,
      quests: state.quests,
      world: state.world,
      ending: state.endingRecordState,
    },
  })
}
