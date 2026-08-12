import { describe, expect, it } from 'vitest'
import { contentManifest } from '../../content/manifest'
import { loadChapterSync } from '../../content/sync-loader'
import { asChapterId, asLocationId, asWorldRegionId } from '../../types/ids'
import type { ContentManifest } from '../../types/content'
import {
  createInitialWorldNavigationState,
  createWorldContentCatalog,
  enterLocation,
  enterRegion,
  getLocationAvailability,
  getRegionAvailability,
  restoreWorldNavigationFromSave,
  restoreWorldNavigationState,
  unlockRegion,
} from './navigation'

const villageRegion = contentManifest.regions[0]!
const villageLocation = villageRegion.entryLocationId

function makeManifestWithLockedRegion(): ContentManifest {
  const regionId = asWorldRegionId('qinghe-county')
  const locationId = asLocationId('qinghe-town')
  return {
    ...contentManifest,
    regions: [
      contentManifest.regions[0]!,
      {
        id: regionId,
        chapterId: asChapterId('ch02'),
        title: '清河县',
        order: 2,
        entryLocationId: locationId,
        locationIds: [locationId],
        resourceEntry: './chapters/ch02',
        entryCondition: { type: 'flag_equals', flag: 'qingheUnlocked', value: true },
        lockedReason: '完成小愚村主线后才能前往清河县。',
      },
    ],
  }
}

describe('world navigation', () => {
  it('只把 Manifest 已登记的区域列入地图，并对锁定区域返回可读原因', () => {
    const manifest = makeManifestWithLockedRegion()
    const state = createInitialWorldNavigationState(manifest)
    const regionId = manifest.regions[1]!.id
    const availability = getRegionAvailability(manifest, state, regionId)
    expect(availability).toMatchObject({ status: 'locked', reason: '完成小愚村主线后才能前往清河县。' })

    const entered = enterRegion(manifest, state, regionId)
    expect(entered.ok).toBe(false)
    if (!entered.ok) expect(entered.error.message).toContain('完成小愚村主线')
  })

  it('解锁后可进入区域，条件不满足时不会被直接写入解锁列表', () => {
    const manifest = makeManifestWithLockedRegion()
    const state = createInitialWorldNavigationState(manifest)
    const regionId = manifest.regions[1]!.id
    const blocked = unlockRegion(manifest, state, regionId)
    expect(blocked.ok).toBe(false)

    const unlocked = unlockRegion(manifest, state, regionId, { flags: { qingheUnlocked: true } })
    expect(unlocked.ok).toBe(true)
    if (!unlocked.ok) return
    expect(unlocked.value.unlockedRegionIds).toContain(regionId)
    const entered = enterRegion(manifest, unlocked.value, regionId, { flags: { qingheUnlocked: true } })
    expect(entered.ok).toBe(true)
    if (entered.ok) expect(entered.value.currentLocationId).toBe('qinghe-town')
  })

  it('刷新恢复合法地点，非法地点回到当前合法起始地点', () => {
    const state = createInitialWorldNavigationState(contentManifest)
    const restored = restoreWorldNavigationState(contentManifest, {
      ...state,
      returnPath: [villageLocation],
    })
    expect(restored.currentRegionId).toBe(villageRegion.id)
    expect(restored.currentLocationId).toBe(villageLocation)
    expect(restored.returnPath).toEqual([villageLocation])

    const invalid = restoreWorldNavigationState(contentManifest, {
      ...state,
      currentLocationId: asLocationId('location:missing'),
    })
    expect(invalid.currentLocationId).toBe(villageLocation)
    expect(invalid.returnPath).toEqual([])

    const fromSave = restoreWorldNavigationFromSave(contentManifest, { world: restored })
    expect(fromSave.currentLocationId).toBe(villageLocation)
  })

  it('只有加载过的地点才能进入，入口地点的未加载内容返回可恢复错误', () => {
    const regionId = asWorldRegionId('loaded-region')
    const locationId = asLocationId('loaded-location')
    const manifest: ContentManifest = {
      ...contentManifest,
      regions: [{ ...villageRegion, id: regionId, entryLocationId: locationId, locationIds: [locationId] }],
    }
    const state = createInitialWorldNavigationState(manifest)
    const unloadedCatalog = createWorldContentCatalog(manifest)
    const unloaded = getLocationAvailability(unloadedCatalog, state, locationId)
    expect(unloaded.ok).toBe(false)
    if (!unloaded.ok) expect(unloaded.error).toMatchObject({ code: 'location_not_loaded', recoverable: true })

    const chapter = loadChapterSync(contentManifest.chapters[0]!.id)
    const loadedCatalog = createWorldContentCatalog(manifest, [{
      ...chapter,
      locations: [{ ...chapter.locations[0]!, id: locationId, regionId }],
    }])
    const loaded = enterLocation(loadedCatalog, state, locationId)
    expect(loaded.ok).toBe(true)
  })
})
