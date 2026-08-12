import { describe, expect, it } from 'vitest'
import { createEffectState } from '../../types/effects'
import { asContentKey, asHotspotId, asLocationId } from '../../types/ids'
import type { HotspotDefinition } from '../../types/hotspot'
import { ExplorationEngine, validateHotspotDefinitions } from './engine'

const location = asLocationId('test-village')

function hotspot(overrides: Partial<HotspotDefinition> = {}): HotspotDefinition {
  return {
    id: asHotspotId('test:well'),
    locationId: location,
    label: '水井',
    description: '看看水井里的倒影。',
    layout: { desktop: { x: .4, y: .3 }, mobile: { x: .35, y: .25 } },
    keyboardOrder: 1,
    mode: 'once',
    effects: [{ type: 'give_exp', amount: 3, grantKey: 'test:well:exp' }, { type: 'narrate', lineId: asContentKey('narration:test:well') }],
    ...overrides,
  }
}

describe('exploration hotspot engine', () => {
  it('校验归一化坐标、键盘顺序和地点引用', () => {
    const result = validateHotspotDefinitions([hotspot({ layout: { desktop: { x: 1.2, y: .3 } }, keyboardOrder: -1 })], ['other-location'])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'missing_location')).toBe(true)
    expect(result.issues.some((issue) => issue.path.endsWith('.layout.desktop.x'))).toBe(true)
    expect(result.issues.some((issue) => issue.path.endsWith('.keyboardOrder'))).toBe(true)
  })

  it('锁定原因由领域 view 提供，页面不需要复制条件判断', () => {
    const engine = new ExplorationEngine({
      definitions: [hotspot({ conditions: [{ type: 'flag_equals', flag: 'catResolved', value: true }], lockedReason: '先处理大黄猫。' })],
      conditionContext: { quests: {}, inventory: {}, stats: {}, flags: { catResolved: false } },
    })
    const view = engine.getView(asHotspotId('test:well'))
    expect(view.available).toBe(false)
    expect(view.lockedReason).toBe('先处理大黄猫。')
  })

  it('一次性热点的关键奖励和重复 action 都幂等，快照可恢复', () => {
    const engine = new ExplorationEngine({ definitions: [hotspot()] })
    const first = engine.activate(asHotspotId('test:well'), { actionId: 'click:1', occurredAtTick: 4 })
    expect(first.status).toBe('activated')
    expect(engine.getEffectState().experience).toBe(3)
    expect(engine.getEffectState().claimedGrantKeys).toEqual(['test:well:exp'])

    expect(engine.activate(asHotspotId('test:well'), { actionId: 'click:1' }).status).toBe('duplicate_action')
    expect(engine.activate(asHotspotId('test:well'), { actionId: 'click:2' }).status).toBe('already_completed')

    const restored = new ExplorationEngine({ definitions: [hotspot()], state: engine.getSnapshot() })
    expect(restored.getEffectState().experience).toBe(3)
    expect(restored.getView(asHotspotId('test:well')).completed).toBe(true)
  })

  it('可重复热点每次产生领域事件，但带 grantKey 的奖励不会重复发放', () => {
    const repeat = hotspot({ id: asHotspotId('test:bell'), mode: 'repeat', effects: [{ type: 'give_exp', amount: 2, grantKey: 'test:bell:first' }] })
    const engine = new ExplorationEngine({ definitions: [repeat], effectState: createEffectState() })
    expect(engine.activate(asHotspotId('test:bell')).status).toBe('activated')
    expect(engine.activate(asHotspotId('test:bell')).status).toBe('activated')
    expect(engine.getState().activationCounts['test:bell']).toBe(2)
    expect(engine.getEffectState().experience).toBe(2)
  })
})
