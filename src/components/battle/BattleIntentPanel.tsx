export interface BattleIntentView {
  readonly label: string
  readonly summary: string
  readonly expectedDamage: number
  readonly expectedPostureDamage: number
  readonly honest: boolean
}

export function BattleIntentPanel({ intent }: { readonly intent: BattleIntentView }) {
  return (
    <aside className="battle-intent" aria-label="敌方意图">
      <div className="battle-intent__heading"><span>敌方意图</span><b>{intent.honest ? '诚实预览' : '虚实未明'}</b></div>
      <strong className="battle-intent__label">{intent.label}</strong>
      <p>{intent.summary}</p>
      <div className="battle-intent__numbers"><span>预计伤害 <b>{intent.expectedDamage}</b></span><span>预计削架势 <b>{intent.expectedPostureDamage}</b></span></div>
    </aside>
  )
}
