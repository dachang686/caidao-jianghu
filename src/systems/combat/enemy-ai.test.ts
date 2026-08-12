import { describe, expect, it } from 'vitest'
import { DeterministicRng } from '../rng'
import {
  chooseEnemyAction,
  createBossPhaseState,
  resolveBossPhase,
  resolveEnemyStats,
} from './enemy-ai'
import { getEffectiveDeceptiveChance } from './difficulty'
import type { CombatEnemyDefinition } from '../../types/enemy'

const enemy: CombatEnemyDefinition = {
  id: 'enemy:bandit',
  name: '试刀山贼',
  behavior: { id: 'template:honest', name: '直来直往', moveIds: ['slash', 'guard'], fallbackMoveId: 'slash' },
  moves: [
    { id: 'slash', name: '横着砍', kind: 'aggressive', summary: '预计造成伤害', weight: 2, power: 1, posturePower: 3 },
    { id: 'guard', name: '先叠甲', kind: 'defend', summary: '减少本回合伤害', weight: 1, guardRatio: 0.4 },
  ],
  curve: {
    maxHp: { base: 100, growth: 10 },
    maxQi: { base: 20 },
    attack: { base: 12 },
    defense: { base: 5 },
    posture: { base: 30 },
  },
}

const boss: CombatEnemyDefinition = {
  ...enemy,
  id: 'enemy:boss',
  name: '阶段大侠',
  boss: {
    phases: [
      { id: 'boss:p1', phase: 1, hpThresholdRatio: 1, moveIds: ['slash'] },
      { id: 'boss:p2', phase: 2, hpThresholdRatio: 0.5, moveIds: ['slash', 'guard'], deceptiveChance: 0.2 },
    ],
  },
}

describe('enemy AI and boss phases', () => {
  it('固定 RNG 下重复得到同一敌人行动序列，普通敌人意图始终诚实', () => {
    const firstRng = new DeterministicRng(42)
    const secondRng = new DeterministicRng(42)
    const first = [1, 2, 3].map((round) => chooseEnemyAction({ enemy, level: 1, difficulty: 'standard', currentHp: 100, maxHp: 100, round, rng: firstRng }))
    const second = [1, 2, 3].map((round) => chooseEnemyAction({ enemy, level: 1, difficulty: 'standard', currentHp: 100, maxHp: 100, round, rng: secondRng }))
    expect(first.map((item) => item.actualMoveId)).toEqual(second.map((item) => item.actualMoveId))
    expect(first.every((item) => item.intent?.honest)).toBe(true)
  })

  it('Boss 死亡优先于阶段转换，重复检查同一血量不会重复触发', () => {
    const initial = createBossPhaseState(boss.boss!, 100)
    const transition = resolveBossPhase(boss.boss!, initial, 40, 100)
    const repeated = resolveBossPhase(boss.boss!, transition.state, 40, 100)
    const lethal = resolveBossPhase(boss.boss!, transition.state, 0, 100)
    expect(transition).toMatchObject({ changed: true, fromPhase: 1, toPhase: 2 })
    expect(repeated.changed).toBe(false)
    expect(lethal.state.outcome).toBe('victory')
    expect(lethal.changed).toBe(false)
  })

  it('二阶段欺骗概率被限制在 20%，难度只影响数值/容错/意图诚实度', () => {
    expect(getEffectiveDeceptiveChance(0.9, 'expert', true)).toBe(0.2)
    expect(getEffectiveDeceptiveChance(0.9, 'standard', true)).toBeCloseTo(0.1)
    expect(getEffectiveDeceptiveChance(0.9, 'expert', false)).toBe(0)
    expect(resolveEnemyStats(enemy, 2, 'story').maxHp).toBeLessThan(resolveEnemyStats(enemy, 2, 'expert').maxHp)
  })
})

