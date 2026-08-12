import type { CommissionSnapshot } from '../../types/commission'
import type { SectDispatchSnapshot } from '../../types/dispatch'
import type { PostgameDifficulty, PostgameState } from '../../types/postgame'
import { Button } from '../game-ui'

export interface DispatchQueueProps {
  readonly dispatch: SectDispatchSnapshot
  readonly commissions?: CommissionSnapshot
  readonly onClaimDispatch: (dispatchId: string) => void
  readonly onClaimCommission?: (instanceId: string) => void
  readonly onCompleteCommission?: (instanceId: string) => void
  readonly postgame?: Pick<PostgameState, 'unlocked' | 'difficulty'>
  readonly onSetPostgameDifficulty?: (difficulty: PostgameDifficulty) => void
  readonly onGenerateCommission?: () => void
}

export function DispatchQueue({ dispatch, commissions, onClaimDispatch, onClaimCommission, onCompleteCommission, postgame, onSetPostgameDifficulty, onGenerateCommission }: DispatchQueueProps) {
  const activeTeams = dispatch.tasks.filter((task) => task.status !== 'claimed')
  return <section className="sect-operations" aria-labelledby="sect-operations-title"><div className="sect-section-heading"><div><span className="sect-kicker">战斗场次推进</span><h2 id="sect-operations-title">派遣队列</h2></div><strong>{activeTeams.length}/3 队</strong></div><p className="sect-rule-note">只有有效战斗完成才会推进场次，刷新页面或修改系统时间不会改变进度。</p><div className="sect-dispatch-list">{dispatch.tasks.length === 0 && <p className="sect-empty">还没有派遣队伍。先从门人名册选择队员。</p>}{dispatch.tasks.map((task) => <article className={`sect-dispatch-row is-${task.status}`} key={task.dispatchId} data-testid={`sect-dispatch-${task.dispatchId}`}><div><strong>{task.dispatchId}</strong><span>{task.discipleIds.join('、')}</span></div><div className="sect-dispatch-progress">{task.status === 'active' ? <><b>还需 {task.remainingTicks} 场有效战斗</b><small>总周期 {task.expectedTicks} 场</small></> : task.status === 'ready' ? <b>已完成，可领取</b> : <b>结果已领取</b>}</div>{task.status === 'ready' && <Button onClick={() => onClaimDispatch(task.dispatchId)}>领取结果</Button>}</article>)}</div>{commissions && <div className="sect-commission-block"><div className="sect-inline-heading"><h3>通关后委托</h3><span>{commissions.active.filter((task) => task.status !== 'claimed').length}/3</span></div>{postgame?.unlocked && <div className="sect-commission-controls"><div role="group" aria-label="通关后委托难度">{(['ordinary', 'elite', 'legendary'] as const).map((difficulty) => <Button key={difficulty} disabled={postgame.difficulty === difficulty} onClick={() => onSetPostgameDifficulty?.(difficulty)}>{difficulty === 'ordinary' ? '普通' : difficulty === 'elite' ? '精英' : '传说'}</Button>)}</div><Button data-testid="generate-postgame-commission" onClick={onGenerateCommission}>领取新委托</Button></div>}{commissions.active.length === 0 && <p className="sect-empty">完成结局后可领取普通、精英或传说委托。</p>}{commissions.active.map((task) => <article className="sect-commission-row" key={task.instanceId}><div><strong>{task.title}</strong><span>{task.target.label} · {task.regionId}</span></div>{task.status === 'ready' && onClaimCommission ? <Button onClick={() => onClaimCommission(task.instanceId)}>领取</Button> : task.status === 'active' && onCompleteCommission ? <Button onClick={() => onCompleteCommission(task.instanceId)}>完成委托</Button> : <small>{task.status === 'claimed' ? '已领取' : '待处理'}</small>}</article>)}</div>}</section>
}
