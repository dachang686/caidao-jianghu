import { asChoiceId, asContentKey, asDialogueId, asNpcId } from '../../types/ids'
import type { DialogueGraph, DialogueNode } from '../../types/dialogue'
import type { MemeDensity } from '../../types/text-provider'

const oldManId = asNpcId('old-man')
const auntId = asNpcId('aunt')
const catId = asNpcId('dahuang-cat')
const baiId = asNpcId('bai-daxia')

const hubId = asDialogueId('dialogue:ch01:hub')
const oldManNodeId = asDialogueId('dialogue:ch01:old-man')
const oldManClueId = asDialogueId('dialogue:ch01:old-man:clue')
const oldManDetourId = asDialogueId('dialogue:ch01:old-man:detour')
const auntNodeId = asDialogueId('dialogue:ch01:aunt')
const auntClueId = asDialogueId('dialogue:ch01:aunt:clue')
const auntDetourId = asDialogueId('dialogue:ch01:aunt:detour')
const catNodeId = asDialogueId('dialogue:ch01:cat')
const catAnswerId = asDialogueId('dialogue:ch01:cat:answer')
const baiNodeId = asDialogueId('dialogue:ch01:bai')
const baiRulesId = asDialogueId('dialogue:ch01:bai:rules')
const baiReadyId = asDialogueId('dialogue:ch01:bai:ready')

const choice = (slug: string, label: string, nextNodeId?: typeof hubId, options: Partial<DialogueNode['choices'][number]> = {}) => ({
  id: asChoiceId(`choice:ch01:${slug}`),
  label,
  ...(nextNodeId ? { nextNodeId } : {}),
  ...options,
})

/** 第 1 章对白全部是本地作者稿；AI/LocalTextProvider 只能改写展示层，不参与任务分支。 */
export const ch01DialogueDefinitions: readonly DialogueNode[] = [
  {
    id: hubId,
    speakerNpcId: oldManId,
    text: '小愚村的客栈把江湖缩成一张桌子：刀谱在桌上，百晓榜在桌下，掌柜说两边都要先付茶钱。',
    choices: [
      choice('hub-old-man', '找老头问刀谱', oldManNodeId),
      choice('hub-aunt', '问王大娘这村里的榜单', auntNodeId),
      choice('hub-cat', '听大黄的猫说说风声', catNodeId),
      choice('hub-bai', '去擂台确认白大侠的规矩', baiNodeId),
    ],
  },
  {
    id: oldManNodeId,
    speakerNpcId: oldManId,
    text: '老头把菜刀翻过来，刀背上刻着《百味刀谱》第一句：先认清自己拿的是刀还是锅铲。',
    choices: [
      choice('old-man-clue', '记下刀谱线索', oldManClueId),
      choice('old-man-fee', '先问欠了几年的学费', oldManDetourId, {
        branch: 'confusing',
        returnToNodeId: oldManNodeId,
      }),
    ],
  },
  {
    id: oldManClueId,
    speakerNpcId: oldManId,
    text: '老头点头：“记性不错。下一句在水边，别问我为什么，江湖的纸总喜欢被风吹到水边。”',
    choices: [choice('old-man-clue-back', '回客栈继续查榜', hubId)],
  },
  {
    id: oldManDetourId,
    speakerNpcId: oldManId,
    text: '老头掏出一张三十年前的欠条，签名处写着“下次一定”。你决定暂时把学费问题交给下次。',
    choices: [choice('old-man-fee-back', '回到刀谱正题', oldManNodeId, { branch: 'confusing', returnToNodeId: oldManNodeId })],
  },
  {
    id: auntNodeId,
    speakerNpcId: auntId,
    text: '王大娘把账本压在灶台边：“百晓榜不只记大侠，也记谁把客栈的锅刷得最有侠气。”',
    choices: [
      choice('aunt-clue', '请她指一条榜单线索', auntClueId),
      choice('aunt-kitchen', '先问灶台账本为何有三种口径', auntDetourId, {
        branch: 'confusing',
        returnToNodeId: auntNodeId,
      }),
    ],
  },
  {
    id: auntClueId,
    speakerNpcId: auntId,
    text: '王大娘说：“白大侠最近在擂台上守着名次。你若真想上榜，先把自己的刀谱线索理顺。”',
    choices: [choice('aunt-clue-back', '把线索记在菜刀柄上', hubId)],
  },
  {
    id: auntDetourId,
    speakerNpcId: auntId,
    text: '三种口径分别是掌柜口径、厨娘口径和猫踩过后的口径。最后一种最有说服力，因为爪印最大。',
    choices: [choice('aunt-kitchen-back', '回到百晓榜的话题', auntNodeId, { branch: 'confusing', returnToNodeId: auntNodeId })],
  },
  {
    id: catNodeId,
    speakerNpcId: catId,
    text: '大黄的猫盯着你的菜刀，尾巴在地上写出一个不太标准的“榜”字。',
    choices: [
      choice('cat-ask', '请它提供一条可靠风声', catAnswerId),
      choice('cat-respect', '把鱼干放下，保持江湖礼数', catAnswerId),
    ],
  },
  {
    id: catAnswerId,
    speakerNpcId: catId,
    text: '猫没有回答，只把鱼干推向擂台方向。你得到一条纯江湖线索：会走路的鱼干通常知道路。',
    choices: [choice('cat-back', '收好这条线索', hubId)],
  },
  {
    id: baiNodeId,
    speakerNpcId: baiId,
    text: '白大侠抱拳：“擂台只认刀法，不认气势。若你准备好了，我可以让百晓榜记下这一场。”',
    choices: [
      choice('bai-rules', '先听清楚比武规矩', baiRulesId),
      choice('bai-challenge', '直接确认挑战白大侠', baiReadyId, {
        irreversible: true,
        requiresConfirmation: true,
        effects: [{ type: 'set_flag', flag: 'ch01_bai_challenge_acknowledged', value: true }],
      }),
    ],
  },
  {
    id: baiRulesId,
    speakerNpcId: baiId,
    text: '白大侠郑重说明：擂台上可以输，不能把菜刀借给裁判；胜负只结算一次，重试不会扣掉你的晚饭。',
    choices: [choice('bai-rules-ready', '明白了，回去准备', baiReadyId)],
  },
  {
    id: baiReadyId,
    speakerNpcId: baiId,
    text: '白大侠收起笑意：“去把刀谱线索补全。等你回来，擂台会记得这次确认。”',
    choices: [choice('bai-ready-back', '回客栈整理线索', hubId)],
  },
]

export const CH01_DIALOGUE_GRAPH: DialogueGraph = {
  id: 'dialogue:ch01',
  startNodeId: hubId,
  nodes: ch01DialogueDefinitions,
  mainlineNodeIds: [hubId, oldManNodeId, oldManClueId, auntNodeId, auntClueId, catNodeId, catAnswerId, baiNodeId, baiRulesId, baiReadyId],
  maxConfusingHops: 2,
}

/** 三档密度只补充表现文案，任务目标、条件和 Effect 均不从这里读取。 */
export const CH01_DENSITY_COPY: Readonly<Record<MemeDensity, readonly string[]>> = {
  mild: [
    '江湖提醒：先把刀谱线索记清，再去擂台问名次。',
    '猫把鱼干推远了一寸，像是在提醒你留出安全距离。',
  ],
  standard: [
    '江湖提醒：刀谱写得很稳，只有你的握刀姿势还在申请入门。',
    '猫把鱼干推向擂台，百晓榜因此多了一条“猫的意见”。',
  ],
  spicy: [
    '江湖提醒：你的菜刀已经有章法，唯独掌门气势还在排队取号。',
    '猫把鱼干当作密报递来，顺便收取了不公开的咨询费。',
    '白大侠说胜负只结算一次，老头在旁边小声问能不能把学费也算一次。',
  ],
}

export const CH01_DIALOGUE_COPY_KEYS = {
  clue: asContentKey('line:ch01:manual-clue'),
  cat: asContentKey('line:ch01:cat-fish-intel'),
  challenge: asContentKey('line:ch01:bai-serious-confirmation'),
} as const

export const CORE_CH01_DIALOGUES = ch01DialogueDefinitions
