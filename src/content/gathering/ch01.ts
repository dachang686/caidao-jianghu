import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapter = asChapterId('ch01')
const village = asLocationId('xiaoyu-village')
const herb = asItemId('item:herb')
const ironScrap = asItemId('item:iron-scrap')

export const ch01GatheringItems: readonly ItemDefinition[] = [
  { id: herb, name: '止血草', description: '山路边常见的药草，味道比名字更诚实。', category: 'material', maxStack: 20 },
  { id: ironScrap, name: '铁屑', description: '铁匠铺旁捡来的细碎材料，至少没有人收停车费。', category: 'material', maxStack: 20 },
]

export const ch01GatheringNodes: readonly GatheringNodeDefinition[] = [
  {
    id: asGatheringNodeId('ch01:hill-herbs'),
    chapterId: chapter,
    locationId: village,
    label: '山路止血草',
    description: '沿着客栈后山采一点止血草。',
    mode: 'once',
    requiredChapter: 1,
    rewards: [{ itemId: herb, count: 2 }],
  },
  {
    id: asGatheringNodeId('ch01:smithy-iron-scrap'),
    chapterId: chapter,
    locationId: village,
    label: '铁匠铺铁屑',
    description: '在铁匠铺旁收集可回炉的铁屑。',
    mode: 'repeat',
    requiredChapter: 1,
    refreshEveryBattleTicks: 2,
    rewards: [{ itemId: ironScrap, count: 1 }],
  },
]

export const CORE_GATHERING_ITEMS = ch01GatheringItems
export const CORE_GATHERING_NODES = ch01GatheringNodes
