import type { ItemId, QuestId } from './ids'

export type ConditionStat = 'moral' | 'fame' | 'wealth' | 'sectProsperity'
export type QuestConditionStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed' | 'complete'

export type Condition =
  | { readonly type: 'quest_complete'; readonly questId: QuestId }
  | { readonly type: 'has_item'; readonly itemId: ItemId; readonly count?: number }
  | { readonly type: 'stat_gte'; readonly stat: ConditionStat; readonly value: number }
  | { readonly type: 'flag_equals'; readonly flag: string; readonly value: boolean }
  | { readonly type: 'not'; readonly condition: Condition }
  | { readonly type: 'all'; readonly conditions: readonly Condition[] }
  | { readonly type: 'any'; readonly conditions: readonly Condition[] }

export interface QuestConditionSnapshot {
  readonly status: QuestConditionStatus
}

export type ConditionLookup<T> = ReadonlyMap<string, T> | Readonly<Record<string, T>>

export interface ConditionContext {
  readonly quests: ConditionLookup<QuestConditionSnapshot | QuestConditionStatus>
  readonly inventory: ConditionLookup<number> | readonly string[]
  readonly stats: Readonly<Partial<Record<ConditionStat, number>>>
  readonly flags: ConditionLookup<boolean>
}

export type ConditionEvalContext = ConditionContext
