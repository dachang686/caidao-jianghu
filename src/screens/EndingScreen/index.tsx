import { useState } from 'react'
import type { EndingRecordResult, EndingRecordState, EndingSelection } from '../../types/ending'

export interface EndingScreenProps {
  readonly selection: EndingSelection
  readonly state: EndingRecordState
  readonly onRecord?: (choiceId: string, confirmed: boolean) => EndingRecordResult | null
  readonly onContinue?: () => void
}

export function EndingScreen({ selection, state, onRecord, onContinue }: EndingScreenProps) {
  const [pendingChoiceId, setPendingChoiceId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const ending = selection.ending
  if (!ending) return <main className="ending-screen" data-testid="ending-screen"><section className="ending-card"><p className="ending-kicker">结局路线</p><h1>刀谱还差最后一页</h1><p>{selection.reason}</p><button type="button" onClick={onContinue}>返回江湖</button></section></main>

  const choose = (choiceId: string) => {
    const choice = ending.choices.find((candidate) => candidate.id === choiceId)
    if (!choice) return
    if (choice.seriousConfirmation && pendingChoiceId !== choiceId) {
      setPendingChoiceId(choiceId)
      setMessage('这是不可逆的最终选择；再次点击确认后才会记录。')
      return
    }
    if (onRecord) {
      const result = onRecord(choiceId, true)
      if (result) setMessage(result.message)
    }
    setPendingChoiceId(null)
  }

  return <main className="ending-screen" data-testid="ending-screen"><section className="ending-card" aria-labelledby="ending-title"><p className="ending-kicker">第八章 · 结算完成</p><h1 id="ending-title">{ending.title}</h1><h2>{ending.subtitle}</h2><p className="ending-summary">{ending.settlementSummary}</p><p className="ending-presentation" data-presentation-cue={ending.presentationCueId}>终局演出：{ending.postgameLabel}</p><div className="ending-candidates" aria-label="候选结局">{selection.candidates.map((candidate) => <span key={String(candidate.id)} className={candidate.id === ending.id ? 'ending-candidate ending-candidate--active' : 'ending-candidate'}>{candidate.title}</span>)}</div><div className="ending-choices">{ending.choices.map((choice) => <button key={choice.id} type="button" onClick={() => choose(choice.id)}>{pendingChoiceId === choice.id ? '再次确认：' : ''}{choice.label}<small>{choice.summary}</small></button>)}</div><p role="status" aria-live="polite">{message || (state.seenIds.includes(String(ending.id)) ? '本结局已记录，可继续原档。' : '选择结局后将保留原档，不会清除章节进度。')}</p>{state.postgameContinues && <button className="ending-continue" type="button" onClick={onContinue}>继续原档</button>}</section></main>
}
