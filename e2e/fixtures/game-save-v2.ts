import { createMinimalGameSaveV2, parseGameSaveV2 } from '../../src/systems/save/schema'
import type { GameSaveV2 } from '../../src/types/save'

export const SNAPSHOT_CHAPTERS = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08'] as const
export type SnapshotChapter = typeof SNAPSHOT_CHAPTERS[number]

/**
 * E2E fixtures are authored as GameSaveV2 first. The current visual shell still
 * reads its legacy IndexedDB adapter, so tests deliberately validate V2 and
 * then use the small adapter below to exercise the visible chapter UI.
 */
export function makeGameSaveV2Fixture(chapterId: SnapshotChapter): GameSaveV2 {
  const base = createMinimalGameSaveV2()
  return parseGameSaveV2({
    ...base,
    chapterId,
    world: {
      ...base.world,
      currentRegionId: `region:${chapterId}`,
      currentLocationId: `location:${chapterId}`,
      unlockedRegionIds: [`region:${chapterId}`],
    },
    flags: { [`snapshot:${chapterId}`]: true },
    contentKeys: [`chapter:${chapterId}`],
    defeatedEnemyIds: [`enemy:${chapterId}:boss`],
  })
}

export function assertGameSaveV2Fixture(chapterId: SnapshotChapter): { schemaVersion: 2; chapterId: SnapshotChapter } {
  const save = makeGameSaveV2Fixture(chapterId)
  return { schemaVersion: save.schemaVersion, chapterId: save.chapterId as SnapshotChapter }
}

/** Map the validated V2 snapshot to the existing visible-shell adapter. */
export function toLegacyChapterFixture(save: GameSaveV2): Record<string, unknown> {
  const chapterId = save.chapterId as SnapshotChapter
  const completed = (chapter: SnapshotChapter) => SNAPSHOT_CHAPTERS.indexOf(chapter) < SNAPSHOT_CHAPTERS.indexOf(chapterId)
  return {
    version: 1,
    savedAt: save.savedAt,
    screen: 'jianghu',
    player: {
      name: 'V2 快照客', talent: 'thickSkinned', level: 4, experience: 500, nextLevelExperience: 700,
      hp: 500, maxHp: 500, qi: 80, maxQi: 80, silver: 500, moral: 0,
      stats: { attack: 80, defense: 80, speed: 10, crit: .1, dodge: .08, accuracy: .99 },
      inventory: ['stalePill', 'erguotou', 'rustyCleaver', 'qingyunMark'], equippedWeapon: 'rustyCleaver',
      activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'], titles: [],
    },
    quests: [
      { id: 'firstSteps', status: 'complete', progress: 1 },
      { id: 'findCat', status: 'complete', progress: 1 },
      { id: 'challengeBai', status: 'complete', progress: 1 },
    ],
    world: {
      currentChapter: chapterId, oldManMet: true, catQuestAccepted: true, catChoice: 'coax', catResolved: true,
      baiDefeated: true, npcClickCounts: {}, damageTakenHits: 0, narratorSeen: [], lastNarratorAt: 0, tipsyNextBattle: false,
      systemUnlocks: {
        dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true,
        skillTree: true, cooking: true, advancedIntent: true, equipmentStrengthening: true, sectCreation: true,
        tickDispatch: true, advancedCommissions: true, discipleEvents: true, endingRouteLock: true, fourEndings: true, postgameContinue: false,
      },
      nextChapterUnlocked: true, endingEligible: true, ch01AutosaveCheckpoint: true,
      ch02MainlineComplete: completed('ch02'), ch02BossReady: completed('ch02'), ch02BangsiDefeated: completed('ch02'), ch02AutosaveCheckpoint: completed('ch02'),
      ch03MainlineComplete: completed('ch03'), ch03BossReady: completed('ch03'), ch03BlackwindLeaderDefeated: completed('ch03'), ch03AutosaveCheckpoint: completed('ch03'),
      ch04MainlineComplete: completed('ch04'), ch04BossReady: completed('ch04'), ch04QingyunMasterDefeated: completed('ch04'), ch04AutosaveCheckpoint: completed('ch04'),
      ch05MainlineComplete: completed('ch05'), ch05BossReady: completed('ch05'), ch05TwinBanditsDefeated: completed('ch05'), ch05AutosaveCheckpoint: completed('ch05'),
      ch06MainlineComplete: completed('ch06'), ch06BossReady: completed('ch06'), ch06TideMasterDefeated: completed('ch06'), ch06AutosaveCheckpoint: completed('ch06'),
      ch07MainlineComplete: completed('ch07'), ch07BossReady: completed('ch07'), ch07RankingGovernorDefeated: completed('ch07'), ch07AutosaveCheckpoint: completed('ch07'),
      ch08MainlineComplete: false, ch08BossReady: false, ch08RankingMasterDefeated: false, ch08AutosaveCheckpoint: false,
    },
    settings: {
      reducedMotion: false, masterMuted: true, bgmEnabled: false, sfxEnabled: false, sillySfxEnabled: false,
      masterVolume: 1, musicVolume: .55, sfxVolume: .75, sillyVolume: .8, memeDensity: 'standard', textSpeed: 'standard', difficulty: 'standard',
      keyBindings: { confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] },
      aiEnhancement: { enabled: false, provider: 'none' },
    },
    rngState: save.rng.state,
    unlockables: { version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] },
  }
}
