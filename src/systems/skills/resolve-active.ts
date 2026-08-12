import type { RngSnapshot } from '../rng'
import { DeterministicRng } from '../rng'
import type { SkillDefinition, SkillEffect } from '../../types/skill'

export interface SkillResolveActor {
  readonly hp: number
  readonly maxHp: number
  readonly qi: number
  readonly maxQi: number
  readonly attack: number
  readonly accuracy?: number
}

export interface SkillResolveTarget {
  readonly hp: number
  readonly maxHp: number
  readonly defense: number
  readonly posture: number
  readonly maxPosture: number
}

export interface SkillResolveContext {
  readonly actor: SkillResolveActor
  readonly target: SkillResolveTarget
  readonly statuses?: readonly string[]
  readonly rng: DeterministicRng
}

export interface AppliedSkillStatus {
  readonly id: string
  readonly turns: number
  readonly stacks: number
}

export interface SkillResolution {
  readonly skillId: string
  readonly qiCost: number
  readonly damage: number
  readonly hits: number
  readonly postureDamage: number
  readonly healing: number
  readonly selfDamage: number
  readonly qiGained: number
  readonly appliedStatuses: readonly AppliedSkillStatus[]
  readonly clearedStatusCount: number
  readonly guardRatio: number
  readonly nextSkillQiCostDelta: number
  readonly accuracyDelta: number
  readonly evasionTurns: number
  readonly rng: RngSnapshot
}

export class SkillResolutionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SkillResolutionError'
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}

function finite(value: number | undefined, fallback = 0): number {
  return Number.isFinite(value) ? value as number : fallback
}

function positiveInteger(value: number | undefined, fallback = 1, maximum = 5): number {
  const result = Math.floor(finite(value, fallback))
  return Math.max(1, Math.min(maximum, result))
}

function resolveEffect(
  effect: SkillEffect,
  context: SkillResolveContext,
  skill: SkillDefinition,
  result: {
    damage: number
    hits: number
    postureDamage: number
    healing: number
    selfDamage: number
    qiGained: number
    appliedStatuses: AppliedSkillStatus[]
    clearedStatusCount: number
    guardRatio: number
    nextSkillQiCostDelta: number
    accuracyDelta: number
    evasionTurns: number
  },
): void {
  switch (effect.type) {
    case 'damage': {
      const hits = positiveInteger(effect.hits, 1, skill.safety?.maximumHits ?? 5)
      const accuracy = clamp(finite(context.actor.accuracy, 1), 0, 1)
      for (let index = 0; index < hits; index += 1) {
        const hit = context.rng.nextFloat() <= accuracy
        if (!hit) continue
        const variance = clamp(finite(effect.variance, 0), 0, 0.25)
        const roll = 1 - variance + context.rng.nextFloat() * variance * 2
        const raw = Math.max(0, context.actor.attack * Math.max(0, effect.power) * roll - Math.max(0, context.target.defense))
        result.damage += Math.max(0, Math.round(raw))
        result.hits += 1
        result.postureDamage += Math.max(0, finite(effect.posturePower))
      }
      return
    }
    case 'posture_damage':
      result.postureDamage += Math.max(0, finite(effect.amount) || context.actor.attack * Math.max(0, finite(effect.power)))
      return
    case 'heal':
      result.healing = Math.min(context.actor.maxHp - context.actor.hp, result.healing + Math.max(0, effect.amount))
      return
    case 'gain_qi':
      result.qiGained = Math.min(context.actor.maxQi - context.actor.qi, result.qiGained + Math.max(0, effect.amount))
      return
    case 'apply_status': {
      const maximumTurns = skill.safety?.maximumNegativeStatusTurns ?? 2
      result.appliedStatuses.push({ id: effect.statusId, turns: Math.max(1, Math.min(maximumTurns, Math.floor(effect.turns))), stacks: Math.max(1, Math.floor(effect.stacks ?? 1)) })
      return
    }
    case 'guard':
      result.guardRatio = Math.max(result.guardRatio, clamp(effect.ratio, 0, 0.8))
      return
    case 'self_damage': {
      const configuredRatio = effect.maxHpRatio ?? (effect.amount === undefined ? 0 : effect.amount / Math.max(1, context.actor.maxHp))
      const maximumRatio = Math.min(0.08, skill.safety?.maxSelfDamageRatio ?? 0.08)
      const requested = effect.amount ?? context.actor.maxHp * clamp(configuredRatio, 0, maximumRatio)
      const maximumSafeDamage = Math.max(0, context.actor.hp - (skill.safety?.minimumHpAfterSelfDamage ?? 1))
      result.selfDamage += Math.min(Math.max(0, requested), maximumSafeDamage, context.actor.maxHp * maximumRatio)
      return
    }
    case 'clear_status':
      result.clearedStatusCount += Math.min(context.statuses?.length ?? 0, Math.max(1, Math.floor(effect.count ?? 1)))
      return
    case 'modify_qi_cost':
      result.nextSkillQiCostDelta += clamp(effect.amount, -20, 20)
      return
    case 'modify_accuracy':
      result.accuracyDelta += clamp(effect.delta, -1, 1)
      return
    case 'grant_evasion':
      result.evasionTurns = Math.max(result.evasionTurns, Math.min(2, Math.max(1, Math.floor(effect.turns))))
      return
    default:
      throw new SkillResolutionError(`未知技能效果「${String((effect as { type?: unknown }).type)}」`)
  }
}

export function resolveActiveSkill(skill: SkillDefinition, context: SkillResolveContext): SkillResolution {
  if (context.actor.qi < skill.qiCost) throw new SkillResolutionError(`内力不足：需要 ${skill.qiCost}`)
  const result = {
    damage: 0,
    hits: 0,
    postureDamage: 0,
    healing: 0,
    selfDamage: 0,
    qiGained: 0,
    appliedStatuses: [] as AppliedSkillStatus[],
    clearedStatusCount: 0,
    guardRatio: 0,
    nextSkillQiCostDelta: 0,
    accuracyDelta: 0,
    evasionTurns: 0,
  }
  skill.effects.forEach((effect) => resolveEffect(effect, context, skill, result))
  return {
    skillId: String(skill.id),
    qiCost: Math.max(0, skill.qiCost),
    damage: Math.max(0, result.damage),
    hits: result.hits,
    postureDamage: Math.max(0, result.postureDamage),
    healing: Math.max(0, result.healing),
    selfDamage: Math.max(0, result.selfDamage),
    qiGained: Math.max(0, result.qiGained),
    appliedStatuses: result.appliedStatuses,
    clearedStatusCount: result.clearedStatusCount,
    guardRatio: result.guardRatio,
    nextSkillQiCostDelta: result.nextSkillQiCostDelta,
    accuracyDelta: result.accuracyDelta,
    evasionTurns: result.evasionTurns,
    rng: context.rng.snapshot(),
  }
}

export const resolveSkill = resolveActiveSkill
export const previewActiveSkill = resolveActiveSkill

