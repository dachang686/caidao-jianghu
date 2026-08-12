import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import { asChapterId, asEnemyId } from '../../types/ids'

const chapterId = asChapterId('ch01')

const straightTemplate = {
  id: 'template:ch01:straightforward',
  name: '直来直往',
  moveIds: ['move:ch01:thug:slap', 'move:ch01:thug:brace'],
  fallbackMoveId: 'move:ch01:thug:slap',
  tags: ['honest-intent', 'normal'],
} as const

const quickTemplate = {
  id: 'template:ch01:quick-feint',
  name: '先试探再扑上来',
  moveIds: ['move:ch01:pickpocket:scratch', 'move:ch01:pickpocket:charge', 'move:ch01:pickpocket:duck'],
  fallbackMoveId: 'move:ch01:pickpocket:scratch',
  tags: ['honest-intent', 'normal'],
} as const

const baiTemplate = {
  id: 'template:ch01:bai-daxia',
  name: '名门正派的三成认真',
  moveIds: ['move:ch01:bai:palm', 'move:ch01:bai:windmill', 'move:ch01:bai:brace'],
  fallbackMoveId: 'move:ch01:bai:palm',
  tags: ['honest-intent', 'boss', 'readable-phase'],
} as const

export const CH01_ENEMY_DEFINITIONS: readonly ChapterEnemyDefinition[] = [
  {
    id: asEnemyId('enemy:ch01:river-thug'),
    chapterId,
    role: 'normal',
    name: '河边醉汉',
    readableIntent: true,
    behavior: straightTemplate,
    moves: [
      { id: 'move:ch01:thug:slap', name: '横着拍', kind: 'aggressive', summary: '预计造成轻度伤害，并削减 6 点架势。', weight: 3, power: 0.9, posturePower: 6 },
      { id: 'move:ch01:thug:brace', name: '抱坛叠甲', kind: 'defend', summary: '本回合减少约 35% 所受伤害。', weight: 1, guardRatio: 0.35 },
    ],
    curve: {
      maxHp: { base: 72 }, maxQi: { base: 12 }, attack: { base: 10 }, defense: { base: 4 }, posture: { base: 32 },
      accuracy: { base: 0.86 }, dodge: { base: 0.04 }, crit: { base: 0.04 },
    },
  },
  {
    id: asEnemyId('enemy:ch01:pantry-pickpocket'),
    chapterId,
    role: 'normal',
    name: '后厨扒手',
    readableIntent: true,
    behavior: quickTemplate,
    moves: [
      { id: 'move:ch01:pickpocket:scratch', name: '抄锅铲', kind: 'aggressive', summary: '预计造成稳定伤害，并削减 4 点架势。', weight: 3, power: 0.82, posturePower: 4 },
      { id: 'move:ch01:pickpocket:charge', name: '蓄力扑灶', kind: 'charge', summary: '下一击预计更重，提前看见蓄力就能躲。', weight: 1, power: 1.22, posturePower: 8, chargeTurns: 1 },
      { id: 'move:ch01:pickpocket:duck', name: '钻进米缸', kind: 'defend', summary: '本回合减少约 25% 所受伤害。', weight: 1, guardRatio: 0.25 },
    ],
    curve: {
      maxHp: { base: 66 }, maxQi: { base: 16 }, attack: { base: 11 }, defense: { base: 3 }, posture: { base: 28 },
      accuracy: { base: 0.9 }, dodge: { base: 0.08 }, crit: { base: 0.06 },
    },
  },
  {
    id: asEnemyId('enemy:bai-daxia'),
    chapterId,
    role: 'boss',
    name: '白大侠',
    readableIntent: true,
    specialRuleIds: ['rule:ch01:bai:windmill'],
    presentationCueIds: ['presentation:ch01:bai:defeat'],
    behavior: baiTemplate,
    moves: [
      { id: 'move:ch01:bai:palm', name: '降龙十巴掌', kind: 'aggressive', summary: '预计造成约 18 点伤害，并削减 10 点架势。', weight: 3, power: 1.05, posturePower: 10 },
      { id: 'move:ch01:bai:windmill', name: '无敌风火轮', kind: 'special', summary: '白大侠会原地转晕，本回合不造成伤害。', weight: 1, power: 0, posturePower: 0 },
      { id: 'move:ch01:bai:brace', name: '名门叠甲', kind: 'defend', summary: '本回合减少约 30% 所受伤害。', weight: 1, guardRatio: 0.3 },
      { id: 'move:ch01:bai:serious-palm', name: '认真三成', kind: 'aggressive', summary: '预计造成约 23 点伤害，并削减 12 点架势。', weight: 3, power: 1.32, posturePower: 12 },
    ],
    curve: {
      maxHp: { base: 130 }, maxQi: { base: 40 }, attack: { base: 17 }, defense: { base: 11 }, posture: { base: 48 },
      accuracy: { base: 0.88 }, dodge: { base: 0.04 }, crit: { base: 0.1 },
    },
    boss: {
      phases: [
        { id: 'phase:ch01:bai:opening', phase: 1, hpThresholdRatio: 1, moveIds: ['move:ch01:bai:palm', 'move:ch01:bai:windmill', 'move:ch01:bai:brace'] },
        { id: 'phase:ch01:bai:serious', phase: 2, hpThresholdRatio: 0.5, moveIds: ['move:ch01:bai:serious-palm', 'move:ch01:bai:windmill', 'move:ch01:bai:brace'], deceptiveChance: 0.2 },
      ],
    },
  },
]

export const ch01EnemyDefinitions = CH01_ENEMY_DEFINITIONS
