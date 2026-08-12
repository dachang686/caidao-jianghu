import { DeterministicRng } from '../rng'
import type { EconomyState, LootEntry, LootGrantResult, LootReward, LootRollResult, LootTable, PendingLoot } from '../../types/loot'
import type { ItemDefinition } from '../../types/item'
import { tryAddItem } from '../inventory'

export class LootError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LootError'
  }
}

function validReward(reward: LootReward): void {
  if (reward.kind === 'silver' && (!Number.isInteger(reward.amount) || reward.amount < 0)) throw new LootError('银两奖励必须是非负整数')
  if ((reward.kind === 'material' || reward.kind === 'quest_item') && (!Number.isInteger(reward.count) || reward.count <= 0)) throw new LootError(`物品「${reward.itemId}」数量必须是正整数`)
  if (reward.kind === 'equipment' && reward.count !== undefined && (!Number.isInteger(reward.count) || reward.count <= 0)) throw new LootError(`装备「${reward.equipmentId}」数量必须是正整数`)
}

function rewardKey(reward: LootReward): string | undefined {
  return reward.firstRewardKey?.trim() || undefined
}

function chooseWeighted(entries: readonly LootEntry[], rng: DeterministicRng): LootReward {
  if (entries.length === 0) throw new LootError('加权掉落池不能为空')
  return rng.weightedPick(entries.map((entry) => ({ value: entry.reward, weight: entry.weight ?? 1 })))
}

export function rollLoot(table: LootTable, options: { rng: DeterministicRng; claimedFirstRewardKeys?: readonly string[] }): LootRollResult {
  if (!table.id.trim()) throw new LootError('掉落表 ID 不能为空')
  const claimed = new Set(options.claimedFirstRewardKeys ?? [])
  const tableRng = options.rng.fork(`loot:${table.id}`)
  const rewards: LootReward[] = []
  table.fixed?.forEach((reward) => {
    validReward(reward)
    const key = rewardKey(reward)
    if (!key || !claimed.has(key)) rewards.push(reward)
  })
  const rolls = table.rolls ?? (table.weighted && table.weighted.length > 0 ? 1 : 0)
  if (!Number.isInteger(rolls) || rolls < 0) throw new LootError('掉落次数必须是非负整数')
  for (let index = 0; index < rolls; index += 1) {
    if (!table.weighted || table.weighted.length === 0) break
    const reward = chooseWeighted(table.weighted, tableRng.fork(`roll:${index}`))
    validReward(reward)
    const key = rewardKey(reward)
    if (!key || !claimed.has(key)) rewards.push(reward)
  }
  return { tableId: table.id, rewards, rng: tableRng.snapshot() }
}

export function createEconomyState(inventory: EconomyState['inventory']): EconomyState {
  return { silver: 0, inventory, equipmentIds: [], claimedFirstRewardKeys: [], pendingLoot: [] }
}

function findItem(items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>, id: string): ItemDefinition | undefined {
  return Array.isArray(items) ? items.find((item) => String(item.id) === id) : (items as ReadonlyMap<string, ItemDefinition>).get(id)
}

export function grantLoot(
  state: EconomyState,
  rewards: readonly LootReward[],
  items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>,
): LootGrantResult {
  let inventory = state.inventory
  let silver = state.silver
  const equipmentIds = new Set(state.equipmentIds)
  const claimedKeys = new Set(state.claimedFirstRewardKeys)
  const pending: PendingLoot[] = [...state.pendingLoot]
  const granted: LootReward[] = []

  rewards.forEach((reward) => {
    validReward(reward)
    const key = rewardKey(reward)
    if (key && claimedKeys.has(key)) return
    if (reward.kind === 'silver') {
      silver += reward.amount
      if (key) claimedKeys.add(key)
      granted.push(reward)
      return
    }
    const item = findItem(items, reward.itemId)
    if (!item) throw new LootError(`掉落引用未知物品「${reward.itemId}」`)
    const count = reward.kind === 'equipment' ? reward.count ?? 1 : reward.count
    const result = tryAddItem(inventory, item, count)
    inventory = result.state
    if (result.added === count) {
      if (reward.kind === 'equipment') equipmentIds.add(reward.equipmentId)
      if (key) claimedKeys.add(key)
      granted.push(reward)
      return
    }
    const remainingReward: LootReward = reward.kind === 'equipment'
      ? { ...reward, count: count - result.added }
      : { ...reward, count: count - result.added }
    pending.push({ reward: remainingReward, reason: result.added === 0 && item.unique ? 'unique_owned' : 'inventory_full' })
  })

  const nextState: EconomyState = { silver, inventory, equipmentIds: [...equipmentIds], claimedFirstRewardKeys: [...claimedKeys], pendingLoot: pending }
  return { state: nextState, granted, pending: pending.slice(state.pendingLoot.length) }
}

export function claimPendingLoot(
  state: EconomyState,
  items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>,
): LootGrantResult {
  const pendingRewards = state.pendingLoot.map((pendingItem) => pendingItem.reward)
  const base: EconomyState = { ...state, pendingLoot: [] }
  const result = grantLoot(base, pendingRewards, items)
  return { state: result.state, granted: result.granted, pending: result.pending }
}

export const resolveLoot = rollLoot
export const applyLoot = grantLoot

