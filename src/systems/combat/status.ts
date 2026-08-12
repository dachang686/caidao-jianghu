export type StatusStackMode = 'replace' | 'extend' | 'stack'

export interface StatusDefinition {
  readonly id: string
  readonly maxStacks?: number
  readonly stackMode?: StatusStackMode
}

export interface StatusState {
  readonly id: string
  readonly turns: number
  readonly stacks: number
}

export function addStatus(current: readonly StatusState[], definition: StatusDefinition, turns: number, stacks = 1): readonly StatusState[] {
  if (!definition.id.trim() || !Number.isInteger(turns) || turns <= 0 || !Number.isInteger(stacks) || stacks <= 0) return current.map((status) => ({ ...status }))
  const maxStacks = Math.max(1, definition.maxStacks ?? 1)
  const existing = current.find((status) => status.id === definition.id)
  if (!existing) return [...current.map((status) => ({ ...status })), { id: definition.id, turns, stacks: Math.min(maxStacks, stacks) }]
  const mode = definition.stackMode ?? 'replace'
  const next: StatusState = mode === 'extend'
    ? { ...existing, turns: existing.turns + turns, stacks: Math.min(maxStacks, existing.stacks) }
    : mode === 'stack'
      ? { ...existing, turns: Math.max(existing.turns, turns), stacks: Math.min(maxStacks, existing.stacks + stacks) }
      : { ...existing, turns, stacks: Math.min(maxStacks, stacks) }
  return current.map((status) => status.id === definition.id ? next : { ...status })
}

export function tickStatuses(current: readonly StatusState[], _timing: 'start' | 'end'): readonly StatusState[] {
  return current.map((status) => ({ ...status, turns: status.turns - 1 })).filter((status) => status.turns > 0)
}

export function removeStatus(current: readonly StatusState[], id: string): readonly StatusState[] {
  return current.filter((status) => status.id !== id).map((status) => ({ ...status }))
}

export function hasStatus(current: readonly StatusState[], id: string): boolean {
  return current.some((status) => status.id === id)
}
