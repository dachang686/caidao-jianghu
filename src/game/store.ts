/**
 * 兼容旧的 game/store 导入路径。
 * 运行时状态和动作的唯一所有者位于 stores/root-store。
 */
export { getRootGameStore, useGameStore, useRootGameStore } from '../stores/root-store'
export type { RootGameStore as GameStore } from '../stores/root-store'

