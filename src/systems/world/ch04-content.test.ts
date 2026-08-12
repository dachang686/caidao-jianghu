import { describe, expect, it } from 'vitest'
import { CORE_ASSET_MANIFEST } from '../../content/assets'
import { loadChapterSync } from '../../content/sync-loader'
import { contentManifest } from '../../content/manifest'
import { ch04GatheringItems } from '../../content/gathering/ch04'
import { ch04NpcDefinitions } from '../../content/npcs/ch04'
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

const qingyunRegionId = asWorldRegionId('qingyun-mountain')
const gateId = asLocationId('qingyun-gate')
const herbGardenId = asLocationId('qingyun-herb-garden')
const bellTerraceId = asLocationId('qingyun-bell-terrace')
const ch01 = loadChapterSync(asChapterId('ch01'))
const ch02 = loadChapterSync(asChapterId('ch02'))
const ch03 = loadChapterSync(asChapterId('ch03'))
const ch04 = loadChapterSync(asChapterId('ch04'))
const qingyunContext = { flags: { ch03_mainline_complete: true } }

describe('C331 青云山场景与素材', () => {
  it('上一章完成前锁定区域，完成后可进入山门并沿安全路径返回', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    expect(getRegionAvailability(contentManifest, state, qingyunRegionId)?.status).toBe('locked')

    const unlocked = unlockRegion(contentManifest, state, qingyunRegionId, qingyunContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const enteredRegion = enterRegion(contentManifest, unlocked.value, qingyunRegionId, qingyunContext)
    expect(enteredRegion.ok).toBe(true)
    if (!enteredRegion.ok) return
    expect(enteredRegion.value.currentLocationId).toBe(gateId)

    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02, ch03, ch04])
    const enteredHerbGarden = enterLocation(catalog, enteredRegion.value, herbGardenId, qingyunContext)
    expect(enteredHerbGarden.ok).toBe(true)
    if (enteredHerbGarden.ok) expect(enteredHerbGarden.value.returnPath).toContain(gateId)
    const enteredBellTerrace = enterLocation(catalog, enteredRegion.value, bellTerraceId, qingyunContext)
    expect(enteredBellTerrace.ok).toBe(true)
    if (enteredBellTerrace.ok) expect(enteredBellTerrace.value.returnPath).toContain(gateId)
  })

  it('刷新恢复合法的青云地点，非法地点回到首个区域入口', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    const unlocked = unlockRegion(contentManifest, state, qingyunRegionId, qingyunContext)
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    const catalog = createWorldContentCatalog(contentManifest, [ch01, ch02, ch03, ch04])
    const entered = enterLocation(catalog, { ...unlocked.value, currentRegionId: qingyunRegionId, currentLocationId: gateId }, herbGardenId, qingyunContext)
    expect(entered.ok).toBe(true)
    if (!entered.ok) return

    const restored = restoreWorldNavigationState(contentManifest, entered.value, qingyunContext, catalog)
    expect(restored.currentRegionId).toBe(qingyunRegionId)
    expect(restored.currentLocationId).toBe(herbGardenId)

    const invalid = restoreWorldNavigationState(contentManifest, { ...entered.value, currentLocationId: asLocationId('qingyun-missing') }, qingyunContext, catalog)
    expect(invalid.currentRegionId).toBe(contentManifest.regions[0]!.id)
    expect(invalid.currentLocationId).toBe(contentManifest.regions[0]!.entryLocationId)
  })

  it('青云山全部素材是本地 WebP，区域资源总量低于 5MB', () => {
    const result = validateAssetManifest(CORE_ASSET_MANIFEST)
    expect(result.valid).toBe(true)
    const region = CORE_ASSET_MANIFEST.regions.find((entry) => entry.regionId === qingyunRegionId)
    expect(region).toBeDefined()
    const assets = region!.assetIds.map((id) => CORE_ASSET_MANIFEST.assets.find((asset) => asset.id === id)!)
    expect(assets).toHaveLength(6)
    expect(assets.every((asset) => asset.format === 'webp' && (asset.src.startsWith('file:') || asset.src.includes('/src/assets/')))).toBe(true)
    expect(assets.reduce((total, asset) => total + asset.sizeBytes, 0)).toBeLessThanOrEqual(5_000_000)
  })

  it('保留三个有关系边界的 NPC、一个采集点，并接入当前章节任务与战斗内容', () => {
    expect(ch04.npcs).toHaveLength(3)
    expect(ch04.npcs).toEqual(ch04NpcDefinitions)
    expect(ch04.npcs.every((npc) => npc.relationship && npc.interactionEffects)).toBe(true)
    expect(ch04.gatheringNodes).toHaveLength(1)
    expect(ch04GatheringItems).toHaveLength(1)
    expect(ch04.quests).toHaveLength(6)
    expect(ch04.enemies).toHaveLength(3)
    expect(ch04.enemies?.filter((enemy) => enemy.role === 'normal')).toHaveLength(2)
    expect(ch04.enemies?.find((enemy) => enemy.role === 'boss')?.name).toBe('青云掌门')
  })
})
