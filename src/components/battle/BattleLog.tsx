export interface BattleLogView {
  readonly id: string
  readonly text: string
  readonly kind: 'system' | 'player' | 'enemy' | 'critical' | 'status'
}

export function BattleLog({ logs }: { readonly logs: readonly BattleLogView[] }) {
  return (
    <section className="battle-log-panel" aria-label="战斗日志">
      <div className="battle-log-panel__heading"><h2>战斗记录</h2><span>最多保留 50 条</span></div>
      <div className="battle-log-panel__body" role="log" aria-live="off">
        {logs.map((log) => <p className={`battle-log-entry battle-log-entry--${log.kind}`} key={log.id}>{log.text}</p>)}
      </div>
    </section>
  )
}
