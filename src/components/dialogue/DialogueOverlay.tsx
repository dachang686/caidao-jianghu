import { useEffect, useState } from 'react'
import type { ChoiceId } from '../../types/ids'
import type { DialoguePlaybackMode, DialogueSnapshot, DialogueView } from '../../types/dialogue'

export interface DialogueOverlayProps {
  readonly view: DialogueView
  readonly state: DialogueSnapshot
  readonly onChoose: (choiceId: ChoiceId, confirm?: boolean) => void
  readonly onAdvance: () => void
  readonly onSetMode: (mode: DialoguePlaybackMode) => void
  readonly onSetAuto: (auto: boolean) => void
  readonly onClose?: () => void
}

/** 展示层不判断条件/奖励，只使用引擎返回的 enabled、reason 与确认标记。 */
export function DialogueOverlay({ view, state, onChoose, onAdvance, onSetMode, onSetAuto, onClose }: DialogueOverlayProps) {
  const [pendingConfirmation, setPendingConfirmation] = useState<ChoiceId | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onAdvance()
      } else if (event.key === 'Escape' && onClose) {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onAdvance, onClose])

  if (!view.node) return null

  const choose = (choiceId: ChoiceId, requiresConfirmation: boolean) => {
    if (requiresConfirmation && pendingConfirmation !== choiceId) {
      setPendingConfirmation(choiceId)
      return
    }
    setPendingConfirmation(null)
    onChoose(choiceId, requiresConfirmation)
  }

  return (
    <section className="dialogue-engine-overlay" role="dialog" aria-modal="true" aria-label="对白" data-testid="dialogue-engine">
      <header className="dialogue-engine-header">
        <span>{view.node.speakerNpcId ?? '说书人'}</span>
        <div className="dialogue-engine-controls" aria-label="对白播放控制">
          <button type="button" aria-pressed={state.mode === 'typewriter'} onClick={() => onSetMode('typewriter')}>逐字</button>
          <button type="button" aria-pressed={state.mode === 'instant'} onClick={() => onSetMode('instant')}>立即</button>
          <button type="button" aria-pressed={state.auto} onClick={() => onSetAuto(!state.auto)}>{state.auto ? '停止 Auto' : 'Auto'}</button>
          {onClose && <button type="button" onClick={onClose} aria-label="关闭对白">×</button>}
        </div>
      </header>
      <p className="dialogue-engine-text" aria-live="polite">{view.node.text}</p>
      {view.status === 'diagnostic' && <p className="dialogue-engine-diagnostic" role="alert">{view.diagnostic}</p>}
      <div className="dialogue-engine-options" aria-label="对白选项">
        {view.choices.map((entry) => {
          const confirming = pendingConfirmation === entry.optionId
          return (
            <button
              key={entry.optionId}
              type="button"
              disabled={!entry.enabled}
              data-testid={`dialogue-option-${entry.optionId}`}
              aria-label={!entry.enabled ? `${entry.choice.label}：${entry.reason ?? '不可用'}` : entry.choice.label}
              onClick={() => choose(entry.optionId, entry.requiresConfirmation)}
            >
              {!entry.enabled && '🔒 '}
              {confirming ? `再次确认：${entry.choice.label}` : entry.choice.label}
              {!entry.enabled && <small>{entry.reason}</small>}
            </button>
          )
        })}
      </div>
      <button type="button" className="dialogue-engine-advance" onClick={onAdvance}>{state.readNodeIds.includes(view.node.id) ? '继续' : '跳过逐字'}</button>
    </section>
  )
}
