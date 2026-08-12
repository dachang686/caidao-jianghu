import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch06')
const locationId = asLocationId('donghai-port')
const itemId = asItemId('item:donghai-sea-salt')

export const ch06GatheringItems: readonly ItemDefinition[] = [{
  id: itemId,
  name: '东海潮盐',
  description: '退潮后留下的细盐，适合腌鱼，也适合腌一份过度热情的带货文案。',
  category: 'material',
  maxStack: 20,
  tags: ['ch06', 'gathering', 'sea'],
}]

export const ch06GatheringNodes: readonly GatheringNodeDefinition[] = [{
  id: asGatheringNodeId('ch06:sea-salt'),
  chapterId,
  locationId,
  label: '码头退潮潮盐',
  description: '沿着码头木桩收集潮盐，确认留影石的盐渍不是滤镜。',
  mode: 'repeat',
  requiredChapter: 6,
  refreshEveryBattleTicks: 2,
  rewards: [{ itemId, count: 2 }],
}]

export const CORE_CH06_GATHERING_ITEMS = ch06GatheringItems
export const CORE_CH06_GATHERING_NODES = ch06GatheringNodes
