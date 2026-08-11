import type { GameSettings } from './types'

type SfxKind = 'tap' | 'hit' | 'victory' | 'silly'

class AudioDirector {
  private context: AudioContext | null = null
  private musicTimer: number | null = null
  private settings: GameSettings | null = null
  private paused = false
  private step = 0

  activate(settings: GameSettings) {
    this.settings = settings
    if (typeof window === 'undefined') return
    this.context ??= new AudioContext()
    void this.context.resume().then(() => this.syncMusic())
  }

  update(settings: GameSettings) {
    this.settings = settings
    this.syncMusic()
  }

  setPaused(paused: boolean) {
    this.paused = paused
    this.syncMusic()
  }

  play(kind: SfxKind) {
    if (!this.context || !this.settings || this.settings.masterMuted || !this.settings.sfxEnabled || this.paused) return
    if (kind === 'silly' && !this.settings.sillySfxEnabled) return
    const frequencies: Record<SfxKind, number[]> = {
      tap: [660],
      hit: [156, 122],
      victory: [523, 659, 784],
      silly: [392, 330, 262],
    }
    frequencies[kind].forEach((frequency, index) => this.note(frequency, this.context!.currentTime + index * 0.07, kind === 'hit' ? 0.08 : 0.13, kind === 'hit' ? 'square' : 'triangle', 0.035))
  }

  private syncMusic() {
    const shouldPlay = Boolean(this.context && this.settings && !this.settings.masterMuted && this.settings.bgmEnabled && !this.paused)
    if (!shouldPlay) {
      if (this.musicTimer !== null) window.clearInterval(this.musicTimer)
      this.musicTimer = null
      return
    }
    if (this.musicTimer !== null) return
    this.playMusicStep()
    this.musicTimer = window.setInterval(() => this.playMusicStep(), 720)
  }

  private playMusicStep() {
    if (!this.context || !this.settings || this.settings.masterMuted || !this.settings.bgmEnabled || this.paused) return
    const pentatonic = [261.63, 293.66, 329.63, 392, 440, 523.25]
    const index = [0, 2, 4, 2, 1, 3, 5, 3][this.step % 8]
    this.step += 1
    this.note(pentatonic[index], this.context.currentTime, 0.48, 'sine', 0.018)
  }

  private note(frequency: number, start: number, duration: number, waveform: OscillatorType, gain: number) {
    if (!this.context) return
    const oscillator = this.context.createOscillator()
    const volume = this.context.createGain()
    oscillator.type = waveform
    oscillator.frequency.setValueAtTime(frequency, start)
    volume.gain.setValueAtTime(0.0001, start)
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(volume).connect(this.context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
  }
}

export const audioDirector = new AudioDirector()
