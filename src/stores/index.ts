// 依赖方向：stores -> systems / types；页面通过公开 store 入口读取状态。
export { getRootGameStore, useRootGameStore } from './root-store'
export { getStoreServices, initializeStoreServices } from './services'
export type { StoreServices } from './services'
export { sliceNames } from './slices'
export type { RootGameStore } from './root-store'
export type { BattleSlice, PlayerSlice, QuestSlice, RootGameStoreSlices, SettingsSlice, ShellSlice, SliceName, WorldSlice } from './slices'
