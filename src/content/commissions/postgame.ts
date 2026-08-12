import { asWorldRegionId } from '../../types/ids'
import type { PostgameTemplatePack } from '../../types/postgame'

const village = asWorldRegionId('xiaoyu-village')
const western = asWorldRegionId('western-relay')
const donghai = asWorldRegionId('donghai-town')
const capital = asWorldRegionId('capital-ranking')
const convention = asWorldRegionId('martial-convention')

export const POSTGAME_COMMISSION_TEMPLATES = [
  { id: 'commission:postgame:ordinary:market-audit', title: '回头核账', description: '回到熟悉的市场，确认这次没人把采购单写成秘籍。', tier: 'ordinary', regionId: village, requiredChapter: 8, target: { kind: 'investigate', id: 'postgame-market-audit', label: '完成市场复核', contextTags: ['postgame', 'market', 'repeatable'] }, reward: { wealth: 55, fame: 2, grantKey: 'commission:postgame:reward:market-audit' }, oneTime: false },
  { id: 'commission:postgame:ordinary:relay-run', title: '驿路回信', description: '给西域驿站送一封没有折角的回信。', tier: 'ordinary', regionId: western, requiredChapter: 8, target: { kind: 'deliver', id: 'postgame-relay-letter', label: '送达驿路回信', contextTags: ['postgame', 'western', 'repeatable'] }, reward: { wealth: 62, fame: 2, grantKey: 'commission:postgame:reward:relay-run' }, oneTime: false },
  { id: 'commission:postgame:ordinary:tide-sample', title: '潮声取样', description: '从东海带回一小瓶潮声，瓶子里不许装进整片海。', tier: 'ordinary', regionId: donghai, requiredChapter: 8, target: { kind: 'collect', id: 'postgame-tide-sample', label: '取得潮声样本', count: 1, contextTags: ['postgame', 'donghai', 'repeatable'] }, reward: { wealth: 66, fame: 2, grantKey: 'commission:postgame:reward:tide-sample' }, oneTime: false },
  { id: 'commission:postgame:elite:archive-proof', title: '原卷复核', description: '把京城原始墨迹重新装订，拒绝让传闻单独上桌。', tier: 'elite', regionId: capital, requiredChapter: 8, target: { kind: 'investigate', id: 'postgame-archive-proof', label: '完成原卷复核', contextTags: ['postgame', 'capital', 'evidence'] }, reward: { wealth: 126, fame: 5, grantKey: 'commission:postgame:reward:archive-proof' }, oneTime: false },
  { id: 'commission:postgame:elite:sect-training', title: '门人公开课', description: '给新门人上一堂不超过一炷香的实战课。', tier: 'elite', regionId: convention, requiredChapter: 8, target: { kind: 'help', id: 'postgame-sect-training', label: '完成门人公开课', contextTags: ['postgame', 'sect', 'training'] }, reward: { wealth: 138, fame: 6, grantKey: 'commission:postgame:reward:sect-training' }, oneTime: false },
  { id: 'commission:postgame:elite:boss-rematch', title: '旧 Boss 复盘', description: '请一位已败 Boss 回来复盘，先约定不改写结算记录。', tier: 'elite', regionId: convention, requiredChapter: 8, target: { kind: 'defeat', id: 'postgame-boss-rematch', label: '完成旧 Boss 复盘', enemyId: 'ranking-master', contextTags: ['postgame', 'boss', 'rematch'] }, reward: { wealth: 150, fame: 7, grantKey: 'commission:postgame:reward:boss-rematch' }, oneTime: false },
  { id: 'commission:postgame:legendary:discipleship', title: '首席门人试炼', description: '一次性高价值目标：带领首席门人完成公开试炼，奖励不会重复发放。', tier: 'legendary', regionId: convention, requiredChapter: 8, target: { kind: 'help', id: 'postgame-first-disciple', label: '完成首席门人试炼', contextTags: ['postgame', 'disciple', 'one-time'] }, reward: { wealth: 300, fame: 14, itemIds: ['item:conventionCrest'], grantKey: 'commission:postgame:reward:discipleship' }, oneTime: true },
  { id: 'commission:postgame:legendary:open-archive', title: '公开档案夜', description: '把八章档案摆上长桌，让任何门人都能查到来路。', tier: 'legendary', regionId: capital, requiredChapter: 8, target: { kind: 'investigate', id: 'postgame-open-archive', label: '完成公开档案夜', contextTags: ['postgame', 'archive', 'one-time'] }, reward: { wealth: 340, fame: 16, grantKey: 'commission:postgame:reward:open-archive' }, oneTime: true },
  { id: 'commission:postgame:legendary:four-style', title: '四系合流演示', description: '让四系武学在同一张演示桌上互相尊重，别互相抢锅。', tier: 'legendary', regionId: convention, requiredChapter: 8, target: { kind: 'help', id: 'postgame-four-style', label: '完成四系合流演示', contextTags: ['postgame', 'four-schools', 'one-time'] }, reward: { wealth: 380, fame: 18, grantKey: 'commission:postgame:reward:four-style' }, oneTime: true },
] as const

export const POSTGAME_COMMISSION_PACK: PostgameTemplatePack = {
  templates: POSTGAME_COMMISSION_TEMPLATES,
  oneTimeTargetIds: POSTGAME_COMMISSION_TEMPLATES.filter((template) => template.oneTime).map((template) => template.target.id),
}

export const CORE_POSTGAME_COMMISSION_TEMPLATES = POSTGAME_COMMISSION_TEMPLATES
