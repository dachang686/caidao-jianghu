import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { exportGameSave, parseGameSaveExport } from '../src/systems/save'
import { clearV2Save, startNewGame } from './helpers/journey'

async function corruptV2AutomaticSave(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(async () => await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('caidao-jianghu-v2', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction('save-records', 'readwrite')
      transaction.objectStore('save-records').put({ broken: true }, 'auto')
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }))
}

async function savedAtInSlot(page: import('@playwright/test').Page, slotId: string): Promise<string | null> {
  return page.evaluate(async (key) => await new Promise<string | null>((resolve, reject) => {
    const request = indexedDB.open('caidao-jianghu-v2', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction('save-records', 'readonly')
      const read = transaction.objectStore('save-records').get(key)
      read.onsuccess = () => { database.close(); resolve((read.result as { save?: { savedAt?: string } } | undefined)?.save?.savedAt ?? null) }
      read.onerror = () => reject(read.error)
    }
  }), slotId)
}

test.describe('存档恢复与失败边界', () => {
  test('损坏自动档显示恢复面板，临时档恢复后不覆盖原损坏记录', async ({ page }) => {
    await clearV2Save(page)
    await startNewGame(page, '恢复客')
    await page.waitForTimeout(450)
    await corruptV2AutomaticSave(page)
    await page.reload()

    const panel = page.getByTestId('save-recovery-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText(/没有覆盖你的有效进度/)).toBeVisible()
    await expect(panel.getByRole('button', { name: '恢复临时档' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '重新验证自动档' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '导出当前数据' })).toBeVisible()
    await expect(panel.getByRole('button', { name: '清除损坏自动档' })).toBeVisible()

    await panel.getByRole('button', { name: '恢复临时档' }).click()
    await expect(page.getByTestId('save-recovery-panel')).toHaveCount(0)
    await expect(page.getByText('恢复客', { exact: true }).first()).toBeVisible()
  })

  test('玩家可通过可见设置面板导出并导入合法存档，非法 JSON 不覆盖当前档', async ({ page }) => {
    await clearV2Save(page)
    await startNewGame(page, '导出客')
    await page.waitForTimeout(450)
    await page.locator('.header-tools button').nth(2).click()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出存档' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
    const exported = parseGameSaveExport(readFileSync(downloadPath!, 'utf8'))
    const imported = {
      ...exported,
      runtime: { ...exported.runtime, player: { ...exported.runtime.player, name: '导入客' } },
    }

    await page.locator('input[type="file"]').setInputFiles({
      name: 'imported-save.json',
      mimeType: 'application/json',
      buffer: Buffer.from(exportGameSave(imported)),
    })
    await expect(page.getByText('导入客', { exact: true }).first()).toBeVisible()

    await page.locator('.header-tools button').nth(2).click()
    const dialogPromise = page.waitForEvent('dialog')
    await page.locator('input[type="file"]').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') })
    const dialog = await dialogPromise
    expect(dialog.message()).toMatch(/JSON|导入|账本/)
    await dialog.dismiss()
    await expect(page.getByText('导入客', { exact: true }).first()).toBeVisible()
  })

  test('设置页提供三手动档，且对白与战斗中途不覆盖权威自动档', async ({ page }) => {
    await clearV2Save(page)
    await startNewGame(page, '多档客')
    await page.waitForTimeout(450)
    await page.locator('.header-tools button').nth(2).click()
    for (const label of ['保存档 1', '保存档 2', '保存档 3']) await page.getByRole('button', { name: label }).click()
    for (const slot of ['manual-1', 'manual-2', 'manual-3']) expect(await savedAtInSlot(page, slot)).not.toBeNull()
    await page.getByRole('button', { name: '关闭面板' }).click()

    const beforeDialogue = await savedAtInSlot(page, 'auto')
    await page.locator('[data-hotspot="old-man"]').click()
    await page.waitForTimeout(450)
    expect(await savedAtInSlot(page, 'auto')).toBe(beforeDialogue)
    await page.getByRole('button', { name: /弟子愿闻其详/ }).click()
    await page.waitForTimeout(450)
    const beforeBattle = await savedAtInSlot(page, 'auto')

    await page.locator('[data-hotspot="bai-daxia"]').click()
    await page.getByRole('button', { name: '菜刀已饥渴难耐' }).click()
    await expect(page.locator('.battle-screen')).toBeVisible()
    await page.waitForTimeout(450)
    expect(await savedAtInSlot(page, 'auto')).toBe(beforeBattle)
  })
})
