import type { MemeDensity } from './text-provider'
export type TextSpeed = 'slow' | 'standard' | 'fast'
export type Difficulty = 'story' | 'standard' | 'expert'

export type InputAction = 'confirm' | 'cancel' | 'nextTab' | 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'skill5' | 'skill6'
export type KeyBindingMap = Readonly<Record<InputAction, readonly string[]>>

export interface GameSettings {
  readonly reducedMotion: boolean
  readonly masterMuted: boolean
  readonly bgmEnabled: boolean
  readonly sfxEnabled: boolean
  readonly sillySfxEnabled: boolean
  readonly masterVolume: number
  readonly musicVolume: number
  readonly sfxVolume: number
  readonly sillyVolume: number
  readonly memeDensity: MemeDensity
  readonly textSpeed: TextSpeed
  readonly difficulty: Difficulty
  readonly keyBindings: KeyBindingMap
  /** 1.0 only exposes the offline provider contract. */
  readonly aiEnhancement: {
    readonly enabled: false
    readonly provider: 'none'
  }
}
