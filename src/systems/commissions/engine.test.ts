import { describe, expect, it } from 'vitest'
import { commissionTemplates } from '../../content/commissions/templates'
import { asWorldRegionId } from '../../types/ids'
import type { CommissionTemplate } from '../../types/commission'
import {
  CommissionEngine,
  CommissionEngineError,
  claimCommission,
  createCommissionEngine,
  generateCommission,
  markCommissionReady,
  validateCommissionTemplates,
} from './engine'

const village = asWorldRegionId('xiaoyu-village')

function context(progress: number, regionId: string | undefined = village.toString(), seed = 99) {
  return { chapter: 5, unlockedRegionIds: [village], progress, regionId, rng: { seed, state: seed } }
}

describe('commission engine', () => {
  it('同 seed/进度生成相同的上下文委托，关闭区域不会生成任务', () => {
    const first = createCommissionEngine(commissionTemplates)
    const second = createCommissionEngine(commissionTemplates)
    const firstResult = generateCommission(first, context(10))
    const secondResult = generateCommission(second, context(10))
    expect(firstResult).toEqual(secondResult)
    expect(firstResult.task?.target.label).toBeTruthy()
    expect(firstResult.task?.regionId).toBe(village)

    const closed = createCommissionEngine([{
      ...commissionTemplates[0]!,
      id: 'commission:closed',
      regionId: asWorldRegionId('qinghe-county'),
    }])
    expect(generateCommission(closed, context(11)).status).toBe('no_eligible_template')
  })

  it('活跃委托最多三项，重复模板收益逐步回落，领取幂等', () => {
    const engine = createCommissionEngine([commissionTemplates[0]!])
    const first = generateCommission(engine, context(1))
    expect(first.status).toBe('generated')
    markCommissionReady(engine, first.task!.instanceId)
    const claimed = claimCommission(engine, first.task!.instanceId)
    expect(claimed.status).toBe('claimed')
    expect(claimCommission(engine, first.task!.instanceId).status).toBe('already_claimed')

    const repeated = generateCommission(engine, context(2))
    expect(repeated.task?.payoutMultiplier).toBe(0.85)
    expect(repeated.task?.reward.wealth).toBeLessThan(first.task?.reward.wealth ?? 0)

    const full = createCommissionEngine(commissionTemplates.slice(0, 4))
    expect(generateCommission(full, context(1)).status).toBe('generated')
    expect(generateCommission(full, context(2)).status).toBe('generated')
    expect(generateCommission(full, context(3)).status).toBe('generated')
    expect(generateCommission(full, context(4)).status).toBe('limit_reached')
  })

  it('高价值一次性模板和纯数字跑腿均有明确安全阀', () => {
    const oneTime: CommissionTemplate = { ...commissionTemplates[9]!, id: 'commission:one-time-test', reward: { ...commissionTemplates[9]!.reward, grantKey: 'grant:one-time-test' } }
    const engine = createCommissionEngine([oneTime])
    const generated = generateCommission(engine, context(1))
    expect(generated.status).toBe('generated')
    markCommissionReady(engine, generated.task!.instanceId)
    expect(claimCommission(engine, generated.task!.instanceId).status).toBe('claimed')
    expect(generateCommission(engine, context(2)).status).toBe('no_eligible_template')

    const invalid: CommissionTemplate = { ...commissionTemplates[0]!, id: 'commission:numeric-only', target: { kind: 'collect', id: 'count', label: '收集数字', contextTags: [] } }
    expect(validateCommissionTemplates([invalid]).valid).toBe(false)
    expect(() => new CommissionEngine([invalid])).toThrow(CommissionEngineError)
  })
})
