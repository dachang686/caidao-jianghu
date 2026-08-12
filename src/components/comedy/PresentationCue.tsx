import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { PresentationCueDefinition, PresentationCueSnapshot } from '../../types/comedy'
import { PresentationCueRuntime } from '../../systems/comedy/presentation'

const PHASE_LABELS: Record<PresentationCueSnapshot['phase'], string> = {
  idle: '准备',
  anticipation: '铺垫',
  action: '动作',
  pause: '停顿',
  reaction: '反应',
  short: '短版',
  static: '静态反馈',
}

export interface PresentationCueProps {
  readonly definition: PresentationCueDefinition
  readonly actionId: string
  readonly cueId?: string
  readonly isRepeat?: boolean
  readonly reducedMotion?: boolean
  readonly muted?: boolean
  readonly label?: ReactNode
  readonly onComplete?: (snapshot: PresentationCueSnapshot) => void
}

export function PresentationCue({ definition, actionId, cueId, isRepeat, reducedMotion, muted, label = '演出反馈', onComplete }: PresentationCueProps) {
  const runtimeRef = useRef<PresentationCueRuntime | null>(null)
  const [snapshot, setSnapshot] = useState<PresentationCueSnapshot>({
    status: 'idle',
    phase: 'idle',
    stepIndex: -1,
    cueId: null,
    actionId: null,
    isRepeat: false,
    reducedMotion: false,
    muted: false,
  })

  useEffect(() => {
    const runtime = new PresentationCueRuntime([definition])
    runtimeRef.current = runtime
    const unsubscribe = runtime.subscribe(setSnapshot)
    runtime.play({ definition, actionId, cueId, isRepeat, reducedMotion, muted })
    return () => {
      unsubscribe()
      runtime.dispose()
      if (runtimeRef.current === runtime) runtimeRef.current = null
    }
  }, [actionId, cueId, definition.id, isRepeat, muted, reducedMotion])

  useEffect(() => {
    if (snapshot.status === 'completed' || snapshot.status === 'short' || snapshot.status === 'static' || snapshot.status === 'skipped') {
      onComplete?.(snapshot)
    }
  }, [onComplete, snapshot])

  if (snapshot.status === 'idle' || snapshot.status === 'cancelled') return null

  const running = snapshot.status === 'running'
  return (
    <aside className={`presentation-cue presentation-cue--${snapshot.status}`} data-testid="presentation-cue" data-cue-phase={snapshot.phase} role="status" aria-live="polite">
      <span className="presentation-cue__eyebrow">{snapshot.isRepeat ? '短版回响' : '演出反馈'}</span>
      <strong>{label}</strong>
      <span className="presentation-cue__phase">{PHASE_LABELS[snapshot.phase]}</span>
      {running && <button type="button" className="presentation-cue__skip" onClick={() => runtimeRef.current?.skip()}>跳过演出</button>}
    </aside>
  )
}

