import type { Difficulty, GameSettings } from '../../types/settings'
import { normalizeKeyBindings } from './index'

export interface SettingsUpdateResult {
  readonly settings: GameSettings
  readonly difficultyBlocked: boolean
}

export function clampVolume(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
}

export function canChangeDifficulty(battleActive: boolean): boolean {
  return !battleActive
}

export function updateGameSettings(current: GameSettings, patch: Partial<GameSettings>, battleActive: boolean): SettingsUpdateResult {
  const difficultyBlocked = Boolean(patch.difficulty && patch.difficulty !== current.difficulty && !canChangeDifficulty(battleActive))
  const nextDifficulty: Difficulty = difficultyBlocked ? current.difficulty : (patch.difficulty ?? current.difficulty)
  const next = {
    ...current,
    ...patch,
    difficulty: nextDifficulty,
    masterVolume: clampVolume(patch.masterVolume ?? current.masterVolume),
    musicVolume: clampVolume(patch.musicVolume ?? current.musicVolume),
    sfxVolume: clampVolume(patch.sfxVolume ?? current.sfxVolume),
    sillyVolume: clampVolume(patch.sillyVolume ?? current.sillyVolume),
    keyBindings: normalizeKeyBindings(patch.keyBindings ?? current.keyBindings),
    aiEnhancement: { enabled: false, provider: 'none' } as const,
  }
  return { settings: next, difficultyBlocked }
}
