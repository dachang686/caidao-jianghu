import { describe, expect, it } from 'vitest'
import type { DomainEvent } from '../../types/events'
import { EventBus, EventBusError } from './event-bus'

function event(type: string, id = type): DomainEvent {
  return { id, type, occurredAtTick: 1, payload: {}, sourceActionId: 'test-action' }
}

describe('同步 Domain EventBus', () => {
  it('按注册顺序完成当前事件，再按 FIFO 顺序处理派生事件', () => {
    const bus = new EventBus()
    const order: string[] = []
    bus.subscribe('root', () => {
      order.push('root:first')
      return event('derived:first')
    })
    bus.subscribe('root', () => {
      order.push('root:second')
      return event('derived:second')
    })
    bus.subscribe('derived:first', () => { order.push('derived:first') })
    bus.subscribe('derived:second', () => { order.push('derived:second') })

    const processed = bus.dispatch(event('root'))
    expect(order).toEqual(['root:first', 'root:second', 'derived:first', 'derived:second'])
    expect(processed.map((item) => item.type)).toEqual(['root', 'derived:first', 'derived:second'])
  })

  it('派生事件在当前处理完成后排队，且支持注销订阅和 reset', () => {
    const bus = new EventBus()
    const seen: string[] = []
    const unsubscribe = bus.subscribe('root', () => {
      seen.push('root')
      bus.dispatch(event('nested'))
    })
    bus.subscribe('nested', () => { seen.push('nested') })
    bus.dispatch(event('root'))
    expect(seen).toEqual(['root', 'nested'])

    unsubscribe()
    bus.dispatch(event('root', 'root-after-unsubscribe'))
    expect(seen).toEqual(['root', 'nested'])
    bus.reset()
    bus.dispatch(event('nested', 'nested-after-reset'))
    expect(seen).toEqual(['root', 'nested'])
  })

  it('循环事件抛出包含事件链的错误，并受派生深度上限保护', () => {
    const loop = new EventBus()
    loop.subscribe('a', () => event('b'))
    loop.subscribe('b', () => event('a'))
    expect(() => loop.dispatch(event('a'))).toThrow(/a -> b -> a/)
    try {
      loop.dispatch(event('a', 'loop-again'))
    } catch (error) {
      expect(error).toBeInstanceOf(EventBusError)
      expect((error as EventBusError).eventChain).toEqual(['a', 'b', 'a'])
    }

    const deep = new EventBus({ maxDerivedDepth: 1 })
    deep.subscribe('a', () => event('b'))
    deep.subscribe('b', () => event('c'))
    expect(() => deep.dispatch(event('a'))).toThrow(/深度超过上限/)
  })
})
