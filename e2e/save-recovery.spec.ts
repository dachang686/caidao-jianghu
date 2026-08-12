import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { clearLegacySave, startNewGame } from './helpers/journey'

async function corruptLegacyAutomaticSave(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(async () => await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('caidao-jianghu', 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction('saves', 'readwrite')
      transaction.objectStore('saves').put({ broken: true }, 'slot-1')
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }))
}

test.describe('存档恢复与失败边界', () => {
  test('损坏自动档显示恢复面板，临时档恢复后不覆盖原损坏记录', async ({ page }) => {
    await clearLegacySave(page)
    await startNewGame(page, '恢复客')
    await page.waitForTimeout(450)
    await corruptLegacyAutomaticSave(page)
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
    await clearLegacySave(page)
    await startNewGame(page, '导出客')
    await page.waitForTimeout(450)
    await page.locator('.header-tools button').nth(2).click()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出存档' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
    const exported = JSON.parse(readFileSync(downloadPath!, 'utf8')) as { player: { name: string } }
    exported.player.name = '导入客'

    await page.locator('input[type="file"]').setInputFiles({
      name: 'imported-save.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(exported)),
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
})
