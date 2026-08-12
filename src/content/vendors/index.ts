import type { EquipmentDefinition } from '../../types/equipment'
import type { ItemDefinition } from '../../types/item'
import { coreForgingEquipment, coreForgingItems } from '../recipes/forging'

export interface CoreVendorOffer {
  readonly id: string
  readonly equipmentId: string
  readonly itemId: string
  readonly chapter: number
  readonly price: number
  readonly protectedByDefault: boolean
  readonly regionId: string
}

const itemsById = new Map(coreForgingItems.map((item) => [String(item.id), item]))

export const CORE_VENDOR_OFFERS: readonly CoreVendorOffer[] = coreForgingEquipment.map((equipment, index) => ({
  id: `vendor:core:${String(equipment.id).replace('equipment:', '')}`,
  equipmentId: String(equipment.id),
  itemId: String(equipment.itemId),
  chapter: equipment.chapter ?? Math.min(8, Math.floor(index / 6) + 1),
  price: equipment.price ?? 50,
  protectedByDefault: equipment.protectable ?? true,
  regionId: `core-region:ch0${equipment.chapter ?? 1}`,
}))

export const CORE_VENDOR_ITEMS: readonly ItemDefinition[] = CORE_VENDOR_OFFERS
  .map((offer) => itemsById.get(offer.itemId))
  .filter((item): item is ItemDefinition => item !== undefined)

export function getCoreVendorOffer(equipmentId: string): CoreVendorOffer | undefined {
  return CORE_VENDOR_OFFERS.find((offer) => offer.equipmentId === equipmentId)
}

export function getCoreEquipmentMarketItem(equipmentId: string): { readonly equipment: EquipmentDefinition; readonly item: ItemDefinition; readonly basePrice: number } | undefined {
  const offer = getCoreVendorOffer(equipmentId)
  if (!offer) return undefined
  const equipment = coreForgingEquipment.find((candidate) => String(candidate.id) === equipmentId)
  const item = itemsById.get(offer.itemId)
  if (!equipment || !item) return undefined
  return { equipment, item, basePrice: offer.price }
}
