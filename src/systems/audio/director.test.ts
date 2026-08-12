import { describe, expect, it, vi } from 'vitest'
import type { GameSettings } from '../../types/settings'
import { AudioDirector, type AudioContextLike, type GainNodeLike, type OscillatorNodeLike } from './index'

class FakeParam {
  readonly values: number[] = []
  setValueAtTime(value: number): void { this.values.push(value) }
  exponentialRampToValueAtTime(value: number): void { this.values.push(value) }
}

class FakeOscillator implements OscillatorNodeLike {
  type: OscillatorType = 'sine'
  frequency = new FakeParam()
  onended: (() => void) | null = null
  startCalls = 0
  stopCalls = 0
  connect(): unknown { return this }
  start(): void { this.startCalls += 1 }
  stop(): void { this.stopCalls += 1 }
}

class FakeGain implements GainNodeLike {
  gain = new FakeParam()
  connect(): unknown { return this }
}

class FakeContext implements AudioContextLike {
  currentTime = 0
  state: AudioContextState = 'suspended'
  destination = {}
  oscillators: FakeOscillator[] = []
  gains: FakeGain[] = []
  resume = vi.fn(async () => { this.state = 'running' })
  close = vi.fn(async () => { this.state = 'closed' })
  createOscillator(): OscillatorNodeLike {
    const oscillator = new FakeOscillator()
    this.oscillators.push(oscillator)
    return oscillator
  }
  createGain(): GainNodeLike {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }
}

const settings: GameSettings = {
  reducedMotion: true,
  masterMuted: false,
  bgmEnabled: false,
  sfxEnabled: true,
  sillySfxEnabled: true,
  masterVolume: 1,
  musicVolume: 0.5,
  sfxVolume: 0.5,
  sillyVolume: 0.2,
  memeDensity: 'standard',
  textSpeed: 'standard',
  difficulty: 'standard',
  keyBindings: {
    confirm: ['Enter'], cancel: ['Escape'], nextTab: ['Tab'],
    skill1: ['Digit1'], skill2: ['Digit2'], skill3: ['Digit3'], skill4: ['Digit4'], skill5: ['Digit5'], skill6: ['Digit6'],
  },
  aiEnhancement: { enabled: false, provider: 'none' },
}

describe('AudioDirector', () => {
  it('没有 AudioContext 时保持静默并不阻塞核心流程', () => {
    const director = new AudioDirector({ createContext: () => null })
    expect(director.activate(settings)).toBe(false)
    expect(director.play('hit')).toBe(false)
    expect(director.snapshot().contextState).toBe('unavailable')
  })

  it('首次激活后限制并发 SFX 为 6，减少动态仍保留音效反馈', async () => {
    vi.useFakeTimers()
    const context = new FakeContext()
    const director = new AudioDirector({ createContext: () => context, musicIntervalMs: 100000 })
    expect(director.activate(settings)).toBe(true)
    await Promise.resolve()
    for (let index = 0; index < 10; index += 1) director.play('victory')
    expect(director.snapshot().activeSfx).toBeLessThanOrEqual(6)
    expect(director.snapshot().activeSfx).toBe(6)
    vi.advanceTimersByTime(1000)
    expect(director.snapshot().activeSfx).toBe(0)
    director.dispose()
    vi.useRealTimers()
  })

  it('BGM、普通音效和搞笑音效使用独立音量，静音会停止音乐计时器', async () => {
    vi.useFakeTimers()
    const context = new FakeContext()
    const director = new AudioDirector({ createContext: () => context, musicIntervalMs: 120 })
    const musicSettings = { ...settings, bgmEnabled: true, musicVolume: 1 }
    director.activate(musicSettings)
    await Promise.resolve()
    expect(director.snapshot().musicPlaying).toBe(true)
    director.update(settings)
    context.gains = []
    director.play('silly')
    const sillyPeak = Math.max(...context.gains.flatMap((gain) => gain.gain.values))
    expect(sillyPeak).toBeCloseTo(0.035 * settings.sfxVolume * settings.sillyVolume)
    director.update({ ...settings, sillyVolume: 1 })
    context.gains = []
    director.play('hit')
    const hitPeak = Math.max(...context.gains.flatMap((gain) => gain.gain.values))
    expect(hitPeak).toBeCloseTo(0.035 * settings.sfxVolume)
    director.update({ ...settings, masterMuted: true })
    expect(director.snapshot().musicPlaying).toBe(false)
    director.dispose()
    vi.useRealTimers()
  })
})
