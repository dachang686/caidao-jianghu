import type { ChapterDefinition, ContentManifest, DialogueNode, HotspotDefinition, LocationDefinition, NpcDefinition, QuestDefinition, RegionIndexEntry } from './content'
import type { GatheringNodeDefinition } from './gathering'
import type { Condition, ConditionContext } from './conditions'
import type { ChapterId, LocationId, WorldRegionId } from './ids'

export type { WorldRegionId } from './ids'

/** W201 只增加世界导航 screen 契约，具体页面仍由应用内部状态机驱动。 */
export type WorldScreenId = 'worldMap' | 'location'

export interface WorldNavigationState {
  readonly unlockedRegionIds: readonly WorldRegionId[]
  readonly currentRegionId: WorldRegionId | null
  readonly currentLocationId: LocationId | null
  /** 从当前地点返回上一个地点时使用，栈顶是最近一次进入的地点。 */
  readonly returnPath: readonly LocationId[]
}

/** 存档只保存权威导航状态，不包含区域加载中的 Promise 或 UI 错误。 */
export type WorldNavigationSnapshot = WorldNavigationState

export interface WorldConditionContext extends ConditionContext {
  readonly currentRegionId: WorldRegionId | null
  readonly currentLocationId: LocationId | null
}

export interface WorldLocationRecord {
  readonly id: LocationId
  readonly chapterId: ChapterId
  readonly regionId: WorldRegionId
  readonly title: string
  readonly description: string
  readonly entryCondition?: Condition
  readonly lockedReason?: string
  readonly returnToLocationId?: LocationId
}

export interface WorldContentCatalog {
  readonly manifest: ContentManifest
  readonly locations: readonly WorldLocationRecord[]
}

/** 与 ChapterContent 保持结构兼容，但不让 types 层反向依赖 content loader 运行时模块。 */
export interface WorldRegionContent {
  readonly chapter: ChapterDefinition
  readonly locations: readonly LocationDefinition[]
  readonly npcs: readonly NpcDefinition[]
  readonly quests: readonly QuestDefinition[]
  readonly hotspots?: readonly HotspotDefinition[]
  readonly gatheringNodes?: readonly GatheringNodeDefinition[]
  readonly dialogues?: readonly DialogueNode[]
}

export type WorldAccessStatus = 'available' | 'locked' | 'loading' | 'error'

export interface RegionAvailability {
  readonly region: RegionIndexEntry
  readonly status: Exclude<WorldAccessStatus, 'loading' | 'error'>
  readonly reason?: string
}

export interface LocationAvailability {
  readonly location: WorldLocationRecord
  readonly status: Exclude<WorldAccessStatus, 'loading' | 'error'>
  readonly reason?: string
}

export type WorldNavigationFailureCode =
  | 'no_start_region'
  | 'unknown_region'
  | 'region_locked'
  | 'unknown_location'
  | 'location_not_loaded'
  | 'location_locked'
  | 'no_return_path'
  | 'invalid_saved_location'

export interface WorldNavigationFailure {
  readonly code: WorldNavigationFailureCode
  readonly message: string
  readonly recoverable: boolean
  readonly regionId?: WorldRegionId
  readonly locationId?: LocationId
}

export type WorldOperationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: WorldNavigationFailure }

export interface RegionLoadError {
  readonly code: 'unknown_region' | 'missing_loader' | 'load_failed' | 'invalid_content'
  readonly regionId: WorldRegionId
  readonly message: string
  readonly recoverable: boolean
}

export type RegionLoadResult =
  | { readonly status: 'loaded'; readonly regionId: WorldRegionId; readonly content: WorldRegionContent }
  | { readonly status: 'error'; readonly regionId: WorldRegionId; readonly error: RegionLoadError }

export interface WorldRegionLoader {
  load(regionId: WorldRegionId): Promise<RegionLoadResult>
  isLoaded(regionId: WorldRegionId): boolean
  clear(regionId?: WorldRegionId): void
}

export type WorldRegionDefinition = RegionIndexEntry

/** 保留这个类型别名，方便存档适配层表达“来自保存数据的世界状态”。 */
export type SavedWorldNavigationState = WorldNavigationSnapshot

export type WorldContentLocationSource = LocationDefinition
