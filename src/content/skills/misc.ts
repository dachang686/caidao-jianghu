import type { SkillDefinition } from '../../types/skill'

export const miscSkills: readonly SkillDefinition[] = [
  {
    id: 'misc:baijiu', name: '二锅头', description: '两回合攻击更凶但命中变差，失手也会敲出一点架势。', school: 'misc', target: 'enemy', qiCost: 7, cooldown: 3,
    effects: [{ type: 'damage', power: 1.05, posturePower: 3, variance: 0.08 }, { type: 'modify_accuracy', delta: -0.15, turns: 2 }, { type: 'apply_status', statusId: 'tipsy', turns: 2 }], preview: { summary: '攻击强化的酒意与命中下降同时生效', values: { power: 1.05, accuracyDelta: -0.15, turns: 2 } },
    aiLimit: { allowedWhen: '两回合内未饮酒且目标没有免疫反馈' }, statusNotes: ['落空仍保留少量架势反馈，不会让回合完全无收益'], safety: { maximumNegativeStatusTurns: 2, grantsExtraTurns: false },
  },
  {
    id: 'misc:expired-panacea', name: '过期大还丹', description: '立即治疗，但下一回合技能内力消耗增加，肚中开会。', school: 'misc', target: 'self', qiCost: 10, cooldown: 3,
    effects: [{ type: 'heal', amount: 25 }, { type: 'modify_qi_cost', amount: 4, turns: 1 }, { type: 'apply_status', statusId: 'belly-meeting', turns: 1 }], preview: { summary: '治疗并使下一回合技能消耗增加', values: { heal: 25, nextQiCost: 4, turns: 1 } },
    aiLimit: { allowedWhen: '自身生命低于 60% 且下一回合仍有可用内力' }, statusNotes: ['负面效果只持续一回合且不会致死'], safety: { maximumNegativeStatusTurns: 1, grantsExtraTurns: false },
  },
  {
    id: 'misc:armor-disclaimer', name: '先叠甲', description: '先把免责声明叠满，获得护盾但本回合攻击意愿下降。', school: 'misc', target: 'self', qiCost: 5, cooldown: 2,
    effects: [{ type: 'guard', ratio: 0.55, turns: 1 }, { type: 'modify_accuracy', delta: -0.1, turns: 1 }, { type: 'apply_status', statusId: 'disclaimer', turns: 1 }], preview: { summary: '本回合减伤与攻击惩罚同时显示', values: { guard: 0.55, accuracyDelta: -0.1, turns: 1 } },
    aiLimit: { allowedWhen: '预计承受高额伤害且本回合不追求收尾' }, statusNotes: ['动画可跳过，实际减伤在释放前展示'], safety: { maximumNegativeStatusTurns: 1, grantsExtraTurns: false },
  },
  {
    id: 'misc:improvise', name: '临场发挥', description: '把手边的江湖杂学拼起来，少量输出并稳定回气。', school: 'misc', target: 'enemy', qiCost: 3, cooldown: 1,
    effects: [{ type: 'damage', power: 0.45, posturePower: 4 }, { type: 'gain_qi', amount: 2 }], preview: { summary: '低成本小伤害、架势反馈与少量回气', values: { power: 0.45, posture: 4, qi: 2 } },
    aiLimit: { allowedWhen: '任意可行动回合，优先用于填补冷却空档' }, statusNotes: ['回气受最大内力限制，不形成无限资源'], safety: { grantsExtraTurns: false },
  },
]

