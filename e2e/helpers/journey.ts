import { expect, type Page } from '@playwright/test'
import { calculateSaveChecksum, createMinimalGameSaveV2, parseGameSaveV2 } from '../../src/systems/save'
import { m1RuntimeSaveSchema } from '../../src/game/save'
import type { GameSaveV2 } from '../../src/types/save'

export async function clearV2Save(page: Page): Promise<void> {
  await page.goto('/caidao-jianghu/')
  await page.evaluate(async () => await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase('caidao-jianghu-v2')
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  }))
  await page.reload()
}

export async function writeV2AutoSave(page: Page, save: GameSaveV2): Promise<void> {
  const serialized = JSON.stringify(save)
  const record = {
    save,
    checksum: calculateSaveChecksum(save),
    summary: {
      slotId: 'auto',
      savedAt: save.savedAt,
      chapterId: save.chapterId,
      level: save.player.level,
      itemCount: save.items.reduce((sum, item) => sum + item.count, 0),
      byteLength: new TextEncoder().encode(serialized).byteLength,
    },
  }
  await page.evaluate(async (nextRecord) => await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('caidao-jianghu-v2', 1)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('save-records')) request.result.createObjectStore('save-records')
      if (!request.result.objectStoreNames.contains('save-summaries')) request.result.createObjectStore('save-summaries')
    }
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(['save-records', 'save-summaries'], 'readwrite')
      transaction.objectStore('save-records').put(nextRecord, 'auto')
      transaction.objectStore('save-summaries').put(nextRecord.summary, 'auto')
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }), record)
}

export function wrapM1Snapshot(chapterId: GameSaveV2['chapterId'], input: unknown): GameSaveV2 {
  const m1 = m1RuntimeSaveSchema.parse(input)
  const itemCounts = new Map<string, number>()
  m1.player.inventory.forEach((itemId) => itemCounts.set(itemId, (itemCounts.get(itemId) ?? 0) + 1))
  const base = createMinimalGameSaveV2()
  return parseGameSaveV2({
    ...base,
    savedAt: m1.savedAt,
    chapterId,
    player: {
      level: m1.player.level,
      experience: m1.player.experience,
      moral: m1.player.moral,
      fame: 0,
      wealth: m1.player.silver,
      sectProsperity: 0,
    },
    tasks: m1.quests.map((quest) => ({ questId: quest.id, status: quest.status === 'complete' ? 'completed' : quest.status, progress: quest.progress })),
    items: [...itemCounts.entries()].map(([itemId, count]) => ({ itemId, count })),
    skills: { unlockedSkillIds: m1.player.activeSkills, activeSkillIds: m1.player.activeSkills, skillPoints: 0 },
    settings: m1.settings,
    unlockables: m1.unlockables,
    rng: { algorithm: 'mulberry32', seed: 987654321, state: m1.rngState },
    m1,
  })
}

export async function startNewGame(page: Page, name = '黄金路径客'): Promise<void> {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByLabel('江湖名号').fill(name)
  await page.getByRole('radio', { name: /厚脸皮/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
}

async function skipPresentation(page: Page): Promise<void> {
  const skip = page.getByRole('button', { name: '跳过演出' })
  if (await skip.count() && await skip.isVisible()) await skip.click()
}

export async function finishBattle(page: Page, maxTurns = 420): Promise<void> {
  const firstSkill = page.locator('[data-skill-slot="1"]')
  const heavySkill = page.locator('[data-skill-slot="2"]')
  const controlSkill = page.locator('[data-skill-slot="3"]')
  const guardSkill = page.locator('[data-skill-slot="4"]')
  for (let turn = 0; turn < maxTurns; turn += 1) {
    if (await page.getByTestId('battle-victory').isVisible()) return
    if (await page.getByTestId('battle-defeat').isVisible()) {
      await page.getByTestId('battle-retry').click()
      continue
    }
    if (await heavySkill.isEnabled()) await heavySkill.click()
    else if (await controlSkill.isEnabled()) await controlSkill.click()
    else if (await guardSkill.isEnabled()) await guardSkill.click()
    else await firstSkill.click()
    await page.waitForTimeout(30)
  }
  await expect(page.getByTestId('battle-victory')).toBeVisible()
}

async function finishChapterBoss(page: Page, chapter: string, returnLabel: string): Promise<void> {
  await page.getByTestId(`${chapter}-investigate`).click()
  await expect(page.getByTestId(`${chapter}-battle-call`)).toBeEnabled()
  await page.getByTestId(`${chapter}-battle-call`).click()
  await expect(page.locator('.battle-screen')).toBeVisible()
  await finishBattle(page)
  await skipPresentation(page)
  await page.getByRole('button', { name: returnLabel }).click()
}

async function runCh01(page: Page, chaos: boolean): Promise<void> {
  await page.locator('[data-hotspot="old-man"]').click()
  await page.getByRole('button', { name: /弟子愿闻其详/ }).click()

  if (chaos) {
    for (let click = 0; click < 4; click += 1) {
      await page.locator('[data-hotspot="old-man"]').click()
      await page.getByRole('button', { name: /多谢前辈/ }).click()
    }
    await page.locator('[data-hotspot="aunt"]').click()
    await page.getByRole('button', { name: '我帮你找' }).click()
    await page.locator('[data-hotspot="dahuang"]').click()
    await page.getByRole('button', { name: '一把强抱回家' }).click()
  }

  await page.locator('[data-hotspot="bai-daxia"]').click()
  await page.getByRole('button', { name: '菜刀已饥渴难耐' }).click()
  await expect(page.locator('.battle-screen')).toBeVisible()

  if (chaos) {
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('boss-key-screen')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.battle-screen')).toBeVisible()
    for (let turn = 0; turn < 20; turn += 1) {
      if (await page.getByTestId('battle-defeat').isVisible() || await page.getByTestId('battle-victory').isVisible()) break
      await page.keyboard.press('1')
      await page.waitForTimeout(18)
    }
    if (await page.getByTestId('battle-defeat').isVisible()) await page.getByTestId('battle-retry').click()
  }

  await finishBattle(page)
  await skipPresentation(page)
  await page.getByRole('button', { name: '回到小愚村' }).click()
  await page.getByTestId('open-ch02').click()
}

async function setAllMemeDensities(page: Page): Promise<void> {
  await page.locator('.header-tools button').nth(2).click()
  const densityGroup = page.getByRole('group', { name: '梗密度' })
  for (const label of ['清淡', '标准', '加辣']) await densityGroup.getByRole('radio', { name: new RegExp(label) }).check()
  await page.getByRole('group', { name: /难度/ }).getByRole('radio', { name: /剧情/ }).check()
  await page.locator('.dialogue-close').click()
}

export async function completeFullJourney(page: Page, options: { chaos?: boolean } = {}): Promise<void> {
  const chaos = options.chaos === true
  await clearV2Save(page)
  await startNewGame(page, chaos ? '混沌路径客' : '黄金路径客')
  if (chaos) await setAllMemeDensities(page)
  await runCh01(page, chaos)

  await finishChapterBoss(page, 'ch02', '回到清河县')
  await page.getByTestId('open-ch03').click()
  await finishChapterBoss(page, 'ch03', '回到黑风寨')
  await page.getByTestId('open-ch04').click()
  await finishChapterBoss(page, 'ch04', '回到青云山')

  await page.getByTestId('open-ch05').click()
  await finishChapterBoss(page, 'ch05', '回到西域驿站')
  await page.getByTestId('open-ch06').click()
  await finishChapterBoss(page, 'ch06', '回到东海镇')
  await page.getByTestId('open-ch07').click()
  await finishChapterBoss(page, 'ch07', '回到京城')
  await page.getByTestId('open-ch08').click()
  await finishChapterBoss(page, 'ch08', '回到武林大会')

  await expect(page.getByTestId('ending-screen')).toBeVisible()
  const endingChoice = page.getByRole('button', { name: /留在榜上领航/ })
  await endingChoice.click()
  await expect(endingChoice).toContainText('再次确认')
  await endingChoice.click()
  await expect(page.getByRole('button', { name: '继续原档' })).toBeVisible()
  await page.getByRole('button', { name: '继续原档' }).click()
  await expect(page.getByText(/江湖传闻|章节传闻/)).toBeVisible()
}
