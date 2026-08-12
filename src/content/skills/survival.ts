import type { SkillDefinition } from '../../types/skill'

export const survivalSkills: readonly SkillDefinition[] = [
  {
    id: 'survival:play-dead', name: '装死', description: '消耗一回合装作退出江湖，下一回合获得反击窗口。', school: 'survival', target: 'self', qiCost: 4, cooldown: 3,
    effects: [{ type: 'guard', ratio: 0.8, turns: 1 }, { type: 'apply_status', statusId: 'ignored', turns: 1 }], preview: { summary: '本回合高减伤并获得下回合反击标记', values: { guard: 0.8, turns: 1 } },
    aiLimit: { allowedWhen: '本回合未行动且敌人未处于胜利结算' }, statusNotes: ['Boss 只降低本回合伤害，不跳过阶段'], safety: { maximumNegativeStatusTurns: 1, grantsExtraTurns: false },
  },
  {
    id: 'survival:iron-head', name: '铁头功', description: '拿一点血量买架势反击，绝不把自己打到一滴没有。', school: 'survival', target: 'enemy', qiCost: 5, cooldown: 2,
    effects: [{ type: 'self_damage', maxHpRatio: 0.08 }, { type: 'posture_damage', amount: 22 }], preview: { summary: '安全自伤后造成高额架势伤害', values: { selfDamageRatio: 0.08, posture: 22, minimumHp: 1 } },
    aiLimit: { allowedWhen: '自身生命高于 8% 且目标架势未破' }, statusNotes: ['自伤不能致死，最低保留 1 点生命'], safety: { maxSelfDamageRatio: 0.08, minimumHpAfterSelfDamage: 1, grantsExtraTurns: false },
  },
  {
    id: 'survival:roll-away', name: '借坡下驴', description: '顺势后撤，清掉一个控制并留下一回合闪避。', school: 'survival', target: 'self', qiCost: 6, cooldown: 2,
    effects: [{ type: 'clear_status', count: 1 }, { type: 'grant_evasion', turns: 1 }], preview: { summary: '清除一个控制并获得一回合闪避', values: { clear: 1, evasionTurns: 1 } },
    aiLimit: { allowedWhen: '自身存在控制或架势低于 30%' }, statusNotes: ['Boss 战中不等同逃跑，不重置生命或阶段'], safety: { grantsExtraTurns: false },
  },
  {
    id: 'survival:second-wind', name: '喘口气', description: '把狼狈的停顿变成有限治疗和内力回气。', school: 'survival', target: 'self', qiCost: 8, cooldown: 4,
    effects: [{ type: 'heal', amount: 18 }, { type: 'gain_qi', amount: 6 }, { type: 'apply_status', statusId: 'tired', turns: 1 }], preview: { summary: '治疗、回气并承受一回合疲劳', values: { heal: 18, qi: 6, tiredTurns: 1 } },
    aiLimit: { allowedWhen: '自身生命低于 55%' }, statusNotes: ['治疗与回气均受资源上限限制'], safety: { maximumNegativeStatusTurns: 1, grantsExtraTurns: false },
  },
]

