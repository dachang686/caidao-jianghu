import type { EconomyStageProfile, MarketItem, MarketQuote } from '../../types/loot'
import type { EconomyState } from '../../types/loot'
import { addItem, removeItem, InventoryError } from '../inventory'

export class EconomyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EconomyError'
  }
}

const STAGE_PROFILES: readonly EconomyStageProfile[] = Array.from({ length: 8 }, (_, index) => ({
  chapterOrder: index + 1,
  buyPriceMultiplier: 1 + index * 0.04,
  sellPriceMultiplier: 0.45,
  rewardMultiplier: 1 + index * 0.05,
}))

export function getEconomyStageProfile(chapterOrder: number): EconomyStageProfile {
  if (!Number.isInteger(chapterOrder) || chapterOrder < 1) throw new EconomyError('章节顺序必须是大于 0 的整数')
  return STAGE_PROFILES[Math.min(STAGE_PROFILES.length, chapterOrder) - 1]
}

export const ECONOMY_STAGE_PROFILES = STAGE_PROFILES

export function quoteMarketItem(item: MarketItem, quantity: number, chapterOrder: number): MarketQuote {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new EconomyError('交易数量必须是正整数')
  if (!Number.isFinite(item.basePrice) || item.basePrice < 0) throw new EconomyError('物品基础价格必须是非负有限数字')
  const profile = getEconomyStageProfile(chapterOrder)
  const buyUnit = Math.max(0, Math.ceil(item.basePrice * profile.buyPriceMultiplier))
  const sellUnit = Math.max(0, Math.floor(item.basePrice * profile.sellPriceMultiplier))
  if (sellUnit >= buyUnit && buyUnit > 0) throw new EconomyError('市场配置会产生买卖套利')
  return { itemId: item.itemId, quantity, buyPrice: buyUnit * quantity, sellPrice: sellUnit * quantity }
}

export function buyMarketItem(state: EconomyState, item: MarketItem, quantity: number, chapterOrder: number): EconomyState {
  const quote = quoteMarketItem(item, quantity, chapterOrder)
  if (state.silver < quote.buyPrice) throw new EconomyError('银两不足')
  try {
    return { ...state, silver: state.silver - quote.buyPrice, inventory: addItem(state.inventory, item.item, quantity) }
  } catch (error) {
    if (error instanceof InventoryError) throw new EconomyError(error.message)
    throw error
  }
}

export function sellMarketItem(state: EconomyState, item: MarketItem, quantity: number, chapterOrder: number): EconomyState {
  const quote = quoteMarketItem(item, quantity, chapterOrder)
  try {
    return { ...state, silver: state.silver + quote.sellPrice, inventory: removeItem(state.inventory, item.itemId, quantity, item.item) }
  } catch (error) {
    if (error instanceof InventoryError) throw new EconomyError(error.message)
    throw error
  }
}

export const getMarketQuote = quoteMarketItem

