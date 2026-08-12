import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch04')
const herbGardenId = asLocationId('qingyun-herb-garden')
const cloudHerbId = asItemId('item:qingyun-cloud-herb')

export const ch04GatheringItems: readonly ItemDefinition[] = [
  {
    id: cloudHerbId,
    name: '云台青蘅',
    description: '雨后山门边的清香药草，名门弟子说它只适合入药，闻起来却很像好吃的。',
    category: 'material',
    maxStack: 20,
    tags: ['ch04', 'gathering', 'herb'],
  },
]

export const ch04GatheringNodes: readonly GatheringNodeDefinition[] = [
  {
    id: asGatheringNodeId('ch04:cloud-herb'),
    chapterId,
    locationId: herbGardenId,
    label: '云台青蘅草',
    description: '在药圃边采几株云台青蘅，先确认它没有被当作门面盆栽。',
    mode: 'repeat',
    requiredChapter: 4,
    refreshEveryBattleTicks: 2,
    rewards: [{ itemId: cloudHerbId, count: 2 }],
  },
]

export const CORE_CH04_GATHERING_ITEMS = ch04GatheringItems
export const CORE_CH04_GATHERING_NODES = ch04GatheringNodes
