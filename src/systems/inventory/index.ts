export {
  InventoryError,
  addItem,
  addItemToInventory,
  createInventoryState,
  getItemCount,
  getOccupiedSlots,
  hasItem,
  removeItem,
  removeItemFromInventory,
  setItemProtected,
  tryAddItem,
} from './inventory'
export type { TryAddItemResult } from './inventory'
export {
  EQUIPMENT_SLOTS,
  EquipmentError,
  createEquipmentLoadout,
  equipEquipment,
  recalculateEquipmentDerivedStats,
  recalculateEquipmentStats,
  unequip,
  unequipEquipment,
} from './equipment'
export type { EquipmentCatalog, EquipmentOperationResult } from './equipment'
