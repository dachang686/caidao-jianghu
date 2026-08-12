import { Meter } from '../game-ui'

export interface BattleStatusView {
  readonly id: string
  readonly label: string
  readonly turns: number
}

export interface BattlePostureView {
  readonly current: number
  readonly max: number
  readonly broken: boolean
  readonly exposedTurns: number
}

export interface BattleCombatantView {
  readonly name: string
  readonly side: 'player' | 'enemy'
  readonly sprite: string
  readonly hp: number
  readonly maxHp: number
  readonly qi: number
  readonly maxQi: number
  readonly posture: BattlePostureView
  readonly statuses: readonly BattleStatusView[]
  readonly subtitle: string
  readonly phase?: 1 | 2
}

export function BattleCombatantCard({ combatant }: { readonly combatant: BattleCombatantView }) {
  const { posture } = combatant
  return (
    <article className={`battle-combatant battle-combatant--${combatant.side}`} aria-label={`${combatant.name}战斗状态`}>
      <div className="battle-combatant__heading">
        <span className="battle-combatant__side">{combatant.side === 'player' ? '我方' : '敌方'}</span>
        {combatant.phase === 2 && <span className="battle-combatant__phase">二阶段</span>}
      </div>
      <div className="battle-combatant__portrait">
        <img src={combatant.sprite} alt="" />
        <span aria-hidden="true">{combatant.side === 'enemy' && combatant.phase === 2 ? '💢' : '✦'}</span>
      </div>
      <h2>{combatant.name}</h2>
      <p className="battle-combatant__subtitle">{combatant.subtitle}</p>
      <div className="battle-resource-row"><span>生命</span><Meter value={combatant.hp} max={combatant.maxHp} /><strong>{combatant.hp}/{combatant.maxHp}</strong></div>
      <div className="battle-resource-row"><span>内力</span><Meter value={combatant.qi} max={combatant.maxQi} tone="blue" /><strong>{combatant.qi}/{combatant.maxQi}</strong></div>
      <div className={`battle-resource-row battle-resource-row--posture${posture.broken ? ' is-broken' : ''}`}>
        <span>架势</span><Meter value={posture.current} max={posture.max} tone="green" /><strong>{posture.broken ? '破防' : `${posture.current}/${posture.max}`}</strong>
      </div>
      <div className="battle-statuses" aria-label={`${combatant.name}状态`}>
        {combatant.statuses.length === 0 ? <span className="battle-statuses__empty">无异常状态</span> : combatant.statuses.map((status) => <span className="battle-status" key={`${status.id}-${status.turns}`}>{status.label}<b>{status.turns}回合</b></span>)}
      </div>
    </article>
  )
}
