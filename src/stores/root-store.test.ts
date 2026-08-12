import { describe, expect, it } from 'vitest'
import { initializeStoreServices, sliceNames, useRootGameStore } from './index'
import { EventBus } from '../systems/events'
import { createMemorySaveStorage, SaveRepository } from '../systems/save'
import { LocalTextProvider } from '../systems/providers'
import { createWorldRegionLoader } from '../systems/world'
import { asWorldRegionId } from '../types/ids'
import { coreForgingEquipment, coreForgingItems } from '../content/recipes/forging'
import { addItem } from '../systems/inventory'

describe('RootGameStore slices', () => {
  it('公开稳定的领域 slice 名称并保持旧 Demo 动作行为', () => {
    expect(sliceNames).toEqual(['player', 'quest', 'battle', 'world', 'settings', 'shell'])
    useRootGameStore.getState().startNewGame('切片侠', 'clever')
    expect(useRootGameStore.getState().player?.name).toBe('切片侠')
    useRootGameStore.getState().meetOldMan()
    expect(useRootGameStore.getState().world.oldManMet).toBe(true)
  })

  it('服务通过注入容器保存，不进入可序列化 Zustand 状态', () => {
    const services = { eventBus: new EventBus(), saveRepository: new SaveRepository(createMemorySaveStorage()), textProvider: new LocalTextProvider() }
    const cleanup = initializeStoreServices(services)
    expect(useRootGameStore.getState()).not.toHaveProperty('eventBus')
    cleanup()
  })

  it('将 M1 运行态封装进 V2 存档并可无损恢复', () => {
    const store = useRootGameStore.getState()
    store.startNewGame('V2存档侠', 'clever')
    store.meetOldMan()
    store.acceptCatQuest()
    store.resolveCatQuest('coax')

    const save = useRootGameStore.getState().makeSaveV2()
    expect(save).toMatchObject({
      schemaVersion: 2,
      chapterId: 'ch01',
      m1: { player: { name: 'V2存档侠' }, world: { catResolved: true } },
    })

    useRootGameStore.getState().startNewGame('覆盖前', 'reckless')
    useRootGameStore.getState().hydrateSaveV2(save!)
    expect(useRootGameStore.getState().player?.name).toBe('V2存档侠')
    expect(useRootGameStore.getState().world.catResolved).toBe(true)
  })

  it('通过根动作加载区域并把合法导航状态写进 V2 存档', async () => {
    const cleanup = initializeStoreServices({
      eventBus: new EventBus(),
      saveRepository: new SaveRepository(createMemorySaveStorage()),
      regionLoader: createWorldRegionLoader(),
    })
    try {
      useRootGameStore.getState().startNewGame('地图客', 'clever')
      useRootGameStore.getState().openWorldMap()
      expect(useRootGameStore.getState().getWorldRegions().find((entry) => entry.region.title === '清河县')?.status).toBe('locked')

      await useRootGameStore.getState().enterWorldRegion(asWorldRegionId('xiaoyu-village'))
      expect(useRootGameStore.getState()).toMatchObject({
        screen: 'location',
        worldLocation: { title: '小愚村悦来客栈' },
      })

      const save = useRootGameStore.getState().makeSaveV2()
      expect(save?.world).toMatchObject({ currentRegionId: 'xiaoyu-village', currentLocationId: 'xiaoyu-village' })
      expect(save?.flags['ui:location_open']).toBe(true)

      useRootGameStore.getState().startNewGame('覆盖地点', 'reckless')
      useRootGameStore.getState().hydrateSaveV2(save!)
      await new Promise((resolve) => globalThis.setTimeout(resolve, 0))
      expect(useRootGameStore.getState()).toMatchObject({
        screen: 'location',
        worldLocation: { title: '小愚村悦来客栈' },
      })
    } finally {
      cleanup()
    }
  })

  it('工作台只读写根库存，失败不会扣除材料，V2 存档可恢复制作产物', () => {
    useRootGameStore.getState().startNewGame('厨刀客', 'clever')
    const beforeForge = useRootGameStore.getState().inventoryState
    const lockedForge = useRootGameStore.getState().craftRecipe('recipe:tempered-steel')
    expect(lockedForge?.status).toBe('chapter_locked')
    expect(useRootGameStore.getState().inventoryState).toEqual(beforeForge)

    const cooked = useRootGameStore.getState().cookRecipe('recipe:erguotou')
    expect(cooked?.status).toBe('cooked')
    expect(useRootGameStore.getState().inventoryState.stacks).toContainEqual({ itemId: 'item:erguotou', count: 1 })

    useRootGameStore.getState().consumeFoodItem('item:erguotou')
    expect(useRootGameStore.getState().foodBuffSnapshot.active).toContainEqual(expect.objectContaining({ buffId: 'food:erguotou', remainingBattles: 1 }))
    expect(useRootGameStore.getState().inventoryState.stacks).not.toContainEqual({ itemId: 'item:erguotou', count: 1 })

    const save = useRootGameStore.getState().makeSaveV2()
    useRootGameStore.getState().startNewGame('覆盖库存', 'reckless')
    useRootGameStore.getState().hydrateSaveV2(save!)
    expect(useRootGameStore.getState().foodBuffSnapshot.active).toContainEqual(expect.objectContaining({ buffId: 'food:erguotou', remainingBattles: 1 }))
  })

  it('技能装配进入战斗，装备影响伤害并在 V2 存档中保留', () => {
    const store = useRootGameStore.getState()
    store.startNewGame('配装侠', 'clever')
    useRootGameStore.setState((state) => ({
      skillProgress: { ...state.skillProgress, level: 2, earnedSkillPoints: 1 },
    }))
    store.unlockActiveSkill('dao:heavy-chop')
    store.equipActiveSkill('dao:heavy-chop', 4)
    expect(useRootGameStore.getState().player?.activeSkills).toContain('dao:heavy-chop')

    const villageCleaver = coreForgingEquipment.find((item) => String(item.id) === 'equipment:village-cleaver')!
    const villageCleaverItem = coreForgingItems.find((item) => String(item.id) === villageCleaver.itemId)!
    useRootGameStore.setState((state) => ({
      inventoryState: addItem(state.inventoryState, villageCleaverItem, 1),
      equipmentIds: [...state.equipmentIds, String(villageCleaver.id)],
    }))
    store.equipInventoryEquipment(String(villageCleaver.id))
    expect(useRootGameStore.getState().equipmentLoadout.weapon).toBe('equipment:village-cleaver')

    store.meetOldMan()
    store.startBattle('ch01')
    store.useSkill('dao:heavy-chop')
    const battle = useRootGameStore.getState().battle!
    expect(battle.logs.some((entry) => entry.text.includes('重刃压顶'))).toBe(true)
    expect(battle.enemy.hp).toBeLessThan(battle.enemy.maxHp - 20)

    store.leaveBattle()
    const save = store.makeSaveV2()
    useRootGameStore.getState().startNewGame('覆盖配装', 'reckless')
    useRootGameStore.getState().hydrateSaveV2(save!)
    expect(useRootGameStore.getState()).toMatchObject({
      equipmentLoadout: { weapon: 'equipment:village-cleaver' },
    })
    expect(useRootGameStore.getState().player?.activeSkills).toContain('dao:heavy-chop')
  })
})
