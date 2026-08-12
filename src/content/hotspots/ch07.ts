import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'
const gate = asLocationId('capital-gate'); const office = asLocationId('capital-ranking-office'); const archive = asLocationId('capital-archive')
export const ch07HotspotDefinitions: readonly HotspotDefinition[] = [
  { id: asHotspotId('ch07:gate:board'), locationId: gate, label: '入城榜板', description: '榜板上的墨迹都很正，正到没人敢问谁改的。', layout: { desktop: { x: .48, y: .42 }, mobile: { x: .5, y: .34 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch07:office:ledger'), locationId: office, label: '榜司账册', description: '账册厚得能挡住一半真相。', layout: { desktop: { x: .74, y: .7 }, mobile: { x: .75, y: .6 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch07:archive:seal'), locationId: archive, label: '旧印档案', description: '印章已经褪色，交易却还很新鲜。', layout: { desktop: { x: .27, y: .35 }, mobile: { x: .28, y: .28 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch07:office:return'), locationId: office, label: '回到京城门', description: '沿着榜单廊道回到城门。', layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch07:archive:return'), locationId: archive, label: '回到京城门', description: '合上档案回到城门。', layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
]
export const CH07_HOTSPOTS = ch07HotspotDefinitions
