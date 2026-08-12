export interface DomainEvent<Payload = unknown> {
  readonly id: string
  readonly type: string
  readonly occurredAtTick: number
  readonly payload: Payload
  readonly sourceActionId: string
}

export type DomainEventType = string

export type EventHandler<Payload = unknown> = (event: DomainEvent<Payload>) =>
  | void
  | DomainEvent
  | readonly DomainEvent[]
