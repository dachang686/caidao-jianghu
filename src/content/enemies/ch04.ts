import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import { asChapterId, asEnemyId } from '../../types/ids'

const chapterId = asChapterId('ch04')

const gateDiscipleTemplate = {
  id: 'template:ch04:gate-disciple',
  name: '先登记再出剑',
  moveIds: ['move:ch04:disciple:seal', 'move:ch04:disciple:step', 'move:ch04:disciple:cloak'],
  fallbackMoveId: 'move:ch04:disciple:seal',
  tags: ['honest-intent', 'normal', 'qingyun-gate'],
} as const

const mistSwordTemplate = {
  id: 'template:ch04:mist-sword-disciple',
  name: '雾里校步三式',
  moveIds: ['move:ch04:sword:step', 'move:ch04:sword:mist', 'move:ch04:sword:guard'],
  fallbackMoveId: 'move:ch04:sword:step',
  tags: ['honest-intent', 'normal', 'mountain-mist'],
} as const

const masterTemplate = {
  id: 'template:ch04:qingyun-master',
  name: '门面工程四段论',
  moveIds: ['move:ch04:master:rule-call', 'move:ch04:master:formal-stance', 'move:ch04:master:fan-guard'],
  fallbackMoveId: 'move:ch04:master:rule-call',
  tags: ['honest-intent', 'boss', 'readable-phase', 'qingyun-formality'],
} as const

export const CH04_ENEMY_DEFINITIONS: readonly ChapterEnemyDefinition[] = [
  {
    id: asEnemyId('enemy:ch04:gate-disciple'),
    chapterId,
    role: 'normal',
    name: '山门执事',
    readableIntent: true,
    behavior: gateDiscipleTemplate,
    moves: [
      { id: 'move:ch04:disciple:seal', name: '门规点名', kind: 'aggressive', summary: '预计造成稳定伤害，并削减 6 点架势。', weight: 3, power: 0.94, posturePower: 6 },
      { id: 'move:ch04:disciple:step', name: '按阶复核', kind: 'charge', summary: '下一击预计更重，执事已经先亮出脚下石阶。', weight: 1, power: 1.2, posturePower: 8, chargeTurns: 1 },
      { id: 'move:ch04:disciple:cloak', name: '袖口遮章', kind: 'defend', summary: '把门规挡在袖口后，本回合减少约 28% 所受伤害。', weight: 1, guardRatio: 0.28 },
    ],
    curve: {
      maxHp: { base: 90 }, maxQi: { base: 18 }, attack: { base: 13 }, defense: { base: 6 }, posture: { base: 36 },
      accuracy: { base: 0.89 }, dodge: { base: 0.06 }, crit: { base: 0.06 },
    },
  },
  {
    id: asEnemyId('enemy:ch04:mist-sword-disciple'),
    chapterId,
    role: 'normal',
    name: '雾阶剑童',
    readableIntent: true,
    behavior: mistSwordTemplate,
    moves: [
      { id: 'move:ch04:sword:step', name: '云步点剑', kind: 'aggressive', summary: '预计造成中等伤害，并削减 7 点架势。', weight: 3, power: 1.02, posturePower: 7 },
      { id: 'move:ch04:sword:mist', name: '雾里改稿', kind: 'special', summary: '预计造成轻度伤害，下一回合的命中会变得不稳定。', weight: 1, power: 0.72, posturePower: 4 },
      { id: 'move:ch04:sword:guard', name: '剑鞘端正', kind: 'defend', summary: '把剑鞘摆正护住要害，本回合减少约 32% 所受伤害。', weight: 1, guardRatio: 0.32 },
    ],
    curve: {
      maxHp: { base: 96 }, maxQi: { base: 20 }, attack: { base: 14 }, defense: { base: 5 }, posture: { base: 38 },
      accuracy: { base: 0.87 }, dodge: { base: 0.08 }, crit: { base: 0.07 },
    },
  },
  {
    id: asEnemyId('enemy:ch04:qingyun-master'),
    chapterId,
    role: 'boss',
    name: '青云掌门',
    readableIntent: true,
    specialRuleIds: ['rule:ch04:master:formal-stance'],
    presentationCueIds: ['presentation:ch04:master:defeat'],
    behavior: masterTemplate,
    moves: [
      { id: 'move:ch04:master:rule-call', name: '门规点名', kind: 'aggressive', summary: '预计造成约 23 点伤害，并削减 11 点架势。', weight: 3, power: 1.08, posturePower: 11 },
      { id: 'move:ch04:master:formal-stance', name: '礼法反噬', kind: 'special', summary: '本回合不攻击，掌门被自己过长的门规念到沉思。', weight: 1, power: 0, posturePower: 0 },
      { id: 'move:ch04:master:fan-guard', name: '折扇叠甲', kind: 'defend', summary: '借折扇和山门挡住要害，本回合减少约 30% 所受伤害。', weight: 1, guardRatio: 0.3 },
      { id: 'move:ch04:master:correction', name: '剑谱纠错', kind: 'aggressive', summary: '预计造成约 29 点伤害，并削减 13 点架势。', weight: 3, power: 1.34, posturePower: 13 },
    ],
    curve: {
      maxHp: { base: 176 }, maxQi: { base: 50 }, attack: { base: 21 }, defense: { base: 12 }, posture: { base: 56 },
      accuracy: { base: 0.9 }, dodge: { base: 0.05 }, crit: { base: 0.1 },
    },
    boss: {
      phases: [
        { id: 'phase:ch04:master:opening', phase: 1, hpThresholdRatio: 1, moveIds: ['move:ch04:master:rule-call', 'move:ch04:master:formal-stance', 'move:ch04:master:fan-guard'] },
        { id: 'phase:ch04:master:correction', phase: 2, hpThresholdRatio: 0.5, moveIds: ['move:ch04:master:correction', 'move:ch04:master:formal-stance', 'move:ch04:master:fan-guard'], deceptiveChance: 0.2 },
      ],
    },
  },
]

export const ch04EnemyDefinitions = CH04_ENEMY_DEFINITIONS
