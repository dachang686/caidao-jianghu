import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import { asChapterId, asEnemyId } from '../../types/ids'

const chapterId = asChapterId('ch05')
const normal = (id: string, name: string, tag: string, power: number, posture: number): ChapterEnemyDefinition => ({
  id: asEnemyId(`enemy:ch05:${id}`), chapterId, role: 'normal', name, readableIntent: true,
  behavior: { id: `template:ch05:${id}`, name: `${name}的驿路套路`, moveIds: [`move:ch05:${id}:strike`, `move:ch05:${id}:guard`, `move:ch05:${id}:dust`], fallbackMoveId: `move:ch05:${id}:strike`, tags: ['honest-intent', 'normal', tag] },
  moves: [
    { id: `move:ch05:${id}:strike`, name: '车辙突进', kind: 'aggressive', summary: `预计造成稳定伤害，并削减 ${posture} 点架势。`, weight: 3, power, posturePower: posture },
    { id: `move:ch05:${id}:guard`, name: '货箱遮身', kind: 'defend', summary: '借货箱挡住要害，本回合减少约 30% 所受伤害。', weight: 1, guardRatio: .3 },
    { id: `move:ch05:${id}:dust`, name: '沙尘改道', kind: 'special', summary: '预计造成轻度伤害，下一回合命中会变得不稳定。', weight: 1, power: .7, posturePower: 4 },
  ],
  curve: { maxHp: { base: id === 'road-raider' ? 104 : 110 }, maxQi: { base: 22 }, attack: { base: 15 }, defense: { base: 7 }, posture: { base: 40 }, accuracy: { base: .88 }, dodge: { base: .07 }, crit: { base: .07 } },
})

const bossBehavior = { id: 'template:ch05:twin-bandits', name: '一明一暗的驿路双煞', moveIds: ['move:ch05:twin:seal', 'move:ch05:twin:swap', 'move:ch05:twin:guard', 'move:ch05:twin:double'], fallbackMoveId: 'move:ch05:twin:seal', tags: ['honest-intent', 'boss', 'readable-phase', 'paired-turns'] } as const
export const CH05_ENEMY_DEFINITIONS: readonly ChapterEnemyDefinition[] = [
  normal('road-raider', '车辙劫匪', 'road', 1.02, 7),
  normal('masked-raider', '蒙面驿盗', 'masked', 1.08, 8),
  {
    id: asEnemyId('enemy:ch05:twin-bandits'), chapterId, role: 'boss', name: '驿路双煞', readableIntent: true,
    specialRuleIds: ['rule:ch05:twin:swap'], presentationCueIds: ['presentation:ch05:twin:defeat'], behavior: bossBehavior,
    moves: [
      { id: 'move:ch05:twin:seal', name: '双线封条', kind: 'aggressive', summary: '预计造成约 25 点伤害，并削减 11 点架势。', weight: 3, power: 1.12, posturePower: 11 },
      { id: 'move:ch05:twin:swap', name: '调包换位', kind: 'special', summary: '双煞交换站位，本回合不攻击并让下一次意图更难判断。', weight: 1, power: 0, posturePower: 0 },
      { id: 'move:ch05:twin:guard', name: '货箱叠甲', kind: 'defend', summary: '用两只货箱挡住要害，本回合减少约 28% 所受伤害。', weight: 1, guardRatio: .28 },
      { id: 'move:ch05:twin:double', name: '一明一暗', kind: 'aggressive', summary: '预计造成约 31 点伤害，并削减 13 点架势。', weight: 3, power: 1.38, posturePower: 13 },
    ],
    curve: { maxHp: { base: 190 }, maxQi: { base: 54 }, attack: { base: 22 }, defense: { base: 13 }, posture: { base: 58 }, accuracy: { base: .9 }, dodge: { base: .06 }, crit: { base: .1 } },
    boss: { phases: [{ id: 'phase:ch05:twin:opening', phase: 1, hpThresholdRatio: 1, moveIds: ['move:ch05:twin:seal', 'move:ch05:twin:swap', 'move:ch05:twin:guard'] }, { id: 'phase:ch05:twin:double', phase: 2, hpThresholdRatio: .5, moveIds: ['move:ch05:twin:double', 'move:ch05:twin:swap', 'move:ch05:twin:guard'], deceptiveChance: .2 }] },
  },
]
export const ch05EnemyDefinitions = CH05_ENEMY_DEFINITIONS
