import { describe, expect, it } from 'vitest'
import { CORE_ASSET_MANIFEST } from '../../content/assets'
import { loadChapterSync } from '../../content/sync-loader'
import { contentManifest } from '../../content/manifest'
import { ch03GatheringItems } from '../../content/gathering/ch03'
import { ch03NpcDefinitions } from '../../content/npcs/ch03'
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

const blackwindRegionId = asWorldRegionId('blackwind-fortress')
const gateId = asLocationId('blackwind-gate')
const kitchenId = asLocationId('blackwind-kitchen')
const watchtowerId = asLocationId('blackwind-watchtower')
const ch01 = loadChapterSync(asChapterId('ch01'))
const ch02 = loadChapterSync(asChapterId('ch02'))
const ch03 = loadChapterSync(asChapterId('ch03'))
const blackwindContext = { flags: { ch02_mainline_complete: true } }

describe('C321–C322 黑风寨场景与任务内容', () => {
  it('上一章完成前锁定区域，完成后可进入入口并沿安全路径返回', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    expect(getRegionAvailability(contentManifest, state, blackwindRegionId)?.status).toBe('locked')

    const unlocked = unlockRegion(contentManifest, state, blackwindRegionId, blackwindContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const enteredRegion = enterRegion(contentManifest, unlocked.value, blackwindRegionId, blackwindContext)
    expect(enteredRegion.ok).toBe(true)
    if (!enteredRegion.ok) return
    expect(enteredRegion.value.currentLocationId).toBe(gateId)

    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02, ch03])
    const enteredKitchen = enterLocation(catalog, enteredRegion.value, kitchenId, blackwindContext)
    expect(enteredKitchen.ok).toBe(true)
    if (enteredKitchen.ok) expect(enteredKitchen.value.returnPath).toContain(gateId)
    const enteredWatchtower = enterLocation(catalog, enteredRegion.value, watchtowerId, blackwindContext)
    expect(enteredWatchtower.ok).toBe(true)
    if (enteredWatchtower.ok) expect(enteredWatchtower.value.returnPath).toContain(gateId)
  })

  it('刷新恢复仍然合法的山寨地点，非法地点回到小愚村起点', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    const unlocked = unlockRegion(contentManifest, state, blackwindRegionId, blackwindContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02, ch03])
    const entered = enterLocation(catalog, { ...unlocked.value, currentRegionId: blackwindRegionId, currentLocationId: gateId }, kitchenId, blackwindContext)
    expect(entered.ok).toBe(true)
    if (!entered.ok) return

    const restored = restoreWorldNavigationState(contentManifest, entered.value, blackwindContext, catalog)
    expect(restored.currentRegionId).toBe(blackwindRegionId)
    expect(restored.currentLocationId).toBe(kitchenId)

    const invalid = restoreWorldNavigationState(contentManifest, { ...entered.value, currentLocationId: asLocationId('blackwind-missing') }, blackwindContext, catalog)
    expect(invalid.currentRegionId).toBe(contentManifest.regions[0]!.id)
    expect(invalid.currentLocationId).toBe(contentManifest.regions[0]!.entryLocationId)
  })

  it('黑风寨资源是本地 WebP，区域资源总量低于 5MB', () => {
    const result = validateAssetManifest(CORE_ASSET_MANIFEST)
    expect(result.valid).toBe(true)
    const region = CORE_ASSET_MANIFEST.regions.find((entry) => entry.regionId === blackwindRegionId)
    expect(region).toBeDefined()
    const assets = region!.assetIds.map((id) => CORE_ASSET_MANIFEST.assets.find((asset) => asset.id === id)!)
    expect(assets).toHaveLength(6)
    expect(assets.every((asset) => asset.format === 'webp' && (asset.src.startsWith('file:') || asset.src.includes('/src/assets/')))).toBe(true)
    expect(assets.reduce((total, asset) => total + asset.sizeBytes, 0)).toBeLessThanOrEqual(5_000_000)
  })

  it('保留至少三个有关系边界和互动效果的 NPC、一个采集点，任务已接入但不提前塞入敌人或 Boss 占位', () => {
    expect(ch03.npcs).toHaveLength(3)
    expect(ch03.npcs).toEqual(ch03NpcDefinitions)
    expect(ch03.npcs.every((npc) => npc.relationship && npc.interactionEffects)).toBe(true)
    expect(ch03.gatheringNodes).toHaveLength(1)
    expect(ch03GatheringItems).toHaveLength(1)
    expect(ch03.quests.filter((quest) => quest.kind === 'main')).toHaveLength(4)
    expect(ch03.quests.filter((quest) => quest.kind === 'side')).toHaveLength(2)
    expect(ch03.enemies).toHaveLength(3)
    expect(ch03.enemies?.filter((enemy) => enemy.role === 'normal')).toHaveLength(2)
    expect(ch03.enemies?.filter((enemy) => enemy.role === 'boss')).toHaveLength(1)
  })
})
