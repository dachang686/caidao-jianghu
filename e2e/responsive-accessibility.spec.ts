import { expect, test } from '@playwright/test'
import { clearV2Save, startNewGame } from './helpers/journey'

const VIEWPORTS = [
  { name: 'small-phone', width: 360, height: 800 },
  { name: 'phone', width: 412, height: 915 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 },
] as const

async function assertContained(page: import('@playwright/test').Page, selector: string): Promise<void> {
  const box = await page.locator(selector).first().boundingBox()
  const viewport = page.viewportSize()!
  expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
  expect(box!.y).toBeGreaterThanOrEqual(-1)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1)
}

test.describe('响应式与可访问性审计', () => {
  test('菜单、江湖页、设置、图鉴和老板键在五档视口可操作', async ({ page }) => {
    await clearV2Save(page)
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await expect(page.getByRole('button', { name: /开始游戏/ })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      await assertContained(page, '.menu-action--primary')
      expect((await page.locator('.menu-action--primary').boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }

    await startNewGame(page, '无障碍客')
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      await assertContained(page, '.village-stage')
      await assertContained(page, '.header-tools')
      const buttonSizes = await page.locator('button').evaluateAll((buttons) => buttons.filter((button) => {
        const rect = button.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      }).map((button) => {
        const rect = button.getBoundingClientRect()
        return { text: button.textContent?.trim().slice(0, 16), width: rect.width, height: rect.height }
      }))
      expect(buttonSizes.filter((button) => button.width < 44 || button.height < 44)).toEqual([])

      await page.locator('.header-tools button').nth(1).click()
      await expect(page.getByRole('heading', { name: '小小图鉴' })).toBeVisible()
      await assertContained(page, '.overlay-panel')
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBeVisible()
      await page.locator('.dialogue-close').click()

      await page.locator('.header-tools button').nth(2).click()
      await page.getByLabel('减少动态效果').check()
      await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true')
      await page.locator('.dialogue-close').click()
    }

    await page.getByRole('button', { name: '老板键' }).click()
    await expect(page.getByTestId('boss-key-screen')).toBeVisible()
    await expect(page.getByRole('button', { name: '返回采购现场' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.getByText(/江湖传闻/)).toBeVisible()

    for (const label of ['背包', '武功', '装备']) {
      await page.getByRole('button', { name: new RegExp(label) }).click()
      await expect(page.locator('.dialogue-close')).toHaveCount(1)
      await page.locator('.dialogue-close').click()
      await expect(page.locator('.overlay-panel')).toHaveCount(0)
    }
  })
})
