import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch02')
const riverfrontId = asLocationId('qinghe-riverfront')
const lotusId = asItemId('item:qinghe-lotus')

export const ch02GatheringItems: readonly ItemDefinition[] = [
  {
    id: lotusId,
    name: '清河莲子',
    description: '河岸药篮里晒过的莲子，清甜得像一条暂时没有榜单的消息。',
    category: 'material',
    maxStack: 20,
    tags: ['ch02', 'gathering'],
  },
]

export const ch02GatheringNodes: readonly GatheringNodeDefinition[] = [
  {
    id: asGatheringNodeId('ch02:river-lotus'),
    chapterId,
    locationId: riverfrontId,
    label: '河岸莲子',
    description: '在石桥下的药篮旁采一点清河莲子。',
    mode: 'repeat',
    requiredChapter: 2,
    refreshEveryBattleTicks: 2,
    rewards: [{ itemId: lotusId, count: 2 }],
  },
]

export const CORE_CH02_GATHERING_ITEMS = ch02GatheringItems
export const CORE_CH02_GATHERING_NODES = ch02GatheringNodes
