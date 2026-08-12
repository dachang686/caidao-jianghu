import { expect, test, type Page } from '@playwright/test'
import { clearV2Save, wrapM1Snapshot, writeV2AutoSave } from './helpers/journey'

async function clearSave(page: Page) {
  await clearV2Save(page)
}

async function seedChapterThreeSnapshot(page: Page) {
  const m1 = await page.evaluate(() => {
    const save = {
      version: 1,
      savedAt: new Date().toISOString(),
      screen: 'jianghu',
      player: {
        name: '快照试刀客',
        talent: 'thickSkinned',
        level: 1,
        experience: 42,
        nextLevelExperience: 100,
        hp: 115,
        maxHp: 115,
        qi: 55,
        maxQi: 55,
        silver: 70,
        moral: 0,
        stats: { attack: 18, defense: 12, speed: 10, crit: 0.08, dodge: 0.06, accuracy: 0.9 },
        inventory: ['stalePill', 'erguotou', 'rustyCleaver', 'qingheBadge'],
        equippedWeapon: 'rustyCleaver',
        activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'],
        titles: [],
      },
      quests: [
        { id: 'firstSteps', status: 'complete', progress: 1 },
        { id: 'findCat', status: 'complete', progress: 1 },
        { id: 'challengeBai', status: 'complete', progress: 1 },
      ],
      world: {
        currentChapter: 'ch03',
        oldManMet: true,
        catQuestAccepted: true,
        catChoice: 'coax',
        catResolved: true,
        baiDefeated: true,
        npcClickCounts: {},
        damageTakenHits: 0,
        narratorSeen: [],
        lastNarratorAt: 0,
        tipsyNextBattle: false,
        systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: false, cooking: false },
        nextChapterUnlocked: true,
        endingEligible: true,
        ch01AutosaveCheckpoint: true,
        ch02MainlineComplete: true,
        ch02BossReady: true,
        ch02BangsiDefeated: true,
        ch02AutosaveCheckpoint: true,
        ch03MainlineComplete: false,
        ch03BossReady: false,
        ch03BlackwindLeaderDefeated: false,
        ch03AutosaveCheckpoint: false,
      },
      settings: {
        reducedMotion: false,
        masterMuted: true,
        bgmEnabled: false,
        sfxEnabled: false,
        sillySfxEnabled: false,
        masterVolume: 1,
        musicVolume: 0.55,
        sfxVolume: 0.75,
        sillyVolume: 0.8,
        memeDensity: 'standard',
        textSpeed: 'standard',
        difficulty: 'standard',
        keyBindings: { confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] },
        aiEnhancement: { enabled: false, provider: 'none' },
      },
      rngState: 987654321,
      unlockables: { version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] },
    }
    return save
  })
  await writeV2AutoSave(page, wrapM1Snapshot('ch03', m1))
  await page.reload()
}

async function finishBlackwindBattle(page: Page) {
  const firstSkill = page.locator('[data-skill-slot]').first()
  for (let turn = 0; turn < 120; turn += 1) {
    if (await page.getByTestId('battle-victory').isVisible()) return
    if (await page.getByTestId('battle-defeat').isVisible()) {
      await page.getByTestId('battle-retry').click()
      continue
    }
    await firstSkill.click()
  }
  await expect(page.getByTestId('battle-victory')).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await clearSave(page)
  await seedChapterThreeSnapshot(page)
})

test('第 3 章快照可完成调查、黑风寨主、自动档并返回山寨', async ({ page }) => {
  await expect(page.getByTestId('ch03-investigate')).toBeVisible()
  await expect(page.getByTestId('ch03-battle-call')).toBeDisabled()

  await page.getByTestId('ch03-investigate').click()
  await expect(page.getByTestId('ch03-investigate')).toBeDisabled()
  await page.getByTestId('ch03-battle-call').click()
  await expect(page.getByText('黑风寨主', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/空旗/).first()).toBeVisible()
  await finishBlackwindBattle(page)

  await expect(page.getByText('技能树、烹饪已解锁')).toBeVisible()
  await expect(page.getByTestId('presentation-cue')).toBeVisible()
  const skipPresentation = page.getByRole('button', { name: '跳过演出' })
  if (await skipPresentation.isVisible()) await skipPresentation.click()
  await page.getByRole('button', { name: '回到黑风寨' }).click()
  await expect(page.getByText('黑风寨主宣布', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: '黑风寨主服了' })).toBeDisabled()

  await page.waitForTimeout(450)
  await page.reload()
  await expect(page.getByRole('region', { name: '黑风寨山寨门' })).toBeVisible()
  await expect(page.getByRole('button', { name: '黑风寨主服了' })).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
})
