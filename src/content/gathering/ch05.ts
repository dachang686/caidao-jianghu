import type { ItemDefinition } from '../../types/item'
import type { GatheringNodeDefinition } from '../../types/gathering'
import { asChapterId, asGatheringNodeId, asItemId, asLocationId } from '../../types/ids'

const chapterId = asChapterId('ch05')
const locationId = asLocationId('western-dune-supply')
const itemId = asItemId('item:western-sand-herb')

export const ch05GatheringItems: readonly ItemDefinition[] = [{
  id: itemId,
  name: '西域沙参',
  description: '驿路风沙里长出的耐旱药材，嚼起来像一份没有提交按钮的差旅报销。',
  category: 'material',
  maxStack: 20,
  tags: ['ch05', 'gathering', 'herb'],
}]

export const ch05GatheringNodes: readonly GatheringNodeDefinition[] = [{
  id: asGatheringNodeId('ch05:sand-herb'),
  chapterId,
  locationId,
  label: '沙丘边的西域沙参',
  description: '在补给点外采一株沙参，给刀谱物流谜案补上真实材料。',
  mode: 'repeat',
  requiredChapter: 5,
  refreshEveryBattleTicks: 2,
  rewards: [{ itemId, count: 2 }],
}]

export const CORE_CH05_GATHERING_ITEMS = ch05GatheringItems
export const CORE_CH05_GATHERING_NODES = ch05GatheringNodes
