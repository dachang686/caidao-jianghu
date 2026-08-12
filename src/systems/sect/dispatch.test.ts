import { describe, expect, it } from 'vitest'
import { asDiscipleId } from '../../types/ids'
import { DeterministicRng } from '../rng'
import { EventBus } from '../events'
import type { BattleCompletedEvent, DispatchStartRequest } from '../../types/dispatch'
import {
  BATTLE_COMPLETED_EVENT,
  SectDispatchEngine,
  advanceDispatch,
  claimDispatch,
  createDispatchEngine,
  startDispatch,
} from './dispatch'

const d1 = asDiscipleId('disciple:one')
const d2 = asDiscipleId('disciple:two')
const d3 = asDiscipleId('disciple:three')
const d4 = asDiscipleId('disciple:four')
const rootRng = new DeterministicRng(2026).snapshot()

function request(dispatchId: string, discipleIds = [d1], baseDurationTicks = 2): DispatchStartRequest {
  return { dispatchId, discipleIds, baseDurationTicks, modifiers: { qualityDelta: 1 }, rng: rootRng }
}

function battle(id: string, payload: Record<string, unknown> = { battleId: id, outcome: 'won' }): BattleCompletedEvent {
  return { id, type: BATTLE_COMPLETED_EVENT, occurredAtTick: 0, sourceActionId: `action:${id}`, payload: payload as unknown as BattleCompletedEvent['payload'] }
}

describe('sect dispatch ticks', () => {
  it('只有有效 battle.completed 推进 tick，重复/逃跑/重试/模拟不重复计数', () => {
    const engine = createDispatchEngine()
    const started = startDispatch(engine, request('dispatch:one'))
    expect(started.status).toBe('started')
    expect(started.task?.expectedTicks).toBe(2)
    expect(started.task?.rng).toEqual(new DeterministicRng(rootRng.seed, rootRng.state).fork('sect-dispatch:dispatch:one').snapshot())

    expect(advanceDispatch(engine, battle('battle:escape', { battleId: 'battle:escape', outcome: 'escaped' })).status).toBe('ignored_event')
    expect(advanceDispatch(engine, battle('battle:retry', { battleId: 'battle:retry', outcome: 'won', isRetry: true })).status).toBe('ignored_event')
    expect(advanceDispatch(engine, battle('battle:simulation', { battleId: 'battle:simulation', outcome: 'won', mode: 'preview' })).status).toBe('ignored_event')
    expect(engine.getState().battleTick).toBe(0)

    expect(advanceDispatch(engine, battle('battle:one')).status).toBe('advanced')
    expect(engine.getState().tasks[0]?.remainingTicks).toBe(1)
    expect(advanceDispatch(engine, battle('battle:one')).status).toBe('duplicate_event')
    expect(engine.getState().battleTick).toBe(1)
    expect(advanceDispatch(engine, battle('battle:two')).advancedTaskIds).toEqual(['dispatch:one'])
    expect(engine.getState().tasks[0]?.status).toBe('ready')
  })

  it('最多三队并行，门人不能被多个活动队伍占用', () => {
    const engine = new SectDispatchEngine()
    expect(engine.start(request('dispatch:a', [d1])).status).toBe('started')
    expect(engine.start(request('dispatch:b', [d2])).status).toBe('started')
    expect(engine.start(request('dispatch:c', [d3])).status).toBe('started')
    expect(engine.start(request('dispatch:d', [d4])).status).toBe('team_limit')

    const occupiedEngine = new SectDispatchEngine()
    expect(occupiedEngine.start(request('dispatch:occupied', [d1])).status).toBe('started')
    expect(occupiedEngine.start(request('dispatch:conflict', [d1, d4])).status).toBe('disciple_occupied')
  })

  it('领取结果固定且幂等，EventBus 只接收有效战斗完成事件', () => {
    const engine = createDispatchEngine()
    engine.start(request('dispatch:claim', [d1], 1))
    const bus = new EventBus()
    const unsubscribe = engine.subscribe(bus)
    bus.dispatch(battle('battle:claim'))
    unsubscribe()
    const first = claimDispatch(engine, 'dispatch:claim')
    const second = claimDispatch(engine, 'dispatch:claim')
    expect(first.status).toBe('claimed')
    expect(second.status).toBe('already_claimed')
    expect(second.claim).toEqual(first.claim)
    expect(first.claim?.qualityScore).toBeGreaterThanOrEqual(0)
    expect(first.claim?.qualityScore).toBeLessThanOrEqual(100)
  })
})
