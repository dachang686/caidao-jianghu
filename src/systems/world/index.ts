// 依赖方向：world system -> content loader/types；页面只消费结果，不复制解锁判断。
export {
  createEmptyWorldConditionContext,
  createInitialWorldNavigationState,
  createWorldContentCatalog,
  enterLocation,
  enterRegion,
  getLocationAvailability,
  getRegionAvailability,
  listRegionAvailability,
  restoreWorldNavigation,
  restoreWorldNavigationFromSave,
  restoreWorldNavigationState,
  returnToPreviousLocation,
  toWorldNavigationSnapshot,
  unlockRegion,
} from './navigation'
export { createRegionContentLoader, createWorldRegionLoader } from './region-loader'
export type { WorldRegionLoaderOptions } from './region-loader'
