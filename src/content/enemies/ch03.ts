import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import { asChapterId, asEnemyId } from '../../types/ids'

const chapterId = asChapterId('ch03')

const scoutTemplate = {
  id: 'template:ch03:fortress-scout',
  name: '按鼓点巡山',
  moveIds: ['move:ch03:scout:club', 'move:ch03:scout:signal', 'move:ch03:scout:hide'],
  fallbackMoveId: 'move:ch03:scout:club',
  tags: ['honest-intent', 'normal', 'fortress-gate'],
} as const

const kitchenTemplate = {
  id: 'template:ch03:kitchen-raider',
  name: '先抢锅再讲理',
  moveIds: ['move:ch03:raider:ladle', 'move:ch03:raider:pepper', 'move:ch03:raider:pot-lid'],
  fallbackMoveId: 'move:ch03:raider:ladle',
  tags: ['honest-intent', 'normal', 'kitchen'],
} as const

const leaderTemplate = {
  id: 'template:ch03:blackwind-leader',
  name: '山寨冲榜三板斧',
  moveIds: ['move:ch03:leader:banner-cut', 'move:ch03:leader:empty-banner', 'move:ch03:leader:guard'],
  fallbackMoveId: 'move:ch03:leader:banner-cut',
  tags: ['honest-intent', 'boss', 'readable-phase', 'fortress-ranking'],
} as const

export const CH03_ENEMY_DEFINITIONS: readonly ChapterEnemyDefinition[] = [
  {
    id: asEnemyId('enemy:ch03:fortress-scout'),
    chapterId,
    role: 'normal',
    name: '山寨巡哨',
    readableIntent: true,
    behavior: scoutTemplate,
    moves: [
      { id: 'move:ch03:scout:club', name: '木棍点名', kind: 'aggressive', summary: '预计造成稳定伤害，并削减 6 点架势。', weight: 3, power: 0.94, posturePower: 6 },
      { id: 'move:ch03:scout:signal', name: '敲鼓传令', kind: 'charge', summary: '下一击预计更重，鼓声已经先把意图说完。', weight: 1, power: 1.2, posturePower: 8, chargeTurns: 1 },
      { id: 'move:ch03:scout:hide', name: '旗后藏身', kind: 'defend', summary: '躲到空旗后，本回合减少约 28% 所受伤害。', weight: 1, guardRatio: 0.28 },
    ],
    curve: {
      maxHp: { base: 86 }, maxQi: { base: 16 }, attack: { base: 13 }, defense: { base: 6 }, posture: { base: 36 },
      accuracy: { base: 0.89 }, dodge: { base: 0.06 }, crit: { base: 0.06 },
    },
  },
  {
    id: asEnemyId('enemy:ch03:kitchen-raider'),
    chapterId,
    role: 'normal',
    name: '抢锅客',
    readableIntent: true,
    behavior: kitchenTemplate,
    moves: [
      { id: 'move:ch03:raider:ladle', name: '长勺横扫', kind: 'aggressive', summary: '预计造成中等伤害，并削减 7 点架势。', weight: 3, power: 1.02, posturePower: 7 },
      { id: 'move:ch03:raider:pepper', name: '山椒扬尘', kind: 'special', summary: '预计造成轻度伤害，下一回合的命中会变得不舒服。', weight: 1, power: 0.72, posturePower: 4 },
      { id: 'move:ch03:raider:pot-lid', name: '锅盖护面', kind: 'defend', summary: '举锅盖护住要害，本回合减少约 32% 所受伤害。', weight: 1, guardRatio: 0.32 },
    ],
    curve: {
      maxHp: { base: 92 }, maxQi: { base: 18 }, attack: { base: 14 }, defense: { base: 5 }, posture: { base: 38 },
      accuracy: { base: 0.87 }, dodge: { base: 0.07 }, crit: { base: 0.07 },
    },
  },
  {
    id: asEnemyId('enemy:ch03:blackwind-leader'),
    chapterId,
    role: 'boss',
    name: '黑风寨主',
    readableIntent: true,
    specialRuleIds: ['rule:ch03:leader:empty-banner'],
    presentationCueIds: ['presentation:ch03:leader:defeat'],
    behavior: leaderTemplate,
    moves: [
      { id: 'move:ch03:leader:banner-cut', name: '旗影断粮', kind: 'aggressive', summary: '预计造成约 22 点伤害，并削减 11 点架势。', weight: 3, power: 1.08, posturePower: 11 },
      { id: 'move:ch03:leader:empty-banner', name: '空旗反卷', kind: 'special', summary: '本回合不攻击，寨主被自己挂反的空旗绊住。', weight: 1, power: 0, posturePower: 0 },
      { id: 'move:ch03:leader:guard', name: '寨门叠甲', kind: 'defend', summary: '借寨门和空旗挡住要害，本回合减少约 30% 所受伤害。', weight: 1, guardRatio: 0.3 },
      { id: 'move:ch03:leader:banner-reversal', name: '反卷山河', kind: 'aggressive', summary: '预计造成约 28 点伤害，并削减 13 点架势。', weight: 3, power: 1.34, posturePower: 13 },
    ],
    curve: {
      maxHp: { base: 168 }, maxQi: { base: 48 }, attack: { base: 20 }, defense: { base: 11 }, posture: { base: 54 },
      accuracy: { base: 0.9 }, dodge: { base: 0.05 }, crit: { base: 0.1 },
    },
    boss: {
      phases: [
        { id: 'phase:ch03:leader:opening', phase: 1, hpThresholdRatio: 1, moveIds: ['move:ch03:leader:banner-cut', 'move:ch03:leader:empty-banner', 'move:ch03:leader:guard'] },
        { id: 'phase:ch03:leader:reversal', phase: 2, hpThresholdRatio: 0.5, moveIds: ['move:ch03:leader:banner-reversal', 'move:ch03:leader:empty-banner', 'move:ch03:leader:guard'], deceptiveChance: 0.2 },
      ],
    },
  },
]

export const ch03EnemyDefinitions = CH03_ENEMY_DEFINITIONS
