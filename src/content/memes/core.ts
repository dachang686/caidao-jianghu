import type { MemeDefinition } from '../../types/meme'

/** Core meme pack: modern mappings stay world-translated and are reviewed by ratio/content validation. */
export const CORE_MEME_PACK = [
  { id: 'meme:idle:jianghu-breeze', category: 'jianghu', triggerEvent: 'idle', text: '江湖很大，先把菜刀擦亮也算修行。', minDensity: 'mild', cooldownGroup: 'idle', cooldownTicks: 2 },
  { id: 'meme:idle:relaxation', category: 'emotion', triggerEvent: 'idle', text: '你获得片刻松弛感，代价是暂时想不起自己要去哪。', minDensity: 'standard', cooldownGroup: 'idle', cooldownTicks: 2 },
  { id: 'meme:battle-win:wooden-board', category: 'hotlist', triggerEvent: 'battle_win', text: '百晓榜暂无热榜，擂台木牌先替你记了一笔。', minDensity: 'standard', cooldownGroup: 'battle-result', cooldownTicks: 1, modernMapping: '热榜' },
  { id: 'meme:battle-win:knife-reason', category: 'jianghu', triggerEvent: 'battle_win', text: '这一刀讲道理，连对手都决定先听你说完。', minDensity: 'mild', cooldownGroup: 'battle-result', cooldownTicks: 1 },
  { id: 'meme:battle-fail:monthly-test', category: 'workplace', triggerEvent: 'battle_fail', text: '本次门派月考结果：勇气达标，骨头需要补考。', minDensity: 'standard', cooldownGroup: 'battle-result', cooldownTicks: 1, modernMapping: '绩效' },
  { id: 'meme:battle-fail:old-school', category: 'jianghu', triggerEvent: 'battle_fail', text: '挨打不丢人，丢人的是还没记住白大侠的掌风。', minDensity: 'mild', cooldownGroup: 'battle-result', cooldownTicks: 1 },
  { id: 'meme:quest:delivery', category: 'delivery', triggerEvent: 'quest_complete', text: '委托已送达，收件人是江湖，签收人暂时是你。', minDensity: 'standard', cooldownGroup: 'quest-result', cooldownTicks: 1, modernMapping: '外卖' },
  { id: 'meme:quest:ledger', category: 'jianghu', triggerEvent: 'quest_complete', text: '账本又添一笔：事情办成，报酬暂且没有跑。', minDensity: 'mild', cooldownGroup: 'quest-result', cooldownTicks: 1 },
  { id: 'meme:npc:stone-stream', category: 'livestream', triggerEvent: 'npc_harass', text: '留影石全程记录，你的好奇心已经开始有观众了。', minDensity: 'spicy', cooldownGroup: 'npc-reaction', cooldownTicks: 2, modernMapping: '直播' },
  { id: 'meme:npc:consulting-fee', category: 'jianghu', triggerEvent: 'npc_harass', text: '你又点了一遍，对方开始考虑收取咨询费。', minDensity: 'mild', cooldownGroup: 'npc-reaction', cooldownTicks: 2 },
] satisfies readonly MemeDefinition[]

export const coreMemePack = CORE_MEME_PACK
