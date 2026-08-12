import type { PostgameDungeonDefinition } from '../../types/postgame-dungeon'

const enemy = (index: number) => `enemy:optional:hidden:${index}`

export const OPTIONAL_POSTGAME_DUNGEONS: readonly PostgameDungeonDefinition[] = [
  {
    id: 'dungeon:postgame:archive-vault', title: '原卷秘库', theme: '京城档案与会自动说话的墨锭', discoveryClue: '公开档案夜后，墨迹会在没有人催促时指向一扇窄门。',
    encounters: [1, 2, 3, 4].map((index) => ({ id: `dungeon:archive-vault:encounter:${index}`, title: `原卷核验 ${index}`, enemyIds: [enemy(6), enemy(7)], resourceCost: 2 + index, canExitAfter: index > 1 })),
    firstClearGrantKey: 'reward:dungeon:archive-vault:first-clear', firstClearSummary: '获得公开复核材料与一件 Optional 装备来源记录。', repeatRewardMultiplier: 0.55, failurePolicy: 'preserve_core_and_equipment', offlineSafe: true,
  },
  {
    id: 'dungeon:postgame:tide-cistern', title: '潮声暗渠', theme: '东海潮声、留影石与不会退潮的回声', discoveryClue: '潮钟第三次响后，码头水线会留下不属于任何船的路线。',
    encounters: [1, 2, 3].map((index) => ({ id: `dungeon:tide-cistern:encounter:${index}`, title: `潮声回流 ${index}`, enemyIds: [enemy(5), enemy(6)], resourceCost: 3 + index, canExitAfter: index > 1 })),
    firstClearGrantKey: 'reward:dungeon:tide-cistern:first-clear', firstClearSummary: '获得潮系材料、图鉴记录和重复收益衰减标记。', repeatRewardMultiplier: 0.6, failurePolicy: 'preserve_core_and_equipment', offlineSafe: true,
  },
  {
    id: 'dungeon:postgame:four-school-kitchen', title: '四系灶台', theme: '四系武学在一口锅里讨论谁负责收拾', discoveryClue: '四系合流演示结束后，厨房会多出一张没有署名的菜单。',
    encounters: [1, 2, 3, 4, 5].map((index) => ({ id: `dungeon:four-school-kitchen:encounter:${index}`, title: `合味试炼 ${index}`, enemyIds: [enemy(1 + ((index - 1) % 8)), enemy(8 - ((index - 1) % 8))], resourceCost: 2 + index, canExitAfter: index > 2 })),
    firstClearGrantKey: 'reward:dungeon:four-school-kitchen:first-clear', firstClearSummary: '获得四系合流菜谱与终局构筑的可追踪奖励。', repeatRewardMultiplier: 0.5, failurePolicy: 'preserve_core_and_equipment', offlineSafe: true,
  },
]

