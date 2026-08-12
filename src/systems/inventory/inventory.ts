import type { InventoryState, ItemDefinition, ItemStack } from '../../types/item'

export class InventoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InventoryError'
  }
}

function itemId(item: ItemDefinition): string {
  const id = String(item.id)
  if (!id.trim()) throw new InventoryError('物品 ID 不能为空')
  return id
}

function validCount(count: number): number {
  if (!Number.isInteger(count) || count <= 0) throw new InventoryError('物品数量必须是大于 0 的整数')
  return count
}

function maxStack(item: ItemDefinition): number {
  if (!Number.isInteger(item.maxStack) || item.maxStack < 1) throw new InventoryError(`物品「${item.id}」堆叠上限无效`)
  return item.maxStack
}

function clone(state: InventoryState): { capacity: number; stacks: ItemStack[]; protectedItemIds: string[] } {
  if (!Number.isInteger(state.capacity) || state.capacity < 1) throw new InventoryError('背包容量必须是大于 0 的整数')
  return { capacity: state.capacity, stacks: state.stacks.map((stack) => ({ ...stack })), protectedItemIds: [...state.protectedItemIds] }
}

export function createInventoryState(capacity = 20, protectedItemIds: readonly string[] = []): InventoryState {
  if (!Number.isInteger(capacity) || capacity < 1) throw new InventoryError('背包容量必须是大于 0 的整数')
  return { capacity, stacks: [], protectedItemIds: [...protectedItemIds] }
}

export function getItemCount(state: InventoryState, itemId: string): number {
  return state.stacks.filter((stack) => stack.itemId === itemId).reduce((total, stack) => total + stack.count, 0)
}

export function getOccupiedSlots(state: InventoryState): number {
  return state.stacks.filter((stack) => stack.count > 0).length
}

export function hasItem(state: InventoryState, itemId: string, count = 1): boolean {
  return getItemCount(state, itemId) >= count
}

export function addItem(state: InventoryState, item: ItemDefinition, count = 1): InventoryState {
  validCount(count)
  const id = itemId(item)
  const stackLimit = maxStack(item)
  const next = clone(state)
  const existingCount = getItemCount(state, id)
  if (item.unique && existingCount > 0) throw new InventoryError(`唯一物品「${id}」已经在背包中`)
  if (item.unique && count > 1) throw new InventoryError(`唯一物品「${id}」不能添加多个`)

  let remaining = count
  while (remaining > 0) {
    const targetIndex = next.stacks.findIndex((stack) => stack.itemId === id && stack.count < stackLimit)
    if (targetIndex >= 0) {
      const target = next.stacks[targetIndex]
      const added = Math.min(remaining, stackLimit - target.count)
      next.stacks[targetIndex] = { ...target, count: target.count + added }
      remaining -= added
      continue
    }
    if (next.stacks.length >= next.capacity) throw new InventoryError('背包已满，物品未添加')
    const added = Math.min(remaining, stackLimit)
    next.stacks.push({ itemId: id, count: added })
    remaining -= added
  }
  return next
}

export function removeItem(state: InventoryState, itemId: string, count = 1, item?: Pick<ItemDefinition, 'keyItem'>): InventoryState {
  validCount(count)
  if (state.protectedItemIds.includes(itemId) || item?.keyItem) throw new InventoryError(`关键物品「${itemId}」受保护，不能移除`)
  if (!hasItem(state, itemId, count)) throw new InventoryError(`物品「${itemId}」数量不足`)
  const next = clone(state)
  let remaining = count
  for (let index = next.stacks.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const stack = next.stacks[index]
    if (stack.itemId !== itemId) continue
    const removed = Math.min(remaining, stack.count)
    next.stacks[index] = { ...stack, count: stack.count - removed }
    remaining -= removed
    if (stack.count === removed) next.stacks.splice(index, 1)
  }
  return next
}

export function setItemProtected(state: InventoryState, itemId: string, protectedItem: boolean): InventoryState {
  const ids = new Set(state.protectedItemIds)
  if (protectedItem) ids.add(itemId)
  else ids.delete(itemId)
  return { ...state, protectedItemIds: [...ids] }
}

export interface TryAddItemResult {
  readonly state: InventoryState
  readonly added: number
  readonly remaining: number
}

export function tryAddItem(state: InventoryState, item: ItemDefinition, count = 1): TryAddItemResult {
  validCount(count)
  let next = state
  let added = 0
  for (let index = 0; index < count; index += 1) {
    try {
      next = addItem(next, item, 1)
      added += 1
    } catch (error) {
      if (!(error instanceof InventoryError)) throw error
      break
    }
  }
  return { state: next, added, remaining: count - added }
}

export const addItemToInventory = addItem
export const removeItemFromInventory = removeItem
