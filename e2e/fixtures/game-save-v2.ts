import { createMinimalGameSaveV2, parseGameSaveV2 } from '../../src/systems/save/schema'
import type { GameSaveV2 } from '../../src/types/save'

export const SNAPSHOT_CHAPTERS = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08'] as const
export type SnapshotChapter = typeof SNAPSHOT_CHAPTERS[number]

/**
 * E2E fixtures are authored as GameSaveV2 first and carry the direct V2 runtime
 * state consumed by the visible chapter UI.
 */
export function makeGameSaveV2Fixture(chapterId: SnapshotChapter): GameSaveV2 {
  const base = createMinimalGameSaveV2()
  return parseGameSaveV2({
    ...base,
    chapterId,
    runtime: {
      ...base.runtime,
      screen: 'jianghu',
      world: { ...base.runtime.world, currentChapter: chapterId },
    },
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
