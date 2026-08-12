import { describe, expect, it } from 'vitest'
import { passiveSkills } from '../../content/skills/passives'
import type { DerivedCombatStats, PassiveDefinition } from '../../types/skill'
import {
  createPassiveTreeState,
  recalculateDerivedStats,
  resetPassiveTree,
  unlockPassive,
  validatePassiveDefinitions,
} from './passive-tree'

const base: DerivedCombatStats = {
  maxHp: 100, maxQi: 30, attack: 20, defense: 10, posture: 25, accuracy: 0.9, dodge: 0.1, crit: 0.05,
  qiRecovery: 3, healingMultiplier: 1, damageWhenPostureBroken: 0,
}

describe('passive tree', () => {
  it('四系各两个 Core 节点，并支持前置/互斥配置', () => {
    expect(passiveSkills).toHaveLength(8)
    expect(new Set(passiveSkills.map((passive) => passive.id)).size).toBe(8)
    expect(passiveSkills.filter((passive) => passive.school === 'dao')).toHaveLength(2)
    expect(passiveSkills.filter((passive) => passive.school === 'mouth')).toHaveLength(2)
    expect(passiveSkills.filter((passive) => passive.school === 'survival')).toHaveLength(2)
    expect(passiveSkills.filter((passive) => passive.school === 'misc')).toHaveLength(2)
  })

  it('从基础属性重算，重复计算不会漂移，条件效果只在满足时生效', () => {
    const edge = passiveSkills.find((passive) => passive.id === 'dao:edge-balance')!
    const breakWindow = passiveSkills.find((passive) => passive.id === 'dao:break-window')!
    const first = recalculateDerivedStats(base, [edge, breakWindow], { postureBroken: true })
    const second = recalculateDerivedStats(base, [edge, breakWindow], { postureBroken: true })
    const inactive = recalculateDerivedStats(base, [edge, breakWindow], { postureBroken: false })
    expect(second).toEqual(first)
    expect(first.damageWhenPostureBroken).toBeCloseTo(0.12)
    expect(inactive.damageWhenPostureBroken).toBe(0)
    expect(first.attack).toBe(base.attack + 3)
  })

  it('前置循环被拒绝，洗点返还技能点并移除节点', () => {
    const cycle: PassiveDefinition[] = [
      { ...passiveSkills[0], id: 'a', prerequisiteIds: ['b'] },
      { ...passiveSkills[0], id: 'b', prerequisiteIds: ['a'] },
    ]
    expect(validatePassiveDefinitions(cycle).issues.some((issue) => issue.code === 'prerequisite_cycle')).toBe(true)
    let state = createPassiveTreeState(2)
    state = unlockPassive(state, passiveSkills, 'dao:edge-balance')
    state = unlockPassive(state, passiveSkills, 'dao:break-window')
    const reset = resetPassiveTree(state)
    expect(reset).toEqual({ earnedSkillPoints: 2, spentSkillPoints: 0, unlockedPassiveIds: [] })
  })
})

