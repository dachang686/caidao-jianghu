// 回合引擎只处理阶段和动作合法性；伤害/状态公式由后续 resolver 注入。
export { CombatTurnEngine, CombatTurnError } from './turn-engine'
export type { CombatErrorCode } from './turn-engine'
export { calculateDamage } from './damage'
export type { DamageInput, DamageResult, DamageStats } from './damage'
export { addStatus, hasStatus, removeStatus, tickStatuses } from './status'
export type { StatusDefinition, StatusStackMode, StatusState } from './status'
export { FoodBuffEngine, FoodBuffEngineError, createFoodBuffEngine } from './food-buffs'
export type { FoodBattleAdvanceResult, FoodConsumeResult, FoodModifiers } from '../../types/food'
export { getSkillUnavailableReason, isCooldownReady, setCooldown, tickCooldowns } from './cooldown'
export type { CooldownState, SkillUnavailableReason } from './cooldown'
export { applyPostureDamage, createPosture, postureDamageMultiplier, tickPosture } from './posture'
export type { PostureDamageResult, PostureState } from './posture'
export { toEnemyIntentUiSummary } from './intent'
export {
  EnemyAiError,
  advanceBossPhase,
  calculateEnemyStats,
  chooseEnemyAction,
  createBossPhaseState,
  planEnemyAction,
  resolveBossPhase,
  resolveEnemyStats,
} from './enemy-ai'
export type { EnemyAiDecision, EnemyAiInput } from './enemy-ai'
export {
  applyDifficultyToEnemyStats,
  applyResourceTolerance,
  getDifficultyModifiers,
  getDifficultyProfile,
  getEffectiveDeceptiveChance,
  getIntentHonesty,
  resolveDeceptiveChance,
  scaleEnemyStatsForDifficulty,
} from './difficulty'
export type { DifficultyProfile, ResourceTolerance } from './difficulty'
export {
  CombatSimulatorError,
  runBattleSimulation,
  simulateBatch,
  simulateBattle,
  simulateBattles,
  DEFAULT_SIMULATION_THRESHOLDS,
} from './simulator'
export type {
  BattleSimulationOutcome,
  BattleSimulationReport,
  BattleSimulationSample,
  CombatSimulationRequest,
  SimulationChecks,
  SimulationDistribution,
  SimulationIssue,
  SimulationIssueCode,
  SimulationPlayerBuild,
  SimulationPlayerStats,
  SimulationPostureReport,
  SimulationResourceReport,
  SimulationSeedRange,
  SimulationSeeds,
  SimulationStrategy,
  SimulationThresholds,
} from './simulator'
