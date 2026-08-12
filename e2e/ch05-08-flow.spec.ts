import { expect, test, type Page } from '@playwright/test'
import { buildV2SaveFromRuntime, clearV2Save, writeV2AutoSave } from './helpers/journey'

type Chapter = 'ch05' | 'ch06' | 'ch07' | 'ch08'
const CHAPTERS: Record<Chapter, { title: string; boss: string; unlocks: string; steps: readonly string[]; normals: readonly { readonly id: string; readonly name: string; readonly intent: string }[] }> = {
  ch05: { title: '西域驿路场景', boss: '驿路双煞', unlocks: '自建门派、Tick 派遣', steps: ['ch05-step-western-courier', 'ch05-step-ch05:station:manifest', 'ch05-step-western-guard', 'ch05-step-ch05:sand-herb'], normals: [{ id: 'ch05:road-raider', name: '车辙劫匪', intent: '车辙突进' }, { id: 'ch05:masked-raider', name: '蒙面驿盗', intent: '车辙突进' }] },
  ch06: { title: '东海镇场景', boss: '海潮帮主', unlocks: '委托进阶、门人事件', steps: ['ch06-step-donghai-boatwoman', 'ch06-step-ch06:market:shells', 'ch06-step-ch06:sea-salt'], normals: [{ id: 'ch06:dock-smuggler', name: '码头私运客', intent: '潮头短打' }, { id: 'ch06:hook-raider', name: '钩浪劫客', intent: '潮头短打' }] },
  ch07: { title: '京城场景', boss: '榜司督主', unlocks: '结局路线锁定', steps: ['ch07-step-capital-clerk', 'ch07-step-ch07:office:ledger', 'ch07-step-ch07:capital-ink'], normals: [{ id: 'ch07:archive-guard', name: '档案守门人', intent: '榜纸拍击' }, { id: 'ch07:ranking-enforcer', name: '榜司执行客', intent: '榜纸拍击' }] },
  ch08: { title: '武林大会场景', boss: '百晓榜主', unlocks: '四结局、通关后继续', steps: ['ch08-step-convention-usher', 'ch08-step-ch08:stage:arena', 'ch08-step-ch08:convention-pepper'], normals: [{ id: 'ch08:rival-martialist', name: '争榜武人', intent: '会场短打' }, { id: 'ch08:convention-enforcer', name: '会场执事', intent: '会场短打' }] },
}

async function clearSave(page: Page) {
  await clearV2Save(page)
}

async function seedChapter(page: Page, chapter: Chapter) {
  const runtime = await page.evaluate((currentChapter) => {
    const completedBefore = (chapterNumber: number) => Number(currentChapter.slice(2)) > chapterNumber
    const save = {
      savedAt: new Date().toISOString(), screen: 'jianghu',
      player: { name: '后四章快照客', talent: 'thickSkinned', level: 4, experience: 500, nextLevelExperience: 700, hp: 500, maxHp: 500, qi: 80, maxQi: 80, silver: 500, moral: 0, stats: { attack: 80, defense: 80, speed: 10, crit: .1, dodge: .08, accuracy: .99 }, inventory: ['stalePill', 'erguotou', 'rustyCleaver', 'qingyunMark'], equippedWeapon: 'rustyCleaver', activeSkills: ['basicSlash', 'cleaverWhirl', 'mockery', 'playDead'], titles: [] },
      quests: [{ id: 'firstSteps', status: 'complete', progress: 1 }, { id: 'findCat', status: 'complete', progress: 1 }, { id: 'challengeBai', status: 'complete', progress: 1 }],
      world: { currentChapter, oldManMet: true, catQuestAccepted: true, catChoice: 'coax', catResolved: true, baiDefeated: true, npcClickCounts: {}, damageTakenHits: 0, narratorSeen: [], lastNarratorAt: 0, tipsyNextBattle: false, systemUnlocks: { dialogue: true, basicCombat: true, inventory: true, equipment: true, gathering: true, forging: true, skillTree: true, cooking: true, advancedIntent: true, equipmentStrengthening: true }, nextChapterUnlocked: true, endingEligible: true, ch01AutosaveCheckpoint: true, ch02MainlineComplete: true, ch02BossReady: true, ch02BangsiDefeated: true, ch02AutosaveCheckpoint: true, ch03MainlineComplete: true, ch03BossReady: true, ch03BlackwindLeaderDefeated: true, ch03AutosaveCheckpoint: true, ch04MainlineComplete: true, ch04BossReady: true, ch04QingyunMasterDefeated: true, ch04AutosaveCheckpoint: true, ch05MainlineComplete: completedBefore(5), ch05BossReady: completedBefore(5), ch05TwinBanditsDefeated: completedBefore(5), ch05AutosaveCheckpoint: completedBefore(5), ch06MainlineComplete: completedBefore(6), ch06BossReady: completedBefore(6), ch06TideMasterDefeated: completedBefore(6), ch06AutosaveCheckpoint: completedBefore(6), ch07MainlineComplete: completedBefore(7), ch07BossReady: completedBefore(7), ch07RankingGovernorDefeated: completedBefore(7), ch07AutosaveCheckpoint: completedBefore(7), ch08MainlineComplete: false, ch08BossReady: false, ch08RankingMasterDefeated: false, ch08AutosaveCheckpoint: false },
      settings: { reducedMotion: false, masterMuted: true, bgmEnabled: false, sfxEnabled: false, sillySfxEnabled: false, masterVolume: 1, musicVolume: .55, sfxVolume: .75, sillyVolume: .8, memeDensity: 'standard', textSpeed: 'standard', difficulty: 'standard', keyBindings: { confirm: ['Enter', 'Space'], cancel: ['Escape'], nextTab: ['Tab'], skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'] }, aiEnhancement: { enabled: false, provider: 'none' } },
      rngState: 987654321, unlockables: { version: 1, unlockedIds: [], claimedRewardIds: [], processedEventIds: [] },
    }
    return save
  }, chapter)
  await writeV2AutoSave(page, buildV2SaveFromRuntime(chapter, runtime))
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
    await expect(page.getByTestId(config.steps[0])).toBeVisible()
    for (const normal of config.normals) {
      await page.getByTestId(normal.id).click()
      await expect(page.getByText(normal.name, { exact: true }).first()).toBeVisible()
      await expect(page.getByText(normal.intent, { exact: true })).toBeVisible()
      await page.getByRole('button', { name: '暂离擂台' }).click()
    }
    await expect(page.getByTestId(`${chapter}-battle-call`)).toBeDisabled()
    for (const step of config.steps) await page.getByTestId(step).click()
    await page.getByTestId(`${chapter}-battle-call`).click()
    await expect(page.getByText(config.boss, { exact: true }).first()).toBeVisible()
    await finishBattle(page)
    await expect(page.getByText(config.unlocks)).toBeVisible()
    await expect(page.getByTestId('presentation-cue')).toBeVisible()
    const skip = page.getByRole('button', { name: '跳过演出' })
    if (await skip.isVisible()) await skip.click()
    await page.getByRole('button', { name: new RegExp(`回到`) }).click()
    if (chapter === 'ch05') {
      await page.getByTestId('open-sect').click()
      await expect(page.getByTestId('sect-screen')).toBeVisible()
      const firstDisciple = page.getByTestId('sect-disciple-disciple:shy-scholar')
      const recruit = firstDisciple.getByRole('button', { name: '招募' })
      await recruit.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByText('沈算盘已加入门派。')).toBeVisible()
      await firstDisciple.getByRole('button', { name: '选择派遣' }).click()
      await page.getByRole('button', { name: '派遣 1 名门人' }).click()
      await expect(page.getByText(/还需 \d+ 场有效战斗/)).toBeVisible()
      await page.getByRole('button', { name: '关闭门派页面' }).click()
      await expect(page.getByTestId('ch05-battle-call')).toBeVisible()
    }
    if (chapter === 'ch08') {
      await expect(page.getByTestId('ending-screen')).toBeVisible()
      const endingChoice = page.locator('.ending-choices button').first()
      await endingChoice.click()
      await endingChoice.click()
      await expect(page.getByRole('button', { name: '继续原档' })).toBeVisible()
      await page.getByRole('button', { name: '继续原档' }).click()
      await expect(page.getByText(/江湖传闻|章节传闻/)).toBeVisible()
      await page.getByTestId('open-sect').click()
      await page.getByTestId('generate-postgame-commission').click()
      await expect(page.getByRole('button', { name: '完成委托' })).toBeVisible()
      await page.getByRole('button', { name: '完成委托' }).click()
      await page.getByRole('button', { name: '领取', exact: true }).click()
      await expect(page.getByText(/已结算：收益回流到门派经营/)).toBeVisible()
    } else {
      await expect(page.getByRole('button', { name: new RegExp(`${config.boss}服了`) })).toBeDisabled()
    }
    await page.waitForTimeout(450)
    await page.reload()
    await expect(page.getByTestId(`${chapter}-battle-call`)).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  })
}
