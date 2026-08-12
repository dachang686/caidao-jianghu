import { test } from '@playwright/test'
import { completeFullJourney } from './helpers/journey'

test.describe('完整黄金路径', () => {
  test.setTimeout(180_000)

  test('从空存档完成八章、结局、通关后循环并刷新恢复', async ({ page }) => {
    await completeFullJourney(page)
    for (let refresh = 0; refresh < 3; refresh += 1) {
      await page.reload()
      await page.waitForLoadState('domcontentloaded')
      await page.getByText(/江湖传闻|章节传闻/).waitFor()
    }
  })
})
