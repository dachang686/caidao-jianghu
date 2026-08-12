// 依赖方向：stores -> systems / types；页面通过公开 store 入口读取状态。
export { getRootGameStore, useGameStore, useRootGameStore } from './root-store'
export { getStoreServices, initializeStoreServices } from './services'
export type { StoreServices } from './services'
export { sliceNames } from './slices'
export type { BattleSlice, LegacyStoreShape, PlayerSlice, QuestSlice, RootGameStore, RootGameStoreSlices, SettingsSlice, ShellSlice, SliceName, WorldSlice } from './slices'
