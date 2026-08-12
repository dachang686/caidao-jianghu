import { afterEach, describe, expect, it, vi } from 'vitest'
import { CORE_PRESENTATION_CUES } from '../../content/comedy/presentation'
import { PresentationCueRuntime, validatePresentationCueDefinitions } from './presentation'

describe('PresentationCueRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('按铺垫、动作、停顿、反应推进，并在 1200ms 内完成', () => {
    vi.useFakeTimers()
    const definition = CORE_PRESENTATION_CUES[0]!
    expect(validatePresentationCueDefinitions(CORE_PRESENTATION_CUES)).toEqual({ valid: true, issues: [] })
    const runtime = new PresentationCueRuntime(CORE_PRESENTATION_CUES)
    const first = runtime.play({ definition, actionId: 'battle:1' })
    expect(first).toMatchObject({ status: 'started', snapshot: { status: 'running', phase: 'anticipation', stepIndex: 0 } })

    vi.advanceTimersByTime(120)
    expect(runtime.getSnapshot()).toMatchObject({ status: 'running', phase: 'action', stepIndex: 1 })
    vi.advanceTimersByTime(180)
    expect(runtime.getSnapshot()).toMatchObject({ phase: 'pause', stepIndex: 2 })
    vi.advanceTimersByTime(120)
    expect(runtime.getSnapshot()).toMatchObject({ phase: 'reaction', stepIndex: 3 })
    vi.advanceTimersByTime(220)
    expect(runtime.getSnapshot()).toMatchObject({ status: 'completed', phase: 'reaction', stepIndex: 3 })
    runtime.dispose()
  })

  it('同动作最多一个完整 cue，重复、减少动态和静音都降级为无计时静态反馈', () => {
    vi.useFakeTimers()
    const definition = CORE_PRESENTATION_CUES[0]!
    const runtime = new PresentationCueRuntime([definition])
    expect(runtime.play({ definition, actionId: 'same-action' }).status).toBe('started')
    expect(runtime.play({ definition, actionId: 'same-action' }).snapshot).toMatchObject({ status: 'short', cueId: definition.shortCueId, isRepeat: true })
    expect(vi.getTimerCount()).toBe(0)
    expect(runtime.play({ definition, actionId: 'reduced-action', reducedMotion: true }).snapshot).toMatchObject({ status: 'static', cueId: definition.reducedMotionCueId, reducedMotion: true })
    expect(runtime.play({ definition, actionId: 'muted-action', muted: true }).snapshot).toMatchObject({ status: 'static', cueId: definition.reducedMotionCueId, muted: true })
    runtime.dispose()
  })

  it('skip、cancel 和 dispose 会清理剩余计时器，不产生后续状态推进', () => {
    vi.useFakeTimers()
    const definition = CORE_PRESENTATION_CUES[1]!
    const runtime = new PresentationCueRuntime([definition])
    runtime.play({ definition, actionId: 'skip-action' })
    expect(vi.getTimerCount()).toBe(1)
    expect(runtime.skip().status).toBe('skipped')
    expect(vi.getTimerCount()).toBe(0)
    vi.runAllTimers()
    expect(runtime.getSnapshot().status).toBe('skipped')

    runtime.play({ definition, actionId: 'cancel-action' })
    runtime.cancel()
    expect(vi.getTimerCount()).toBe(0)
    runtime.dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})
