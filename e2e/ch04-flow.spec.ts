import { expect, test, type Page } from '@playwright/test'

async function clearSave(page: Page) {
  await page.goto('/caidao-jianghu/')
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('caidao-jianghu')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  })
}

async function seedChapterFourSnapshot(page: Page) {
  await page.evaluate(async () => {
    const save = {
      version: 1,
      savedAt: new Date().toISOString(),
      screen: 'jianghu',
      player: {
        name: '青云快照客',
        talent: 'thickSkinned',
        level: 1,
        experience: 114,
        nextLevelExperience: 160,
        hp: 115,
        maxHp: 115,
        qi: 55,
        maxQi: 55,
        silver: 120,
        moral: 0,
        stats: { attack: 18, defense: 12, speed: 10, crit: 0.08, dodge: 0.06, accuracy: 0.9 },
        inventory: ['stalePill', 'erguotou', 'rustyCleaver', 'qingheBadge', 'blackwindSeal'],
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
        currentChapter: 'ch04',
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
        systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true, advancedIntent: false, equipmentStrengthening: false },
        nextChapterUnlocked: true,
        endingEligible: true,
        ch01AutosaveCheckpoint: true,
        ch02MainlineComplete: true,
        ch02BossReady: true,
        ch02BangsiDefeated: true,
        ch02AutosaveCheckpoint: true,
        ch03MainlineComplete: true,
        ch03BossReady: true,
        ch03BlackwindLeaderDefeated: true,
        ch03AutosaveCheckpoint: true,
        ch04MainlineComplete: false,
        ch04BossReady: false,
        ch04QingyunMasterDefeated: false,
        ch04AutosaveCheckpoint: false,
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
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('caidao-jianghu', 1)
      request.onerror = () => reject(request.error)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('saves')) request.result.createObjectStore('saves')
      }
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction('saves', 'readwrite')
        transaction.objectStore('saves').put(save, 'slot-1')
        transaction.oncomplete = () => { database.close(); resolve() }
        transaction.onerror = () => reject(transaction.error)
      }
    })
  })
  await page.reload()
}

async function finishQingyunBattle(page: Page) {
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
  await seedChapterFourSnapshot(page)
})

test('第 4 章快照可完成调查、青云掌门、自动档并返回青云山', async ({ page }) => {
  await expect(page.getByTestId('ch04-investigate')).toBeVisible()
  await expect(page.getByTestId('ch04-battle-call')).toBeDisabled()

  await page.getByTestId('ch04-investigate').click()
  await expect(page.getByTestId('ch04-investigate')).toBeDisabled()
  await page.getByTestId('ch04-battle-call').click()
  await expect(page.getByText('青云掌门', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/礼法|门规/).first()).toBeVisible()
  await finishQingyunBattle(page)

  await expect(page.getByText('意图进阶、装备强化已解锁')).toBeVisible()
  await expect(page.getByTestId('presentation-cue')).toBeVisible()
  const skipPresentation = page.getByRole('button', { name: '跳过演出' })
  if (await skipPresentation.isVisible()) await skipPresentation.click()
  await page.getByRole('button', { name: '回到青云山' }).click()
  await expect(page.getByText('青云掌门承认', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: '青云掌门服了' })).toBeDisabled()

  await page.waitForTimeout(450)
  await page.reload()
  await expect(page.getByRole('region', { name: '青云山门石阶' })).toBeVisible()
  await expect(page.getByRole('button', { name: '青云掌门服了' })).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
})
