import type { CookingRecipeDefinition } from '../../types/recipe'
import type { FoodBuffDefinition } from '../../types/food'
import type { ItemDefinition } from '../../types/item'
import { asChapterId, asContentKey, asItemId, asRecipeId } from '../../types/ids'

const ch01 = asChapterId('ch01')
const ch02 = asChapterId('ch02')
const ch03 = asChapterId('ch03')
const ch04 = asChapterId('ch04')
const grain = asItemId('item:grain')
const spice = asItemId('item:spice')
const fish = asItemId('item:fish')
const herb = asItemId('item:herb')

export const coreCookingItems: readonly ItemDefinition[] = [
  { id: grain, name: '粗粮', description: '能填饱肚子，也能填满菜谱。', category: 'material', maxStack: 20 },
  { id: spice, name: '山椒', description: '一粒下去，锅里和江湖都开始有意见。', category: 'material', maxStack: 20 },
  { id: fish, name: '鲜鱼', description: '鱼摊刚送来的，暂时还没有江湖理想。', category: 'material', maxStack: 20 },
  { id: herb, name: '止血草', description: '采集来的药草，苦得很有原则。', category: 'material', maxStack: 20 },
  { id: 'item:erguotou', name: '二锅头', description: '攻击更猛，命中更随缘。', category: 'food', maxStack: 10 },
  { id: 'item:stale-pill', name: '过期大还丹', description: '治疗有效，肚中开会也有效。', category: 'food', maxStack: 10 },
  { id: 'item:pepper-noodles', name: '山椒面', description: '辣出一点攻击力。', category: 'food', maxStack: 10 },
  { id: 'item:herb-broth', name: '止血汤', description: '每次治疗都更像认真治疗。', category: 'food', maxStack: 10 },
  { id: 'item:iron-pot-stew', name: '铁锅炖', description: '防御增加，锅盖暂时不飞。', category: 'food', maxStack: 10 },
  { id: 'item:jade-tea', name: '温玉茶', description: '内力慢慢回，不催。', category: 'food', maxStack: 10 },
  { id: 'item:cat-fish-feast', name: '猫眼鱼宴', description: '猫看了都觉得你有准备。', category: 'food', maxStack: 10 },
  { id: 'item:focus-dumplings', name: '定心饺', description: '先定心，再决定要不要乱挥刀。', category: 'food', maxStack: 10 },
]

const buffs: Record<string, FoodBuffDefinition> = {
  erguotou: { id: 'food:erguotou', foodItemId: 'item:erguotou', name: '二锅头', durationBattles: 1, stacking: 'replace', attackMultiplier: 1.25, accuracyDelta: -.15, negative: { id: 'status:tipsy', turns: 2, description: '酒劲上头：命中降低 15%。', accuracyDelta: -.15 }, localExplanationKey: asContentKey('food:erguotou') },
  stalePill: { id: 'food:stale-pill', foodItemId: 'item:stale-pill', name: '过期大还丹', durationBattles: 1, stacking: 'replace', immediateHeal: 38, negative: { id: 'status:stomach-meeting', turns: 1, description: '肚中开会：技能内力消耗提高 25%。', qiCostMultiplier: .25 }, localExplanationKey: asContentKey('food:stale-pill') },
  pepperNoodles: { id: 'food:pepper-noodles', foodItemId: 'item:pepper-noodles', name: '山椒面', durationBattles: 2, stacking: 'extend', attackMultiplier: 1.1, localExplanationKey: asContentKey('food:pepper-noodles') },
  herbBroth: { id: 'food:herb-broth', foodItemId: 'item:herb-broth', name: '止血汤', durationBattles: 2, stacking: 'replace', healingMultiplier: 1.3, localExplanationKey: asContentKey('food:herb-broth') },
  ironPotStew: { id: 'food:iron-pot-stew', foodItemId: 'item:iron-pot-stew', name: '铁锅炖', durationBattles: 3, stacking: 'replace', defenseDelta: 4, localExplanationKey: asContentKey('food:iron-pot-stew') },
  jadeTea: { id: 'food:jade-tea', foodItemId: 'item:jade-tea', name: '温玉茶', durationBattles: 2, stacking: 'extend', qiRecoveryDelta: 1, localExplanationKey: asContentKey('food:jade-tea') },
  catFishFeast: { id: 'food:cat-fish-feast', foodItemId: 'item:cat-fish-feast', name: '猫眼鱼宴', durationBattles: 1, stacking: 'ignore', accuracyDelta: .08, localExplanationKey: asContentKey('food:cat-fish-feast') },
  focusDumplings: { id: 'food:focus-dumplings', foodItemId: 'item:focus-dumplings', name: '定心饺', durationBattles: 2, stacking: 'replace', critDelta: .03, localExplanationKey: asContentKey('food:focus-dumplings') },
}

const recipe = (id: string, name: string, description: string, chapterId: ReturnType<typeof asChapterId>, requiredChapter: number, materials: CookingRecipeDefinition['materials'], output: CookingRecipeDefinition['output']): CookingRecipeDefinition => ({ id: asRecipeId(id), name, description, chapterId, requiredChapter, materials, output })

export const coreCookingRecipes: readonly CookingRecipeDefinition[] = [
  recipe('recipe:erguotou', '二锅头', '把粮食酿成勇气，顺便酿成一点命中问题。', ch01, 1, [{ itemId: grain, count: 1 }, { itemId: spice, count: 1 }], { itemId: 'item:erguotou', count: 1, buff: buffs.erguotou }),
  recipe('recipe:stale-pill', '过期大还丹', '药效和保质期互相推诿，最后都进了肚子。', ch01, 1, [{ itemId: herb, count: 2 }, { itemId: spice, count: 1 }], { itemId: 'item:stale-pill', count: 1, buff: buffs.stalePill }),
  recipe('recipe:pepper-noodles', '山椒面', '一碗下去，攻击先有意见。', ch02, 2, [{ itemId: grain, count: 1 }, { itemId: spice, count: 2 }], { itemId: 'item:pepper-noodles', count: 1, buff: buffs.pepperNoodles }),
  recipe('recipe:herb-broth', '止血汤', '苦味没有消失，只是被治疗效果说服了。', ch02, 2, [{ itemId: herb, count: 2 }, { itemId: fish, count: 1 }], { itemId: 'item:herb-broth', count: 1, buff: buffs.herbBroth }),
  recipe('recipe:iron-pot-stew', '铁锅炖', '锅盖压住了食材，也压住了挨打时的慌张。', ch03, 3, [{ itemId: fish, count: 2 }, { itemId: spice, count: 2 }], { itemId: 'item:iron-pot-stew', count: 1, buff: buffs.ironPotStew }),
  recipe('recipe:jade-tea', '温玉茶', '喝茶不急，内力也不急。', ch03, 3, [{ itemId: herb, count: 1 }, { itemId: spice, count: 1 }], { itemId: 'item:jade-tea', count: 1, buff: buffs.jadeTea }),
  recipe('recipe:cat-fish-feast', '猫眼鱼宴', '鱼摊和猫都同意这是一场正式宴席。', ch04, 4, [{ itemId: fish, count: 2 }, { itemId: herb, count: 1 }], { itemId: 'item:cat-fish-feast', count: 1, buff: buffs.catFishFeast }),
  recipe('recipe:focus-dumplings', '定心饺', '把杂念包进去，至少先包住一回合。', ch04, 4, [{ itemId: grain, count: 2 }, { itemId: herb, count: 1 }], { itemId: 'item:focus-dumplings', count: 1, buff: buffs.focusDumplings }),
]

export const coreFoodBuffs: readonly FoodBuffDefinition[] = Object.values(buffs)
export const COOKING_RECIPES = coreCookingRecipes
