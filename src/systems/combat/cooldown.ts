export type CooldownState = Readonly<Record<string, number>>

export type SkillUnavailableReason =
  | { readonly code: 'missing_skill'; readonly message: string }
  | { readonly code: 'cooldown'; readonly message: string; readonly remaining: number }
  | { readonly code: 'qi'; readonly message: string; readonly required: number; readonly available: number }

export function tickCooldowns(cooldowns: CooldownState): CooldownState {
  return Object.fromEntries(Object.entries(cooldowns).map(([id, turns]) => [id, Math.max(0, turns - 1)]))
}

export function setCooldown(cooldowns: CooldownState, skillId: string, turns: number): CooldownState {
  if (!skillId.trim() || !Number.isInteger(turns) || turns < 0) return { ...cooldowns }
  return { ...cooldowns, [skillId]: turns }
}

export function isCooldownReady(cooldowns: CooldownState, skillId: string): boolean {
  return (cooldowns[skillId] ?? 0) <= 0
}

export function getSkillUnavailableReason(
  cooldowns: CooldownState,
  skillId: string,
  qiCost: number | undefined,
  availableQi: number,
): SkillUnavailableReason | null {
  if (!skillId.trim() || qiCost === undefined) return { code: 'missing_skill', message: '找不到这招，菜刀也不认识。' }
  const remaining = cooldowns[skillId] ?? 0
  if (remaining > 0) return { code: 'cooldown', message: `还要等 ${remaining} 回合。`, remaining }
  if (availableQi < qiCost) return { code: 'qi', message: `内力不足，需要 ${qiCost}，当前 ${availableQi}。`, required: qiCost, available: availableQi }
  return null
}
