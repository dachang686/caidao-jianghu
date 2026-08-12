import { describe, expect, it } from 'vitest'
import { applyPostureDamage, createPosture, postureDamageMultiplier, tickPosture } from './posture'
import { toEnemyIntentUiSummary } from './intent'

describe('posture and enemy intent', () => {
  it('破防只触发一次，易伤持续一回合后重置', () => {
    let posture = createPosture(10)
    expect(applyPostureDamage(posture, 4).brokeNow).toBe(false)
    const broken = applyPostureDamage(posture, 10)
    posture = broken.state
    expect(broken.brokeNow).toBe(true)
    expect(postureDamageMultiplier(posture)).toBe(1.5)
    expect(applyPostureDamage(posture, 20).brokeNow).toBe(false)
    expect(tickPosture(posture)).toMatchObject({ broken: false, current: 10, exposedTurns: 0 })
    expect(postureDamageMultiplier(tickPosture(posture))).toBe(1)
  })

  it('意图摘要直接提供安全预览，普通敌人保持诚实', () => {
    const summary = toEnemyIntentUiSummary({ id: 'intent:smash', kind: 'aggressive', label: '猛攻', summary: '预计造成 12 点伤害', expectedDamage: 12, expectedPostureDamage: 4, guardRatio: 0, honest: true, deceptiveChance: 0 })
    expect(summary).toEqual({ id: 'intent:smash', kind: 'aggressive', label: '猛攻', summary: '预计造成 12 点伤害', expectedDamage: 12, expectedPostureDamage: 4, guardRatio: 0, honest: true })
  })
})
