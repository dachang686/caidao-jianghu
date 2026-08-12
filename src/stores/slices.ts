import type { RootGameStore } from './root-store'

/**
 * 根 store 由这些运行时领域组合而成；它们都从 `stores/root-store` 的唯一实例读取。
 * `LegacyStoreShape` 仅保留给旧类型导入，不能再成为状态实现的来源。
 */
export type LegacyStoreShape = RootGameStore

export type PlayerSlice = Pick<RootGameStore, 'player' | 'startNewGame' | 'useItem' | 'equipWeapon'>
export type QuestSlice = Pick<RootGameStore, 'quests' | 'meetOldMan' | 'acceptCatQuest' | 'resolveCatQuest'>
export type BattleSlice = Pick<RootGameStore, 'battle' | 'startBattle' | 'useSkill' | 'retryBattle' | 'leaveBattle'>
export type WorldSlice = Pick<RootGameStore, 'world' | 'activeDialogue' | 'openDialogue' | 'closeDialogue' | 'recordNpcClick' | 'maybeNarrate' | 'dismissNarrator'>
export type SettingsSlice = Pick<RootGameStore, 'settings' | 'setSettings'>
export type ShellSlice = Pick<RootGameStore, 'screen' | 'setScreen' | 'activePanel' | 'setPanel' | 'temporaryMode' | 'toggleBossKey' | 'saveStatus' | 'setSaveStatus' | 'makeSave' | 'hydrateSave' | 'importSave'>

export type RootGameStoreSlices = PlayerSlice & QuestSlice & BattleSlice & WorldSlice & SettingsSlice & ShellSlice

export const sliceNames = ['player', 'quest', 'battle', 'world', 'settings', 'shell'] as const
export type SliceName = typeof sliceNames[number]
