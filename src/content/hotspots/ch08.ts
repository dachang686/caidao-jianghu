import type { HotspotDefinition } from '../../types/hotspot'
import { asHotspotId, asLocationId } from '../../types/ids'
const gate = asLocationId('convention-gate'); const stage = asLocationId('convention-stage'); const kitchen = asLocationId('convention-kitchen')
export const ch08HotspotDefinitions: readonly HotspotDefinition[] = [
  { id: asHotspotId('ch08:gate:register'), locationId: gate, label: '大会名册', description: '名册上只有一栏：你愿意把江湖交给谁定义。', layout: { desktop: { x: .48, y: .42 }, mobile: { x: .5, y: .34 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch08:stage:arena'), locationId: stage, label: '武林擂台', description: '擂台中央留着一圈不肯被解释的风。', layout: { desktop: { x: .74, y: .7 }, mobile: { x: .75, y: .6 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch08:kitchen:menu'), locationId: kitchen, label: '终局刀谱灶', description: '最后一道菜要不要加盐，竟然也能成为路线选择。', layout: { desktop: { x: .27, y: .35 }, mobile: { x: .28, y: .28 } }, keyboardOrder: 1, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch08:stage:return'), locationId: stage, label: '回到大会入口', description: '从擂台边缘退回大会入口。', layout: { desktop: { x: .12, y: .28 }, mobile: { x: .16, y: .24 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
  { id: asHotspotId('ch08:kitchen:return'), locationId: kitchen, label: '回到大会入口', description: '端着刀谱回到大会入口。', layout: { desktop: { x: .86, y: .74 }, mobile: { x: .79, y: .65 } }, keyboardOrder: 2, mode: 'repeat', effects: [] },
]
export const CH08_HOTSPOTS = ch08HotspotDefinitions
