import { describe, expect, it } from 'vitest'
import type { SkillDefinition } from '../../types/skill'
import {
  SkillLoadoutError,
  SkillRegistry,
  createSkillProgressState,
  equipSkill,
  resetSkillPoints,
  unlockSkill,
  validateSkillDefinitions,
} from './index'

const baseSkill: SkillDefinition = {
  id: 'dao:slash',
  name: '横着砍',
  description: '基础攻击',
  school: 'dao',
  target: 'enemy',
  qiCost: 0,
  cooldown: 0,
  effects: [{ type: 'damage', power: 1 }],
  preview: { summary: '造成伤害', values: { power: 1 } },
}

describe('skill registry and loadout', () => {
  it('检测未知前置和循环前置', () => {
    const unknown = validateSkillDefinitions([{ ...baseSkill, prerequisiteIds: ['missing'] }])
    expect(unknown.valid).toBe(false)
    expect(unknown.issues.some((issue) => issue.code === 'missing_prerequisite')).toBe(true)
    const cycle = validateSkillDefinitions([
      { ...baseSkill, id: 'a', prerequisiteIds: ['b'] },
      { ...baseSkill, id: 'b', prerequisiteIds: ['a'] },
    ])
    expect(cycle.issues.some((issue) => issue.code === 'prerequisite_cycle')).toBe(true)
  })

  it('技能点按最高 30 级每级一点，前置与六槽装配均受约束', () => {
    const registry = new SkillRegistry([
      baseSkill,
      { ...baseSkill, id: 'dao:finisher', prerequisiteIds: ['dao:slash'], requiredLevel: 2, maxRank: 2 },
    ])
    let state = createSkillProgressState(3)
    state = unlockSkill(state, registry, 'dao:slash')
    state = unlockSkill(state, registry, 'dao:finisher')
    state = equipSkill(state, registry, 'dao:slash', 0)
    expect(() => equipSkill(state, registry, 'dao:slash', 6)).toThrow(SkillLoadoutError)
    expect(state.loadout[0]).toBe('dao:slash')
  })

  it('非战斗洗点返还全部已用点并清理未解锁技能槽', () => {
    const registry = new SkillRegistry([baseSkill])
    let state = unlockSkill(createSkillProgressState(2), registry, 'dao:slash')
    state = equipSkill(state, registry, 'dao:slash', 0)
    const reset = resetSkillPoints(state)
    expect(reset.spentSkillPoints).toBe(0)
    expect(reset.unlockedSkillIds).toEqual([])
    expect(reset.loadout.every((skillId) => skillId === null)).toBe(true)
    expect(() => resetSkillPoints(state, true)).toThrow('战斗中')
  })
})
