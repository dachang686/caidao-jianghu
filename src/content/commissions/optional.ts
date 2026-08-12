import { asWorldRegionId } from '../../types/ids'
import type { CommissionTemplate } from '../../types/commission'
import { CORE_COMMISSION_TEMPLATES } from './templates'

const regions = [asWorldRegionId('western-relay'), asWorldRegionId('donghai-town'), asWorldRegionId('capital-ranking'), asWorldRegionId('martial-convention')]
const entries = [
  ['seal-return', '封条归档', 'deliver', '把已经验收过的封条送回驿站档案房', 5, 72, 3],
  ['camel-route', '驼铃复盘', 'investigate', '完成一次驼队路线复盘', 5, 80, 3],
  ['shell-ledger', '贝壳账校', 'investigate', '校对贝市三笔潮汐账', 6, 86, 4],
  ['tide-lantern', '潮灯借还', 'deliver', '把潮声寺的灯借还登记完整', 6, 92, 4],
  ['ink-source', '墨锭溯源', 'collect', '取得一份可复核的京城墨锭', 7, 104, 5],
  ['archive-seat', '档案排座', 'help', '让档案房的八份原卷各归其位', 7, 112, 5],
  ['judge-lunch', '裁判午饭', 'help', '给评判台送去不带立场的午饭', 8, 120, 6],
  ['four-school-demo', '四系示范', 'help', '完成一次四系武学公开示范', 8, 132, 7],
  ['postgame-map', '秘境绘图', 'investigate', '为通关后秘境补齐一张安全路线图', 8, 150, 8],
  ['returning-guest', '回头客公证', 'deliver', '完成一名回头客的原档公证', 8, 162, 9],
] as const

export const OPTIONAL_COMMISSION_TEMPLATES: readonly CommissionTemplate[] = entries.map(([key, title, kind, label, chapter, wealth, fame], index) => ({
  id: `commission:optional:${key}`,
  title,
  description: `${title}：${label}，完成后奖励与一次性标记均可复核。`,
  tier: chapter >= 8 ? 'legendary' : chapter >= 6 ? 'elite' : 'ordinary',
  regionId: regions[index % regions.length]!,
  requiredChapter: chapter,
  target: { kind, id: `optional-target:${key}`, label, count: kind === 'collect' ? 1 : undefined, contextTags: ['optional', `chapter:${chapter}`, `target:${key}`] },
  reward: { wealth, fame, grantKey: `commission:optional:reward:${key}` },
  oneTime: index >= 6,
}))

export const ALL_COMMISSION_TEMPLATES: readonly CommissionTemplate[] = [...CORE_COMMISSION_TEMPLATES, ...OPTIONAL_COMMISSION_TEMPLATES]
