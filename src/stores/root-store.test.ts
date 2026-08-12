import { describe, expect, it } from 'vitest'
import { initializeStoreServices, sliceNames, useRootGameStore } from './index'
import { EventBus } from '../systems/events'
import { createMemorySaveStorage, SaveRepository } from '../systems/save'
import { LocalTextProvider } from '../systems/providers'

describe('RootGameStore slices compatibility', () => {
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
})
