import { asItemId, asRecipeId, asWorldRegionId } from '../../types/ids'
import type { SectFacilityDefinition } from '../../types/sect'

const timber = asItemId('material:timber')
const ironScrap = asItemId('material:iron-scrap')
const spiritStone = asItemId('material:spirit-stone')
const herb = asItemId('material:herb')
const spice = asItemId('material:spice')
const ink = asItemId('material:ink')

export const sectFacilityDefinitions: readonly SectFacilityDefinition[] = [
  {
    id: 'training',
    name: '练功房',
    description: '把挨打经验整理成可复用的招式心得。',
    levels: [
      { level: 1, requiredChapter: 5, cost: { silver: 60, materials: [{ itemId: timber, count: 2 }] }, grantKey: 'sect:training:1', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 2 }], benefits: [{ type: 'combat_stat_bonus', stat: 'attack', delta: 1 }] },
      { level: 2, requiredChapter: 5, cost: { silver: 180, materials: [{ itemId: ironScrap, count: 3 }] }, prerequisite: { facilityId: 'training', level: 1 }, grantKey: 'sect:training:2', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 4 }], benefits: [{ type: 'combat_stat_bonus', stat: 'defense', delta: 2 }] },
      { level: 3, requiredChapter: 5, cost: { silver: 420, materials: [{ itemId: spiritStone, count: 5 }] }, prerequisite: { facilityId: 'training', level: 2 }, grantKey: 'sect:training:3', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 7 }], benefits: [{ type: 'combat_stat_bonus', stat: 'attack', delta: 2 }, { type: 'combat_stat_bonus', stat: 'defense', delta: 1 }] },
    ],
  },
  {
    id: 'kitchen',
    name: '厨房',
    description: '把门派伙食升级成战斗前的正经准备。',
    levels: [
      { level: 1, requiredChapter: 5, cost: { silver: 50, materials: [{ itemId: herb, count: 2 }] }, grantKey: 'sect:kitchen:1', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 2 }], benefits: [{ type: 'unlock_recipe', recipeId: asRecipeId('recipe:sect-broth') }] },
      { level: 2, requiredChapter: 5, cost: { silver: 150, materials: [{ itemId: spice, count: 3 }] }, prerequisite: { facilityId: 'kitchen', level: 1 }, grantKey: 'sect:kitchen:2', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 4 }], benefits: [{ type: 'unlock_recipe', recipeId: asRecipeId('recipe:focus-noodles') }] },
      { level: 3, requiredChapter: 5, cost: { silver: 360, materials: [{ itemId: spiritStone, count: 3 }, { itemId: herb, count: 5 }] }, prerequisite: { facilityId: 'kitchen', level: 2 }, grantKey: 'sect:kitchen:3', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 6 }], benefits: [{ type: 'unlock_recipe', recipeId: asRecipeId('recipe:banquet-of-reason') }] },
    ],
  },
  {
    id: 'forge',
    name: '铁匠铺',
    description: '让强化不再全靠铁匠临场发挥。',
    levels: [
      { level: 1, requiredChapter: 5, cost: { silver: 80, materials: [{ itemId: ironScrap, count: 2 }] }, grantKey: 'sect:forge:1', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 2 }], benefits: [{ type: 'strengthening_chance_bonus', delta: 0.02 }] },
      { level: 2, requiredChapter: 5, cost: { silver: 220, materials: [{ itemId: ironScrap, count: 5 }] }, prerequisite: { facilityId: 'forge', level: 1 }, grantKey: 'sect:forge:2', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 4 }], benefits: [{ type: 'strengthening_chance_bonus', delta: 0.03 }] },
      { level: 3, requiredChapter: 5, cost: { silver: 500, materials: [{ itemId: spiritStone, count: 4 }, { itemId: ironScrap, count: 8 }] }, prerequisite: { facilityId: 'forge', level: 2 }, grantKey: 'sect:forge:3', effects: [{ type: 'change_stat', stat: 'sectProsperity', delta: 8 }], benefits: [{ type: 'strengthening_chance_bonus', delta: 0.05 }] },
    ],
  },
  {
    id: 'intel',
    name: '情报堂',
    description: '把听来的风声整理成可行动的区域情报。',
    levels: [
      { level: 1, requiredChapter: 5, cost: { silver: 70, materials: [{ itemId: ink, count: 2 }] }, grantKey: 'sect:intel:1', effects: [{ type: 'change_stat', stat: 'fame', delta: 1 }], benefits: [{ type: 'commission_quality_bonus', delta: 1 }] },
      { level: 2, requiredChapter: 5, cost: { silver: 200, materials: [{ itemId: ink, count: 5 }] }, prerequisite: { facilityId: 'intel', level: 1 }, grantKey: 'sect:intel:2', effects: [{ type: 'change_stat', stat: 'fame', delta: 2 }], benefits: [{ type: 'reveal_region', regionId: asWorldRegionId('qinghe-county') }] },
      { level: 3, requiredChapter: 5, cost: { silver: 450, materials: [{ itemId: ink, count: 8 }, { itemId: spiritStone, count: 2 }] }, prerequisite: { facilityId: 'intel', level: 2 }, grantKey: 'sect:intel:3', effects: [{ type: 'change_stat', stat: 'fame', delta: 4 }], benefits: [{ type: 'commission_quality_bonus', delta: 2 }, { type: 'reveal_region', regionId: asWorldRegionId('black-wind-fort') }] },
    ],
  },
]

export const CORE_SECT_FACILITIES = sectFacilityDefinitions
