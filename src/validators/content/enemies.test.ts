import { describe, expect, it } from 'vitest'
import { CH01_ENEMY_DEFINITIONS } from '../../content/enemies/ch01'
import { coreActiveSkills } from '../../content/skills'
import { simulateBattles } from '../../systems/combat/simulator'
import { validateChapterEnemyDefinitions } from './enemies'

describe('章节敌人内容校验', () => {
  it('第 1 章包含两类普通敌人、双阶段 Boss 和诚实意图', () => {
    const result = validateChapterEnemyDefinitions(CH01_ENEMY_DEFINITIONS, 'ch01')
    expect(result).toEqual({ valid: true, issues: [] })
    expect(CH01_ENEMY_DEFINITIONS.filter((enemy) => enemy.role === 'normal')).toHaveLength(2)
    expect(CH01_ENEMY_DEFINITIONS.find((enemy) => enemy.role === 'boss')?.boss?.phases).toHaveLength(2)
  })

  it('独立报告招式引用、欺骗概率、Boss 规则数量和演出 cue 路径', () => {
    const boss = CH01_ENEMY_DEFINITIONS.find((enemy) => enemy.role === 'boss')!
    const invalid = {
      ...boss,
      specialRuleIds: ['rule:a', 'rule:b'],
      presentationCueIds: [],
      behavior: { ...boss.behavior, moveIds: [...boss.behavior.moveIds, 'move:missing'] },
      boss: {
        phases: boss.boss!.phases.map((phase, index) => index === 0 ? { ...phase, deceptiveChance: 0.21 } : phase),
      },
    }
    const result = validateChapterEnemyDefinitions([invalid, ...CH01_ENEMY_DEFINITIONS.filter((enemy) => enemy !== boss)], 'ch01')
    expect(result.issues.some((issue) => issue.path.includes('behavior.moveIds') && issue.code === 'missing_reference')).toBe(true)
    expect(result.issues.some((issue) => issue.path.includes('specialRuleIds'))).toBe(true)
    expect(result.issues.some((issue) => issue.path.includes('deceptiveChance'))).toBe(true)
    expect(result.issues.some((issue) => issue.path.includes('presentationCueIds'))).toBe(true)
  })

  it('标准难度固定种子批量模拟有胜率、破防窗口和单次阶段转换', () => {
    const boss = CH01_ENEMY_DEFINITIONS.find((enemy) => enemy.role === 'boss')!
    const report = simulateBattles({
      player: {
        level: 1,
        stats: { maxHp: 100, maxQi: 55, attack: 18, defense: 9, posture: 100, accuracy: 0.9, dodge: 0.06, crit: 0.08, qiRecovery: 3, healingMultiplier: 1, damageWhenPostureBroken: 0.12 },
        skills: coreActiveSkills.slice(0, 6),
      },
      enemy: boss,
      difficulty: 'standard',
      seeds: { start: 1, end: 20 },
      strategy: 'balanced',
      mainline: true,
    })
    expect(report.wins).toBeGreaterThan(0)
    expect(report.timeouts).toBe(0)
    expect(report.rounds.maximum).toBeLessThan(40)
    expect(report.posture.enemyBreaks).toBeGreaterThan(0)
    expect(report.samples.every((sample) => sample.bossPhaseTransitions <= 1)).toBe(true)
    expect(report.issues).toEqual([])
  })
})
