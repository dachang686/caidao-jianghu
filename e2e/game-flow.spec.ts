import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/caidao-jianghu/')
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('caidao-jianghu')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  })
  await page.reload()
})

test('创角后可以完成老头教学、找猫并进入白大侠战斗', async ({ page }) => {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByLabel('江湖名号').fill('试刀客')
  await page.getByRole('radio', { name: /厚脸皮/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()

  await expect(page.getByText('试刀客', { exact: true }).first()).toBeVisible()
  await page.locator('[data-hotspot="old-man"]').click()
  await page.getByRole('button', { name: /弟子愿闻其详/ }).click()
  await expect(page.getByText('不正经老头', { exact: true })).toBeVisible()

  await page.locator('[data-hotspot="dahuang"]').click()
  await page.getByRole('button', { name: /我帮你找/ }).click()
  await page.locator('[data-hotspot="dahuang"]').click()
  await page.getByRole('button', { name: '好言相劝' }).click()
  await expect(page.getByText('帮王大娘找猫')).toBeVisible()

  await page.locator('[data-hotspot="bai-daxia"]').click()
  await page.getByRole('button', { name: '菜刀已饥渴难耐' }).click()
  await expect(page.getByText('白大侠', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: /嘴遁/ }).click()
  await expect(page.getByText(/白大侠.*嘴遁|白大侠还在琢磨/)).toBeVisible()
})

test('Esc 老板键能切换并恢复游戏页面', async ({ page }) => {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByText('小愚村第一季度农产品采购表')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText('江湖传闻')).toBeVisible()
})

test('刷新页面后可以继续小愚村旅程', async ({ page }) => {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByLabel('江湖名号').fill('续刀客')
  await page.getByRole('button', { name: '提刀入江湖' }).click()
  await page.locator('[data-hotspot="old-man"]').click()
  await page.getByRole('button', { name: /弟子愿闻其详/ }).click()
  await page.waitForTimeout(350)
  await page.reload()
  await expect(page.getByText('续刀客', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('和不正经老头聊聊')).toBeVisible()
})
