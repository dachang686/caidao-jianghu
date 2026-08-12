import type { HotspotDefinition } from '../../types/hotspot'
import { asContentKey, asEnemyId, asHotspotId, asLocationId } from '../../types/ids'

const village = asLocationId('xiaoyu-village')

/** 小愚村的命中层配置；坐标是场景比例，不绑定角色图片尺寸或像素。 */
export const ch01HotspotDefinitions: readonly HotspotDefinition[] = [
  {
    id: asHotspotId('ch01:old-man'),
    locationId: village,
    label: '不正经老头',
    description: '听听这位前辈又准备把学费欠到哪一辈。',
    layout: { desktop: { x: .16, y: .75 }, mobile: { x: .18, y: .72 } },
    keyboardOrder: 1,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch01:bai-daxia'),
    locationId: village,
    label: '白大侠擂台',
    description: '挑战擂台上的白大侠。',
    layout: { desktop: { x: .82, y: .74 }, mobile: { x: .78, y: .69 } },
    keyboardOrder: 2,
    mode: 'repeat',
    effects: [{ type: 'trigger_battle', enemyId: asEnemyId('bai-daxia') }],
  },
  {
    id: asHotspotId('ch01:dahuang-cat'),
    locationId: village,
    label: '大黄的猫',
    description: '和正在客栈蹭饭的大黄猫谈谈回家计划。',
    layout: { desktop: { x: .94, y: .82 }, mobile: { x: .87, y: .53 } },
    keyboardOrder: 3,
    mode: 'repeat',
    effects: [],
  },
  {
    id: asHotspotId('ch01:well-reflection'),
    locationId: village,
    label: '后院水井',
    description: '看看水井里有没有比你更像掌门的倒影。',
    layout: { desktop: { x: .35, y: .34 }, mobile: { x: .32, y: .3 } },
    keyboardOrder: 4,
    mode: 'once',
    conditions: [{ type: 'flag_equals', flag: 'catResolved', value: true }],
    lockedReason: '先把大黄猫的事情处理好，后院才有人给你让路。',
    effects: [
      { type: 'give_exp', amount: 2, grantKey: 'hotspot:ch01:well-reflection' },
      { type: 'narrate', lineId: asContentKey('narration:ch01:well-reflection') },
    ],
  },
]

export const CH01_HOTSPOTS = ch01HotspotDefinitions
