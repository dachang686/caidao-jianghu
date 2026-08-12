// 同步纯领域事件总线：不依赖 React、Zustand、存档或浏览器副作用。
export { EventBus, EventBusError, createEventBus } from './event-bus'
export type { EventBusOptions, EventSubscription } from './event-bus'
