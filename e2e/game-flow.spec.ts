import { expect, test, type Page } from '@playwright/test'

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

async function enterBattle(page: Page) {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()
  await page.locator('[data-hotspot="old-man"]').click()
  await page.getByRole('button', { name: /弟子愿闻其详/ }).click()
  await page.locator('[data-hotspot="bai-daxia"]').click()
  await page.getByRole('button', { name: '菜刀已饥渴难耐' }).click()
}

async function startJourney(page: Page) {
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()
}

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

test('江湖页会在宽屏与手机视口重新排布，不让场景与信息面板重叠', async ({ page }, testInfo) => {
  const wide = testInfo.project.name === 'desktop'
  await page.setViewportSize(wide ? { width: 1777, height: 965 } : { width: 412, height: 915 })
  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()

  const stage = await page.locator('.village-stage').boundingBox()
  const header = await page.locator('.jianghu-header').boundingBox()
  const actionStack = await page.locator('.action-stack').boundingBox()
  const sceneActions = await page.locator('.scene-actions').boundingBox()
  const narrator = await page.locator('.narrator-toast').boundingBox()
  expect(stage).not.toBeNull()
  expect(header).not.toBeNull()
  expect(actionStack).not.toBeNull()
  expect(sceneActions).not.toBeNull()
  await expect(page.locator('.skill-dock')).toHaveCount(0)
  expect(narrator).not.toBeNull()

  if (wide) {
    const status = await page.locator('.status-panel').boundingBox()
    const rumor = await page.locator('.rumor-panel').boundingBox()
    expect(status).not.toBeNull()
    expect(rumor).not.toBeNull()
    expect(stage!.x).toBeGreaterThanOrEqual(status!.x + status!.width)
    expect(stage!.x + stage!.width).toBeLessThanOrEqual(rumor!.x + 1)
    expect(header!.y + header!.height).toBeLessThanOrEqual(stage!.y + 1)
    expect(actionStack!.x).toBeGreaterThanOrEqual(stage!.x + stage!.width)
    expect(actionStack!.x).toBeGreaterThanOrEqual(narrator!.x + narrator!.width)
  } else {
    expect(header!.y + header!.height).toBeLessThanOrEqual(stage!.y + 1)
    expect(actionStack!.y + actionStack!.height).toBeLessThanOrEqual(915)
    expect(narrator!.y + narrator!.height).toBeLessThanOrEqual(sceneActions!.y + 1)
    await expect(page.locator('.action-stack button').first()).toHaveCSS('min-height', '44px')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  }

  await page.screenshot({ path: `output/playwright/responsive-${testInfo.project.name}.png`, fullPage: true })
})

test('应用壳覆盖五档视口，底部操作区、面板滚动区和战斗区不被裁切', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '五档矩阵只在桌面项目执行一次，避免重复跑同一组视口。')
  const viewports = [
    { width: 360, height: 800 },
    { width: 412, height: 915 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]

  const assertNoHorizontalOverflow = async () => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  }
  const assertInViewport = async (selector: string) => {
    const box = await page.locator(selector).boundingBox()
    const viewport = page.viewportSize()!
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(-1)
    expect(box!.y).toBeGreaterThanOrEqual(-1)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1)
  }
  const assertHorizontallyContained = async (selector: string) => {
    const box = await page.locator(selector).boundingBox()
    const viewport = page.viewportSize()!
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(-1)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
  }

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await expect(page.getByRole('button', { name: /开始游戏/ })).toBeVisible()
    await assertNoHorizontalOverflow()
    await assertInViewport('.menu-action--primary')
    expect((await page.locator('.menu-action--primary').boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }

  await page.getByRole('button', { name: /开始游戏/ }).click()
  await page.getByRole('button', { name: '提刀入江湖' }).click()
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await expect(page.locator('.village-stage')).toBeVisible()
    await expect(page.locator('.header-tools')).toBeVisible()
    await assertNoHorizontalOverflow()
    await assertHorizontallyContained('.village-stage')
    await page.locator('.header-tools button').nth(2).click()
    await expect(page.locator('.overlay-panel')).toBeVisible()
    await assertInViewport('.overlay-panel')
    await assertNoHorizontalOverflow()
    if (viewport.width === 360) {
      const before = await page.locator('.overlay-panel').boundingBox()
      await page.getByLabel('减少动态效果').check()
      const after = await page.locator('.overlay-panel').boundingBox()
      expect(after).toMatchObject({ width: before!.width, height: before!.height })
      await page.getByLabel('减少动态效果').uncheck()
    }
    await page.locator('.dialogue-close').click()
    await expect(page.locator('.overlay-panel')).toHaveCount(0)
  }

  await page.setViewportSize(viewports[0]!)
  await page.locator('[data-hotspot="old-man"]').click()
  await page.getByRole('button', { name: /弟子愿闻其详/ }).click()
  await page.locator('[data-hotspot="bai-daxia"]').click()
  await page.getByRole('button', { name: '菜刀已饥渴难耐' }).click()
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await expect(page.locator('.battle-arena')).toBeVisible()
    await expect(page.locator('.battle-skill-panel')).toBeVisible()
    await assertNoHorizontalOverflow()
    await assertInViewport('.battle-arena')
    await assertInViewport('.battle-skill-panel')
  }
})

test('Battle Screen 在 360px 仍显示三种资源、意图、6 槽并支持数字快捷键', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await enterBattle(page)

  await expect(page.getByText('敌方意图', { exact: true })).toBeVisible()
  await expect(page.getByText('架势', { exact: true }).first()).toBeVisible()
  await expect(page.locator('[data-skill-slot]')).toHaveCount(6)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))

  const before = await page.locator('.battle-log-entry').count()
  await page.keyboard.press('1')
  await expect(page.locator('.battle-log-entry')).toHaveCount(before + 2)
})

test('Battle Screen 覆盖战败、原地重试和资源恢复', async ({ page }) => {
  await enterBattle(page)
  const firstSkill = page.locator('[data-skill-slot]').first()
  for (let turn = 0; turn < 20; turn += 1) {
    if (await page.getByTestId('battle-defeat').isVisible()) break
    if (await page.getByTestId('battle-victory').isVisible()) break
    await firstSkill.click()
  }

  await expect(page.getByTestId('battle-defeat')).toBeVisible()
  await page.getByTestId('battle-retry').click()
  await expect(page.getByTestId('battle-defeat')).toBeHidden()
  await expect(firstSkill).toBeEnabled()
  await expect(page.getByText('100/100', { exact: true }).first()).toBeVisible()
})

test('Battle Screen 覆盖二阶段演出和胜利结算', async ({ page }) => {
  await enterBattle(page)
  const firstSkill = page.locator('[data-skill-slot]').first()
  let sawPhase = false
  for (let turn = 0; turn < 45; turn += 1) {
    if (await page.getByTestId('battle-victory').isVisible()) break
    if (await page.getByTestId('battle-phase').isVisible()) sawPhase = true
    if (await page.getByTestId('battle-defeat').isVisible()) {
      await page.getByTestId('battle-retry').click()
      continue
    }
    await firstSkill.click()
  }

  expect(sawPhase || await page.getByTestId('battle-phase').isVisible()).toBe(true)
  await expect(page.getByTestId('battle-victory')).toBeVisible()
  await expect(page.getByText('结算完成', { exact: true })).toBeVisible()
  await expect(page.getByTestId('presentation-cue')).toBeVisible()
  await expect(page.getByRole('button', { name: '跳过演出' })).toBeVisible()
  await page.getByRole('button', { name: '跳过演出' }).click()
  await expect(page.getByTestId('presentation-cue')).toBeVisible()
  await expect(page.getByRole('button', { name: '跳过演出' })).toHaveCount(0)
  await expect(page.getByText('结算完成', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '回到小愚村' }).click()
  await expect(page.getByText('有人说白大侠最近开始研究菜刀。')).toBeVisible()
  await expect(page.getByRole('button', { name: '白大侠服了' })).toBeDisabled()
})

test('锻造与烹饪页面支持预览、原子提交和返回江湖', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await startJourney(page)
  await page.getByTestId('open-cooking').click()
  await expect(page.getByRole('heading', { name: '后厨' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  await expect(page.locator('[data-testid^="cooking-recipe-"]')).toHaveCount(8)
  await expect(page.getByText('持续 1 场战斗', { exact: false }).first()).toBeVisible()
  await page.getByTestId('cooking-submit').dblclick()
  await expect(page.getByTestId('recipe-status')).toContainText('烹饪完成')
  await expect(page.getByText('5/1', { exact: true }).first()).toBeVisible()
  await page.getByTestId('recipe-back').click()
  await expect(page.getByText('江湖传闻')).toBeVisible()

  await page.getByTestId('open-crafting').click()
  await expect(page.getByRole('heading', { name: '铁匠铺' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  await expect(page.locator('[data-testid^="forging-recipe-"]')).toHaveCount(51)
  await page.getByTestId('forging-submit').click()
  await expect(page.getByTestId('recipe-status')).toContainText('锻造完成')
  await expect(page.getByText('3/5', { exact: true }).first()).toBeVisible()
  await page.getByTestId('recipe-back').click()
  await expect(page.getByText('江湖传闻')).toBeVisible()
})

test('图鉴在手机视口支持分类、键盘聚焦和触摸浏览', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await startJourney(page)
  await page.locator('.header-tools button').nth(1).click()

  await expect(page.getByRole('heading', { name: '小小图鉴' })).toBeVisible()
  await expect(page.getByRole('tab')).toHaveCount(5)
  await expect(page.getByRole('option')).not.toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
  await expect(page.locator('.codex-tabs button').first()).toHaveCSS('min-height', '44px')

  const titles = page.getByRole('tab', { name: /称号/ })
  await titles.focus()
  await page.keyboard.press('Enter')
  await expect(titles).toHaveAttribute('aria-selected', 'true')
  const firstEntry = page.getByRole('option').first()
  await firstEntry.focus()
  await page.keyboard.press('Enter')
  await expect(firstEntry).toHaveAttribute('aria-selected', 'true')
})

test('设置面板支持即时体验设置、改键并隐藏 AI 入口', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await startJourney(page)
  await page.locator('.header-tools button').nth(2).click()

  await expect(page.getByRole('heading', { name: '掌柜的' })).toBeVisible()
  await expect(page.getByText(/AI|模型|增强/)).toHaveCount(0)
  await page.getByRole('radio', { name: /加辣/ }).check()
  await expect(page.getByRole('radio', { name: /加辣/ })).toBeChecked()

  const confirmKey = page.getByRole('button', { name: /Enter/ }).first()
  await confirmKey.click()
  await page.keyboard.press('q')
  await expect(page.getByRole('button', { name: 'Q' })).toBeVisible()
  await expect(page.locator('.settings-key-button')).toHaveCount(9)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth))
})
