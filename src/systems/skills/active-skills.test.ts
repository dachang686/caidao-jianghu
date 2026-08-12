import { describe, expect, it } from 'vitest'
import { coreActiveSkills } from '../../content/skills'
import { DeterministicRng } from '../rng'
import { previewActiveSkill, resolveActiveSkill } from './resolve-active'
import { SkillRegistry } from './registry'

const context = () => ({
  actor: { hp: 80, maxHp: 100, qi: 50, maxQi: 50, attack: 30, accuracy: 1 },
  target: { hp: 120, maxHp: 120, defense: 8, posture: 40, maxPosture: 40 },
  statuses: ['stunned'],
  rng: new DeterministicRng(2026),
})

describe('Core 主动技能', () => {
  it('四系各 4 个，ID 唯一且全部能注册', () => {
    expect(coreActiveSkills).toHaveLength(16)
    expect(new Set(coreActiveSkills.map((skill) => skill.id)).size).toBe(16)
    expect(() => new SkillRegistry(coreActiveSkills)).not.toThrow()
    coreActiveSkills.forEach((skill) => expect(skill.preview.summary.length).toBeGreaterThan(0))
  })

  it('同一固定 RNG 下预览与实际结算一致', () => {
    coreActiveSkills.forEach((skill) => {
      const preview = previewActiveSkill(skill, context())
      const actual = resolveActiveSkill(skill, context())
      expect(actual).toEqual(preview)
    })
  })

  it('安全阀限制铁头功自伤、负面状态时长与额外回合', () => {
    const ironHead = coreActiveSkills.find((skill) => skill.id === 'survival:iron-head')!
    const base = context()
    const resolution = resolveActiveSkill(ironHead, { ...base, actor: { ...base.actor, hp: 2 } })
    expect(resolution.selfDamage).toBeLessThanOrEqual(1)
    coreActiveSkills.forEach((skill) => expect(skill.safety?.grantsExtraTurns).toBe(false))
    coreActiveSkills.forEach((skill) => skill.effects.filter((effect) => effect.type === 'apply_status').forEach((effect) => expect(effect.turns).toBeLessThanOrEqual(skill.safety?.maximumNegativeStatusTurns ?? 2)))
  })
})

