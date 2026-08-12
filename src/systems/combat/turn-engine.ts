import type { CombatAction, CombatPatch, CombatResolution, CombatSetup, CombatSkillDefinition, CombatState } from '../../types/combat'

export type CombatErrorCode = 'invalid_phase' | 'duplicate_action' | 'unknown_action' | 'unknown_skill' | 'invalid_resolution'

export class CombatTurnError extends Error {
  readonly code: CombatErrorCode
  readonly actionId?: string

  constructor(code: CombatErrorCode, message: string, actionId?: string) {
    super(message)
    this.name = 'CombatTurnError'
    this.code = code
    this.actionId = actionId
  }
}

function clonePatch(patch: CombatPatch | undefined): CombatPatch | undefined {
  if (!patch) return undefined
  return { ...patch, statuses: patch.statuses ? patch.statuses.map((status) => ({ ...status })) : undefined }
}

function applyPatch(current: CombatState['player'], patch: CombatPatch | undefined): CombatState['player'] {
  if (!patch) return current
  return {
    ...current,
    hp: patch.hp ?? current.hp,
    qi: patch.qi ?? current.qi,
    statuses: patch.statuses ? patch.statuses.map((status) => ({ ...status })) : current.statuses,
  }
}

function validateCombatant(combatant: CombatSetup['player'], label: string): void {
  if (!combatant.id.trim() || !combatant.name.trim()) throw new CombatTurnError('invalid_resolution', `${label} ID 和名称不能为空`)
  if (!Number.isFinite(combatant.maxHp) || combatant.maxHp <= 0 || combatant.hp < 0 || combatant.hp > combatant.maxHp) throw new CombatTurnError('invalid_resolution', `${label} HP 越界`)
  if (!Number.isFinite(combatant.maxQi) || combatant.maxQi < 0 || combatant.qi < 0 || combatant.qi > combatant.maxQi) throw new CombatTurnError('invalid_resolution', `${label} 内力越界`)
}

export class CombatTurnEngine {
  private state: CombatState
  private readonly preBattle: Pick<CombatState, 'player' | 'enemy' | 'cooldowns' | 'rng' | 'round'>

  constructor(setup: CombatSetup) {
    validateCombatant(setup.player, '玩家')
    validateCombatant(setup.enemy, '敌人')
    const skills: Record<string, CombatSkillDefinition> = {}
    setup.skills.forEach((skill) => {
      if (!skill.id.trim() || skills[skill.id]) throw new CombatTurnError('unknown_skill', `技能 ID 重复或为空「${skill.id}」`)
      if (!Number.isInteger(skill.qiCost) || skill.qiCost < 0 || !Number.isInteger(skill.cooldown) || skill.cooldown < 0) throw new CombatTurnError('invalid_resolution', `技能「${skill.id}」资源配置无效`)
      skills[skill.id] = { ...skill }
    })
    this.state = {
      phase: 'setup',
      round: 1,
      player: { ...setup.player, statuses: setup.player.statuses.map((status) => ({ ...status })) },
      enemy: { ...setup.enemy, statuses: setup.enemy.statuses.map((status) => ({ ...status })) },
      skills,
      cooldowns: {},
      pendingAction: null,
      processedActionIds: [],
      rng: { ...setup.rng },
    }
    this.preBattle = { player: this.state.player, enemy: this.state.enemy, cooldowns: {}, rng: { ...setup.rng }, round: 1 }
  }

  getState(): CombatState {
    return {
      ...this.state,
      player: { ...this.state.player, statuses: this.state.player.statuses.map((status) => ({ ...status })) },
      enemy: { ...this.state.enemy, statuses: this.state.enemy.statuses.map((status) => ({ ...status })) },
      cooldowns: { ...this.state.cooldowns },
      processedActionIds: [...this.state.processedActionIds],
      pendingAction: this.state.pendingAction ? { ...this.state.pendingAction } : null,
      rng: { ...this.state.rng },
    }
  }

  start(): CombatState {
    this.requirePhase('setup')
    this.state = { ...this.state, phase: 'player_turn' }
    return this.getState()
  }

  chooseSkill(actionId: string, skillId: string): CombatState {
    this.requireNewAction(actionId)
    this.requirePhase('player_turn', actionId)
    const skill = this.state.skills[skillId]
    if (!skill) throw new CombatTurnError('unknown_skill', `技能不存在「${skillId}」`, actionId)
    if ((this.state.cooldowns[skillId] ?? 0) > 0) throw new CombatTurnError('unknown_action', `技能「${skillId}」仍在冷却`, actionId)
    if (this.state.player.qi < skill.qiCost) throw new CombatTurnError('unknown_action', `技能「${skillId}」内力不足`, actionId)
    this.state = { ...this.state, phase: 'resolving', pendingAction: { actionId, actor: 'player', skillId } }
    return this.getState()
  }

  resolvePlayerAction(actionId: string, resolution: CombatResolution = {}): CombatState {
    this.requirePending('player', actionId)
    const skillId = this.state.pendingAction?.skillId
    const skill = skillId ? this.state.skills[skillId] : undefined
    if (!skill) throw new CombatTurnError('unknown_skill', '待结算技能不存在', actionId)
    const playerQi = this.state.player.qi - skill.qiCost
    if (playerQi < 0) throw new CombatTurnError('invalid_resolution', '结算后内力不能为负', actionId)
    const cooldowns = { ...this.state.cooldowns, [skill.id]: skill.cooldown }
    const player = applyPatch({ ...this.state.player, qi: playerQi }, clonePatch(resolution.player))
    const enemy = applyPatch(this.state.enemy, clonePatch(resolution.enemy))
    this.state = this.afterPlayerResolution(actionId, player, enemy, cooldowns, resolution)
    return this.getState()
  }

  startEnemyTurn(actionId: string): CombatState {
    this.requirePhase('enemy_turn', actionId)
    this.requireNewAction(actionId)
    this.state = { ...this.state, phase: 'resolving', pendingAction: { actionId, actor: 'enemy' } }
    return this.getState()
  }

  resolveEnemyAction(actionId: string, resolution: CombatResolution = {}): CombatState {
    this.requirePending('enemy', actionId)
    const player = applyPatch(this.state.player, clonePatch(resolution.player))
    const enemy = applyPatch(this.state.enemy, clonePatch(resolution.enemy))
    const processed = [...this.state.processedActionIds, actionId]
    if (player.hp <= 0) {
      this.state = { ...this.state, player: { ...player, hp: 0 }, enemy, phase: 'defeat', pendingAction: null, processedActionIds: processed, rng: resolution.rng ? { ...resolution.rng } : this.state.rng }
    } else if (enemy.hp <= 0) {
      this.state = { ...this.state, player, enemy: { ...enemy, hp: 0 }, phase: 'victory', pendingAction: null, processedActionIds: processed, rng: resolution.rng ? { ...resolution.rng } : this.state.rng }
    } else {
      this.state = { ...this.state, player, enemy, phase: 'player_turn', round: this.state.round + 1, pendingAction: null, processedActionIds: processed, cooldowns: this.decrementCooldowns(), rng: resolution.rng ? { ...resolution.rng } : this.state.rng }
    }
    return this.getState()
  }

  endEnemyTurn(actionId: string): CombatState {
    return this.resolveEnemyAction(actionId)
  }

  retry(): CombatState {
    this.requirePhase('defeat')
    this.state = {
      ...this.state,
      phase: 'player_turn',
      round: this.preBattle.round,
      player: { ...this.preBattle.player, statuses: this.preBattle.player.statuses.map((status) => ({ ...status })) },
      enemy: { ...this.preBattle.enemy, statuses: this.preBattle.enemy.statuses.map((status) => ({ ...status })) },
      cooldowns: { ...this.preBattle.cooldowns },
      pendingAction: null,
      processedActionIds: [],
      rng: { ...this.preBattle.rng },
    }
    return this.getState()
  }

  private afterPlayerResolution(actionId: string, player: CombatState['player'], enemy: CombatState['enemy'], cooldowns: Readonly<Record<string, number>>, resolution: CombatResolution): CombatState {
    const processed = [...this.state.processedActionIds, actionId]
    const rng = resolution.rng ? { ...resolution.rng } : this.state.rng
    if (player.hp <= 0) return { ...this.state, player: { ...player, hp: 0 }, enemy, phase: 'defeat', pendingAction: null, processedActionIds: processed, cooldowns, rng }
    if (enemy.hp <= 0) return { ...this.state, player, enemy: { ...enemy, hp: 0 }, phase: 'victory', pendingAction: null, processedActionIds: processed, cooldowns, rng }
    return { ...this.state, player, enemy, phase: 'enemy_turn', pendingAction: null, processedActionIds: processed, cooldowns, rng }
  }

  private decrementCooldowns(): Readonly<Record<string, number>> {
    return Object.fromEntries(Object.entries(this.state.cooldowns).map(([skillId, turns]) => [skillId, Math.max(0, turns - 1)]))
  }

  private requirePhase(phase: CombatState['phase'], actionId?: string): void {
    if (this.state.phase !== phase) throw new CombatTurnError('invalid_phase', `当前阶段为 ${this.state.phase}，需要 ${phase}`, actionId)
  }

  private requireNewAction(actionId: string): void {
    if (!actionId.trim()) throw new CombatTurnError('unknown_action', 'actionId 不能为空', actionId)
    if (this.state.processedActionIds.includes(actionId) || this.state.pendingAction?.actionId === actionId) throw new CombatTurnError('duplicate_action', `动作已处理「${actionId}」`, actionId)
  }

  private requirePending(actor: CombatAction['actor'], actionId: string): void {
    if (this.state.phase !== 'resolving' || !this.state.pendingAction || this.state.pendingAction.actor !== actor) throw new CombatTurnError('invalid_phase', `当前没有待结算的 ${actor} 动作`, actionId)
    if (this.state.pendingAction.actionId !== actionId) throw new CombatTurnError('unknown_action', `待结算动作不匹配「${actionId}」`, actionId)
  }
}
