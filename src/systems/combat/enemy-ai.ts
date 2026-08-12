import type { RngSnapshot } from '../rng'
import { DeterministicRng } from '../rng'
import type {
  BossDefinition,
  BossPhaseState,
  BossPhaseTransition,
  CombatEnemyDefinition,
  DifficultyLevel,
  EnemyMoveDefinition,
  EnemyStats,
} from '../../types/enemy'
import type { EnemyIntent } from '../../types/enemy-intent'
import {
  applyDifficultyToEnemyStats,
  getEffectiveDeceptiveChance,
  getDifficultyProfile,
} from './difficulty'

export class EnemyAiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnemyAiError'
  }
}

export interface EnemyAiInput {
  readonly enemy: CombatEnemyDefinition
  readonly level: number
  readonly difficulty: DifficultyLevel
  readonly currentHp: number
  readonly maxHp: number
  readonly round: number
  readonly rng: DeterministicRng
  readonly bossPhaseState?: BossPhaseState
  readonly previousMoveId?: string
}

export interface EnemyAiDecision {
  readonly action: EnemyMoveDefinition | null
  readonly displayedAction: EnemyMoveDefinition | null
  readonly intent: EnemyIntent | null
  readonly actualMoveId?: string
  readonly phase: number
  readonly deceptive: boolean
  readonly deceptiveChance: number
  readonly stats: EnemyStats
  readonly bossPhase: BossPhaseTransition | null
  readonly outcome: 'continue' | 'victory'
  readonly rng: RngSnapshot
}

function finiteOr(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? value as number : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}

function curveValue(value: { base: number; growth?: number; perLevel?: number; min?: number; max?: number }, level: number): number {
  const growth = value.growth ?? value.perLevel ?? 0
  const result = value.base + growth * Math.max(0, level - 1)
  return clamp(result, value.min ?? Number.NEGATIVE_INFINITY, value.max ?? Number.POSITIVE_INFINITY)
}

export function resolveEnemyStats(enemy: CombatEnemyDefinition, level: number, difficulty: DifficultyLevel): EnemyStats {
  const curve = enemy.curve
  const base: EnemyStats = {
    maxHp: curveValue(curve.maxHp, level),
    maxQi: curveValue(curve.maxQi, level),
    attack: curveValue(curve.attack, level),
    defense: curveValue(curve.defense, level),
    posture: curveValue(curve.posture, level),
    accuracy: curveValue(curve.accuracy ?? { base: 1 }, level),
    dodge: curveValue(curve.dodge ?? { base: 0 }, level),
    crit: curveValue(curve.crit ?? { base: 0 }, level),
  }
  return applyDifficultyToEnemyStats(base, difficulty)
}

export const calculateEnemyStats = resolveEnemyStats

function phaseThreshold(phase: { hpThresholdRatio?: number; hpThreshold?: number }): number {
  return clamp(phase.hpThresholdRatio ?? phase.hpThreshold ?? 0, 0, 1)
}

function phaseId(phase: { id: string; phase: number }): string {
  return phase.id || `phase:${phase.phase}`
}

export function createBossPhaseState(boss: BossDefinition, maxHp: number): BossPhaseState {
  const firstPhase = [...boss.phases].sort((a, b) => a.phase - b.phase)[0]
  return {
    phase: firstPhase?.phase ?? 1,
    transitionedPhaseIds: [],
    lastObservedHp: Math.max(0, maxHp),
    outcome: 'active',
  }
}

export function resolveBossPhase(
  boss: BossDefinition,
  state: BossPhaseState,
  currentHp: number,
  maxHp: number,
): BossPhaseTransition {
  const safeMaxHp = Math.max(1, finiteOr(maxHp, 1))
  const hp = clamp(currentHp, 0, safeMaxHp)
  const fromPhase = state.phase

  // Death is resolved before phase logic. A lethal hit cannot be converted into a phase transition.
  if (hp <= 0) {
    return {
      state: { ...state, lastObservedHp: 0, outcome: 'victory' },
      changed: false,
      fromPhase,
      toPhase: state.phase,
    }
  }

  if (state.outcome === 'victory') {
    return { state: { ...state }, changed: false, fromPhase, toPhase: state.phase }
  }

  const observedHp = Math.max(0, Math.min(safeMaxHp, state.lastObservedHp))
  const phases = [...boss.phases].sort((a, b) => a.phase - b.phase)
  const next = phases.find((candidate) =>
    candidate.phase === state.phase + 1
      && !state.transitionedPhaseIds.includes(phaseId(candidate))
      && hp < observedHp
      && hp <= safeMaxHp * phaseThreshold(candidate),
  )

  if (!next) {
    return {
      state: { ...state, lastObservedHp: hp },
      changed: false,
      fromPhase,
      toPhase: state.phase,
    }
  }

  const id = phaseId(next)
  return {
    state: {
      ...state,
      phase: next.phase,
      transitionedPhaseIds: [...state.transitionedPhaseIds, id],
      lastObservedHp: hp,
      outcome: 'active',
    },
    changed: true,
    fromPhase,
    toPhase: next.phase,
    transitionId: id,
  }
}

export const advanceBossPhase = resolveBossPhase

function activePhase(enemy: CombatEnemyDefinition, phase: number) {
  return enemy.boss?.phases.find((candidate) => candidate.phase === phase)
}

function chooseMove(
  moves: readonly EnemyMoveDefinition[],
  rng: DeterministicRng,
  previousMoveId?: string,
): EnemyMoveDefinition {
  if (moves.length === 0) throw new EnemyAiError('敌人没有可执行招式')
  const choices = moves.map((move) => ({
    value: move,
    weight: Math.max(0, finiteOr(move.weight, 1)) * (move.id === previousMoveId && moves.length > 1 ? 0.25 : 1),
  }))
  if (choices.every((choice) => choice.weight === 0)) return moves[0]
  return rng.weightedPick(choices)
}

function createIntent(move: EnemyMoveDefinition, stats: EnemyStats, honest: boolean, deceptiveChance: number): EnemyIntent {
  const power = Math.max(0, finiteOr(move.power, 1))
  return {
    id: `intent:${move.id}`,
    kind: move.kind,
    label: move.name,
    summary: move.summary,
    expectedDamage: Math.max(0, Math.round(stats.attack * power)),
    expectedPostureDamage: Math.max(0, finiteOr(move.posturePower, 0)),
    guardRatio: clamp(finiteOr(move.guardRatio, 0), 0, 1),
    honest,
    deceptiveChance,
  }
}

function getAvailableMoves(enemy: CombatEnemyDefinition, phase: number): EnemyMoveDefinition[] {
  const phaseMoveIds = activePhase(enemy, phase)?.moveIds ?? enemy.behavior.moveIds
  const byId = new Map(enemy.moves.map((move) => [move.id, move]))
  const moves = phaseMoveIds.map((id) => byId.get(id)).filter((move): move is EnemyMoveDefinition => Boolean(move))
  if (moves.length > 0) return moves
  const fallback = enemy.behavior.fallbackMoveId ? byId.get(enemy.behavior.fallbackMoveId) : undefined
  return fallback ? [fallback] : enemy.moves.slice(0, 1)
}

export function chooseEnemyAction(input: EnemyAiInput): EnemyAiDecision {
  const { enemy, currentHp, maxHp, difficulty, rng } = input
  const stats = resolveEnemyStats(enemy, input.level, difficulty)
  let bossPhase: BossPhaseTransition | null = null
  let phase = 1

  if (enemy.boss) {
    const initialState = input.bossPhaseState ?? createBossPhaseState(enemy.boss, maxHp)
    bossPhase = resolveBossPhase(enemy.boss, initialState, currentHp, maxHp)
    phase = bossPhase.state.phase
    if (bossPhase.state.outcome === 'victory') {
      return {
        action: null,
        displayedAction: null,
        intent: null,
        phase,
        deceptive: false,
        deceptiveChance: 0,
        stats,
        bossPhase,
        outcome: 'victory',
        rng: rng.snapshot(),
      }
    }
  }

  const selected = chooseMove(getAvailableMoves(enemy, phase), rng, input.previousMoveId)
  const phaseDefinition = activePhase(enemy, phase)
  const isBossPhaseTwo = Boolean(enemy.boss && phase >= 2)
  const baseDeceptiveChance = phaseDefinition?.deceptiveChance ?? 0
  const deceptiveChance = getEffectiveDeceptiveChance(baseDeceptiveChance, difficulty, isBossPhaseTwo)
  const deceptive = isBossPhaseTwo && deceptiveChance > 0 && rng.nextFloat() < deceptiveChance
  let displayed = selected

  if (deceptive) {
    const alternatives = getAvailableMoves(enemy, phase).filter((move) => move.id !== selected.id)
    if (alternatives.length > 0) displayed = alternatives[rng.nextInt(0, alternatives.length)]
  }

  const profile = getDifficultyProfile(difficulty)
  return {
    action: selected,
    displayedAction: displayed,
    intent: createIntent(displayed, stats, !deceptive || profile.intentHonesty >= 1, deceptiveChance),
    actualMoveId: selected.id,
    phase,
    deceptive,
    deceptiveChance,
    stats,
    bossPhase,
    outcome: 'continue',
    rng: rng.snapshot(),
  }
}

export const planEnemyAction = chooseEnemyAction

