// 所有随机领域逻辑必须通过该模块；不使用 Math.random。
export { createRng, DeterministicRng, DeterministicRngError } from './rng'
export type { RngSnapshot, WeightedChoice } from './rng'
