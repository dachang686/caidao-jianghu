import type { RuleComedyDefinition } from '../../types/comedy'

/** 小愚村的规则笑点复用战斗真实意图预览，不建立第二套伤害公式。 */
export const ch01RuleComedyDefinitions: readonly RuleComedyDefinition[] = [
  {
    id: 'rule:ch01:honest-intent',
    mechanicId: 'battle.intent.preview',
    mechanicType: 'enemy_behavior',
    previewStatKeys: ['expectedDamage', 'expectedPostureDamage'],
    aiRestrictions: ['敌方意图必须先显示', '规则反馈不得改变实际伤害'],
    presentationCueId: 'cue:ch01:honest-intent:static',
  },
  {
    id: 'rule:ch01:bai:windmill',
    mechanicId: 'battle.bai.windmill',
    mechanicType: 'enemy_behavior',
    previewStatKeys: ['expectedDamage', 'expectedPostureDamage'],
    aiRestrictions: ['风火轮必须作为可读意图显示', '风火轮只跳过白大侠本回合攻击，不改变阶段或奖励'],
    presentationCueId: 'cue:ch01:bai:windmill:static',
  },
]

export const CORE_CH01_RULES = ch01RuleComedyDefinitions

export const ch02RuleComedyDefinitions: readonly RuleComedyDefinition[] = [
  {
    id: 'rule:ch02:bangsi:blank-ledger',
    mechanicId: 'battle.bangsi.blank-ledger',
    mechanicType: 'enemy_behavior',
    previewStatKeys: ['expectedDamage', 'expectedPostureDamage'],
    aiRestrictions: ['空白卷宗必须先作为可读意图显示', '空白卷宗只跳过捕快本回合攻击，不改变阶段或奖励'],
    presentationCueId: 'cue:ch02:bangsi:blank-ledger:static',
  },
]

export const CORE_CH02_RULES = ch02RuleComedyDefinitions

export const ch03RuleComedyDefinitions: readonly RuleComedyDefinition[] = [
  {
    id: 'rule:ch03:leader:empty-banner',
    mechanicId: 'battle.blackwind-leader.empty-banner',
    mechanicType: 'enemy_behavior',
    previewStatKeys: ['expectedDamage', 'expectedPostureDamage'],
    aiRestrictions: ['空旗反卷必须先作为可读意图显示', '空旗反卷只跳过寨主本回合攻击，不改变阶段或奖励'],
    presentationCueId: 'cue:ch03:leader:empty-banner:static',
  },
]

export const CORE_CH03_RULES = ch03RuleComedyDefinitions

export const ch04RuleComedyDefinitions: readonly RuleComedyDefinition[] = [
  {
    id: 'rule:ch04:master:formal-stance',
    mechanicId: 'battle.qingyun-master.formal-stance',
    mechanicType: 'enemy_behavior',
    previewStatKeys: ['expectedDamage', 'expectedPostureDamage'],
    aiRestrictions: ['礼法反噬必须先作为可读意图显示', '礼法反噬只跳过掌门本回合攻击，不改变阶段或奖励'],
    presentationCueId: 'cue:ch04:master:formal-stance:static',
  },
]

export const CORE_CH04_RULES = ch04RuleComedyDefinitions

export const ch05RuleComedyDefinitions: readonly RuleComedyDefinition[] = [{ id: 'rule:ch05:twin:swap', mechanicId: 'battle.twin-bandits.swap', mechanicType: 'enemy_behavior', previewStatKeys: ['expectedDamage', 'expectedPostureDamage'], aiRestrictions: ['调包换位必须先作为可读意图显示', '调包换位只跳过双煞本回合攻击，不改变阶段或奖励'], presentationCueId: 'cue:ch05:twin:swap:static' }]
export const CORE_CH05_RULES = ch05RuleComedyDefinitions
export const ch06RuleComedyDefinitions: readonly RuleComedyDefinition[] = [{ id: 'rule:ch06:tide:bell', mechanicId: 'battle.tide-master.bell', mechanicType: 'enemy_behavior', previewStatKeys: ['expectedDamage', 'expectedPostureDamage'], aiRestrictions: ['带货涨潮必须先作为可读意图显示', '带货涨潮只跳过帮主本回合攻击，不改变阶段或奖励'], presentationCueId: 'cue:ch06:tide:bell:static' }]
export const CORE_CH06_RULES = ch06RuleComedyDefinitions
export const ch07RuleComedyDefinitions: readonly RuleComedyDefinition[] = [{ id: 'rule:ch07:governor:publish', mechanicId: 'battle.ranking-governor.publish', mechanicType: 'enemy_behavior', previewStatKeys: ['expectedDamage', 'expectedPostureDamage'], aiRestrictions: ['榜文模糊必须先作为可读意图显示', '榜文模糊只跳过督主本回合攻击，不改变阶段或奖励'], presentationCueId: 'cue:ch07:governor:publish:static' }]
export const CORE_CH07_RULES = ch07RuleComedyDefinitions
export const ch08RuleComedyDefinitions: readonly RuleComedyDefinition[] = [{ id: 'rule:ch08:master:verdict', mechanicId: 'battle.ranking-master.verdict', mechanicType: 'enemy_behavior', previewStatKeys: ['expectedDamage', 'expectedPostureDamage'], aiRestrictions: ['暂不定义必须先作为可读意图显示', '暂不定义只跳过榜主本回合攻击，不改变阶段或奖励'], presentationCueId: 'cue:ch08:master:verdict:static' }]
export const CORE_CH08_RULES = ch08RuleComedyDefinitions
