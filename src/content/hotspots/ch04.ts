import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'

const gateId = asLocationId('qingyun-gate')
const herbGardenId = asLocationId('qingyun-herb-garden')
const bellTerraceId = asLocationId('qingyun-bell-terrace')

/** 青云山门的热点提供可浏览内容与明确的安全返回路径，不提前放入任务或 Boss 入口。 */
export const ch04HotspotDefinitions: readonly HotspotDefinition[] = [
  {
    id: asHotspotId('ch04:gate-inscription'),
    locationId: gateId,
    label: '山门规训石刻',
    description: '石刻写着一长串门面规矩，最后一条是“先看鞋底，再谈剑意”。',
    layout: { desktop: { x: .49, y: .43 }, mobile: { x: .5, y: .34 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch04:herb-garden-cloud-herb'),
    locationId: herbGardenId,
    label: '云台药圃',
    description: '雨后云台长出一圈青蘅草，苏青禾说它只怕被当成装饰。',
    layout: { desktop: { x: .76, y: .71 }, mobile: { x: .76, y: .61 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch04:herb-garden-return'),
    locationId: herbGardenId,
    label: '回到青云山门',
    description: '沿着石阶回到山门，药圃不会把人留在半山腰。',
    layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch04:bell-terrace-cloud-bell'),
    locationId: bellTerraceId,
    label: '听云铜钟',
    description: '铜钟被山风吹得很有礼貌，每次回声都像在申请加盖印章。',
    layout: { desktop: { x: .25, y: .32 }, mobile: { x: .28, y: .28 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch04:bell-terrace-return'),
    locationId: bellTerraceId,
    label: '回到青云山门',
    description: '从听云台下坡，回到山门再决定要不要接受名门规矩。',
    layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
]

export const CH04_HOTSPOTS = ch04HotspotDefinitions
