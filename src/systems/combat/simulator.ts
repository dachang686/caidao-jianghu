import type { DerivedCombatStats, SkillDefinition, SkillEffect } from '../../types/skill'
import type { BossPhaseState, CombatEnemyDefinition, DifficultyLevel, EnemyMoveDefinition, EnemyStats } from '../../types/enemy'
import { DeterministicRng } from '../rng'
import { calculateDamage } from './damage'
import { chooseEnemyAction, createBossPhaseState } from './enemy-ai'
import { applyPostureDamage, createPosture, postureDamageMultiplier, tickPosture, type PostureState } from './posture'
import { resolveActiveSkill } from '../skills/resolve-active'
import { DEFAULT_SIMULATION_THRESHOLDS, type SimulationThresholds } from './simulator-thresholds'

export type SimulationStrategy = 'conservative' | 'balanced' | 'aggressive'

export interface SimulationSeedRange {
  readonly start: number
  readonly end: number
  readonly step?: number
}

export type SimulationSeeds = SimulationSeedRange | readonly number[]

type RequiredSimulationStats = Pick<
  DerivedCombatStats,
  'maxHp' | 'maxQi' | 'attack' | 'defense' | 'posture' | 'accuracy' | 'dodge' | 'crit'
>

export interface SimulationPlayerStats extends RequiredSimulationStats {
  readonly qiRecovery?: number
  readonly healingMultiplier?: number
  readonly damageWhenPostureBroken?: number
}

/** A build is the resolved output of skill/passive/equipment systems. */
export interface SimulationPlayerBuild {
  readonly id?: string
  readonly name?: string
  readonly level: number
  readonly stats: SimulationPlayerStats
  /** The equipped six-slot skills, already resolved from the skill registry. */
  readonly skills?: readonly SkillDefinition[]
  /** Optional replacement for the always-available basic attack. */
  readonly basicSkill?: SkillDefinition
}

export interface CombatSimulationRequest {
  readonly player: SimulationPlayerBuild
  readonly enemy: CombatEnemyDefinition
  readonly difficulty: DifficultyLevel
  readonly seeds: SimulationSeeds
  readonly strategy?: SimulationStrategy
  readonly thresholds?: Partial<SimulationThresholds>
  /** Marks zero-win reports as errors instead of review warnings. */
  readonly mainline?: boolean
}

export type BattleSimulationOutcome = 'victory' | 'defeat' | 'max_rounds'

export interface BattleSimulationSample {
  readonly seed: number
  readonly outcome: BattleSimulationOutcome
  readonly rounds: number
  readonly playerHpRemaining: number
  readonly playerQiRemaining: number
  readonly enemyHpRemaining: number
  readonly enemyPostureBreaks: number
  readonly playerPostureBreaks: number
  readonly enemyPostureDamageTaken: number
  readonly playerPostureDamageTaken: number
  readonly playerQiSpent: number
  readonly playerQiRecovered: number
  readonly playerHealing: number
  readonly playerSelfDamage: number
  readonly playerDamageTaken: number
  readonly bossPhaseTransitions: number
  readonly rngState: number
}

export interface SimulationDistribution {
  readonly average: number
  readonly median: number
  readonly p95: number
  readonly maximum: number
}

export interface SimulationPostureReport {
  readonly enemyBreaks: number
  readonly enemyBreakRate: number
  readonly playerBreaks: number
  readonly playerBreakRate: number
  readonly totalEnemyPostureDamage: number
  readonly totalPlayerPostureDamage: number
  readonly neverBreaks: boolean
}

export interface SimulationResourceReport {
  readonly averageQiSpent: number
  readonly averageQiRecovered: number
  readonly averageHealing: number
  readonly averageSelfDamage: number
  readonly averageDamageTaken: number
  readonly averageQiRemaining: number
  readonly averageHpRemaining: number
}

export type SimulationIssueCode = 'guaranteed_loss' | 'long_battle' | 'never_break'

export interface SimulationIssue {
  readonly code: SimulationIssueCode
  readonly severity: 'error' | 'warning'
  readonly message: string
}

export interface SimulationChecks {
  readonly guaranteedLoss: boolean
  readonly longBattle: boolean
  readonly neverBreaks: boolean
}

export interface BattleSimulationReport {
  readonly strategy: SimulationStrategy
  readonly difficulty: DifficultyLevel
  readonly seeds: readonly number[]
  readonly totalBattles: number
  readonly wins: number
  readonly losses: number
  readonly timeouts: number
  readonly winRate: number
  readonly rounds: SimulationDistribution
  readonly posture: SimulationPostureReport
  readonly resources: SimulationResourceReport
  readonly checks: SimulationChecks
  readonly issues: readonly SimulationIssue[]
  readonly samples: readonly BattleSimulationSample[]
}

export class CombatSimulatorError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CombatSimulatorError'
  }
}

interface RuntimeStatus {
  readonly id: string
  turns: number
}

interface RuntimeActor {
  hp: number
  qi: number
  posture: PostureState
  statuses: RuntimeStatus[]
  cooldowns: Record<string, number>
  guardRatio: number
  evasionTurns: number
  accuracyDelta: number
  accuracyTurns: number
  qiCostDelta: number
  qiCostTurns: number
}

interface SkillEstimate {
  readonly damage: number
  readonly postureDamage: number
  readonly healing: number
  readonly selfDamage: number
  readonly guardRatio: number
  readonly qiGained: number
}

interface NormalizedRequest {
  readonly player: SimulationPlayerBuild & { readonly stats: Required<SimulationPlayerStats> }
  readonly skills: readonly SkillDefinition[]
  readonly enemy: CombatEnemyDefinition
  readonly difficulty: DifficultyLevel
  readonly seeds: readonly number[]
  readonly strategy: SimulationStrategy
  readonly thresholds: SimulationThresholds
  readonly mainline: boolean
}

interface MutableSample {
  seed: number
  outcome: BattleSimulationOutcome
  rounds: number
  playerHpRemaining: number
  playerQiRemaining: number
  enemyHpRemaining: number
  enemyPostureBreaks: number
  playerPostureBreaks: number
  enemyPostureDamageTaken: number
  playerPostureDamageTaken: number
  playerQiSpent: number
  playerQiRecovered: number
  playerHealing: number
  playerSelfDamage: number
  playerDamageTaken: number
  bossPhaseTransitions: number
  rngState: number
}

const BASIC_ATTACK: SkillDefinition = {
  id: 'basic:cleaver',
  name: '普通攻击',
  description: '不消耗内力的基础攻击。',
  school: 'dao',
  target: 'enemy',
  qiCost: 0,
  cooldown: 0,
  effects: [{ type: 'damage', power: 1, posturePower: 4 }],
  preview: { summary: '造成稳定伤害并保留架势压力', values: { power: 1, posture: 4 } },
}

const DIFFICULTIES: readonly DifficultyLevel[] = ['story', 'standard', 'expert']
const STRATEGIES: readonly SimulationStrategy[] = ['conservative', 'balanced', 'aggressive']

function finite(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? value as number : fallback
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum))
}

function assertInteger(value: number, label: string, minimum: number): void {
  if (!Number.isInteger(value) || value < minimum) throw new CombatSimulatorError(`${label}必须是大于等于 ${minimum} 的整数`)
}

function assertFiniteAtLeast(value: number, label: string, minimum: number): void {
  if (!Number.isFinite(value) || value < minimum) throw new CombatSimulatorError(`${label}必须是大于等于 ${minimum} 的有限数字`)
}

function assertSeed(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new CombatSimulatorError(`${label}必须是 0–2^32-1 的整数`)
}

function normalizeSeeds(input: SimulationSeeds, maxSeeds: number): readonly number[] {
  const seeds: number[] = []
  if (Array.isArray(input)) {
    input.forEach((seed, index) => {
      assertSeed(seed, `seeds[${index}]`)
      seeds.push(seed >>> 0)
    })
  } else {
    const range = input as SimulationSeedRange
    assertSeed(range.start, 'seeds.start')
    assertSeed(range.end, 'seeds.end')
    const step = range.step ?? 1
    assertInteger(step, 'seeds.step', 1)
    if (range.end < range.start) throw new CombatSimulatorError('seeds.end 不能小于 seeds.start')
    for (let seed = range.start; seed <= range.end; seed += step) {
      seeds.push(seed >>> 0)
      if (seeds.length > maxSeeds) throw new CombatSimulatorError(`种子数量超过上限 ${maxSeeds}`)
      if (seed > 0xffffffff - step && seed < range.end) break
    }
  }
  if (seeds.length === 0) throw new CombatSimulatorError('种子范围不能为空')
  if (seeds.length > maxSeeds) throw new CombatSimulatorError(`种子数量超过上限 ${maxSeeds}`)
  return seeds
}

function normalizeThresholds(input: Partial<SimulationThresholds> | undefined): SimulationThresholds {
  const thresholds = { ...DEFAULT_SIMULATION_THRESHOLDS, ...(input ?? {}) }
  assertInteger(thresholds.maxRounds, 'thresholds.maxRounds', 1)
  assertInteger(thresholds.longBattleRounds, 'thresholds.longBattleRounds', 1)
  assertInteger(thresholds.maxSeeds, 'thresholds.maxSeeds', 1)
  if (thresholds.longBattleRounds > thresholds.maxRounds) throw new CombatSimulatorError('thresholds.longBattleRounds 不能大于 maxRounds')
  return thresholds
}

function normalizeStats(stats: SimulationPlayerStats): Required<SimulationPlayerStats> {
  assertFiniteAtLeast(stats.maxHp, 'player.stats.maxHp', 1)
  assertFiniteAtLeast(stats.maxQi, 'player.stats.maxQi', 0)
  assertFiniteAtLeast(stats.attack, 'player.stats.attack', 0)
  assertFiniteAtLeast(stats.defense, 'player.stats.defense', 0)
  assertFiniteAtLeast(stats.posture, 'player.stats.posture', 1)
  if (!Number.isFinite(stats.accuracy) || stats.accuracy < 0 || stats.accuracy > 1) throw new CombatSimulatorError('player.stats.accuracy 必须在 0–1 之间')
  if (!Number.isFinite(stats.dodge) || stats.dodge < 0 || stats.dodge > 1) throw new CombatSimulatorError('player.stats.dodge 必须在 0–1 之间')
  if (!Number.isFinite(stats.crit) || stats.crit < 0 || stats.crit > 1) throw new CombatSimulatorError('player.stats.crit 必须在 0–1 之间')
  const normalized = {
    ...stats,
    qiRecovery: finite(stats.qiRecovery, 0),
    healingMultiplier: finite(stats.healingMultiplier, 1),
    damageWhenPostureBroken: finite(stats.damageWhenPostureBroken, 0),
  }
  assertFiniteAtLeast(normalized.qiRecovery, 'player.stats.qiRecovery', 0)
  assertFiniteAtLeast(normalized.healingMultiplier, 'player.stats.healingMultiplier', 0)
  assertFiniteAtLeast(normalized.damageWhenPostureBroken, 'player.stats.damageWhenPostureBroken', 0)
  return normalized
}

function normalizeRequest(request: CombatSimulationRequest): NormalizedRequest {
  if (!request || !request.player || !request.enemy) throw new CombatSimulatorError('模拟输入必须包含 player 和 enemy')
  assertInteger(request.player.level, 'player.level', 1)
  if (request.player.level > 30) throw new CombatSimulatorError('player.level 不能超过 30')
  if (!request.enemy.id || !String(request.enemy.id).trim() || !request.enemy.name.trim()) throw new CombatSimulatorError('enemy.id 和 enemy.name 不能为空')
  if (!DIFFICULTIES.includes(request.difficulty)) throw new CombatSimulatorError(`未知难度「${String(request.difficulty)}」`)
  const strategy = request.strategy ?? 'balanced'
  if (!STRATEGIES.includes(strategy)) throw new CombatSimulatorError(`未知模拟策略「${String(strategy)}」`)
  const thresholds = normalizeThresholds(request.thresholds)
  const seeds = normalizeSeeds(request.seeds, thresholds.maxSeeds)
  const skills = [...(request.player.skills ?? [])]
  const skillIds = new Set<string>()
  skills.forEach((skill) => {
    const id = String(skill.id)
    if (!id.trim() || skillIds.has(id)) throw new CombatSimulatorError(`玩家技能 ID 重复或为空「${id}」`)
    skillIds.add(id)
    if (!Number.isFinite(skill.qiCost) || skill.qiCost < 0 || !Number.isFinite(skill.cooldown) || skill.cooldown < 0) throw new CombatSimulatorError(`技能「${id}」资源配置无效`)
  })
  const basicSkill = request.player.basicSkill ?? BASIC_ATTACK
  if (skillIds.has(String(basicSkill.id))) throw new CombatSimulatorError(`basicSkill 与玩家技能 ID 冲突「${String(basicSkill.id)}」`)
  return {
    ...request,
    player: { ...request.player, stats: normalizeStats(request.player.stats) },
    skills: [...skills, basicSkill],
    seeds,
    strategy,
    thresholds,
    mainline: request.mainline === true,
  }
}

function createActor(stats: SimulationPlayerStats, postureMax: number): RuntimeActor {
  return {
    hp: stats.maxHp,
    qi: stats.maxQi,
    posture: createPosture(postureMax),
    statuses: [],
    cooldowns: {},
    guardRatio: 0,
    evasionTurns: 0,
    accuracyDelta: 0,
    accuracyTurns: 0,
    qiCostDelta: 0,
    qiCostTurns: 0,
  }
}

function enemyActor(stats: EnemyStats): RuntimeActor {
  return {
    hp: stats.maxHp,
    qi: stats.maxQi,
    posture: createPosture(stats.posture),
    statuses: [],
    cooldowns: {},
    guardRatio: 0,
    evasionTurns: 0,
    accuracyDelta: 0,
    accuracyTurns: 0,
    qiCostDelta: 0,
    qiCostTurns: 0,
  }
}

function effectHits(effect: Extract<SkillEffect, { readonly type: 'damage' }>, skill: SkillDefinition): number {
  return Math.max(1, Math.min(skill.safety?.maximumHits ?? 5, Math.floor(effect.hits ?? 1)))
}

function estimateSkill(skill: SkillDefinition, attack: number, enemyDefense: number): SkillEstimate {
  let damage = 0
  let postureDamage = 0
  let healing = 0
  let selfDamage = 0
  let guardRatio = 0
  let qiGained = 0
  skill.effects.forEach((effect) => {
    switch (effect.type) {
      case 'damage': {
        const hits = effectHits(effect, skill)
        damage += Math.max(0, attack * Math.max(0, effect.power) - Math.max(0, enemyDefense)) * hits
        postureDamage += Math.max(0, effect.posturePower ?? 0) * hits
        return
      }
      case 'posture_damage': postureDamage += Math.max(0, effect.amount ?? attack * Math.max(0, effect.power ?? 0)); return
      case 'heal': healing += Math.max(0, effect.amount); return
      case 'self_damage': selfDamage += Math.max(0, effect.amount ?? attack * Math.max(0, effect.maxHpRatio ?? 0)); return
      case 'guard': guardRatio = Math.max(guardRatio, clamp(effect.ratio, 0, 0.8)); return
      case 'gain_qi': qiGained += Math.max(0, effect.amount); return
      default: return
    }
  })
  return { damage, postureDamage, healing, selfDamage, guardRatio, qiGained }
}

function skillCost(skill: SkillDefinition, player: RuntimeActor): number {
  return Math.max(0, Math.round(skill.qiCost + (player.qiCostTurns > 0 ? player.qiCostDelta : 0)))
}

function availableSkills(skills: readonly SkillDefinition[], player: RuntimeActor): readonly SkillDefinition[] {
  return skills.filter((skill) => (player.cooldowns[String(skill.id)] ?? 0) <= 0 && player.qi >= skillCost(skill, player))
}

function chooseSkill(
  strategy: SimulationStrategy,
  skills: readonly SkillDefinition[],
  player: RuntimeActor,
  playerStats: Required<SimulationPlayerStats>,
  enemy: RuntimeActor,
  enemyStats: EnemyStats,
  enemyIntent: ReturnType<typeof chooseEnemyAction>['intent'],
): SkillDefinition {
  const candidates = availableSkills(skills, player)
  if (candidates.length === 0) return BASIC_ATTACK
  const incoming = enemyIntent?.expectedDamage ?? 0
  const hpRatio = player.hp / playerStats.maxHp
  const postureRatio = enemy.posture.current / enemy.posture.max
  let selected = candidates[0]
  let selectedScore = Number.NEGATIVE_INFINITY
  candidates.forEach((skill, index) => {
    const estimate = estimateSkill(skill, playerStats.attack, enemyStats.defense)
    const cost = skillCost(skill, player)
    const damage = estimate.damage
    const posture = estimate.postureDamage
    const recovery = estimate.healing + estimate.qiGained * 0.5
    const survives = estimate.guardRatio * incoming + estimate.healing * playerStats.healingMultiplier
    let score: number
    if (strategy === 'aggressive') {
      score = damage * 10 + posture * (postureRatio > 0.5 ? 1.5 : 0.5) + recovery * 0.2 - cost * 0.25
      if (enemy.hp / enemyStats.maxHp <= 0.4 && damage > 0) score += 6
    } else if (strategy === 'conservative') {
      score = survives * 5 + posture * 2 + damage * 3 + recovery * (hpRatio < 0.55 ? 2 : 0.5) - cost * 0.6
      if (hpRatio < 0.35 && estimate.healing > 0) score += 100
      if (incoming >= playerStats.maxHp * 0.25 && estimate.guardRatio > 0) score += 40
    } else {
      score = damage * 7 + posture * (postureRatio > 0.35 ? 2.5 : 1) + survives * (hpRatio < 0.5 ? 1.5 : 0.3) - cost * 0.4
      if (hpRatio < 0.4 && estimate.healing > 0) score += 30
    }
    // Slot order is the deterministic tie-breaker; the heuristic is deliberately
    // transparent and does not search future turns.
    score -= index * 0.0001
    if (score > selectedScore) {
      selected = skill
      selectedScore = score
    }
  })
  return selected
}

function addRuntimeStatus(actor: RuntimeActor, status: RuntimeStatus): void {
  const existing = actor.statuses.find((item) => item.id === status.id)
  if (existing) existing.turns = Math.max(existing.turns, status.turns)
  else actor.statuses.push({ ...status })
}

function applySkillCooldown(player: RuntimeActor, skill: SkillDefinition): void {
  if (skill.cooldown > 0) player.cooldowns[String(skill.id)] = Math.max(1, Math.floor(skill.cooldown))
}

function tickRuntimeActor(actor: RuntimeActor, stats: SimulationPlayerStats): number {
  const recovered = Math.min(Math.max(0, stats.maxQi - actor.qi), Math.max(0, stats.qiRecovery ?? 0))
  actor.qi += recovered
  actor.cooldowns = Object.fromEntries(Object.entries(actor.cooldowns).map(([id, turns]) => [id, Math.max(0, turns - 1)]))
  actor.statuses = actor.statuses.map((status) => ({ ...status, turns: status.turns - 1 })).filter((status) => status.turns > 0)
  if (actor.accuracyTurns > 0) {
    actor.accuracyTurns -= 1
    if (actor.accuracyTurns <= 0) actor.accuracyDelta = 0
  }
  if (actor.qiCostTurns > 0) {
    actor.qiCostTurns -= 1
    if (actor.qiCostTurns <= 0) actor.qiCostDelta = 0
  }
  actor.evasionTurns = Math.max(0, actor.evasionTurns - 1)
  actor.guardRatio = 0
  return recovered
}

function movePower(move: EnemyMoveDefinition): number {
  if (move.kind === 'defend') return 0
  return Math.max(0, finite(move.power, move.kind === 'charge' ? 1.2 : 1))
}

function simulateBattleInternal(request: NormalizedRequest, seed: number): BattleSimulationSample {
  const rng = new DeterministicRng(seed)
  const enemyStats = (() => {
    // chooseEnemyAction resolves the same stats; this initial value only creates
    // the actor before the first intent is displayed.
    const preview = chooseEnemyAction({ enemy: request.enemy, level: request.player.level, difficulty: request.difficulty, currentHp: 1, maxHp: 1, round: 1, rng: new DeterministicRng(seed) })
    return preview.stats
  })()
  const player = createActor(request.player.stats, request.player.stats.posture)
  const enemy = enemyActor(enemyStats)
  let bossPhaseState: BossPhaseState | undefined = request.enemy.boss ? createBossPhaseState(request.enemy.boss, enemyStats.maxHp) : undefined
  let previousMoveId: string | undefined
  const sample: MutableSample = {
    seed,
    outcome: 'max_rounds',
    rounds: 0,
    playerHpRemaining: player.hp,
    playerQiRemaining: player.qi,
    enemyHpRemaining: enemy.hp,
    enemyPostureBreaks: 0,
    playerPostureBreaks: 0,
    enemyPostureDamageTaken: 0,
    playerPostureDamageTaken: 0,
    playerQiSpent: 0,
    playerQiRecovered: 0,
    playerHealing: 0,
    playerSelfDamage: 0,
    playerDamageTaken: 0,
    bossPhaseTransitions: 0,
    rngState: seed,
  }

  for (let round = 1; round <= request.thresholds.maxRounds; round += 1) {
    sample.rounds = round
    const decision = chooseEnemyAction({
      enemy: request.enemy,
      level: request.player.level,
      difficulty: request.difficulty,
      currentHp: enemy.hp,
      maxHp: enemyStats.maxHp,
      round,
      rng,
      bossPhaseState,
      previousMoveId,
    })
    if (decision.bossPhase) {
      if (decision.bossPhase.changed) sample.bossPhaseTransitions += 1
      bossPhaseState = decision.bossPhase.state
    }
    if (decision.outcome === 'victory') {
      sample.outcome = 'victory'
      break
    }
    const intent = decision.intent
    // The strategy sees the displayed intent, but damage uses the selected
    // actual move so Boss deception remains meaningful in the simulation.
    enemy.guardRatio = clamp(decision.action?.guardRatio ?? 0, 0, 0.8)
    const skill = chooseSkill(request.strategy, request.skills, player, request.player.stats, enemy, decision.stats, intent)
    const actualCost = skillCost(skill, player)
    const adjustedSkill = actualCost === skill.qiCost ? skill : { ...skill, qiCost: actualCost }
    const enemyWasBroken = enemy.posture.broken
    const resolution = resolveActiveSkill(adjustedSkill, {
      actor: {
        hp: player.hp,
        maxHp: request.player.stats.maxHp,
        qi: player.qi,
        maxQi: request.player.stats.maxQi,
        attack: request.player.stats.attack,
        accuracy: clamp(request.player.stats.accuracy + player.accuracyDelta - decision.stats.dodge, 0, 1),
      },
      target: {
        hp: enemy.hp,
        maxHp: enemyStats.maxHp,
        defense: decision.stats.defense,
        posture: enemy.posture.current,
        maxPosture: enemy.posture.max,
      },
      statuses: player.statuses.map((status) => status.id),
      rng,
    })
    player.qi = Math.max(0, player.qi - resolution.qiCost)
    sample.playerQiSpent += resolution.qiCost
    const postureMultiplier = enemyWasBroken ? postureDamageMultiplier(enemy.posture) : 1
    const passiveMultiplier = enemyWasBroken ? 1 + request.player.stats.damageWhenPostureBroken : 1
    const guardedDamage = Math.round(resolution.damage * postureMultiplier * passiveMultiplier * (1 - enemy.guardRatio))
    enemy.hp = Math.max(0, enemy.hp - Math.max(0, guardedDamage))
    const postureResult = applyPostureDamage(enemy.posture, resolution.postureDamage)
    sample.enemyPostureDamageTaken += Math.max(0, enemy.posture.current - postureResult.state.current)
    if (postureResult.brokeNow) sample.enemyPostureBreaks += 1
    enemy.posture = enemyWasBroken ? tickPosture(postureResult.state) : postureResult.state
    const healing = Math.min(request.player.stats.maxHp - player.hp, resolution.healing * request.player.stats.healingMultiplier)
    player.hp = Math.min(request.player.stats.maxHp, player.hp + Math.max(0, healing))
    sample.playerHealing += Math.max(0, healing)
    player.hp = Math.max(1, player.hp - resolution.selfDamage)
    sample.playerSelfDamage += resolution.selfDamage
    const qiGained = Math.min(request.player.stats.maxQi - player.qi, resolution.qiGained)
    player.qi += Math.max(0, qiGained)
    for (const status of resolution.appliedStatuses) addRuntimeStatus(player, { ...status, turns: status.turns + 1 })
    player.guardRatio = resolution.guardRatio
    player.evasionTurns = Math.max(player.evasionTurns, resolution.evasionTurns)
    if (resolution.accuracyDelta !== 0) {
      player.accuracyDelta = resolution.accuracyDelta
      player.accuracyTurns = Math.max(1, adjustedSkill.effects.filter((effect) => effect.type === 'modify_accuracy').reduce((turns, effect) => Math.max(turns, effect.turns + 1), 0))
    }
    if (resolution.nextSkillQiCostDelta !== 0) {
      player.qiCostDelta = resolution.nextSkillQiCostDelta
      player.qiCostTurns = 2
    }
    applySkillCooldown(player, adjustedSkill)
    if (enemy.hp <= 0) {
      sample.outcome = 'victory'
      break
    }

    const move = decision.action
    const playerWasBroken = player.posture.broken
    if (move) {
      previousMoveId = move.id
      const power = movePower(move)
      if (power > 0) {
        const enemyHit = calculateDamage({
          attacker: { attack: decision.stats.attack, defense: decision.stats.defense, crit: decision.stats.crit, accuracy: decision.stats.accuracy, dodge: decision.stats.dodge },
          defender: { attack: request.player.stats.attack, defense: request.player.stats.defense, crit: request.player.stats.crit, accuracy: request.player.stats.accuracy, dodge: clamp(request.player.stats.dodge + (player.evasionTurns > 0 ? 1 : 0), 0, 0.95) },
          power,
          rng,
        })
        if (enemyHit.hit) {
          const damage = Math.round(enemyHit.damage * (playerWasBroken ? postureDamageMultiplier(player.posture) : 1) * (1 - player.guardRatio))
          player.hp = Math.max(0, player.hp - Math.max(0, damage))
          sample.playerDamageTaken += Math.max(0, damage)
          const playerPostureResult = applyPostureDamage(player.posture, move.posturePower ?? 0)
          sample.playerPostureDamageTaken += Math.max(0, player.posture.current - playerPostureResult.state.current)
          if (playerPostureResult.brokeNow) sample.playerPostureBreaks += 1
          player.posture = playerWasBroken ? tickPosture(playerPostureResult.state) : playerPostureResult.state
        } else if (playerWasBroken) {
          player.posture = tickPosture(player.posture)
        }
      } else if (playerWasBroken) {
        player.posture = tickPosture(player.posture)
      }
    } else if (playerWasBroken) {
      player.posture = tickPosture(player.posture)
    }
    if (player.hp <= 0) {
      sample.outcome = 'defeat'
      break
    }
    sample.playerQiRecovered += tickRuntimeActor(player, request.player.stats)
    tickRuntimeActor(enemy, enemyStats)
  }

  sample.playerHpRemaining = Math.max(0, player.hp)
  sample.playerQiRemaining = Math.max(0, player.qi)
  sample.enemyHpRemaining = Math.max(0, enemy.hp)
  sample.rngState = rng.state
  return sample
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
}

function percentile(values: readonly number[], ratio: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))
  return sorted[index]
}

function distribution(values: readonly number[]): SimulationDistribution {
  return { average: average(values), median: percentile(values, 0.5), p95: percentile(values, 0.95), maximum: values.reduce((maximum, value) => Math.max(maximum, value), 0) }
}

function makeIssues(
  checks: SimulationChecks,
  mainline: boolean,
  rounds: SimulationDistribution,
  thresholds: SimulationThresholds,
): readonly SimulationIssue[] {
  const severity = mainline ? 'error' : 'warning'
  const issues: SimulationIssue[] = []
  if (checks.guaranteedLoss) issues.push({ code: 'guaranteed_loss', severity, message: '该构筑在全部固定种子下都未获胜，主线组合需要回归审查。' })
  if (checks.longBattle) issues.push({ code: 'long_battle', severity, message: `战斗达到超长阈值：最长 ${rounds.maximum} 回合，阈值 ${thresholds.longBattleRounds} 回合。` })
  if (checks.neverBreaks) issues.push({ code: 'never_break', severity, message: '全部样本都没有击破敌人架势，需确认破防窗口是否仍有价值。' })
  return issues
}

export function simulateBattle(request: CombatSimulationRequest, seed: number): BattleSimulationSample {
  const normalized = normalizeRequest({ ...request, seeds: [seed] })
  return simulateBattleInternal(normalized, seed >>> 0)
}

export function simulateBattles(request: CombatSimulationRequest): BattleSimulationReport {
  const normalized = normalizeRequest(request)
  const samples = normalized.seeds.map((seed) => simulateBattleInternal(normalized, seed))
  const wins = samples.filter((sample) => sample.outcome === 'victory').length
  const losses = samples.filter((sample) => sample.outcome === 'defeat').length
  const timeouts = samples.filter((sample) => sample.outcome === 'max_rounds').length
  const enemyBreaks = samples.filter((sample) => sample.enemyPostureBreaks > 0).length
  const playerBreaks = samples.filter((sample) => sample.playerPostureBreaks > 0).length
  const roundDistribution = distribution(samples.map((sample) => sample.rounds))
  const posture: SimulationPostureReport = {
    enemyBreaks,
    enemyBreakRate: enemyBreaks / samples.length,
    playerBreaks,
    playerBreakRate: playerBreaks / samples.length,
    totalEnemyPostureDamage: samples.reduce((sum, sample) => sum + sample.enemyPostureDamageTaken, 0),
    totalPlayerPostureDamage: samples.reduce((sum, sample) => sum + sample.playerPostureDamageTaken, 0),
    neverBreaks: enemyBreaks === 0,
  }
  const resources: SimulationResourceReport = {
    averageQiSpent: average(samples.map((sample) => sample.playerQiSpent)),
    averageQiRecovered: average(samples.map((sample) => sample.playerQiRecovered)),
    averageHealing: average(samples.map((sample) => sample.playerHealing)),
    averageSelfDamage: average(samples.map((sample) => sample.playerSelfDamage)),
    averageDamageTaken: average(samples.map((sample) => sample.playerDamageTaken)),
    averageQiRemaining: average(samples.map((sample) => sample.playerQiRemaining)),
    averageHpRemaining: average(samples.map((sample) => sample.playerHpRemaining)),
  }
  const checks: SimulationChecks = {
    guaranteedLoss: wins === 0,
    longBattle: samples.some((sample) => sample.outcome === 'max_rounds' || sample.rounds >= normalized.thresholds.longBattleRounds),
    neverBreaks: posture.neverBreaks,
  }
  return {
    strategy: normalized.strategy,
    difficulty: normalized.difficulty,
    seeds: [...normalized.seeds],
    totalBattles: samples.length,
    wins,
    losses,
    timeouts,
    winRate: wins / samples.length,
    rounds: roundDistribution,
    posture,
    resources,
    checks,
    issues: makeIssues(checks, normalized.mainline, roundDistribution, normalized.thresholds),
    samples,
  }
}

export const runBattleSimulation = simulateBattles
export const simulateBatch = simulateBattles
export { DEFAULT_SIMULATION_THRESHOLDS }
export type { SimulationThresholds }
