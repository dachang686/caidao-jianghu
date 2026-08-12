import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch07')
const locationId = asLocationId('capital-archive')
const itemId = asItemId('item:capital-ink')

export const ch07GatheringItems: readonly ItemDefinition[] = [{
  id: itemId,
  name: '京城墨锭',
  description: '档案房里磨得最细的墨，写榜单时不容易把真相磨成黑块。',
  category: 'material',
  maxStack: 20,
  tags: ['ch07', 'gathering', 'archive'],
}]

export const ch07GatheringNodes: readonly GatheringNodeDefinition[] = [{
  id: asGatheringNodeId('ch07:capital-ink'),
  chapterId,
  locationId,
  label: '档案房余墨',
  description: '收集一块余墨，给百晓榜的交易账留下可读的笔画。',
  mode: 'repeat',
  requiredChapter: 7,
  refreshEveryBattleTicks: 2,
  rewards: [{ itemId, count: 2 }],
}]

export const CORE_CH07_GATHERING_ITEMS = ch07GatheringItems
export const CORE_CH07_GATHERING_NODES = ch07GatheringNodes
