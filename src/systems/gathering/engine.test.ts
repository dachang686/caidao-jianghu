import { describe, expect, it } from 'vitest'
import { addItem, createInventoryState } from '../inventory'
import type { GatheringNodeDefinition } from '../../types/gathering'
import type { ItemDefinition } from '../../types/item'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'
import { GatheringEngine, validateGatheringDefinitions } from './engine'

const chapter = asChapterId('test-ch01')
const location = asLocationId('test-village')
const herb = asItemId('item:test-herb')
const scrap = asItemId('item:test-scrap')
const items: readonly ItemDefinition[] = [
  { id: herb, name: '止血草', description: '', category: 'material', maxStack: 10 },
  { id: scrap, name: '铁屑', description: '', category: 'material', maxStack: 10 },
]

const onceNode: GatheringNodeDefinition = {
  id: asGatheringNodeId('test:herbs'),
  chapterId: chapter,
  locationId: location,
  label: '草药',
  description: '采一把草药。',
  mode: 'once',
  requiredChapter: 1,
  rewards: [{ itemId: herb, count: 2 }],
}

const repeatNode: GatheringNodeDefinition = {
  id: asGatheringNodeId('test:scrap'),
  chapterId: chapter,
  locationId: location,
  label: '铁屑',
  description: '捡一点铁屑。',
  mode: 'repeat',
  requiredChapter: 1,
  refreshEveryBattleTicks: 2,
  rewards: [{ itemId: scrap, count: 1 }],
}

function event(id: string, outcome: 'won' | 'lost' = 'won') {
  return { id, type: 'battle.completed', occurredAtTick: 0, payload: { battleId: id, outcome }, sourceActionId: `battle:${id}` }
}

describe('gathering engine', () => {
  it('校验节点归属、刷新间隔和材料引用', () => {
    const result = validateGatheringDefinitions([{ ...onceNode, locationId: asLocationId('missing'), rewards: [{ itemId: 'missing', count: 0 }] }], { locationIds: [String(location)], chapterId: String(chapter), itemIds: [String(herb)] })
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'missing_location')).toBe(true)
    expect(result.issues.some((issue) => issue.code === 'missing_item')).toBe(true)
    expect(result.issues.some((issue) => issue.path.endsWith('.count'))).toBe(true)
  })

  it('一次性节点成功入包后才标记，刷新/重复 action 不会再发材料', () => {
    const engine = new GatheringEngine([onceNode], { items })
    const first = engine.collect({ nodeId: onceNode.id, locationId: location, chapter: 1, inventory: createInventoryState(2), actionId: 'gather:once:1' })
    expect(first.status).toBe('collected')
    expect(first.inventory.stacks).toEqual([{ itemId: String(herb), count: 2 }])
    expect(engine.collect({ nodeId: onceNode.id, locationId: location, chapter: 1, inventory: first.inventory, actionId: 'gather:once:1' }).status).toBe('duplicate_action')
    expect(engine.collect({ nodeId: onceNode.id, locationId: location, chapter: 1, inventory: first.inventory, actionId: 'gather:once:2' }).status).toBe('already_collected')
  })

  it('背包满时不改变节点状态，清理空间后可以恢复领取', () => {
    const fullInventory = addItem(createInventoryState(1), items[1]!)
    const engine = new GatheringEngine([onceNode], { items })
    const blocked = engine.collect({ nodeId: onceNode.id, locationId: location, chapter: 1, inventory: fullInventory, actionId: 'gather:full' })
    expect(blocked.status).toBe('inventory_full')
    expect(engine.getState().collectedNodeIds).toEqual([])
    const recovered = engine.collect({ nodeId: onceNode.id, locationId: location, chapter: 1, inventory: createInventoryState(2), actionId: 'gather:recovered' })
    expect(recovered.status).toBe('collected')
  })

  it('可重复节点只在有效战斗完成后刷新，失败/逃跑和重复事件不推进场次', () => {
    const engine = new GatheringEngine([repeatNode], { items })
    expect(engine.collect({ nodeId: repeatNode.id, locationId: location, chapter: 1, inventory: createInventoryState(2) }).status).toBe('collected')
    expect(engine.collect({ nodeId: repeatNode.id, locationId: location, chapter: 1, inventory: createInventoryState(2) }).status).toBe('refresh_pending')
    expect(engine.advance(event('lost', 'lost')).status).toBe('ignored_event')
    expect(engine.advance(event('win-1')).status).toBe('advanced')
    expect(engine.advance(event('win-1')).status).toBe('duplicate_event')
    expect(engine.advance(event('win-2')).status).toBe('advanced')
    expect(engine.collect({ nodeId: repeatNode.id, locationId: location, chapter: 1, inventory: createInventoryState(2) }).status).toBe('collected')
    expect(engine.getState().battleTick).toBe(2)
  })
})
