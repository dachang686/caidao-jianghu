import type { RngSnapshot } from '../systems/rng'

export type CombatPhase = 'setup' | 'player_turn' | 'resolving' | 'enemy_turn' | 'victory' | 'defeat'

export interface CombatStatusState {
  readonly id: string
  readonly turns: number
}

export interface CombatantState {
  readonly id: string
  readonly name: string
  readonly hp: number
  readonly maxHp: number
  readonly qi: number
  readonly maxQi: number
  readonly attack: number
  readonly defense: number
  readonly statuses: readonly CombatStatusState[]
}

export interface CombatSkillDefinition {
  readonly id: string
  readonly qiCost: number
  readonly cooldown: number
}

export interface CombatPatch {
  readonly hp?: number
  readonly qi?: number
  readonly statuses?: readonly CombatStatusState[]
}

export interface CombatResolution {
  readonly player?: CombatPatch
  readonly enemy?: CombatPatch
  readonly rng?: RngSnapshot
}

export interface CombatAction {
  readonly actionId: string
  readonly actor: 'player' | 'enemy'
  readonly skillId?: string
}

export interface CombatState {
  readonly phase: CombatPhase
  readonly round: number
  readonly player: CombatantState
  readonly enemy: CombatantState
  readonly skills: Readonly<Record<string, CombatSkillDefinition>>
  readonly cooldowns: Readonly<Record<string, number>>
  readonly pendingAction: CombatAction | null
  readonly processedActionIds: readonly string[]
  readonly rng: RngSnapshot
}

export interface CombatSetup {
  readonly player: CombatantState
  readonly enemy: CombatantState
  readonly skills: readonly CombatSkillDefinition[]
  readonly rng: RngSnapshot
}
