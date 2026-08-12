import type { GameSettings } from '../../types/settings'

export type SfxKind = 'tap' | 'hit' | 'victory' | 'silly'

export interface AudioParamLike {
  setValueAtTime(value: number, time: number): void
  exponentialRampToValueAtTime(value: number, time: number): void
}

export interface OscillatorNodeLike {
  type: OscillatorType
  frequency: AudioParamLike
  onended: (() => void) | null
  connect(destination: unknown): unknown
  start(when?: number): void
  stop(when?: number): void
}

export interface GainNodeLike {
  gain: AudioParamLike
  connect(destination: unknown): unknown
}

export interface AudioContextLike {
  readonly currentTime: number
  readonly destination: unknown
  readonly state?: AudioContextState
  createOscillator(): OscillatorNodeLike
  createGain(): GainNodeLike
  resume(): Promise<void> | void
  close?(): Promise<void> | void
}

export interface AudioDirectorOptions {
  readonly createContext?: () => AudioContextLike | null
  readonly maxConcurrentSfx?: number
  readonly musicIntervalMs?: number
}

export interface AudioDirectorSnapshot {
  readonly contextAvailable: boolean
  readonly contextState: AudioContextState | 'unavailable'
  readonly paused: boolean
  readonly musicPlaying: boolean
  readonly activeVoices: number
  readonly activeSfx: number
  readonly maxConcurrentSfx: number
}

interface ActiveVoice {
  readonly oscillator: OscillatorNodeLike
  readonly isSfx: boolean
  released: boolean
  releaseTimer: ReturnType<typeof globalThis.setTimeout> | null
}

type AudioContextConstructor = new () => AudioContextLike

function createBrowserAudioContext(): AudioContextLike | null {
  if (typeof window === 'undefined') return null
  const browserWindow = window as Window & { webkitAudioContext?: AudioContextConstructor }
  const Context = (window.AudioContext as unknown as AudioContextConstructor | undefined) ?? browserWindow.webkitAudioContext
  if (!Context) return null
  try {
    return new Context()
  } catch {
    return null
  }
}

/**
 * Web Audio 只在首次用户手势中激活；所有音量、静音和并发限制集中在系统层。
 * 没有 AudioContext 的浏览器仍可正常运行，核心反馈由战斗日志和界面状态提供。
 */
export class AudioDirector {
  private readonly createContext: () => AudioContextLike | null
  private readonly maxConcurrentSfx: number
  private readonly musicIntervalMs: number
  private context: AudioContextLike | null = null
  private musicTimer: ReturnType<typeof globalThis.setInterval> | null = null
  private settings: GameSettings | null = null
  private paused = false
  private step = 0
  private readonly activeVoices = new Set<ActiveVoice>()

  constructor(options: AudioDirectorOptions = {}) {
    this.createContext = options.createContext ?? createBrowserAudioContext
    this.maxConcurrentSfx = Math.min(6, Math.max(1, Math.floor(options.maxConcurrentSfx ?? 6)))
    this.musicIntervalMs = Math.max(120, Math.floor(options.musicIntervalMs ?? 720))
  }

  /** 由 App 的首次 pointerdown 调用；重复调用只 resume 现有上下文。 */
  activate(settings: GameSettings): boolean {
    this.settings = settings
    if (!this.context) this.context = this.createContext()
    if (!this.context) return false
    try {
      const result = this.context.resume()
      if (result && typeof result.then === 'function') void result.then(() => this.syncMusic()).catch(() => undefined)
      else this.syncMusic()
      return true
    } catch {
      return false
    }
  }

  update(settings: GameSettings): void {
    this.settings = settings
    this.syncMusic()
  }

  setPaused(paused: boolean): void {
    this.paused = paused
    this.syncMusic()
  }

  play(kind: SfxKind): boolean {
    const settings = this.settings
    if (!this.context || !settings || settings.masterMuted || !settings.sfxEnabled || this.paused) return false
    if (kind === 'silly' && !settings.sillySfxEnabled) return false
    const frequencies: Record<SfxKind, number[]> = {
      tap: [660],
      hit: [156, 122],
      victory: [523, 659, 784],
      silly: [392, 330, 262],
    }
    const gainMultiplier = kind === 'silly' ? settings.sillyVolume : 1
    const gain = 0.035 * settings.sfxVolume * gainMultiplier * settings.masterVolume
    if (gain <= 0) return false
    let played = 0
    frequencies[kind].forEach((frequency, index) => {
      if (this.note(
        frequency,
        this.context!.currentTime + index * 0.07,
        kind === 'hit' ? 0.08 : 0.13,
        kind === 'hit' ? 'square' : 'triangle',
        gain,
        true,
      )) played += 1
    })
    return played > 0
  }

  snapshot(): AudioDirectorSnapshot {
    return {
      contextAvailable: this.context !== null,
      contextState: this.context?.state ?? 'unavailable',
      paused: this.paused,
      musicPlaying: this.musicTimer !== null,
      activeVoices: this.activeVoices.size,
      activeSfx: [...this.activeVoices].filter((voice) => voice.isSfx).length,
      maxConcurrentSfx: this.maxConcurrentSfx,
    }
  }

  /** 释放计时器、振荡器和 AudioContext；下一次 activate 可重新建立上下文。 */
  dispose(): void {
    this.clearMusicTimer()
    for (const voice of [...this.activeVoices]) this.stopVoice(voice)
    const context = this.context
    this.context = null
    this.settings = null
    this.paused = false
    if (context?.close) {
      try {
        void context.close()
      } catch {
        // 浏览器关闭上下文失败不应影响游戏状态。
      }
    }
  }

  private syncMusic(): void {
    const settings = this.settings
    const shouldPlay = Boolean(this.context && settings && !settings.masterMuted && settings.bgmEnabled && settings.musicVolume > 0 && !this.paused)
    if (!shouldPlay) {
      this.clearMusicTimer()
      this.stopMusicVoices()
      return
    }
    if (this.musicTimer !== null) return
    this.playMusicStep()
    this.musicTimer = globalThis.setInterval(() => this.playMusicStep(), this.musicIntervalMs)
  }

  private clearMusicTimer(): void {
    if (this.musicTimer === null) return
    globalThis.clearInterval(this.musicTimer)
    this.musicTimer = null
  }

  private playMusicStep(): void {
    const settings = this.settings
    if (!this.context || !settings || settings.masterMuted || !settings.bgmEnabled || settings.musicVolume <= 0 || this.paused) return
    const pentatonic = [261.63, 293.66, 329.63, 392, 440, 523.25]
    const index = [0, 2, 4, 2, 1, 3, 5, 3][this.step % 8]!
    this.step += 1
    this.note(pentatonic[index]!, this.context.currentTime, 0.48, 'sine', 0.018 * settings.musicVolume * settings.masterVolume, false)
  }

  private note(
    frequency: number,
    start: number,
    duration: number,
    waveform: OscillatorType,
    gain: number,
    isSfx: boolean,
  ): boolean {
    if (!this.context || (isSfx && this.activeSfxCount() >= this.maxConcurrentSfx)) return false
    try {
      const oscillator = this.context.createOscillator()
      const volume = this.context.createGain()
      const safeGain = Math.max(0.0001, gain)
      oscillator.type = waveform
      oscillator.frequency.setValueAtTime(frequency, start)
      volume.gain.setValueAtTime(0.0001, start)
      volume.gain.exponentialRampToValueAtTime(safeGain, start + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      oscillator.connect(volume)
      volume.connect(this.context.destination)
      const voice: ActiveVoice = { oscillator, isSfx, released: false, releaseTimer: null }
      oscillator.onended = () => this.releaseVoice(voice)
      this.activeVoices.add(voice)
      oscillator.start(start)
      oscillator.stop(start + duration + 0.03)
      const delay = Math.max(0, (start - this.context.currentTime + duration + 0.08) * 1000)
      voice.releaseTimer = globalThis.setTimeout(() => this.releaseVoice(voice), delay)
      return true
    } catch {
      return false
    }
  }

  private activeSfxCount(): number {
    let count = 0
    this.activeVoices.forEach((voice) => { if (voice.isSfx && !voice.released) count += 1 })
    return count
  }

  private stopMusicVoices(): void {
    for (const voice of [...this.activeVoices]) {
      if (!voice.isSfx) this.stopVoice(voice)
    }
  }

  private stopVoice(voice: ActiveVoice): void {
    if (voice.released) return
    try {
      voice.oscillator.stop()
    } catch {
      // 已停止的振荡器会抛异常，释放引用仍需继续。
    }
    this.releaseVoice(voice)
  }

  private releaseVoice(voice: ActiveVoice): void {
    if (voice.released) return
    voice.released = true
    if (voice.releaseTimer !== null) {
      globalThis.clearTimeout(voice.releaseTimer)
      voice.releaseTimer = null
    }
    this.activeVoices.delete(voice)
  }
}

export const audioDirector = new AudioDirector()

