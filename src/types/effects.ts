import type { ContentKey, EnemyId, ItemId, QuestId } from './ids'
import type { DomainEvent } from './events'

export type EffectStat = 'moral' | 'fame' | 'wealth' | 'sectProsperity'

export type Effect =
  | { readonly type: 'give_item'; readonly itemId: ItemId; readonly count?: number; readonly grantKey?: string }
  | { readonly type: 'give_exp'; readonly amount: number; readonly grantKey?: string }
  | { readonly type: 'set_flag'; readonly flag: string; readonly value: boolean }
  | { readonly type: 'unlock_quest'; readonly questId: QuestId }
  | { readonly type: 'change_stat'; readonly stat: EffectStat; readonly delta: number }
  | { readonly type: 'trigger_battle'; readonly enemyId: EnemyId }
  | { readonly type: 'narrate'; readonly lineId: ContentKey }

export interface EffectCatalog {
  readonly itemIds?: readonly string[] | ReadonlySet<string>
  readonly questIds?: readonly string[] | ReadonlySet<string>
  readonly enemyIds?: readonly string[] | ReadonlySet<string>
  readonly lineIds?: readonly string[] | ReadonlySet<string>
}

export interface EffectState {
  readonly inventory: Readonly<Record<string, number>>
  readonly experience: number
  readonly stats: Readonly<Record<EffectStat, number>>
  readonly flags: Readonly<Record<string, boolean>>
  readonly quests: Readonly<Record<string, boolean>>
  readonly claimedGrantKeys: readonly string[]
}

export interface EffectNavigation {
  readonly type: 'battle'
  readonly enemyId: EnemyId
}

export interface EffectExecutionOptions {
  readonly sourceActionId?: string
  readonly occurredAtTick?: number
  /** When provided, references are checked against the matching catalog collection. */
  readonly catalog?: EffectCatalog
}

export interface EffectExecutionResult {
  readonly state: EffectState
  readonly events: readonly DomainEvent[]
  readonly navigation: readonly EffectNavigation[]
}

export type EffectEvent = DomainEvent
export type EffectRuntimeState = EffectState

export function createEffectState(overrides: Partial<EffectState> = {}): EffectState {
  return {
    inventory: {},
    experience: 0,
    stats: { moral: 0, fame: 0, wealth: 0, sectProsperity: 0 },
    flags: {},
    quests: {},
    claimedGrantKeys: [],
    ...overrides,
  }
}
