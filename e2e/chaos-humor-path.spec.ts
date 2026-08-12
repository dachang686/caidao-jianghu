import { expect, test } from '@playwright/test'
import { completeFullJourney } from './helpers/journey'

test.describe('混沌幽默路径', () => {
  test.setTimeout(180_000)

  test('重复 NPC、三档梗密度、老板键、失败重试后仍到达有效结局', async ({ page }) => {
    await completeFullJourney(page, { chaos: true })
    await expect(page.getByText(/江湖传闻|章节传闻/)).toBeVisible()
  })
})
