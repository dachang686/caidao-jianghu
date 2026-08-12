import type { PassiveDefinition, SkillDefinition } from '../../types/skill'

const active = (
  id: string,
  name: string,
  description: string,
  school: SkillDefinition['school'],
  effect: SkillDefinition['effects'][number],
  qiCost: number,
  cooldown: number,
  preview: SkillDefinition['preview'],
  prerequisiteIds: readonly string[],
): SkillDefinition => ({
  id,
  name,
  description,
  school,
  target: 'enemy',
  qiCost,
  cooldown,
  effects: [effect],
  preview,
  prerequisiteIds,
  requiredLevel: 8,
  maxRank: 3,
  aiLimit: { allowedWhen: '目标仍在场且本回合未重复使用同一终结技', maxUsesPerTurn: 1 },
  safety: { grantsExtraTurns: false, maximumHits: 1 },
})

export const OPTIONAL_ACTIVE_SKILLS: readonly SkillDefinition[] = [
  active('dao:steam-cleave', '蒸汽开刃', '借锅气把一刀拆成可控的破势窗口，强在节奏而非无条件爆发。', 'dao', { type: 'damage', power: 1.18, posturePower: 16 }, 10, 2, { summary: '中高伤害并显著压架势', values: { power: 1.18, posture: 16 } }, ['dao:heavy-chop']),
  active('dao:lid-counter', '锅盖回锋', '先承认对手的力道，再把一部分压力还回去。', 'dao', { type: 'guard', ratio: 0.3, turns: 1 }, 7, 2, { summary: '本回合减伤并为下一回合留刀位', values: { guard: 0.3 } }, ['dao:pan-breaker']),
  active('mouth:receipt-of-truth', '凭据成句', '把三条证据串成一句话，控制效果稳定但不跳过敌人回合。', 'mouth', { type: 'apply_status', statusId: 'dazed', turns: 1 }, 11, 3, { summary: '让目标沉思 1 回合', values: { turns: 1 } }, ['mouth:verbal-duel']),
  active('mouth:polite-rebuttal', '礼貌反问', '不提高音量，只让对方重新核对一次自己的意图。', 'mouth', { type: 'posture_damage', amount: 18 }, 8, 2, { summary: '稳定削减架势', values: { posture: 18 } }, ['mouth:counterargument']),
  active('survival:borrowed-breath', '借来的气口', '用一次短暂的闪身换回少量内力，收益有限但可预览。', 'survival', { type: 'gain_qi', amount: 10 }, 6, 3, { summary: '回气 10 点', values: { qi: 10 } }, ['survival:second-wind']),
  active('survival:well-timed-roll', '看准再滚', '只在敌方意图已公开时使用，短暂提高容错。', 'survival', { type: 'grant_evasion', turns: 1 }, 9, 3, { summary: '获得 1 回合闪避窗口', values: { turns: 1 } }, ['survival:roll-away']),
  active('misc:borrowed-recipe', '借谱成招', '把装备、食谱和招式的共同标签临时折成一次稳定输出。', 'misc', { type: 'damage', power: 1.05, posturePower: 8 }, 8, 2, { summary: '均衡伤害和架势压力', values: { power: 1.05, posture: 8 } }, ['misc:improvise']),
  active('misc:fourth-footnote', '第四条脚注', '给复杂局面留一条可复核的退路，不改变任务或奖励结算。', 'misc', { type: 'clear_status', count: 2 }, 6, 3, { summary: '清除最多 2 个自身负面状态', values: { count: 2 } }, ['misc:armor-disclaimer']),
]

const passive = (id: string, name: string, description: string, school: PassiveDefinition['school'], effect: PassiveDefinition['effects'][number], preview: PassiveDefinition['preview'], prerequisiteIds: readonly string[]): PassiveDefinition => ({ id, name, description, school, effects: [effect], preview, prerequisiteIds })

export const OPTIONAL_PASSIVE_SKILLS: readonly PassiveDefinition[] = [
  passive('dao:steam-temper', '蒸汽淬锋', '连续出手后才显出锋利，避免开局就把所有答案写完。', 'dao', { stat: 'attack', operation: 'add', value: 4 }, { summary: '攻击 +4', values: { attack: 4 } }, ['dao:break-window']),
  passive('mouth:source-check', '来源核对', '控制失败时不硬拗，转而获得一点架势恢复。', 'mouth', { stat: 'posture', operation: 'add', value: 5, condition: 'control_failed' }, { summary: '控制失败时架势 +5', values: { posture: 5 } }, ['mouth:public-opinion']),
  passive('survival:dry-towel', '干毛巾原则', '低血量时提高防御，仍保留可被击破的风险。', 'survival', { stat: 'defense', operation: 'add', value: 4, condition: 'low_hp' }, { summary: '低血量时防御 +4', values: { defense: 4 } }, ['survival:close-call']),
  passive('misc:ledger-of-moves', '招式流水账', '战斗外整理思路，下一次进入战斗时多一点内力余量。', 'misc', { stat: 'maxQi', operation: 'add', value: 8, condition: 'out_of_combat' }, { summary: '战斗外最大内力 +8', values: { maxQi: 8 } }, ['misc:borrowed-knowledge']),
]
