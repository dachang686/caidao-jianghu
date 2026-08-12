import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'
const station = asLocationId('western-relay-station'); const dune = asLocationId('western-dune-supply'); const caravan = asLocationId('western-caravan-yard')
export const ch05HotspotDefinitions: readonly HotspotDefinition[] = [
  { id: asHotspotId('ch05:station:manifest'), locationId: station, label: '驿站货单', description: '货单被风吹得只剩几行，恰好都是刀谱。', layout: { desktop: { x: .48, y: .42 }, mobile: { x: .5, y: .34 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch05:dune:well'), locationId: dune, label: '沙井水影', description: '井水很少，倒影很多，像一场提前排练的误会。', layout: { desktop: { x: .74, y: .7 }, mobile: { x: .75, y: .6 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch05:caravan:bell'), locationId: caravan, label: '驼铃架', description: '驼铃一响，所有人都假装自己知道货在哪。', layout: { desktop: { x: .27, y: .35 }, mobile: { x: .28, y: .28 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch05:dune:return'), locationId: dune, label: '回到驿站', description: '沿着驼铃和脚印回到驿站。', layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch05:caravan:return'), locationId: caravan, label: '回到驿站', description: '穿过车辙回到驿站门口。', layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
]
export const CH05_HOTSPOTS = ch05HotspotDefinitions
