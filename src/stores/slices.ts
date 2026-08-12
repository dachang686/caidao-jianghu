import type { RootGameStore } from './root-store'

/**
 * 根 store 由这些运行时领域组合而成；它们都从 `stores/root-store` 的唯一实例读取。
 */
export type PlayerSlice = Pick<RootGameStore, 'player' | 'startNewGame' | 'useItem' | 'equipWeapon'>
export type QuestSlice = Pick<RootGameStore, 'quests' | 'meetOldMan' | 'acceptCatQuest' | 'resolveCatQuest'>
export type BattleSlice = Pick<RootGameStore, 'battle' | 'startBattle' | 'useSkill' | 'retryBattle' | 'leaveBattle'>
export type WorldSlice = Pick<RootGameStore, 'world' | 'activeDialogue' | 'openDialogue' | 'closeDialogue' | 'recordNpcClick' | 'maybeNarrate' | 'dismissNarrator'>
export type SettingsSlice = Pick<RootGameStore, 'settings' | 'setSettings'>
export type ShellSlice = Pick<RootGameStore, 'screen' | 'setScreen' | 'activePanel' | 'setPanel' | 'temporaryMode' | 'toggleBossKey' | 'saveStatus' | 'setSaveStatus' | 'makeSaveV2' | 'hydrateSaveV2' | 'importSaveV2'>

export type RootGameStoreSlices = PlayerSlice & QuestSlice & BattleSlice & WorldSlice & SettingsSlice & ShellSlice

export const sliceNames = ['player', 'quest', 'battle', 'world', 'settings', 'shell'] as const
export type SliceName = typeof sliceNames[number]
