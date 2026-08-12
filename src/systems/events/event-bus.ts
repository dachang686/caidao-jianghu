import type { DomainEvent, DomainEventType, EventHandler } from '../../types/events'

interface QueuedEvent {
  readonly event: DomainEvent
  readonly depth: number
  readonly chain: readonly DomainEventType[]
}

export interface EventBusOptions {
  readonly maxDerivedDepth?: number
}

export class EventBusError extends Error {
  readonly eventChain: readonly DomainEventType[]

  constructor(message: string, eventChain: readonly DomainEventType[]) {
    super(`${message}：${eventChain.join(' -> ')}`)
    this.name = 'EventBusError'
    this.eventChain = eventChain
  }
}

export type EventSubscription = () => void

export class EventBus {
  private readonly listeners = new Map<DomainEventType, EventHandler[]>()
  private readonly queue: QueuedEvent[] = []
  private readonly maxDerivedDepth: number
  private processing = false
  private activeQueueItem: QueuedEvent | null = null
  private processedEvents: DomainEvent[] = []

  constructor(options: EventBusOptions = {}) {
    this.maxDerivedDepth = options.maxDerivedDepth ?? 32
    if (!Number.isInteger(this.maxDerivedDepth) || this.maxDerivedDepth < 1) {
      throw new EventBusError('maxDerivedDepth 必须是大于 0 的整数', [])
    }
  }

  subscribe(type: DomainEventType, handler: EventHandler): EventSubscription {
    if (!type.trim()) throw new EventBusError('订阅事件类型不能为空', [])
    const handlers = this.listeners.get(type) ?? []
    handlers.push(handler)
    this.listeners.set(type, handlers)
    let active = true
    return () => {
      if (!active) return
      active = false
      const current = this.listeners.get(type)
      if (!current) return
      const index = current.indexOf(handler)
      if (index >= 0) current.splice(index, 1)
      if (current.length === 0) this.listeners.delete(type)
    }
  }

  on(type: DomainEventType, handler: EventHandler): EventSubscription {
    return this.subscribe(type, handler)
  }

  dispatch(event: DomainEvent): readonly DomainEvent[] {
    this.validateEvent(event)
    const isNestedDispatch = this.processing && this.activeQueueItem !== null
    if (isNestedDispatch) {
      this.enqueue(event, this.activeQueueItem!.depth + 1, this.activeQueueItem!.chain)
      return []
    }

    this.processedEvents = []
    this.enqueue(event, 0, [])
    this.processQueue()
    return [...this.processedEvents]
  }

  reset(): void {
    this.listeners.clear()
    this.queue.length = 0
    this.processedEvents = []
    this.activeQueueItem = null
    this.processing = false
  }

  clear(): void {
    this.reset()
  }

  private processQueue(): void {
    this.processing = true
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift()!
        this.activeQueueItem = item
        this.processedEvents.push(item.event)
        const handlers = [...(this.listeners.get(item.event.type) ?? [])]
        for (const handler of handlers) {
          const derived = handler(item.event)
          for (const next of normalizeDerived(derived)) {
            this.validateEvent(next)
            this.enqueue(next, item.depth + 1, item.chain)
          }
        }
        this.activeQueueItem = null
      }
    } finally {
      this.activeQueueItem = null
      this.processing = false
      this.queue.length = 0
    }
  }

  private enqueue(event: DomainEvent, depth: number, chain: readonly DomainEventType[]): void {
    const nextChain = [...chain, event.type]
    if (depth > this.maxDerivedDepth) {
      throw new EventBusError(`派生事件深度超过上限 ${this.maxDerivedDepth}`, nextChain)
    }
    if (chain.includes(event.type)) {
      throw new EventBusError('检测到事件类型循环', nextChain)
    }
    this.queue.push({ event, depth, chain: nextChain })
  }

  private validateEvent(event: DomainEvent): void {
    if (!event || typeof event !== 'object') throw new EventBusError('事件必须是对象', [])
    if (!event.id.trim()) throw new EventBusError('事件 id 不能为空', [event.type])
    if (!event.type.trim()) throw new EventBusError('事件 type 不能为空', [event.type])
    if (!Number.isInteger(event.occurredAtTick) || event.occurredAtTick < 0) {
      throw new EventBusError('occurredAtTick 必须是大于等于 0 的整数', [event.type])
    }
    if (!event.sourceActionId.trim()) throw new EventBusError('sourceActionId 不能为空', [event.type])
  }
}

function normalizeDerived(derived: void | DomainEvent | readonly DomainEvent[]): readonly DomainEvent[] {
  if (!derived) return []
  return isEventArray(derived) ? derived : [derived]
}

function isEventArray(value: DomainEvent | readonly DomainEvent[]): value is readonly DomainEvent[] {
  return Array.isArray(value)
}

export function createEventBus(options: EventBusOptions = {}): EventBus {
  return new EventBus(options)
}
