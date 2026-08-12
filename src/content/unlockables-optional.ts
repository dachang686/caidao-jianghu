import type { UnlockableDefinition } from '../types/unlockable'

const hiddenBossUnlockables = Array.from({ length: 8 }, (_, index) => ({
  id: `enemy:optional:hidden:${index + 1}`,
  kind: 'enemy' as const,
  name: ['锅底幽灵', '缺页捕风人', '空旗回声', '门规抄写鬼', '沙井倒影王', '潮声留影兽', '榜外墨客', '无名评判者'][index]!,
  description: 'Optional 隐藏 Boss：意图、阶段和首胜奖励均可在图鉴中回看。',
  clue: `第 ${index + 1} 章的异常线索尚未拼齐；先把正常探索记录完整。`,
  eventRules: [{ type: 'enemy.defeated', payload: { enemyId: `enemy:optional:hidden:${index + 1}` } }],
}))

export const OPTIONAL_UNLOCKABLES: readonly UnlockableDefinition[] = [
  ...hiddenBossUnlockables,
  {
    id: 'achievement:optional:first-dungeon',
    kind: 'achievement',
    name: '秘境首个安全节点',
    description: '完成任一通关后秘境，并让安全退出点真正派上用场。',
    clue: '秘境地图上有一处节点正在等你确认。',
    eventRules: [{ type: 'postgame.dungeon.completed', payload: { firstClear: true } }],
  },
  {
    id: 'achievement:optional:all-dungeons',
    kind: 'achievement',
    name: '三秘境不迷路',
    description: '完成三座通关后秘境，重复收益和首通奖励均有记录。',
    clue: '三张秘境地图还缺三枚可复核印章。',
    eventRules: [{ type: 'postgame.dungeons.completed', payload: { count: 3 } }],
  },
  {
    id: 'achievement:optional:all-hidden-bosses',
    kind: 'achievement',
    name: '八处异常均已核验',
    description: '击败八名 Optional 隐藏 Boss，保留主线装备并完成图鉴归档。',
    clue: '八个章节的异常记录都还没有盖满章。',
    eventRules: [{ type: 'optional.hidden_bosses.completed', payload: { count: 8 } }],
  },
  {
    id: 'achievement:optional:content-audit',
    kind: 'achievement',
    name: '可选内容也有账本',
    description: '完成 Optional 内容审计，技能、装备、配方和门人均可追踪。',
    clue: '有一份账本正在等待完整的 Optional 校验结果。',
    eventRules: [{ type: 'optional.content.audit', payload: { status: 'complete' } }],
  },
]

