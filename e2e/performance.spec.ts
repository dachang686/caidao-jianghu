import { expect, test } from '@playwright/test'
import { clearV2Save, startNewGame } from './helpers/journey'

test.describe('性能与资源预算', () => {
  test('首屏资源、布局和重复面板打开保持在预算内', async ({ page }) => {
    await clearV2Save(page)
    await startNewGame(page, '性能客')
    await page.waitForLoadState('networkidle')

    const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, transferSize: (entry as PerformanceResourceTiming).transferSize })))
    expect(resources.some((resource) => /https?:\/\/(?!127\.0\.0\.1)/.test(resource.name))).toBe(false)
    expect(resources.reduce((sum, resource) => sum + resource.transferSize, 0)).toBeLessThan(5 * 1024 * 1024)

    const initialListeners = await page.evaluate(() => performance.getEntriesByType('resource').length)
    for (let cycle = 0; cycle < 12; cycle += 1) {
      await page.locator('.header-tools button').nth(1).click()
      await expect(page.getByRole('heading', { name: '小小图鉴' })).toBeVisible()
      await page.locator('.dialogue-close').click()
      await page.locator('.header-tools button').nth(2).click()
      await expect(page.getByRole('heading', { name: '掌柜的' })).toBeVisible()
      await page.locator('.dialogue-close').click()
    }
    const finalResources = await page.evaluate(() => performance.getEntriesByType('resource').length)
    expect(finalResources).toBeLessThanOrEqual(initialListeners + 20)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  })
})
