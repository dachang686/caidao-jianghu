import type { DeterministicRng, RngSnapshot } from '../rng'

export interface DamageStats {
  readonly attack: number
  readonly defense: number
  readonly crit: number
  readonly accuracy: number
  readonly dodge: number
}

export interface DamageInput {
  readonly attacker: DamageStats
  readonly defender: DamageStats
  readonly power: number
  readonly rng: DeterministicRng
}

export interface DamageResult {
  readonly damage: number
  readonly hit: boolean
  readonly critical: boolean
  readonly rng: RngSnapshot
  readonly reason?: 'miss' | 'zero_power'
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum))
}

export function calculateDamage(input: DamageInput): DamageResult {
  const attack = Math.max(0, Number.isFinite(input.attacker.attack) ? input.attacker.attack : 0)
  const defense = Math.max(0, Number.isFinite(input.defender.defense) ? input.defender.defense : 0)
  const power = Math.max(0, Number.isFinite(input.power) ? input.power : 0)
  if (power === 0) return { damage: 0, hit: true, critical: false, reason: 'zero_power', rng: input.rng.snapshot() }
  const accuracy = clamp(input.attacker.accuracy, 0, 1)
  const dodge = clamp(input.defender.dodge, 0, 0.95)
  const hitChance = clamp(accuracy - dodge, 0, 1)
  if (input.rng.nextFloat() >= hitChance) return { damage: 0, hit: false, critical: false, reason: 'miss', rng: input.rng.snapshot() }
  const critical = input.rng.nextFloat() < clamp(input.attacker.crit, 0, 1)
  const variance = 0.92 + input.rng.nextFloat() * 0.16
  const raw = (attack * power * 100) / (100 + defense)
  return { damage: Math.max(1, Math.round(raw * variance * (critical ? 1.5 : 1))), hit: true, critical, rng: input.rng.snapshot() }
}
