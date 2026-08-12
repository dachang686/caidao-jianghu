import { describe, expect, it } from 'vitest'
import { DeterministicRng, DeterministicRngError } from './rng'

describe('DeterministicRng', () => {
  it('同 seed 和调用序列产生完全一致的结果，快照恢复后 100 次仍一致', () => {
    const first = new DeterministicRng(123456)
    const second = new DeterministicRng(123456)
    for (let index = 0; index < 10; index += 1) {
      expect(first.nextUint32()).toBe(second.nextUint32())
      expect(first.nextFloat()).toBe(second.nextFloat())
    }
    const snapshot = first.snapshot()
    const restored = DeterministicRng.fromSnapshot(snapshot)
    for (let index = 0; index < 100; index += 1) expect(first.nextUint32()).toBe(restored.nextUint32())
  })

  it('不同领域 fork 不消耗父序列，命名空间相同可复现', () => {
    const root = new DeterministicRng(99)
    const before = root.snapshot()
    const combat = root.fork('combat')
    const loot = root.fork('loot')
    expect(root.snapshot()).toEqual(before)
    expect(combat.nextUint32()).toBe(new DeterministicRng(99).fork('combat').nextUint32())
    expect(combat.nextUint32()).not.toBe(loot.nextUint32())
  })

  it('nextInt、weightedPick 的边界和非法权重显式报错', () => {
    const rng = new DeterministicRng(1)
    expect(rng.nextInt(2, 3)).toBe(2)
    expect(() => rng.nextInt(1, 1)).toThrow(DeterministicRngError)
    expect(() => rng.weightedPick([])).toThrow(/空池/)
    expect(() => rng.weightedPick(['a'], [-1])).toThrow(/权重/)
    expect(() => rng.weightedPick([{ value: 'a', weight: 0 }])).toThrow(/总和/)
    expect(rng.weightedPick(['a', 'b'], [1, 0])).toBe('a')
  })
})
