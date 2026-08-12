import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch03')
const kitchenId = asLocationId('blackwind-kitchen')
const mountainPepperId = asItemId('item:blackwind-pepper')

export const ch03GatheringItems: readonly ItemDefinition[] = [
  {
    id: mountainPepperId,
    name: '黑风山椒',
    description: '山风吹熟的辛香果，胡大勺说它能让任何一份军粮先有意见。',
    category: 'material',
    maxStack: 20,
    tags: ['ch03', 'gathering', 'cooking'],
  },
]

export const ch03GatheringNodes: readonly GatheringNodeDefinition[] = [
  {
    id: asGatheringNodeId('ch03:mountain-pepper'),
    chapterId,
    locationId: kitchenId,
    label: '山椒藤蔓',
    description: '在灶房后侧采几串黑风山椒，别让它先掉进锅里。',
    mode: 'repeat',
    requiredChapter: 3,
    refreshEveryBattleTicks: 2,
    rewards: [{ itemId: mountainPepperId, count: 2 }],
  },
]

export const CORE_CH03_GATHERING_ITEMS = ch03GatheringItems
export const CORE_CH03_GATHERING_NODES = ch03GatheringNodes
