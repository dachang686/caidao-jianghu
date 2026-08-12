import type { SkillDefinition } from '../../types/skill'

export const daoSkills: readonly SkillDefinition[] = [
  {
    id: 'dao:blade-dance', name: '菜刀乱舞', description: '连续挥刀，末段命中才把架势砍出节拍。', school: 'dao', target: 'enemy', qiCost: 8, cooldown: 2,
    effects: [{ type: 'damage', power: 0.72, posturePower: 3, hits: 3, variance: 0.05 }], preview: { summary: '三段伤害，预计末段额外压架势', values: { hits: 3, power: 0.72 } },
    aiLimit: { allowedWhen: '目标未倒地且本回合未使用多段技', maxUsesPerTurn: 1 }, statusNotes: ['末段只影响架势表现，不会丢失武器'], safety: { maximumHits: 3, grantsExtraTurns: false },
  },
  {
    id: 'dao:heavy-chop', name: '重刃压顶', description: '牺牲一点节奏换来结实的一刀。', school: 'dao', target: 'enemy', qiCost: 6, cooldown: 1,
    effects: [{ type: 'damage', power: 1.45, posturePower: 8, variance: 0.05 }], preview: { summary: '高额单段伤害与架势伤害', values: { power: 1.45, posture: 8 } },
    aiLimit: { allowedWhen: '敌人未处于无敌阶段' }, statusNotes: ['普通攻击仍可在未破防时造成有效伤害'], safety: { grantsExtraTurns: false },
  },
  {
    id: 'dao:pan-breaker', name: '锅底破阵', description: '专门敲架势，像给铁锅做耐久测试。', school: 'dao', target: 'enemy', qiCost: 7, cooldown: 2,
    effects: [{ type: 'damage', power: 0.55, posturePower: 5 }, { type: 'posture_damage', amount: 15 }], preview: { summary: '中等伤害，重点削减架势', values: { power: 0.55, posture: 15 } },
    aiLimit: { allowedWhen: '敌人架势高于 0' }, statusNotes: ['破防后只改变受伤窗口，不跳过敌人胜负判定'], safety: { grantsExtraTurns: false },
  },
  {
    id: 'dao:finishing-cut', name: '收摊一刀', description: '敌人血线见底时收拾残局，不能替代正常破防。', school: 'dao', target: 'enemy', qiCost: 10, cooldown: 3,
    effects: [{ type: 'damage', power: 1.8, posturePower: 5, variance: 0.03 }], preview: { summary: '低血线目标的高额收尾伤害', values: { power: 1.8, recommendedTargetHpRatio: 0.4 } },
    aiLimit: { allowedWhen: '目标生命低于 40%' }, statusNotes: ['不改变敌人阶段与奖励判定'], safety: { grantsExtraTurns: false },
  },
]

