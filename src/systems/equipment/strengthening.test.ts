import { describe, expect, it } from 'vitest'
import { strengtheningBalance } from '../../content/balance/strengthening'
import { attemptStrengthening, applyStrengtheningResult, createStrengtheningState, rollStrengthening } from './strengthening'

function fundedState(overrides = {}) {
  return createStrengtheningState('instance:sword-1', {
    silver: 500,
    materials: { 'item:iron-scrap': 20, 'item:tempered-steel': 5 },
    ...overrides,
  })
}

describe('seeded strengthening', () => {
  it('同一存档 seed、实例和尝试序号得到相同结果，失败不销毁装备', () => {
    const first = rollStrengthening(fundedState(), 1234)
    const second = rollStrengthening(fundedState(), 1234)
    expect(second).toEqual(first)
    const failedConfig = [{ ...strengtheningBalance[0], successChance: 0 }]
    const failed = attemptStrengthening(fundedState(), 1234, failedConfig)
    expect(failed.result.outcome).toBe('failed')
    expect(failed.state.level).toBe(0)
    expect(failed.state.history).toHaveLength(1)
  })

  it('资源不足与 +5 上限均安全，重复应用同一结果不重复扣除', () => {
    const poor = attemptStrengthening(createStrengtheningState('instance:poor'), 1)
    expect(poor.result.outcome).toBe('insufficient_resources')
    expect(poor.state.attemptCount).toBe(0)

    const capped = fundedState({ level: 5 })
    const capResult = attemptStrengthening(capped, 1)
    expect(capResult.result.outcome).toBe('capped')
    expect(capResult.state).toEqual(capped)

    const state = fundedState()
    const result = rollStrengthening(state, 7)
    const applied = applyStrengtheningResult(state, result)
    const duplicate = applyStrengtheningResult(applied, result)
    expect(duplicate).toEqual(applied)
  })
})

