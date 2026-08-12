import { describe, expect, it } from 'vitest'
import { CH04_ENEMY_DEFINITIONS } from '../../content/enemies/ch04'
import { DeterministicRng } from '../rng'
import { chooseEnemyAction, createBossPhaseState, resolveBossPhase, resolveEnemyStats } from './enemy-ai'

describe('C333 青云山敌人与 Boss 内容', () => {
  const normals = CH04_ENEMY_DEFINITIONS.filter((enemy) => enemy.role === 'normal')
  const boss = CH04_ENEMY_DEFINITIONS.find((enemy) => enemy.role === 'boss')!

  it('提供两类复用行为模板的普通敌人，招式组和诚实意图均可读', () => {
    expect(normals).toHaveLength(2)
    expect(new Set(normals.map((enemy) => enemy.behavior.id)).size).toBe(2)
    for (const enemy of normals) {
      expect(enemy.readableIntent).toBe(true)
      expect(enemy.behavior.moveIds.length).toBeGreaterThanOrEqual(2)
      expect(enemy.behavior.moveIds.every((moveId) => enemy.moves.some((move) => move.id === moveId))).toBe(true)
      expect(enemy.moves.every((move) => move.name.trim() && move.summary.trim())).toBe(true)
      const action = chooseEnemyAction({
        enemy,
        level: 1,
        difficulty: 'standard',
        currentHp: enemy.curve.maxHp.base,
        maxHp: enemy.curve.maxHp.base,
        round: 1,
        rng: new DeterministicRng(3),
      })
      expect(action.intent?.honest).toBe(true)
      expect(action.intent?.label).toBeTruthy()
      expect(action.intent?.summary).toBeTruthy()
    }
  })

  it('青云掌门只有一个专属反套路规则、两阶段且阶段转换只记录一次', () => {
    expect(boss.name).toBe('青云掌门')
    expect(boss.readableIntent).toBe(true)
    expect(boss.specialRuleIds).toEqual(['rule:ch04:master:formal-stance'])
    expect(boss.presentationCueIds).toEqual(['presentation:ch04:master:defeat'])
    expect(boss.boss?.phases).toHaveLength(2)
    expect(boss.boss?.phases.map((phase) => phase.hpThresholdRatio)).toEqual([1, 0.5])
    expect(boss.boss?.phases.every((phase) => phase.moveIds?.every((moveId) => boss.moves.some((move) => move.id === moveId)) ?? false)).toBe(true)

    const stats = resolveEnemyStats(boss, 1, 'standard')
    const initial = createBossPhaseState(boss.boss!, stats.maxHp)
    const transition = resolveBossPhase(boss.boss!, initial, stats.maxHp * 0.49, stats.maxHp)
    const repeated = resolveBossPhase(boss.boss!, transition.state, stats.maxHp * 0.49, stats.maxHp)
    expect(transition).toMatchObject({ changed: true, fromPhase: 1, toPhase: 2 })
    expect(transition.state.transitionedPhaseIds).toHaveLength(1)
    expect(repeated.changed).toBe(false)
    expect(repeated.state.transitionedPhaseIds).toHaveLength(1)
  })
})
