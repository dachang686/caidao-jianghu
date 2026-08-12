export interface PostureState {
  readonly current: number
  readonly max: number
  readonly broken: boolean
  readonly exposedTurns: number
}

export interface PostureDamageResult {
  readonly state: PostureState
  readonly brokeNow: boolean
  readonly remainingDamage: number
}

export function createPosture(max: number, current = max): PostureState {
  const safeMax = Math.max(1, Number.isFinite(max) ? max : 1)
  return { current: Math.max(0, Math.min(safeMax, current)), max: safeMax, broken: false, exposedTurns: 0 }
}

export function applyPostureDamage(state: PostureState, amount: number): PostureDamageResult {
  const damage = Math.max(0, Number.isFinite(amount) ? amount : 0)
  if (state.broken || damage === 0) return { state: { ...state }, brokeNow: false, remainingDamage: 0 }
  const current = Math.max(0, state.current - damage)
  if (current > 0) return { state: { ...state, current }, brokeNow: false, remainingDamage: 0 }
  return { state: { ...state, current: 0, broken: true, exposedTurns: 1 }, brokeNow: true, remainingDamage: Math.max(0, damage - state.current) }
}

export function tickPosture(state: PostureState): PostureState {
  if (!state.broken) return { ...state }
  if (state.exposedTurns > 1) return { ...state, exposedTurns: state.exposedTurns - 1 }
  return { current: state.max, max: state.max, broken: false, exposedTurns: 0 }
}

export function postureDamageMultiplier(state: PostureState): number {
  return state.broken && state.exposedTurns > 0 ? 1.5 : 1
}
