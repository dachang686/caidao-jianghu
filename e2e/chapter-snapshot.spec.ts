import { expect, test } from '@playwright/test'
import { assertGameSaveV2Fixture, makeGameSaveV2Fixture, SNAPSHOT_CHAPTERS, toLegacyChapterFixture } from './fixtures/game-save-v2'

test.describe('GameSaveV2 chapter snapshots', () => {
  for (const chapterId of SNAPSHOT_CHAPTERS) {
    test(`${chapterId} fixture passes schema and exposes chapter metadata`, async ({ page }) => {
      const result = assertGameSaveV2Fixture(chapterId)
      expect(result).toEqual({ schemaVersion: 2, chapterId })
      const save = makeGameSaveV2Fixture(chapterId)
      const legacy = toLegacyChapterFixture(save)
      expect(legacy.screen).toBe('jianghu')
      expect((legacy.world as { currentChapter: string }).currentChapter).toBe(chapterId)

      await page.goto('/caidao-jianghu/')
      await expect(page.getByRole('button', { name: /开始游戏/ })).toBeVisible()
    })
  }
})
