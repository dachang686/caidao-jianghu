export interface RngSnapshot {
  readonly seed: number
  readonly state: number
}

export interface WeightedChoice<T> {
  readonly value: T
  readonly weight: number
}

export class DeterministicRngError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DeterministicRngError'
  }
}

function assertUint32(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new DeterministicRngError(`${field} 必须是 0–2^32-1 的整数`)
}

function hashNamespace(seed: number, state: number, namespace: string): number {
  let hash = (seed ^ state) >>> 0
  for (const character of namespace) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return (hash + 0x9e3779b9) >>> 0
}

export class DeterministicRng {
  readonly seed: number
  private currentState: number

  constructor(seed: number, state = seed) {
    assertUint32(seed, 'seed')
    assertUint32(state, 'state')
    this.seed = seed >>> 0
    this.currentState = state >>> 0
  }

  get state(): number {
    return this.currentState
  }

  snapshot(): RngSnapshot {
    return { seed: this.seed, state: this.currentState }
  }

  nextUint32(): number {
    this.currentState = (this.currentState + 0x6d2b79f5) >>> 0
    let value = this.currentState
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return (value ^ (value >>> 14)) >>> 0
  }

  nextFloat(): number {
    return this.nextUint32() / 4294967296
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive) || maxExclusive <= minInclusive) {
      throw new DeterministicRngError('nextInt 需要整数范围 [minInclusive, maxExclusive)，且 max 大于 min')
    }
    return minInclusive + Math.floor(this.nextFloat() * (maxExclusive - minInclusive))
  }

  weightedPick<T>(choices: readonly WeightedChoice<T>[]): T
  weightedPick<T>(values: readonly T[], weights: readonly number[]): T
  weightedPick<T>(valuesOrChoices: readonly T[] | readonly WeightedChoice<T>[], weights?: readonly number[]): T {
    const choices: readonly WeightedChoice<T>[] = weights
      ? (valuesOrChoices as readonly T[]).map((value, index) => ({ value, weight: weights[index] }))
      : valuesOrChoices as readonly WeightedChoice<T>[]
    if (choices.length === 0) throw new DeterministicRngError('weightedPick 不能选择空池')
    if (weights && weights.length !== valuesOrChoices.length) throw new DeterministicRngError('weightedPick 的值和权重数量不一致')
    let total = 0
    for (const choice of choices) {
      if (!Number.isFinite(choice.weight) || choice.weight < 0) throw new DeterministicRngError('weightedPick 权重必须是非负有限数字')
      total += choice.weight
    }
    if (!Number.isFinite(total) || total <= 0) throw new DeterministicRngError('weightedPick 权重总和必须大于 0')
    let cursor = this.nextFloat() * total
    for (const choice of choices) {
      cursor -= choice.weight
      if (cursor < 0) return choice.value
    }
    return choices[choices.length - 1].value
  }

  fork(namespace: string): DeterministicRng {
    if (!namespace.trim()) throw new DeterministicRngError('fork namespace 不能为空')
    const childSeed = hashNamespace(this.seed, this.currentState, namespace)
    return new DeterministicRng(childSeed, childSeed)
  }

  static fromSnapshot(snapshot: RngSnapshot): DeterministicRng {
    return new DeterministicRng(snapshot.seed, snapshot.state)
  }
}

export const createRng = (seed: number, state?: number) => new DeterministicRng(seed, state)
