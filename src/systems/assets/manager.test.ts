import { describe, expect, it, vi } from 'vitest'
import { CORE_ASSET_MANIFEST } from '../../content/assets'
import type { AssetDefinition } from '../../types/assets'
import { asAssetId } from '../../types/ids'
import { AssetLifecycleManager, validateAssetManifest } from './manager'

function createLoader() {
  const loaded: string[] = []
  const released: string[] = []
  const load = vi.fn(async (definition: AssetDefinition) => {
    loaded.push(String(definition.id))
    return { id: String(definition.id) }
  })
  const release = vi.fn((definition: AssetDefinition) => {
    released.push(String(definition.id))
  })
  return { loaded, released, loader: { load, release } }
}

describe('区域资源生命周期', () => {
  it('Core 资源全部是随包 WebP，并通过区域预算校验', () => {
    const result = validateAssetManifest(CORE_ASSET_MANIFEST)
    expect(result).toEqual({ valid: true, issues: [] })
  })

  it('拒绝远程图片，避免离线包出现第三方请求', () => {
    const first = CORE_ASSET_MANIFEST.assets[0]!
    const result = validateAssetManifest({
      ...CORE_ASSET_MANIFEST,
      assets: [{ ...first, src: 'https://example.com/menu.webp' }],
      globalAssetIds: [first.id],
      regions: [],
    })
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'remote_source')).toBe(true)
  })

  it('重复进入区域不会重复加载，离开后只保留全局引用', async () => {
    const fake = createLoader()
    const manager = new AssetLifecycleManager(CORE_ASSET_MANIFEST, { loader: fake.loader })

    await manager.preloadGlobal()
    expect(fake.loader.load).toHaveBeenCalledTimes(4)
    await manager.preloadGlobal()
    expect(fake.loader.load).toHaveBeenCalledTimes(4)

    const regionId = CORE_ASSET_MANIFEST.regions[0]!.regionId
    await manager.enterRegion(regionId)
    expect(manager.snapshot().currentRegionId).toBe(regionId)
    expect(manager.snapshot().cache).toHaveLength(7)
    expect(manager.snapshot().cache.find((entry) => entry.id === asAssetId('asset:image:hero'))?.references).toBe(2)

    await manager.enterRegion(regionId)
    expect(fake.loader.load).toHaveBeenCalledTimes(7)

    await manager.leaveRegion()
    expect(manager.snapshot().currentRegionId).toBeNull()
    expect(manager.snapshot().cache).toHaveLength(4)
    expect(fake.released).toEqual(expect.arrayContaining(['asset:image:xiaoyu-village', 'asset:image:bai', 'asset:image:aunt']))

    await manager.enterRegion(regionId)
    await manager.leaveRegion()
    await manager.enterRegion(regionId)
    await manager.leaveRegion()
    expect(manager.snapshot().cache.every((entry) => entry.references === 1)).toBe(true)
    expect(manager.snapshot().cache).toHaveLength(4)

    manager.dispose()
    expect(manager.snapshot().cache).toHaveLength(0)
  })

  it('切换区域会释放上一个区域的资源，缓存只保留全局和当前区域', async () => {
    const fake = createLoader()
    const manager = new AssetLifecycleManager(CORE_ASSET_MANIFEST, { loader: fake.loader })
    const [village, qinghe] = CORE_ASSET_MANIFEST.regions

    await manager.preloadGlobal()
    await manager.enterRegion(village!.regionId)
    await manager.enterRegion(qinghe!.regionId)

    const afterSwitch = manager.snapshot()
    expect(afterSwitch.currentRegionId).toBe(qinghe!.regionId)
    expect(afterSwitch.cache.some((entry) => entry.id === asAssetId('asset:image:xiaoyu-village'))).toBe(false)
    expect(afterSwitch.cache.map((entry) => entry.id)).toEqual(expect.arrayContaining(qinghe!.assetIds))

    await manager.enterRegion(village!.regionId)
    await manager.enterRegion(qinghe!.regionId)
    const afterRepeat = manager.snapshot()
    expect(afterRepeat.cache).toHaveLength(afterSwitch.cache.length)
    expect(afterRepeat.cache.every((entry) => entry.references > 0)).toBe(true)
  })
})
