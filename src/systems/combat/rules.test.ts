import { describe, expect, it } from 'vitest'
import { calculateDamage } from './damage'
import { addStatus, hasStatus, tickStatuses } from './status'
import { getSkillUnavailableReason, tickCooldowns } from './cooldown'
import { DeterministicRng } from '../rng'

describe('combat damage/status/cooldown', () => {
  it('伤害公式处理零/负防御、命中边界和极端属性', () => {
    const guaranteed = calculateDamage({ attacker: { attack: 10, defense: 0, crit: 0, accuracy: 1, dodge: 0 }, defender: { attack: 0, defense: -999, crit: 0, accuracy: 0, dodge: 0 }, power: 1, rng: new DeterministicRng(1) })
    expect(guaranteed.hit).toBe(true)
    expect(guaranteed.damage).toBeGreaterThanOrEqual(1)
    const miss = calculateDamage({ attacker: { attack: 999, defense: 0, crit: 1, accuracy: 0, dodge: 0 }, defender: { attack: 0, defense: 0, crit: 0, accuracy: 1, dodge: 0 }, power: 10, rng: new DeterministicRng(2) })
    expect(miss).toMatchObject({ hit: false, damage: 0, reason: 'miss' })
    expect(calculateDamage({ attacker: guaranteed as never, defender: guaranteed as never, power: 0, rng: new DeterministicRng(3) }).damage).toBe(0)
  })

  it('状态按明确 tick 到期，叠加策略不修改输入', () => {
    const base = [{ id: 'shield', turns: 2, stacks: 1 }]
    const stacked = addStatus(base, { id: 'shield', maxStacks: 3, stackMode: 'stack' }, 3, 2)
    expect(base).toEqual([{ id: 'shield', turns: 2, stacks: 1 }])
    expect(stacked).toEqual([{ id: 'shield', turns: 3, stacks: 3 }])
    expect(hasStatus(tickStatuses(stacked, 'end'), 'shield')).toBe(true)
    expect(hasStatus(tickStatuses([{ id: 'short', turns: 1, stacks: 1 }], 'end'), 'short')).toBe(false)
  })

  it('冷却只有显式 tick 才递减，并提供不可用原因', () => {
    const cooldowns = { slash: 2 }
    expect(getSkillUnavailableReason(cooldowns, 'slash', 0, 10)).toMatchObject({ code: 'cooldown', remaining: 2 })
    expect(tickCooldowns(cooldowns)).toEqual({ slash: 1 })
    expect(getSkillUnavailableReason({}, 'slash', 5, 2)).toMatchObject({ code: 'qi' })
    expect(getSkillUnavailableReason({}, 'missing', undefined, 10)).toMatchObject({ code: 'missing_skill' })
  })
})
