import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'

const marketId = asLocationId('qinghe-market')
const riverfrontId = asLocationId('qinghe-riverfront')

/** 清河县热点只提供可浏览的场景入口；完整任务与战斗在后续章节任务中接入。 */
export const ch02HotspotDefinitions: readonly HotspotDefinition[] = [
  {
    id: asHotspotId('ch02:ranking-board'),
    locationId: marketId,
    label: '百晓榜告示台',
    description: '看看今天谁又被写进了榜单，纸面上的江湖比擂台还忙。',
    layout: { desktop: { x: .48, y: .43 }, mobile: { x: .5, y: .34 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch02:tea-stall'),
    locationId: marketId,
    label: '茶摊空位',
    description: '坐下来听两句风声，先别急着把每句话都当任务。',
    layout: { desktop: { x: .82, y: .68 }, mobile: { x: .78, y: .59 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch02:river-herb-baskets'),
    locationId: riverfrontId,
    label: '河岸药篮',
    description: '柳婶整理过的药篮旁长着清河水气养出的莲叶。',
    layout: { desktop: { x: .17, y: .74 }, mobile: { x: .2, y: .69 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch02:return-to-market'),
    locationId: riverfrontId,
    label: '回到街市',
    description: '沿着石桥回到清河县街市，路面不滑，心情自负。',
    layout: { desktop: { x: .86, y: .32 }, mobile: { x: .78, y: .28 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
]

export const CH02_HOTSPOTS = ch02HotspotDefinitions
