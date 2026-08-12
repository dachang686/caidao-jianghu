import { isConditionMet } from '../conditions'
import type { ContentManifest } from '../../types/content'
import type { ChapterContent } from '../../content/loader'
import type { ConditionContext } from '../../types/conditions'
import type { LocationId, WorldRegionId } from '../../types/ids'
import type {
  LocationAvailability,
  RegionAvailability,
  WorldConditionContext,
  WorldContentCatalog,
  WorldLocationRecord,
  WorldNavigationFailure,
  WorldNavigationState,
  WorldOperationResult,
} from '../../types/world'

const EMPTY_CONDITION_CONTEXT: ConditionContext = {
  quests: {},
  inventory: {},
  stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
  flags: {},
}

function worldContext(context: Partial<WorldConditionContext> = {}): WorldConditionContext {
  return {
    ...EMPTY_CONDITION_CONTEXT,
    currentRegionId: null,
    currentLocationId: null,
    ...context,
  }
}

function failure(
  code: WorldNavigationFailure['code'],
  message: string,
  options: Pick<WorldNavigationFailure, 'recoverable' | 'regionId' | 'locationId'> = { recoverable: false },
): WorldNavigationFailure {
  return { code, message, ...options }
}

function resultFailure<T>(error: WorldNavigationFailure): WorldOperationResult<T> {
  return { ok: false, error }
}

function regionForLocation(manifest: ContentManifest, locationId: LocationId) {
  return manifest.regions.find((region) => region.entryLocationId === locationId || region.locationIds?.includes(locationId))
}

function conditionPasses(condition: Parameters<typeof isConditionMet>[0] | undefined, context: WorldConditionContext): boolean {
  if (!condition) return true
  try {
    return isConditionMet(condition, context)
  } catch {
    // 内容校验会阻止正式内容进入构建；运行时仍以锁定处理，避免把错误存档带入可进入状态。
    return false
  }
}

function regionLockReason(region: ContentManifest['regions'][number], context: WorldConditionContext): string | undefined {
  if (!conditionPasses(region.entryCondition, context)) return region.lockedReason ?? '尚未满足该区域的进入条件。'
  return region.lockedReason ?? '该区域尚未解锁。'
}

function locationLockReason(location: WorldLocationRecord, context: WorldConditionContext): string | undefined {
  if (!conditionPasses(location.entryCondition, context)) return location.lockedReason ?? '尚未满足该地点的进入条件。'
  return location.lockedReason
}

export function createEmptyWorldConditionContext(): WorldConditionContext {
  return worldContext()
}

export function createInitialWorldNavigationState(manifest: ContentManifest): WorldNavigationState {
  const start = [...manifest.regions].sort((left, right) => left.order - right.order)[0]
  if (!start) {
    return { unlockedRegionIds: [], currentRegionId: null, currentLocationId: null, returnPath: [] }
  }
  return {
    unlockedRegionIds: [start.id],
    currentRegionId: start.id,
    currentLocationId: start.entryLocationId,
    returnPath: [],
  }
}

export function createWorldContentCatalog(manifest: ContentManifest, chapters: readonly ChapterContent[] = []): WorldContentCatalog {
  const locations: WorldLocationRecord[] = []
  const seen = new Set<LocationId>()
  chapters.forEach((chapterContent) => {
    chapterContent.locations.forEach((location) => {
      if (seen.has(location.id)) return
      const region = manifest.regions.find((candidate) => candidate.chapterId === location.chapterId && (!location.regionId || candidate.id === location.regionId))
      if (!region) return
      seen.add(location.id)
      locations.push({
        id: location.id,
        chapterId: location.chapterId,
        regionId: region.id,
        title: location.title,
        description: location.description,
        entryCondition: location.entryCondition,
        lockedReason: location.lockedReason,
        returnToLocationId: location.returnToLocationId,
      })
    })
  })
  return { manifest, locations }
}

export function getRegionAvailability(
  manifest: ContentManifest,
  state: WorldNavigationState,
  regionId: WorldRegionId,
  context: Partial<WorldConditionContext> = {},
): RegionAvailability | null {
  const region = manifest.regions.find((candidate) => candidate.id === regionId)
  if (!region) return null
  const currentContext = worldContext({ ...context, currentRegionId: state.currentRegionId, currentLocationId: state.currentLocationId })
  const unlocked = state.unlockedRegionIds.includes(regionId)
  const conditionMet = conditionPasses(region.entryCondition, currentContext)
  return {
    region,
    status: unlocked && conditionMet ? 'available' : 'locked',
    ...(unlocked && conditionMet ? {} : { reason: regionLockReason(region, currentContext) }),
  }
}

export function listRegionAvailability(
  manifest: ContentManifest,
  state: WorldNavigationState,
  context: Partial<WorldConditionContext> = {},
): readonly RegionAvailability[] {
  return [...manifest.regions]
    .sort((left, right) => left.order - right.order)
    .map((region) => getRegionAvailability(manifest, state, region.id, context) as RegionAvailability)
}

export function unlockRegion(
  manifest: ContentManifest,
  state: WorldNavigationState,
  regionId: WorldRegionId,
  context: Partial<WorldConditionContext> = {},
): WorldOperationResult<WorldNavigationState> {
  const availability = getRegionAvailability(manifest, state, regionId, context)
  if (!availability) return resultFailure(failure('unknown_region', '地图没有登记该区域。'))
  const currentContext = worldContext({ ...context, currentRegionId: state.currentRegionId, currentLocationId: state.currentLocationId })
  if (!conditionPasses(availability.region.entryCondition, currentContext)) {
    return resultFailure(failure('region_locked', availability.reason ?? '尚未满足该区域的进入条件。', { recoverable: false, regionId }))
  }
  if (state.unlockedRegionIds.includes(regionId)) return { ok: true, value: state }
  return { ok: true, value: { ...state, unlockedRegionIds: [...state.unlockedRegionIds, regionId] } }
}

export function enterRegion(
  manifest: ContentManifest,
  state: WorldNavigationState,
  regionId: WorldRegionId,
  context: Partial<WorldConditionContext> = {},
): WorldOperationResult<WorldNavigationState> {
  const availability = getRegionAvailability(manifest, state, regionId, context)
  if (!availability) return resultFailure(failure('unknown_region', '地图没有登记该区域。'))
  if (availability.status === 'locked') {
    return resultFailure(failure('region_locked', availability.reason ?? '该区域尚未解锁。', { recoverable: false, regionId }))
  }
  if (state.currentRegionId === regionId && state.currentLocationId === availability.region.entryLocationId) return { ok: true, value: state }
  const returnPath = state.currentLocationId && state.currentLocationId !== availability.region.entryLocationId
    ? [...state.returnPath, state.currentLocationId]
    : state.returnPath
  return {
    ok: true,
    value: {
      ...state,
      currentRegionId: regionId,
      currentLocationId: availability.region.entryLocationId,
      returnPath,
    },
  }
}

function loadedLocation(catalog: WorldContentCatalog, locationId: LocationId): WorldLocationRecord | undefined {
  return catalog.locations.find((location) => location.id === locationId)
}

export function getLocationAvailability(
  catalog: WorldContentCatalog,
  state: WorldNavigationState,
  locationId: LocationId,
  context: Partial<WorldConditionContext> = {},
): WorldOperationResult<LocationAvailability> {
  const region = regionForLocation(catalog.manifest, locationId)
  if (!region) return resultFailure(failure('unknown_location', '地图没有登记该地点。', { recoverable: false, locationId }))
  const regionAvailability = getRegionAvailability(catalog.manifest, state, region.id, context)
  if (!regionAvailability || regionAvailability.status === 'locked') {
    return resultFailure(failure('region_locked', regionAvailability?.reason ?? '该地点所属区域尚未解锁。', { recoverable: false, regionId: region.id, locationId }))
  }
  const location = loadedLocation(catalog, locationId)
  if (!location) {
    return resultFailure(failure('location_not_loaded', '地点内容尚未加载，请重试。', { recoverable: true, regionId: region.id, locationId }))
  }
  const currentContext = worldContext({ ...context, currentRegionId: state.currentRegionId, currentLocationId: state.currentLocationId })
  const reason = locationLockReason(location, currentContext)
  if (!conditionPasses(location.entryCondition, currentContext)) {
    return resultFailure(failure('location_locked', reason ?? '该地点尚未解锁。', { recoverable: false, regionId: region.id, locationId }))
  }
  return { ok: true, value: { location, status: 'available' } }
}

export function enterLocation(
  catalog: WorldContentCatalog,
  state: WorldNavigationState,
  locationId: LocationId,
  context: Partial<WorldConditionContext> = {},
): WorldOperationResult<WorldNavigationState> {
  const availability = getLocationAvailability(catalog, state, locationId, context)
  if (!availability.ok) return availability
  const location = availability.value.location
  if (state.currentLocationId === location.id) return { ok: true, value: state }
  const returnPath = state.currentLocationId ? [...state.returnPath, state.currentLocationId] : state.returnPath
  return {
    ok: true,
    value: {
      ...state,
      currentRegionId: location.regionId,
      currentLocationId: location.id,
      returnPath,
    },
  }
}

export function returnToPreviousLocation(
  catalog: WorldContentCatalog,
  state: WorldNavigationState,
  context: Partial<WorldConditionContext> = {},
): WorldOperationResult<WorldNavigationState> {
  const targetId = state.returnPath[state.returnPath.length - 1]
  if (!targetId) return resultFailure(failure('no_return_path', '当前地点没有可返回的路径。', { recoverable: false }))
  const target = getLocationAvailability(catalog, { ...state, returnPath: state.returnPath.slice(0, -1) }, targetId, context)
  if (!target.ok) return target
  return {
    ok: true,
    value: {
      ...state,
      currentRegionId: target.value.location.regionId,
      currentLocationId: target.value.location.id,
      returnPath: state.returnPath.slice(0, -1),
    },
  }
}

function isKnownLocation(manifest: ContentManifest, locationId: LocationId, catalog?: WorldContentCatalog): boolean {
  if (catalog?.locations.some((location) => location.id === locationId)) return true
  return Boolean(regionForLocation(manifest, locationId))
}

function regionContainsLocation(manifest: ContentManifest, regionId: WorldRegionId, locationId: LocationId, catalog?: WorldContentCatalog): boolean {
  const region = manifest.regions.find((candidate) => candidate.id === regionId)
  if (!region) return false
  return region.entryLocationId === locationId
    || Boolean(region.locationIds?.includes(locationId))
    || Boolean(catalog?.locations.some((location) => location.regionId === regionId && location.id === locationId))
}

/**
 * 刷新后只恢复 Manifest 中仍存在、且当前仍有权限进入的地点；不合法快照回到起始地点。
 */
export function restoreWorldNavigationState(
  manifest: ContentManifest,
  snapshot: Partial<WorldNavigationState> | null | undefined,
  context: Partial<WorldConditionContext> = {},
  catalog?: WorldContentCatalog,
): WorldNavigationState {
  const initial = createInitialWorldNavigationState(manifest)
  if (!snapshot || !initial.currentRegionId || !initial.currentLocationId) return initial
  const currentContext = worldContext({ ...context, currentRegionId: snapshot.currentRegionId ?? null, currentLocationId: snapshot.currentLocationId ?? null })
  const unlockedRegionIds = manifest.regions
    .filter((region) => snapshot.unlockedRegionIds?.includes(region.id) && conditionPasses(region.entryCondition, currentContext))
    .map((region) => region.id)
  const unlocked = unlockedRegionIds.includes(initial.currentRegionId) ? unlockedRegionIds : [initial.currentRegionId, ...unlockedRegionIds]
  const regionId = snapshot.currentRegionId
  const currentRegion = regionId ? getRegionAvailability(manifest, { ...initial, ...snapshot, unlockedRegionIds: unlocked }, regionId, context) : null
  if (!regionId || !currentRegion || currentRegion.status === 'locked' || !snapshot.currentLocationId || !regionContainsLocation(manifest, regionId, snapshot.currentLocationId, catalog)) {
    return { ...initial, unlockedRegionIds: unlocked }
  }
  const returnPath = (snapshot.returnPath ?? []).filter((locationId) => isKnownLocation(manifest, locationId, catalog))
  return {
    unlockedRegionIds: unlocked,
    currentRegionId: regionId,
    currentLocationId: snapshot.currentLocationId,
    returnPath,
  }
}

export const restoreWorldNavigation = restoreWorldNavigationState

export function restoreWorldNavigationFromSave(
  manifest: ContentManifest,
  save: { readonly world?: Partial<WorldNavigationState> } | null | undefined,
  context: Partial<WorldConditionContext> = {},
  catalog?: WorldContentCatalog,
): WorldNavigationState {
  return restoreWorldNavigationState(manifest, save?.world, context, catalog)
}

export function toWorldNavigationSnapshot(state: WorldNavigationState): WorldNavigationState {
  return {
    unlockedRegionIds: [...state.unlockedRegionIds],
    currentRegionId: state.currentRegionId,
    currentLocationId: state.currentLocationId,
    returnPath: [...state.returnPath],
  }
}
