import { InventoryError, removeItem } from '../inventory/inventory'
import type { EventBus, EventSubscription } from '../events/event-bus'
import type { DomainEvent } from '../../types/events'
import type { FoodBattleAdvanceResult, FoodBuffCatalog, FoodBuffDefinition, FoodBuffInstance, FoodBuffSnapshot, FoodConsumeRequest, FoodConsumeResult, FoodNegativeEffect, FoodModifiers } from '../../types/food'
import type { ItemDefinition, InventoryState } from '../../types/item'
import type { MemeDensity, TextProvider } from '../../types/text-provider'
import { createLocalTextProvider } from '../providers/LocalTextProvider'

export const FOOD_BATTLE_COMPLETED_EVENT = 'battle.completed'

export class FoodBuffEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FoodBuffEngineError'
  }
}

const EMPTY_STATE: FoodBuffSnapshot = { version: 1, active: [], battleTick: 0, processedBattleEventIds: [], processedActionIds: [] }

function isArray<T>(value: readonly T[] | ReadonlyMap<string, T>): value is readonly T[] { return Array.isArray(value) }

function findItem(items: FoodBuffCatalog['items'], id: string): ItemDefinition | undefined {
  if (isArray(items)) return items.find((item) => String(item.id) === id)
  return (items as ReadonlyMap<string, ItemDefinition>).get(id)
}

function cloneState(state: FoodBuffSnapshot): FoodBuffSnapshot {
  return { version: 1, active: state.active.map((buff) => ({ ...buff })), battleTick: state.battleTick, processedBattleEventIds: [...state.processedBattleEventIds], processedActionIds: [...state.processedActionIds] }
}

function isEligibleFoodBattleEvent(event: Pick<DomainEvent, 'type' | 'payload'>): boolean {
  if (event.type !== FOOD_BATTLE_COMPLETED_EVENT || !event.payload || typeof event.payload !== 'object') return false
  const value = event.payload as { battleId?: unknown; outcome?: unknown; result?: unknown; isRetry?: unknown; isSimulation?: unknown; mode?: unknown }
  if (typeof value.battleId !== 'string' || !value.battleId.trim() || value.isRetry === true || value.isSimulation === true || value.mode === 'retry' || value.mode === 'simulation' || value.mode === 'preview') return false
  const outcome = value.outcome ?? value.result
  return outcome === undefined || outcome === 'won' || outcome === 'win' || outcome === 'completed' || outcome === 'lost' || outcome === 'lose' || outcome === 'defeat'
}

function negativeSafe(negative: FoodNegativeEffect | undefined): FoodNegativeEffect | undefined {
  if (!negative) return undefined
  return { ...negative, turns: Math.max(1, Math.min(2, Math.floor(negative.turns))), selfDamageRatio: negative.selfDamageRatio === undefined ? undefined : Math.max(0, Math.min(.08, negative.selfDamageRatio)) }
}

function foodExplanation(provider: TextProvider, food: FoodBuffDefinition, density: MemeDensity): string {
  const result = provider.generateText?.({ requestId: `food:${food.id}`, type: 'item_flavor', safeData: { item: food.name, extra: food.localExplanationKey ?? '本地食物规则' }, memeDensity: density, maxLength: 160 })
  return result && !(result instanceof Promise) ? result.value : `${food.name}：效果按可见规则生效，负面状态不会让场景致死。`
}

export class FoodBuffEngine {
  private readonly buffsById: ReadonlyMap<string, FoodBuffDefinition>
  private readonly buffsByFoodItem: ReadonlyMap<string, FoodBuffDefinition>
  private readonly catalog: FoodBuffCatalog
  private readonly provider: TextProvider
  private readonly eventBus?: EventBus
  private state: FoodBuffSnapshot

  constructor(catalog: FoodBuffCatalog, initialState: FoodBuffSnapshot = EMPTY_STATE, provider: TextProvider = createLocalTextProvider(), eventBus?: EventBus) {
    const seen = new Set<string>()
    catalog.foods.forEach((food) => {
      if (!food.id.trim() || seen.has(food.id) || food.durationBattles < 1 || food.durationBattles > 3) throw new FoodBuffEngineError(`食物 Buff 配置无效「${food.id}」`)
      if (food.negative && (!Number.isInteger(food.negative.turns) || food.negative.turns < 1 || food.negative.turns > 2 || (food.negative.selfDamageRatio ?? 0) > .08)) throw new FoodBuffEngineError(`食物负面安全阀无效「${food.id}」`)
      seen.add(food.id)
    })
    if (initialState.version !== 1 || !Number.isInteger(initialState.battleTick) || initialState.battleTick < 0) throw new FoodBuffEngineError('食物 Buff 快照无效。')
    this.buffsById = new Map(catalog.foods.map((food) => [String(food.id), food]))
    this.buffsByFoodItem = new Map(catalog.foods.map((food) => [String(food.foodItemId), food]))
    this.catalog = catalog
    this.provider = provider
    this.eventBus = eventBus
    this.state = cloneState(initialState)
  }

  getState(): FoodBuffSnapshot { return cloneState(this.state) }

  snapshot(): FoodBuffSnapshot { return this.getState() }

  getModifiers(): FoodModifiers {
    const active = this.state.active.map((instance) => this.buffsById.get(String(instance.buffId))).filter((buff): buff is FoodBuffDefinition => Boolean(buff))
    return {
      attackMultiplier: active.reduce((value, buff) => value * (buff.attackMultiplier ?? 1), 1),
      defenseDelta: active.reduce((value, buff) => value + (buff.defenseDelta ?? 0), 0),
      accuracyDelta: active.reduce((value, buff) => value + (buff.accuracyDelta ?? 0), 0),
      critDelta: active.reduce((value, buff) => value + (buff.critDelta ?? 0), 0),
      qiRecoveryDelta: active.reduce((value, buff) => value + (buff.qiRecoveryDelta ?? 0), 0),
      healingMultiplier: active.reduce((value, buff) => value * (buff.healingMultiplier ?? 1), 1),
      negativeStatuses: this.state.active.flatMap((instance) => {
        const buff = this.buffsById.get(String(instance.buffId))
        return buff?.negative && instance.negativeTurns > 0 ? [negativeSafe(buff.negative)!] : []
      }),
    }
  }

  consume(request: FoodConsumeRequest, density: MemeDensity = 'standard'): FoodConsumeResult {
    if (!Number.isFinite(request.currentHp) || !Number.isFinite(request.maxHp) || request.maxHp <= 0 || request.currentHp < 1 || request.currentHp > request.maxHp) return { status: 'invalid_hp', foodItemId: String(request.foodItemId), inventory: request.inventory, hp: request.currentHp, state: this.getState(), events: [], explanation: '当前生命值快照无效。', message: '无法食用：生命状态无效。' }
    const food = this.buffsByFoodItem.get(String(request.foodItemId))
    if (!food) return { status: 'missing_food', foodItemId: String(request.foodItemId), inventory: request.inventory, hp: request.currentHp, state: this.getState(), events: [], explanation: '这份食物没有登记可用规则。', message: '这份食物暂时不能食用。' }
    const actionId = request.actionId ?? `food:${food.id}:${this.state.battleTick}:${this.state.processedActionIds.length + 1}`
    if (this.state.processedActionIds.includes(actionId)) return { status: 'duplicate_action', foodItemId: String(request.foodItemId), inventory: request.inventory, hp: request.currentHp, state: this.getState(), events: [], explanation: foodExplanation(this.provider, food, density), message: '这次食用操作已经处理过。', actionId }
    const existing = this.state.active.find((instance) => instance.buffId === food.id)
    if (existing && food.stacking === 'ignore') return { status: 'already_active', foodItemId: String(request.foodItemId), inventory: request.inventory, hp: request.currentHp, state: this.getState(), events: [], explanation: foodExplanation(this.provider, food, density), message: '同类食物效果仍在生效，本次不消耗食物。', actionId }
    const item = findItem(this.catalog.items, String(food.foodItemId))
    if (!item) throw new FoodBuffEngineError(`食物 Buff 引用未知物品「${food.foodItemId}」`)
    let inventory: InventoryState
    try { inventory = removeItem(request.inventory, String(food.foodItemId), 1, item) } catch (error) {
      if (error instanceof InventoryError) return { status: 'missing_food', foodItemId: String(request.foodItemId), inventory: request.inventory, hp: request.currentHp, state: this.getState(), events: [], explanation: foodExplanation(this.provider, food, density), message: '背包里没有这份食物。', actionId }
      throw error
    }
    const nextInstance: FoodBuffInstance = { buffId: food.id, remainingBattles: existing && food.stacking === 'extend' ? Math.min(3, existing.remainingBattles + food.durationBattles) : food.durationBattles, negativeTurns: negativeSafe(food.negative)?.turns ?? 0 }
    const active = existing ? this.state.active.map((instance) => instance.buffId === food.id ? nextInstance : instance) : [...this.state.active, nextInstance]
    this.state = { ...this.state, active, processedActionIds: [...this.state.processedActionIds, actionId] }
    const hp = Math.min(request.maxHp, Math.max(1, request.currentHp + (food.immediateHeal ?? 0)))
    const event: DomainEvent = { id: `${actionId}:consumed`, type: 'food.buff_applied', occurredAtTick: this.state.battleTick, payload: { foodItemId: food.foodItemId, buffId: food.id, durationBattles: nextInstance.remainingBattles }, sourceActionId: actionId }
    this.eventBus?.dispatch(event)
    return { status: 'consumed', foodItemId: String(request.foodItemId), inventory, hp, state: this.getState(), events: [event], explanation: foodExplanation(this.provider, food, density), message: `${food.name}已生效，持续 ${nextInstance.remainingBattles} 场战斗。`, actionId }
  }

  advanceBattle(event: DomainEvent): FoodBattleAdvanceResult {
    if (!isEligibleFoodBattleEvent(event)) return { status: 'ignored_event', state: this.getState(), message: '该事件不会消耗食物持续场次。' }
    if (this.state.processedBattleEventIds.includes(event.id)) return { status: 'duplicate_event', state: this.getState(), message: '该战斗结算已经扣过食物场次。' }
    this.state = { ...this.state, battleTick: this.state.battleTick + 1, active: this.state.active.map((instance) => ({ ...instance, remainingBattles: instance.remainingBattles - 1 })).filter((instance) => instance.remainingBattles > 0), processedBattleEventIds: [...this.state.processedBattleEventIds, event.id] }
    return { status: 'advanced', state: this.getState(), message: '战斗结算完成，食物持续场次 -1。' }
  }

  subscribe(eventBus: EventBus = this.eventBus!): EventSubscription {
    if (!eventBus) throw new FoodBuffEngineError('订阅食物结算需要 EventBus。')
    return eventBus.subscribe(FOOD_BATTLE_COMPLETED_EVENT, (event) => { this.advanceBattle(event) })
  }

  tickCombatTurn(): FoodBuffSnapshot {
    this.state = { ...this.state, active: this.state.active.map((instance) => ({ ...instance, negativeTurns: Math.max(0, instance.negativeTurns - 1) })) }
    return this.getState()
  }

  safeSelfDamage(currentHp: number, maxHp: number, negative: FoodNegativeEffect): number {
    if (!Number.isFinite(currentHp) || !Number.isFinite(maxHp) || maxHp <= 0) throw new FoodBuffEngineError('生命上限无效。')
    const ratio = Math.max(0, Math.min(.08, negative.selfDamageRatio ?? 0))
    return Math.max(1, Math.min(currentHp, currentHp - Math.floor(maxHp * ratio)))
  }
}

export function createFoodBuffEngine(catalog: FoodBuffCatalog, initialState?: FoodBuffSnapshot, provider?: TextProvider, eventBus?: EventBus): FoodBuffEngine {
  return new FoodBuffEngine(catalog, initialState, provider, eventBus)
}
