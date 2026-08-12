import type { SkillDefinition, SkillLoadoutValidation, SkillProgressState } from '../../types/skill'
import { MAX_PLAYER_LEVEL, MAX_SKILL_SLOTS } from '../../types/skill'
import { SkillRegistry } from './registry'

export class SkillLoadoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SkillLoadoutError'
  }
}

function normalizeLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > MAX_PLAYER_LEVEL) throw new SkillLoadoutError(`玩家等级必须在 1–${MAX_PLAYER_LEVEL} 之间`)
  return level
}

function availablePoints(state: SkillProgressState): number {
  return Math.max(0, state.earnedSkillPoints - state.spentSkillPoints)
}

function copyState(state: SkillProgressState, overrides: Partial<SkillProgressState>): SkillProgressState {
  return { ...state, ...overrides, unlockedSkillIds: [...(overrides.unlockedSkillIds ?? state.unlockedSkillIds)], loadout: [...(overrides.loadout ?? state.loadout)] }
}

export function createSkillProgressState(level = 1): SkillProgressState {
  const normalizedLevel = normalizeLevel(level)
  return {
    level: normalizedLevel,
    earnedSkillPoints: normalizedLevel - 1,
    spentSkillPoints: 0,
    unlockedSkillIds: [],
    ranks: {},
    loadout: Array.from({ length: MAX_SKILL_SLOTS }, () => null),
  }
}

export function setSkillLevel(state: SkillProgressState, level: number): SkillProgressState {
  const normalizedLevel = normalizeLevel(level)
  const earnedSkillPoints = normalizedLevel - 1
  const spentSkillPoints = Math.min(state.spentSkillPoints, earnedSkillPoints)
  return copyState(state, { level: normalizedLevel, earnedSkillPoints, spentSkillPoints })
}

export function unlockSkill(state: SkillProgressState, registry: SkillRegistry, skillId: string): SkillProgressState {
  const skill = registry.get(skillId)
  if (state.unlockedSkillIds.includes(skillId)) return state
  if (availablePoints(state) < 1) throw new SkillLoadoutError('没有可用技能点')
  if ((skill.requiredLevel ?? 1) > state.level) throw new SkillLoadoutError(`技能「${skillId}」需要等级 ${skill.requiredLevel}`)
  const missing = (skill.prerequisiteIds ?? []).filter((id) => !state.unlockedSkillIds.includes(String(id)))
  if (missing.length > 0) throw new SkillLoadoutError(`技能「${skillId}」缺少前置：${missing.join('、')}`)
  return copyState(state, {
    unlockedSkillIds: [...state.unlockedSkillIds, skillId],
    spentSkillPoints: state.spentSkillPoints + 1,
    ranks: { ...state.ranks, [skillId]: 1 },
  })
}

export function upgradeSkill(state: SkillProgressState, registry: SkillRegistry, skillId: string): SkillProgressState {
  const skill = registry.get(skillId)
  if (!state.unlockedSkillIds.includes(skillId)) throw new SkillLoadoutError(`技能「${skillId}」尚未解锁`)
  if (availablePoints(state) < 1) throw new SkillLoadoutError('没有可用技能点')
  const currentRank = state.ranks[skillId] ?? 1
  const maxRank = skill.maxRank ?? 1
  if (currentRank >= maxRank) throw new SkillLoadoutError(`技能「${skillId}」已达到最高等级`)
  return copyState(state, { spentSkillPoints: state.spentSkillPoints + 1, ranks: { ...state.ranks, [skillId]: currentRank + 1 } })
}

export function equipSkill(state: SkillProgressState, registry: SkillRegistry, skillId: string, slot: number): SkillProgressState {
  registry.get(skillId)
  if (!Number.isInteger(slot) || slot < 0 || slot >= MAX_SKILL_SLOTS) throw new SkillLoadoutError(`技能槽位必须在 0–${MAX_SKILL_SLOTS - 1} 之间`)
  if (!state.unlockedSkillIds.includes(skillId)) throw new SkillLoadoutError(`技能「${skillId}」尚未解锁`)
  const existingSlot = state.loadout.findIndex((equipped) => equipped === skillId)
  const loadout = [...state.loadout]
  if (existingSlot >= 0 && existingSlot !== slot) loadout[existingSlot] = null
  loadout[slot] = skillId
  return copyState(state, { loadout })
}

export function unequipSkill(state: SkillProgressState, slot: number): SkillProgressState {
  if (!Number.isInteger(slot) || slot < 0 || slot >= MAX_SKILL_SLOTS) throw new SkillLoadoutError(`技能槽位必须在 0–${MAX_SKILL_SLOTS - 1} 之间`)
  const loadout = [...state.loadout]
  loadout[slot] = null
  return copyState(state, { loadout })
}

export function reorderSkillSlots(state: SkillProgressState, from: number, to: number): SkillProgressState {
  if (![from, to].every((slot) => Number.isInteger(slot) && slot >= 0 && slot < MAX_SKILL_SLOTS)) {
    throw new SkillLoadoutError(`技能槽位必须在 0–${MAX_SKILL_SLOTS - 1} 之间`)
  }
  const loadout = [...state.loadout]
  const [moved] = loadout.splice(from, 1)
  loadout.splice(to, 0, moved ?? null)
  return copyState(state, { loadout })
}

export function resetSkillPoints(state: SkillProgressState, inCombat = false): SkillProgressState {
  if (inCombat) throw new SkillLoadoutError('战斗中不能洗点')
  return copyState(state, { spentSkillPoints: 0, unlockedSkillIds: [], ranks: {}, loadout: Array.from({ length: MAX_SKILL_SLOTS }, () => null) })
}

export function validateSkillLoadout(state: SkillProgressState, registry: SkillRegistry): SkillLoadoutValidation {
  const errors: string[] = []
  if (state.loadout.length !== MAX_SKILL_SLOTS) errors.push(`技能槽位必须为 ${MAX_SKILL_SLOTS} 个`)
  const seen = new Set<string>()
  state.loadout.forEach((skillId, index) => {
    if (!skillId) return
    if (seen.has(skillId)) errors.push(`技能「${skillId}」重复装配`)
    seen.add(skillId)
    if (!registry.has(skillId)) errors.push(`槽位 ${index} 存在未知技能「${skillId}」`)
    if (!state.unlockedSkillIds.includes(skillId)) errors.push(`槽位 ${index} 存在未解锁技能「${skillId}」`)
  })
  if (state.spentSkillPoints > state.earnedSkillPoints) errors.push('已用技能点不能超过已获得技能点')
  return { valid: errors.length === 0, errors }
}

export const resetSkills = resetSkillPoints
export const equip = equipSkill
