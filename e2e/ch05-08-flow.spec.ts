import { expect, test, type Page } from '@playwright/test'

type Chapter = 'ch05' | 'ch06' | 'ch07' | 'ch08'
const CHAPTERS: Record<Chapter, { title: string; boss: string; unlocks: string; investigation: string }> = {
  ch05: { title: '西域驿路场景', boss: '驿路双煞', unlocks: '自建门派、Tick 派遣', investigation: 'ch05-investigate' },
  ch06: { title: '东海镇场景', boss: '海潮帮主', unlocks: '委托进阶、门人事件', investigation: 'ch06-investigate' },
  ch07: { title: '京城场景', boss: '榜司督主', unlocks: '结局路线锁定', investigation: 'ch07-investigate' },
  ch08: { title: '武林大会场景', boss: '百晓榜主', unlocks: '四结局、通关后继续', investigation: 'ch08-investigate' },
}

async function clearSave(page: Page) {
  await page.goto('/caidao-jianghu/')
  await page.evaluate(async () => await new Promise<void>((resolve) => { const request = indexedDB.deleteDatabase('caidao-jianghu'); request.onsuccess = () => resolve(); request.onerror = () => resolve(); request.onblocked = () => resolve() }))
}

async function seedChapter(page: Page, chapter: Chapter) {
  await page.evaluate(async (currentChapter) => {
    const save = {
      version: 1, savedAt: new Date().toISOString(), screen: 'jianghu',
      player: { name: '后四章快照客', talent: 'thickSkinned', level: 4, experience: 500, nextLevelExperience: 700, hp: 500, maxHp: 500, qi: 80, maxQi: 80, silver: 500, moral: 0, stats: { attack: 80, defense: 80, speed: 10, crit: .1, dodge: .08, accuracy: .99 }, inventory: ['stalePill', 'erguotou', 'rustyCleaver', 'qingyunMark'], equippedWeapon: 'rustyCleaver', activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'], titles: [] },
      quests: [{ id: 'firstSteps', status: 'complete', progress: 1 }, { id: 'findCat', status: 'complete', progress: 1 }, { id: 'challengeBai', status: 'complete', progress: 1 }],
      world: { currentChapter, oldManMet: true, catQuestAccepted: true, catChoice: 'coax', catResolved: true, baiDefeated: true, npcClickCounts: {}, damageTakenHits: 0, narratorSeen: [], lastNarratorAt: 0, tipsyNextBattle: false, systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true, advancedIntent: true, equipmentStrengthening: true }, nextChapterUnlocked: true, endingEligible: true, ch01AutosaveCheckpoint: true, ch02MainlineComplete: true, ch02BossReady: true, ch02BangsiDefeated: true, ch02AutosaveCheckpoint: true, ch03MainlineComplete: true, ch03BossReady: true, ch03BlackwindLeaderDefeated: true, ch03AutosaveCheckpoint: true, ch04MainlineComplete: true, ch04BossReady: true, ch04QingyunMasterDefeated: true, ch04AutosaveCheckpoint: true },
      settings: { reducedMotion: false, masterMuted: true, bgmEnabled: false, sfxEnabled: false, sillySfxEnabled: false, masterVolume: 1, musicVolume: .55, sfxVolume: .75, sillyVolume: .8, memeDensity: 'standard', textSpeed: 'standard', difficulty: 'standard', keyBindings: { confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] }, aiEnhancement: { enabled: false, provider: 'none' } },
      rngState: 987654321, unlockables: { version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] },
    }
    await new Promise<void>((resolve, reject) => { const request = indexedDB.open('caidao-jianghu', 1); request.onerror = () => reject(request.error); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('saves')) request.result.createObjectStore('saves') }; request.onsuccess = () => { const database = request.result; const transaction = database.transaction('saves', 'readwrite'); transaction.objectStore('saves').put(save, 'slot-1'); transaction.oncomplete = () => { database.close(); resolve() }; transaction.onerror = () => reject(transaction.error) } })
  }, chapter)
  await page.reload()
}

async function finishBattle(page: Page) {
  const firstSkill = page.locator('[data-skill-slot]').first()
  for (let turn = 0; turn < 180; turn += 1) {
    if (await page.getByTestId('battle-victory').isVisible()) return
    if (await page.getByTestId('battle-defeat').isVisible()) { await page.getByTestId('battle-retry').click(); continue }
    await firstSkill.click()
  }
  await expect(page.getByTestId('battle-victory')).toBeVisible()
}

for (const chapter of Object.keys(CHAPTERS) as Chapter[]) {
  test(`${chapter} 快照可完成调查、Boss 和解锁`, async ({ page }) => {
    await clearSave(page)
    await seedChapter(page, chapter)
    const config = CHAPTERS[chapter]
    await expect(page.getByTestId(config.investigation)).toBeVisible()
    await expect(page.getByTestId(`${chapter}-battle-call`)).toBeDisabled()
    await page.getByTestId(config.investigation).click()
    await expect(page.getByTestId(config.investigation)).toBeDisabled()
    await page.getByTestId(`${chapter}-battle-call`).click()
    await expect(page.getByText(config.boss, { exact: true }).first()).toBeVisible()
    await finishBattle(page)
    await expect(page.getByText(config.unlocks)).toBeVisible()
    await expect(page.getByTestId('presentation-cue')).toBeVisible()
    const skip = page.getByRole('button', { name: '跳过演出' })
    if (await skip.isVisible()) await skip.click()
    await page.getByRole('button', { name: new RegExp(`回到`) }).click()
    if (chapter === 'ch08') {
      await expect(page.getByTestId('ending-screen')).toBeVisible()
      const endingChoice = page.locator('.ending-choices button').first()
      await endingChoice.click()
      await endingChoice.click()
      await expect(page.getByRole('button', { name: '继续原档' })).toBeVisible()
      await page.getByRole('button', { name: '继续原档' }).click()
      await expect(page.getByText(/江湖传闻|章节传闻/)).toBeVisible()
    } else {
      await expect(page.getByRole('button', { name: new RegExp(`${config.boss}服了`) })).toBeDisabled()
    }
    await page.waitForTimeout(450)
    await page.reload()
    await expect(page.getByTestId(`${chapter}-battle-call`)).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  })
}
