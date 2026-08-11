import type { CombatStats, ItemId, QuestId, SkillId, TalentId, TitleId } from './types'

export interface TalentDefinition {
  id: TalentId
  name: string
  shortName: string
  description: string
  statBonus: Partial<CombatStats> & { maxHp?: number }
}

export interface SkillDefinition {
  id: SkillId
  name: string
  description: string
  qiCost: number
  cooldown: number
  kind: 'attack' | 'control' | 'defend'
  power?: number
}

export interface ItemDefinition {
  id: ItemId
  name: string
  description: string
  category: 'weapon' | 'consumable' | 'quest'
}

export interface TitleDefinition {
  id: TitleId
  name: string
  description: string
  bonus: string
}

export const BASE_STATS: CombatStats = {
  attack: 18,
  defense: 9,
  speed: 10,
  crit: 0.08,
  dodge: 0.06,
  accuracy: 0.9,
}

export const TALENTS: TalentDefinition[] = [
  {
    id: 'reckless',
    name: '莽夫',
    shortName: '遇事先砍',
    description: '遇事不决先砍一刀，问题是大多时候砍不到。',
    statBonus: { attack: 3 },
  },
  {
    id: 'clever',
    name: '机灵鬼',
    shortName: '跑得挺快',
    description: '打不过就跑，跑不了就躲，躲不了就……哭。',
    statBonus: { speed: 3, dodge: 0.03 },
  },
  {
    id: 'thickSkinned',
    name: '厚脸皮',
    shortName: '挨打不疼',
    description: '脸皮够厚，挨打也像被江风轻抚。',
    statBonus: { defense: 3, maxHp: 15 },
  },
]

export const SKILLS: Record<SkillId, SkillDefinition> = {
  basicSlash: {
    id: 'basicSlash', name: '普通攻击', description: '稳妥地挥一下菜刀。', qiCost: 0, cooldown: 0, kind: 'attack', power: 1,
  },
  cleaverWhirl: {
    id: 'cleaverWhirl', name: '菜刀乱舞', description: '闭眼乱砍，气势比准头更足。', qiCost: 12, cooldown: 2, kind: 'attack', power: 1.55,
  },
  mockery: {
    id: 'mockery', name: '嘴遁', description: '以理服人，实在不行就把他讲懵。', qiCost: 10, cooldown: 3, kind: 'control', power: 0.55,
  },
  playDead: {
    id: 'playDead', name: '装死', description: '江湖险恶，躺着有时真能避祸。', qiCost: 8, cooldown: 3, kind: 'defend',
  },
}

export const ITEMS: Record<ItemId, ItemDefinition> = {
  rustyCleaver: { id: 'rustyCleaver', name: '生锈菜刀', description: '切过十八年猪肉，已经隐隐有了刀意。', category: 'weapon' },
  stalePill: { id: 'stalePill', name: '过期大还丹', description: '药效很猛，保质期也很有个性。', category: 'consumable' },
  erguotou: { id: 'erguotou', name: '二锅头', description: '喝完很勇，命中全靠缘分。', category: 'consumable' },
  saltedFish: { id: 'saltedFish', name: '咸鱼干', description: '大黄猫愿意为它考虑一下人生。', category: 'quest' },
}

export const TITLES: Record<TitleId, TitleDefinition> = {
  cleaverNovice: { id: 'cleaverNovice', name: '菜刀新秀', description: '终于不是拿菜刀比划空气了。', bonus: '攻击 +1' },
  catScratchTrial: { id: 'catScratchTrial', name: '猫爪试炼者', description: '江湖第一伤，来自一只猫。', bonus: '暴击 +1%' },
  chatterboxBane: { id: 'chatterboxBane', name: '话痨克星', description: '你把老头说到愿意给钱。', bonus: '攻击 +1' },
  punchingBag: { id: 'punchingBag', name: '挨打不还手', description: '能屈能伸，主要是伸不出去。', bonus: '防御 +2' },
}

export const QUEST_LABELS: Record<QuestId, { title: string; objective: string }> = {
  firstSteps: { title: '初入江湖', objective: '和不正经老头聊聊' },
  findCat: { title: '帮王大娘找猫', objective: '让大黄猫回家' },
  challengeBai: { title: '比武招亲？', objective: '打败擂台上的白大侠' },
}
