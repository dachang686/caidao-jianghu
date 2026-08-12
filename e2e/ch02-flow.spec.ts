import { expect, test, type Page } from '@playwright/test'
import { buildV2SaveFromRuntime, clearV2Save, writeV2AutoSave } from './helpers/journey'

async function clearSave(page: Page) {
  await clearV2Save(page)
}

async function seedChapterTwoSnapshot(page: Page) {
  const runtime = await page.evaluate(() => {
    const save = {
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
        inventory: ['stalePill', 'erguotou', 'rustyCleaver'],
        equippedWeapon: 'rustyCleaver',
        activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'],
        titles: ['cleaverNovice'],
      },
      quests: [
        { id: 'firstSteps', status: 'complete', progress: 1 },
        { id: 'findCat', status: 'complete', progress: 1 },
        { id: 'challengeBai', status: 'complete', progress: 1 },
      ],
      world: {
        currentChapter: 'ch02',
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
        systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: false, gathering: false, forging: false },
        nextChapterUnlocked: true,
        endingEligible: true,
        ch01AutosaveCheckpoint: true,
        ch02MainlineComplete: false,
        ch02BossReady: false,
        ch02BangsiDefeated: false,
        ch02AutosaveCheckpoint: false,
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
  await writeV2AutoSave(page, buildV2SaveFromRuntime('ch02', runtime))
  await page.reload()
}

async function finishBangsiBattle(page: Page) {
  const firstSkill = page.locator('[data-skill-slot]').first()
  for (let turn = 0; turn < 80; turn += 1) {
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
  await seedChapterTwoSnapshot(page)
})

test('第 2 章两类普通敌人可由清河县场景进入，并在首回合明示意图', async ({ page }) => {
  await page.getByTestId('ch02-ranking-scribe').click()
  await expect(page.getByText('榜纸抄手', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('朱笔横批', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '暂离擂台' }).click()

  await page.getByTestId('ch02-bridge-skulker').click()
  await expect(page.getByText('桥边扒手', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('油纸伞戳', { exact: true })).toBeVisible()
})

test('第 2 章快照可完成调查、榜下捕快、自动档并返回清河县', async ({ page }) => {
  await expect(page.getByTestId('ch02-battle-call')).toBeDisabled()

  await page.getByTestId('ch02-dialogue').click()
  const dialogue = page.getByTestId('chapter-dialogue-overlay')
  await expect(dialogue).toContainText('清河县的街市')
  await dialogue.getByRole('button', { name: '问沈青禾百晓榜怎么记名' }).click()
  await expect(dialogue).toContainText('空白竹册')
  await dialogue.getByRole('button', { name: '关闭章节对白' }).click()

  for (const step of ['ch02-step-registrar', 'ch02-step-board', 'ch02-step-boatwoman', 'ch02-step-tea']) await page.getByTestId(step).click()
  await page.getByTestId('ch02-battle-call').click()
  await expect(page.getByText('榜下捕快', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/空白卷宗/)).toBeVisible()
  await finishBangsiBattle(page)

  await expect(page.getByText('装备、采集、锻造已解锁')).toBeVisible()
  await expect(page.getByTestId('presentation-cue')).toBeVisible()
  const skipPresentation = page.getByRole('button', { name: '跳过演出' })
  if (await skipPresentation.isVisible()) await skipPresentation.click()
  await page.getByRole('button', { name: '回到清河县' }).click()
  await expect(page.getByText('榜下捕快已经盖章', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: '榜下捕快服了' })).toBeDisabled()

  await page.waitForTimeout(450)
  await page.reload()
  await expect(page.getByRole('region', { name: '清河县百晓榜街市' })).toBeVisible()
  await expect(page.getByRole('button', { name: '榜下捕快服了' })).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
})
