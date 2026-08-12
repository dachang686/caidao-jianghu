import type { SkillDefinition } from '../../types/skill'

export const mouthSkills: readonly SkillDefinition[] = [
  {
    id: 'mouth:verbal-duel', name: '嘴遁', description: '按对手自尊敲架势，成功让对方短暂动摇。', school: 'mouth', target: 'enemy', qiCost: 9, cooldown: 2,
    effects: [{ type: 'posture_damage', amount: 16 }, { type: 'apply_status', statusId: 'shaken', turns: 1 }], preview: { summary: '架势伤害并施加一回合动摇', values: { posture: 16, turns: 1 } },
    aiLimit: { allowedWhen: '目标架势未满或拥有自尊标签' }, statusNotes: ['失败时应返还一半内力并进入一回合词穷'], safety: { maximumNegativeStatusTurns: 1, grantsExtraTurns: false },
  },
  {
    id: 'mouth:rumor', name: '江湖传言', description: '散播半真半假的消息，伤害不高但让敌人难以专心。', school: 'mouth', target: 'enemy', qiCost: 6, cooldown: 2,
    effects: [{ type: 'damage', power: 0.6, posturePower: 4 }, { type: 'apply_status', statusId: 'distracted', turns: 2 }], preview: { summary: '轻伤、少量架势伤害与两回合分心', values: { power: 0.6, turns: 2 } },
    aiLimit: { allowedWhen: '目标没有分心状态' }, statusNotes: ['状态持续时间有上限，不会无限叠加'], safety: { maximumNegativeStatusTurns: 2, grantsExtraTurns: false },
  },
  {
    id: 'mouth:counterargument', name: '反问三连', description: '先挡住话头，再把对手的气势顶回去。', school: 'mouth', target: 'enemy', qiCost: 7, cooldown: 2,
    effects: [{ type: 'guard', ratio: 0.3, turns: 1 }, { type: 'posture_damage', amount: 8 }], preview: { summary: '一回合减伤并反压架势', values: { guard: 0.3, posture: 8 } },
    aiLimit: { allowedWhen: '自身生命低于 70% 或敌人正在蓄力' }, statusNotes: ['减伤只覆盖本回合，不改变敌人意图'], safety: { grantsExtraTurns: false },
  },
  {
    id: 'mouth:truth-or-dare', name: '真话还是加钱', description: '用一笔内力押注对手的破绽，命中便回收部分资源。', school: 'mouth', target: 'enemy', qiCost: 12, cooldown: 3,
    effects: [{ type: 'damage', power: 0.8, posturePower: 10 }, { type: 'gain_qi', amount: 4 }], preview: { summary: '中等伤害、架势伤害并回收少量内力', values: { power: 0.8, posture: 10, qi: 4 } },
    aiLimit: { allowedWhen: '自身内力不低于 12 且目标未免疫控制' }, statusNotes: ['回收内力受最大内力限制'], safety: { grantsExtraTurns: false },
  },
]

