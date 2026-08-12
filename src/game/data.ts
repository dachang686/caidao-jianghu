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
  qingheBadge: { id: 'qingheBadge', name: '清河榜牌', description: '榜下捕快留下的木牌，正面写着“已核验”，背面还在等人补字。', category: 'quest' },
  blackwindSeal: { id: 'blackwindSeal', name: '黑风寨令', description: '黑风寨主留下的令牌，背面刻着“空旗反卷，败北有效”。', category: 'quest' },
  qingyunMark: { id: 'qingyunMark', name: '青云名帖', description: '青云掌门留下的名帖，墨迹端正得像一条刚被训过的鱼。', category: 'quest' },
  westernSeal: { id: 'westernSeal', name: '西域封条', description: '驿路双煞留下的封条，证明这次物流终于有了完整签收。', category: 'quest' },
  tidePearl: { id: 'tidePearl', name: '潮声珠', description: '海潮帮主留下的潮声珠，里面只记录事实，不记录热度。', category: 'quest' },
  capitalWrit: { id: 'capitalWrit', name: '京城公牍', description: '榜司督主留下的公牍，所有墨迹都同意接受复核。', category: 'quest' },
  conventionCrest: { id: 'conventionCrest', name: '大会印记', description: '百晓榜主留下的大会印记，允许刀谱继续写下一页。', category: 'quest' },
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
