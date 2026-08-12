import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'

const gateId = asLocationId('blackwind-gate')
const kitchenId = asLocationId('blackwind-kitchen')
const watchtowerId = asLocationId('blackwind-watchtower')

/** 黑风寨每个地点都有桌面/移动双坐标，并保留显式回到入口的安全路径。 */
export const ch03HotspotDefinitions: readonly HotspotDefinition[] = [
  {
    id: asHotspotId('ch03:gate-ledger-board'),
    locationId: gateId,
    label: '山寨账榜',
    description: '门口的账榜把粮草、巡哨和“本月最忙”排在同一张纸上。',
    layout: { desktop: { x: .49, y: .42 }, mobile: { x: .5, y: .34 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch03:kitchen-stove'),
    locationId: kitchenId,
    label: '灶台余火',
    description: '灶台还温着，锅盖下的香气比山寨口号更有说服力。',
    layout: { desktop: { x: .76, y: .73 }, mobile: { x: .76, y: .62 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch03:watchtower-drum'),
    locationId: watchtowerId,
    label: '瞭望鼓',
    description: '鼓面写满了没有落款的通知，敲响前最好先问问小顺。',
    layout: { desktop: { x: .25, y: .32 }, mobile: { x: .28, y: .28 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch03:kitchen-return'),
    locationId: kitchenId,
    label: '回到山寨门',
    description: '沿着挂满空旗的石阶回到山寨门口。',
    layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch03:watchtower-return'),
    locationId: watchtowerId,
    label: '回到山寨门',
    description: '从瞭望台下坡，回到门口再决定要不要挑战山寨规矩。',
    layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [],
  },
]

export const CH03_HOTSPOTS = ch03HotspotDefinitions
