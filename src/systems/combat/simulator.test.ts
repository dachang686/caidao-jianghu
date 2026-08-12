import { describe, expect, it } from 'vitest'
import type { CombatEnemyDefinition } from '../../types/enemy'
import type { SkillDefinition } from '../../types/skill'
import { simulateBattle, simulateBattles } from './simulator'

const basic: SkillDefinition = {
  id: 'test:basic',
  name: '测试基础刀',
  description: '测试用普通攻击。',
  school: 'dao',
  target: 'enemy',
  qiCost: 0,
  cooldown: 0,
  effects: [{ type: 'damage', power: 1, posturePower: 10 }],
  preview: { summary: '稳定伤害和架势压力', values: { power: 1, posture: 10 } },
}

const healAndBreak: SkillDefinition = {
  id: 'test:break',
  name: '测试破势',
  description: '测试用架势技能。',
  school: 'survival',
  target: 'enemy',
  qiCost: 4,
  cooldown: 1,
  effects: [{ type: 'damage', power: 0.7, posturePower: 6 }, { type: 'posture_damage', amount: 12 }],
  preview: { summary: '额外削减架势', values: { posture: 12 } },
}

const repair: SkillDefinition = {
  id: 'test:repair',
  name: '测试回气',
  description: '测试用治疗。',
  school: 'survival',
  target: 'self',
  qiCost: 3,
  cooldown: 2,
  effects: [{ type: 'heal', amount: 12 }, { type: 'gain_qi', amount: 4 }],
  preview: { summary: '恢复生命与内力', values: { heal: 12, qi: 4 } },
}

const player = {
  id: 'fixture:balanced-build',
  name: '测试构筑',
  level: 3,
  stats: {
    maxHp: 100,
    maxQi: 24,
    attack: 18,
    defense: 8,
    posture: 25,
    accuracy: 1,
    dodge: 0,
    crit: 0,
    qiRecovery: 2,
    healingMultiplier: 1,
    damageWhenPostureBroken: 0.1,
  },
  skills: [basic, healAndBreak, repair],
} as const

const enemy: CombatEnemyDefinition = {
  id: 'enemy:fixture-bandit',
  name: '测试山贼',
  behavior: { id: 'fixture:honest', name: '直来直往', moveIds: ['slash', 'guard'], fallbackMoveId: 'slash' },
  moves: [
    { id: 'slash', name: '横着砍', kind: 'aggressive', summary: '造成伤害', weight: 2, power: 0.8, posturePower: 4 },
    { id: 'guard', name: '先叠甲', kind: 'defend', summary: '减少下一次受到的伤害', weight: 1, guardRatio: 0.35 },
  ],
  curve: {
    maxHp: { base: 72 },
    maxQi: { base: 12 },
    attack: { base: 9 },
    defense: { base: 4 },
    posture: { base: 30 },
    accuracy: { base: 1 },
    dodge: { base: 0 },
    crit: { base: 0 },
  },
}

const boss: CombatEnemyDefinition = {
  ...enemy,
  id: 'enemy:fixture-boss',
  name: '测试 Boss',
  boss: {
    phases: [
      { id: 'fixture:boss:p1', phase: 1, hpThresholdRatio: 1, moveIds: ['slash'] },
      { id: 'fixture:boss:p2', phase: 2, hpThresholdRatio: 0.5, moveIds: ['slash'], deceptiveChance: 0.2 },
    ],
  },
}

describe('fixed-RNG combat simulator', () => {
  it('同参数报告稳定，并输出胜率、回合、破防和资源统计', () => {
    const request = { player, enemy, difficulty: 'standard' as const, seeds: { start: 11, end: 18 }, strategy: 'balanced' as const }
    const first = simulateBattles(request)
    const second = simulateBattles(request)

    expect(first).toEqual(second)
    expect(first).toMatchObject({ totalBattles: 8, wins: expect.any(Number), winRate: expect.any(Number) })
    expect(first.rounds).toEqual(expect.objectContaining({ average: expect.any(Number), median: expect.any(Number), p95: expect.any(Number) }))
    expect(first.posture.enemyBreakRate).toBeGreaterThan(0)
    expect(first.resources.averageQiSpent).toBeGreaterThanOrEqual(0)
    expect(first.samples).toHaveLength(8)
  })

  it('种子步长为闭区间，单场接口与批量样本保持同一结果', () => {
    const request = { player, enemy, difficulty: 'story' as const, seeds: { start: 3, end: 7, step: 2 }, strategy: 'conservative' as const }
    const report = simulateBattles(request)
    expect(report.seeds).toEqual([3, 5, 7])
    expect(simulateBattle({ ...request, seeds: [5] }, 5)).toEqual(report.samples[1])
  })

  it('检测主线必败、超长战斗和从不破防，并允许测试夹具单独缩短阈值', () => {
    const report = simulateBattles({
      player: { ...player, stats: { ...player.stats, attack: 1, maxHp: 20, maxQi: 0, posture: 10 }, skills: [] },
      enemy: {
        ...enemy,
        curve: { ...enemy.curve, maxHp: { base: 1_000 }, attack: { base: 0 }, posture: { base: 1_000 } },
        moves: [{ ...enemy.moves[1], weight: 1 }],
        behavior: { ...enemy.behavior, moveIds: ['guard'], fallbackMoveId: 'guard' },
      },
      difficulty: 'standard',
      seeds: [21, 22],
      strategy: 'aggressive',
      mainline: true,
      thresholds: { maxRounds: 3, longBattleRounds: 3 },
    })

    expect(report.checks).toEqual({ guaranteedLoss: true, longBattle: true, neverBreaks: true })
    expect(report.issues.map((issue) => issue.code)).toEqual(['guaranteed_loss', 'long_battle', 'never_break'])
    expect(report.issues.every((issue) => issue.severity === 'error')).toBe(true)
    expect(report.timeouts).toBe(2)
  })

  it('Boss 阶段在固定种子下只记录一次转换，三种策略均可运行', () => {
    for (const strategy of ['conservative', 'balanced', 'aggressive'] as const) {
      const report = simulateBattles({ player, enemy: boss, difficulty: 'expert', seeds: [31, 32], strategy })
      expect(report.samples.every((sample) => sample.bossPhaseTransitions <= 1)).toBe(true)
    }
  })
})
