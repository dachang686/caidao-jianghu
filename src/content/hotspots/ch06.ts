import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'
const port = asLocationId('donghai-port'); const market = asLocationId('donghai-shell-market'); const temple = asLocationId('donghai-tide-temple')
export const ch06HotspotDefinitions: readonly HotspotDefinition[] = [
  { id: asHotspotId('ch06:port:log'), locationId: port, label: '船舶留影石', description: '石面只记录最上镜的一半，另一半正在海里抗议。', layout: { desktop: { x: .48, y: .42 }, mobile: { x: .5, y: .34 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch06:market:shells'), locationId: market, label: '贝壳摊', description: '每一枚贝壳都能反光，只有账本不能。', layout: { desktop: { x: .74, y: .7 }, mobile: { x: .75, y: .6 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch06:temple:bell'), locationId: temple, label: '潮钟', description: '潮钟每响一次，带货话术就短一截。', layout: { desktop: { x: .27, y: .35 }, mobile: { x: .28, y: .28 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch06:market:return'), locationId: market, label: '回到东海港', description: '沿着贝壳路回到港口。', layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch06:temple:return'), locationId: temple, label: '回到东海港', description: '顺着潮声回到港口。', layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
]
export const CH06_HOTSPOTS = ch06HotspotDefinitions
