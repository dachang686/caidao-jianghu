import { describe, expect, it } from 'vitest'
import { CORE_ASSET_MANIFEST } from '../../content/assets'
import { loadChapterSync } from '../../content/sync-loader'
import { contentManifest } from '../../content/manifest'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import { validateAssetManifest } from '../assets'
import {
  createInitialWorldNavigationState,
  createWorldContentCatalog,
  enterLocation,
  enterRegion,
  getRegionAvailability,
  restoreWorldNavigationState,
  unlockRegion,
} from './navigation'

const qingheRegionId = asWorldRegionId('qinghe-county')
const marketId = asLocationId('qinghe-market')
const riverfrontId = asLocationId('qinghe-riverfront')
const ch01 = loadChapterSync(asChapterId('ch01'))
const ch02 = loadChapterSync(asChapterId('ch02'))
const qingheContext = { flags: { ch01_mainline_complete: true } }

describe('C311 清河县场景内容', () => {
  it('上一章完成前锁定区域，完成后可进入街市与码头', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    expect(getRegionAvailability(contentManifest, state, qingheRegionId)?.status).toBe('locked')

    const unlocked = unlockRegion(contentManifest, state, qingheRegionId, qingheContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return

    const enteredRegion = enterRegion(contentManifest, unlocked.value, qingheRegionId, qingheContext)
    expect(enteredRegion.ok).toBe(true)
    if (!enteredRegion.ok) return
    expect(enteredRegion.value.currentLocationId).toBe(marketId)

    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02])
    const enteredRiverfront = enterLocation(catalog, enteredRegion.value, riverfrontId, qingheContext)
    expect(enteredRiverfront.ok).toBe(true)
    if (enteredRiverfront.ok) expect(enteredRiverfront.value.returnPath).toContain(marketId)
  })

  it('刷新恢复清河县合法地点，非法地点回到小愚村起点', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    const unlocked = unlockRegion(contentManifest, state, qingheRegionId, qingheContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02])
    const entered = enterLocation(catalog, { ...unlocked.value, currentRegionId: qingheRegionId, currentLocationId: marketId }, riverfrontId, qingheContext)
    expect(entered.ok).toBe(true)
    if (!entered.ok) return

    const restored = restoreWorldNavigationState(contentManifest, entered.value, qingheContext, catalog)
    expect(restored.currentRegionId).toBe(qingheRegionId)
    expect(restored.currentLocationId).toBe(riverfrontId)
    expect(restored.returnPath).toContain(marketId)

    const invalid = restoreWorldNavigationState(contentManifest, { ...entered.value, currentLocationId: asLocationId('qinghe-missing') }, qingheContext, catalog)
    expect(invalid.currentRegionId).toBe(contentManifest.regions[0]!.id)
    expect(invalid.currentLocationId).toBe(contentManifest.regions[0]!.entryLocationId)
  })

  it('区域资源均为本地 WebP 且清河县新增资源低于 5MB', () => {
    const result = validateAssetManifest(CORE_ASSET_MANIFEST)
    expect(result.valid).toBe(true)
    const region = CORE_ASSET_MANIFEST.regions.find((entry) => entry.regionId === qingheRegionId)
    expect(region).toBeDefined()
    const assets = region!.assetIds.map((id) => CORE_ASSET_MANIFEST.assets.find((asset) => asset.id === id)!)
    expect(assets.every((asset) => asset.format === 'webp' && (asset.src.startsWith('file:') || asset.src.includes('/src/assets/')))).toBe(true)
    expect(assets.reduce((total, asset) => total + asset.sizeBytes, 0)).toBeLessThanOrEqual(5_000_000)
  })

  it('章节任务、敌人和 NPC 内容可被同一目录校验，并提供安全返回地点', () => {
    expect(ch02.chapter.entryLocationId).toBe(marketId)
    expect(ch02.locations.find((location) => location.id === riverfrontId)?.returnToLocationId).toBe(marketId)
    expect(ch02.npcs).toHaveLength(4)
    expect(ch02.npcs.every((npc) => npc.relationship && npc.interactionEffects)).toBe(true)
    expect(ch02.quests.filter((quest) => quest.kind === 'main')).toHaveLength(4)
    expect(ch02.quests.filter((quest) => quest.kind === 'side')).toHaveLength(2)
    expect(ch02.enemies).toHaveLength(3)
    expect(ch02.enemies?.filter((enemy) => enemy.role === 'normal')).toHaveLength(2)
    expect(ch02.enemies?.filter((enemy) => enemy.role === 'boss')).toHaveLength(1)
    expect(ch02.gatheringNodes).toHaveLength(1)
  })
})
