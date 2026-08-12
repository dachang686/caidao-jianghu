import type { UnlockableDefinition } from '../types/unlockable'
import { OPTIONAL_UNLOCKABLES } from './unlockables-optional'

/**
 * M1 的图鉴目录只收录当前 Demo 已经能触发的条目。
 * 条件、事件和奖励声明在内容层，解锁与派生逻辑留在 systems/unlocks。
 */
export const CORE_UNLOCKABLES = [
  {
    id: 'npc:old-man',
    kind: 'npc',
    name: '不正经老头',
    description: '村口那位把学费先欠着的前辈。',
    clue: '村口有个人影，正用扇子给自己扇灰。',
    eventRules: [{ type: 'npc.first_seen', payload: { npcId: 'old-man' } }],
  },
  {
    id: 'npc:aunt',
    kind: 'npc',
    name: '王大娘',
    description: '她的猫比她本人更会讨价还价。',
    clue: '一声着急的喊猫声，从客栈后院传来。',
    eventRules: [{ type: 'npc.first_seen', payload: { npcId: 'aunt' } }],
  },
  {
    id: 'npc:cat',
    kind: 'npc',
    name: '大黄猫',
    description: '不接受道德劝说，只接受咸鱼干。',
    clue: '屋檐上有两只眼睛，正在评估你的诚意。',
    eventRules: [{ type: 'npc.first_seen', payload: { npcId: 'cat' } }],
  },
  {
    id: 'npc:bai',
    kind: 'npc',
    name: '白大侠',
    description: '擂台上的名门正派，认真三成已经很认真。',
    clue: '擂台边有人拍着胸口，宣称自己只用三成功力。',
    eventRules: [{ type: 'npc.first_seen', payload: { npcId: 'bai' } }],
  },
  {
    id: 'enemy:bai-daxia',
    kind: 'enemy',
    name: '白大侠·擂主',
    description: '他输给了菜刀，也输给了自己的开场白。',
    clue: '擂台上立着一块被掌风震歪的木牌。',
    eventRules: [{ type: 'enemy.defeated', payload: { enemyId: 'bai-daxia' } }],
  },
  {
    id: 'skill:basicSlash',
    kind: 'skill',
    name: '菜刀直劈',
    description: '朴实无华，胜在刀是真的。',
    clue: '有人在厨房里练习把空气切成两半。',
    eventRules: [
      { type: 'skill.obtained', payload: { skillId: 'basicSlash' } },
      { type: 'skill.used', payload: { skillId: 'basicSlash' } },
    ],
  },
  {
    id: 'skill:cleaverWhirl',
    kind: 'skill',
    name: '菜刀旋风',
    description: '转得很有气势，停下来时也很有晕感。',
    clue: '地上的菜叶围成了一个不太标准的圆。',
    eventRules: [
      { type: 'skill.obtained', payload: { skillId: 'cleaverWhirl' } },
      { type: 'skill.used', payload: { skillId: 'cleaverWhirl' } },
    ],
  },
  {
    id: 'skill:mockery',
    kind: 'skill',
    name: '歪理嘲讽',
    description: '让对手先破防，至于物理防御稍后再说。',
    clue: '擂台边传来一段令人无法反驳的歪理。',
    eventRules: [
      { type: 'skill.obtained', payload: { skillId: 'mockery' } },
      { type: 'skill.used', payload: { skillId: 'mockery' } },
    ],
  },
  {
    id: 'skill:playDead',
    kind: 'skill',
    name: '装死大法',
    description: '不是逃跑，是给敌人一个重新思考人生的机会。',
    clue: '地上躺着一个人，呼吸声比旁边的猫还大。',
    eventRules: [
      { type: 'skill.obtained', payload: { skillId: 'playDead' } },
      { type: 'skill.used', payload: { skillId: 'playDead' } },
    ],
  },
  {
    id: 'title:cleaverNovice',
    kind: 'title',
    name: '菜刀新秀',
    description: '终于不是拿菜刀比划空气了。',
    clue: '一块木牌上刻着「刀法尚可，切菜更佳」。',
    eventRules: [{ type: 'title.earned', payload: { titleId: 'cleaverNovice' } }],
    titleBonus: { attack: 1 },
  },
  {
    id: 'title:catScratchTrial',
    kind: 'title',
    name: '猫爪试炼者',
    description: '江湖第一伤，来自一只猫。',
    clue: '某位少侠手背上的爪痕，正在发光。',
    eventRules: [{ type: 'title.earned', payload: { titleId: 'catScratchTrial' } }],
    titleBonus: { crit: 0.01 },
  },
  {
    id: 'title:chatterboxBane',
    kind: 'title',
    name: '话痨克星',
    description: '你把老头说到愿意给钱。',
    clue: '有人听完一长串废话后，掏出了一文钱。',
    eventRules: [{ type: 'title.earned', payload: { titleId: 'chatterboxBane' } }],
    titleBonus: { attack: 1 },
  },
  {
    id: 'title:punchingBag',
    kind: 'title',
    name: '挨打不还手',
    description: '能屈能伸，主要是伸不出去。',
    clue: '沙袋旁边写着：再挨三下，或许就懂了。',
    eventRules: [{ type: 'title.earned', payload: { titleId: 'punchingBag' } }],
    titleBonus: { defense: 2 },
  },
  {
    id: 'achievement:first-steps',
    kind: 'achievement',
    name: '初入江湖',
    description: '和不正经老头聊过，江湖就算把你记住了。',
    clue: '第一笔江湖账，似乎还缺一个见证人。',
    eventRules: [{ type: 'quest.completed', payload: { questId: 'firstSteps' } }],
  },
  {
    id: 'achievement:cat-helper',
    kind: 'achievement',
    name: '猫事顺利',
    description: '你和大黄猫达成了某种互不追究的协议。',
    clue: '后院的咸鱼干少了一条，功劳还没人认领。',
    eventRules: [{ type: 'quest.completed', payload: { questId: 'findCat' } }],
  },
  {
    id: 'achievement:duel-winner',
    kind: 'achievement',
    name: '擂台讲理人',
    description: '你用一场胜负证明，菜刀也能讲道理。',
    clue: '擂台边的木牌背面，写着一个待确认的名字。',
    eventRules: [{ type: 'enemy.defeated', payload: { enemyId: 'bai-daxia' } }],
  },
] satisfies readonly UnlockableDefinition[]

export const unlockableDefinitions = CORE_UNLOCKABLES
export { OPTIONAL_UNLOCKABLES }
export const ALL_UNLOCKABLES: readonly UnlockableDefinition[] = [...CORE_UNLOCKABLES, ...OPTIONAL_UNLOCKABLES]
