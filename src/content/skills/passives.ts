import type { PassiveDefinition } from '../../types/skill'

export const passiveSkills: readonly PassiveDefinition[] = [
  {
    id: 'dao:edge-balance', name: '刀口平衡', description: '每一刀都留出下一刀的位置，稳定提升攻击与命中。', school: 'dao',
    effects: [{ stat: 'attack', operation: 'add', value: 3 }, { stat: 'accuracy', operation: 'add', value: 0.04 }], preview: { summary: '攻击 +3，命中 +4%', values: { attack: 3, accuracy: 0.04 } },
  },
  {
    id: 'dao:break-window', name: '破绽窗口', description: '敌人架势破碎时，菜刀更懂得顺势落点。', school: 'dao', prerequisiteIds: ['dao:edge-balance'],
    effects: [{ stat: 'damageWhenPostureBroken', operation: 'add', value: 0.12, condition: 'posture_broken' }, { stat: 'posture', operation: 'add', value: 5 }], preview: { summary: '破防窗口伤害 +12%，架势 +5', values: { brokenDamage: 0.12, posture: 5 } },
  },
  {
    id: 'mouth:save-face', name: '给台阶下', description: '嘴上输了也不至于气竭，控制失败时回一口内力。', school: 'mouth',
    effects: [{ stat: 'qiRecovery', operation: 'add', value: 2, condition: 'control_failed' }, { stat: 'defense', operation: 'add', value: 2 }], preview: { summary: '控制失败时回气 +2，防御 +2', values: { failedQi: 2, defense: 2 } },
  },
  {
    id: 'mouth:public-opinion', name: '舆论先手', description: '先把话说圆，面对架势未稳的敌人更容易命中要害。', school: 'mouth', prerequisiteIds: ['mouth:save-face'],
    effects: [{ stat: 'accuracy', operation: 'multiply', value: 0.08, condition: 'posture_broken' }, { stat: 'damageWhenPostureBroken', operation: 'add', value: 0.08, condition: 'posture_broken' }], preview: { summary: '破防时命中 +8%，伤害 +8%', values: { accuracy: 0.08, damage: 0.08 } },
  },
  {
    id: 'survival:thick-skin', name: '厚脸皮', description: '挨打归挨打，先把血条做得耐用一点。', school: 'survival',
    effects: [{ stat: 'maxHp', operation: 'multiply', value: 0.08 }, { stat: 'defense', operation: 'add', value: 2 }], preview: { summary: '最大生命 +8%，防御 +2', values: { maxHp: 0.08, defense: 2 } },
  },
  {
    id: 'survival:close-call', name: '险中求生', description: '血线见底时反而更会闪，鼓励看清意图后再冒险。', school: 'survival', prerequisiteIds: ['survival:thick-skin'],
    effects: [{ stat: 'dodge', operation: 'add', value: 0.12, condition: 'low_hp' }, { stat: 'healingMultiplier', operation: 'add', value: 0.1, condition: 'low_hp' }], preview: { summary: '低血量时闪避 +12%，治疗 +10%', values: { lowHpRatio: 0.35, dodge: 0.12, healing: 0.1 } },
  },
  {
    id: 'misc:field-cook', name: '边打边吃', description: '把江湖经验折成实用的回气与治疗效率。', school: 'misc',
    effects: [{ stat: 'healingMultiplier', operation: 'add', value: 0.1 }, { stat: 'qiRecovery', operation: 'add', value: 1 }], preview: { summary: '治疗效率 +10%，回气 +1', values: { healing: 0.1, qiRecovery: 1 } },
  },
  {
    id: 'misc:borrowed-knowledge', name: '杂学旁通', description: '什么都学一点，架势与暴击各留一条可用的退路。', school: 'misc', mutuallyExclusiveIds: ['dao:break-window'],
    effects: [{ stat: 'crit', operation: 'add', value: 0.05 }, { stat: 'posture', operation: 'add', value: 4 }, { stat: 'maxQi', operation: 'add', value: 6 }], preview: { summary: '暴击 +5%，架势 +4，最大内力 +6', values: { crit: 0.05, posture: 4, maxQi: 6 } },
  },
]

export const CORE_PASSIVE_SKILLS = passiveSkills

