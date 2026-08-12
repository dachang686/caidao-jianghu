import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import { asChapterId, asEnemyId } from '../../types/ids'

const chapterId = asChapterId('ch02')

const rankingTemplate = {
  id: 'template:ch02:ranking-scribe',
  name: '照章抄写',
  moveIds: ['move:ch02:scribe:brush', 'move:ch02:scribe:ledger-guard'],
  fallbackMoveId: 'move:ch02:scribe:brush',
  tags: ['honest-intent', 'normal', 'ranking-board'],
} as const

const bridgeTemplate = {
  id: 'template:ch02:bridge-skulker',
  name: '先躲桥柱再探头',
  moveIds: ['move:ch02:skulker:umbrella', 'move:ch02:skulker:dash', 'move:ch02:skulker:placard'],
  fallbackMoveId: 'move:ch02:skulker:umbrella',
  tags: ['honest-intent', 'normal', 'riverfront'],
} as const

const bangsiTemplate = {
  id: 'template:ch02:bangsi',
  name: '公文盖章的三种姿势',
  moveIds: ['move:ch02:bangsi:seal', 'move:ch02:bangsi:blank-ledger', 'move:ch02:bangsi:guard'],
  fallbackMoveId: 'move:ch02:bangsi:seal',
  tags: ['honest-intent', 'boss', 'readable-phase', 'official-paperwork'],
} as const

export const CH02_ENEMY_DEFINITIONS: readonly ChapterEnemyDefinition[] = [
  {
    id: asEnemyId('enemy:ch02:ranking-scribe'),
    chapterId,
    role: 'normal',
    name: '榜纸抄手',
    readableIntent: true,
    behavior: rankingTemplate,
    moves: [
      { id: 'move:ch02:scribe:brush', name: '朱笔横批', kind: 'aggressive', summary: '预计造成稳定伤害，并削减 6 点架势。', weight: 3, power: 0.92, posturePower: 6 },
      { id: 'move:ch02:scribe:ledger-guard', name: '合册护身', kind: 'defend', summary: '把账册合上，本回合减少约 35% 所受伤害。', weight: 1, guardRatio: 0.35 },
    ],
    curve: {
      maxHp: { base: 78 }, maxQi: { base: 14 }, attack: { base: 11 }, defense: { base: 5 }, posture: { base: 34 },
      accuracy: { base: 0.88 }, dodge: { base: 0.05 }, crit: { base: 0.05 },
    },
  },
  {
    id: asEnemyId('enemy:ch02:bridge-skulker'),
    chapterId,
    role: 'normal',
    name: '桥边扒手',
    readableIntent: true,
    behavior: bridgeTemplate,
    moves: [
      { id: 'move:ch02:skulker:umbrella', name: '油纸伞戳', kind: 'aggressive', summary: '预计造成轻度伤害，并削减 5 点架势。', weight: 3, power: 0.86, posturePower: 5 },
      { id: 'move:ch02:skulker:dash', name: '踩水扑来', kind: 'charge', summary: '下一击预计更重，提前看见蓄力就能躲。', weight: 1, power: 1.24, posturePower: 8, chargeTurns: 1 },
      { id: 'move:ch02:skulker:placard', name: '躲到榜牌后', kind: 'defend', summary: '借榜牌遮脸，本回合减少约 25% 所受伤害。', weight: 1, guardRatio: 0.25 },
    ],
    curve: {
      maxHp: { base: 72 }, maxQi: { base: 16 }, attack: { base: 12 }, defense: { base: 4 }, posture: { base: 30 },
      accuracy: { base: 0.9 }, dodge: { base: 0.08 }, crit: { base: 0.06 },
    },
  },
  {
    id: asEnemyId('enemy:ch02:bangsi'),
    chapterId,
    role: 'boss',
    name: '榜下捕快',
    readableIntent: true,
    specialRuleIds: ['rule:ch02:bangsi:blank-ledger'],
    presentationCueIds: ['presentation:ch02:bangsi:defeat'],
    behavior: bangsiTemplate,
    moves: [
      { id: 'move:ch02:bangsi:seal', name: '红印落榜', kind: 'aggressive', summary: '预计造成约 19 点伤害，并削减 10 点架势。', weight: 3, power: 1.05, posturePower: 10 },
      { id: 'move:ch02:bangsi:blank-ledger', name: '空白卷宗', kind: 'special', summary: '本回合不攻击，捕快会被空白卷宗卡住。', weight: 1, power: 0, posturePower: 0 },
      { id: 'move:ch02:bangsi:guard', name: '公文叠甲', kind: 'defend', summary: '用卷宗挡住要害，本回合减少约 30% 所受伤害。', weight: 1, guardRatio: 0.3 },
      { id: 'move:ch02:bangsi:reversal', name: '反盖一印', kind: 'aggressive', summary: '预计造成约 24 点伤害，并削减 12 点架势。', weight: 3, power: 1.32, posturePower: 12 },
    ],
    curve: {
      maxHp: { base: 145 }, maxQi: { base: 44 }, attack: { base: 18 }, defense: { base: 10 }, posture: { base: 50 },
      accuracy: { base: 0.89 }, dodge: { base: 0.05 }, crit: { base: 0.1 },
    },
    boss: {
      phases: [
        { id: 'phase:ch02:bangsi:opening', phase: 1, hpThresholdRatio: 1, moveIds: ['move:ch02:bangsi:seal', 'move:ch02:bangsi:blank-ledger', 'move:ch02:bangsi:guard'] },
        { id: 'phase:ch02:bangsi:reversal', phase: 2, hpThresholdRatio: 0.5, moveIds: ['move:ch02:bangsi:reversal', 'move:ch02:bangsi:blank-ledger', 'move:ch02:bangsi:guard'], deceptiveChance: 0.2 },
      ],
    },
  },
]

export const ch02EnemyDefinitions = CH02_ENEMY_DEFINITIONS
