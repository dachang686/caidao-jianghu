import type { GameSaveV1, QuestState, WorldState } from '../game/types'
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
 * 服务对象不参与序列化；剧情与战斗运行态由 m1 快照恢复。
 */
export function makeGameSaveV2(state: RootGameStore, m1: GameSaveV1 | null): GameSaveV2 | null {
  if (!m1 || !state.player) return null
  const base = createMinimalGameSaveV2()
  const defeated = defeatedEnemyIds(state.world)
  return parseGameSaveV2({
    ...base,
    savedAt: m1.savedAt,
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
      sectProsperity: state.world.systemUnlocks.sectCreation ? 8 : 0,
    },
    tasks: state.quests.map((quest) => ({ questId: quest.id, status: taskStatus(quest.status), progress: quest.progress })),
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
      unlocked: state.world.systemUnlocks.sectCreation,
      facilities: { training: 0, kitchen: 0, forge: 0, intel: 0 },
      discipleIds: [],
      seenDiscipleDialogueIds: [],
      dispatches: [],
    },
    commissions: { activeIds: [], completedIds: [] },
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
    m1,
  })
}

/**
 * M1 画面尚未由 V2 领域对象直接渲染；拒绝不含运行态快照的通用 V2 文件，
 * 以免猜测角色战斗数值并覆盖有效进度。
 */
export function toM1RuntimeSave(save: GameSaveV2): GameSaveV1 {
  if (!save.m1) throw new Error('这份 V2 存档不含 M1 恢复快照，不能安全载入当前版本。')
  return save.m1
}
