import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch08')
const locationId = asLocationId('convention-kitchen')
const itemId = asItemId('item:convention-pepper')

export const ch08GatheringItems: readonly ItemDefinition[] = [{
  id: itemId,
  name: '会场椒香',
  description: '武林大会厨房的辣椒，能让评判意见迅速从含糊变得非常明确。',
  category: 'material',
  maxStack: 20,
  tags: ['ch08', 'gathering', 'spice'],
}]

export const ch08GatheringNodes: readonly GatheringNodeDefinition[] = [{
  id: asGatheringNodeId('ch08:convention-pepper'),
  chapterId,
  locationId,
  label: '会场厨房椒香',
  description: '在厨房取一撮椒香，为最终定义权争论准备一份真实调味。',
  mode: 'repeat',
  requiredChapter: 8,
  refreshEveryBattleTicks: 2,
  rewards: [{ itemId, count: 2 }],
}]

export const CORE_CH08_GATHERING_ITEMS = ch08GatheringItems
export const CORE_CH08_GATHERING_NODES = ch08GatheringNodes
