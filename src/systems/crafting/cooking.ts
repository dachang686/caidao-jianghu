import { evaluateCondition } from '../conditions/evaluate'
import { addItem, getItemCount, InventoryError, removeItem } from '../inventory/inventory'
import type { EventBus } from '../events/event-bus'
import type { ConditionContext } from '../../types/conditions'
import type { CookRequest, CookResult, CookingRecipeDefinition, CookingSnapshot } from '../../types/recipe'
import type { RecipeId } from '../../types/ids'
import type { ItemDefinition, InventoryState } from '../../types/item'

export interface CookingValidationIssue {
  readonly code: 'duplicate_id' | 'missing_item' | 'invalid_value' | 'buff_mismatch'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface CookingValidationResult {
  readonly valid: boolean
  readonly issues: readonly CookingValidationIssue[]
}

export interface CookingCatalog {
  readonly items: readonly ItemDefinition[] | ReadonlyMap<string, ItemDefinition>
}

export class CookingEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CookingEngineError'
  }
}

const EMPTY_STATE: CookingSnapshot = { version: 1, cookedCounts: {}, processedActionIds: [] }
const EMPTY_CONDITION_CONTEXT: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: {} }

function isArray<T>(value: readonly T[] | ReadonlyMap<string, T>): value is readonly T[] { return Array.isArray(value) }

function findItem(items: CookingCatalog['items'], id: string): ItemDefinition | undefined {
  if (isArray(items)) return items.find((item) => String(item.id) === id)
  return (items as ReadonlyMap<string, ItemDefinition>).get(id)
}

function hasId(values: readonly string[] | ReadonlySet<string>, id: string): boolean {
  return typeof (values as ReadonlySet<string>).has === 'function' ? (values as ReadonlySet<string>).has(id) : (values as readonly string[]).includes(id)
}

function cloneState(state: CookingSnapshot): CookingSnapshot {
  return { version: 1, cookedCounts: { ...state.cookedCounts }, processedActionIds: [...state.processedActionIds] }
}

export function validateCookingRecipes(
  recipes: readonly CookingRecipeDefinition[],
  options: { readonly itemIds?: readonly string[] | ReadonlySet<string>; readonly chapterId?: string } = {},
): CookingValidationResult {
  const issues: CookingValidationIssue[] = []
  const seen = new Set<string>()
  recipes.forEach((recipe, index) => {
    const path = `recipes[${index}]`
    const id = String(recipe.id)
    if (seen.has(id)) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复菜谱 ID「${id}」`, id })
    seen.add(id)
    if (options.chapterId && String(recipe.chapterId) !== options.chapterId) issues.push({ code: 'invalid_value', path: `${path}.chapterId`, message: '菜谱章节与内容阶段不匹配', id })
    if (!recipe.name.trim() || !recipe.description.trim()) issues.push({ code: 'invalid_value', path: `${path}.name`, message: '菜谱名称和说明不能为空', id })
    if (!Number.isInteger(recipe.requiredChapter) || recipe.requiredChapter < 1) issues.push({ code: 'invalid_value', path: `${path}.requiredChapter`, message: '菜谱开放章节必须是正整数', id })
    if (recipe.materials.length === 0) issues.push({ code: 'invalid_value', path: `${path}.materials`, message: '菜谱至少需要一种材料', id })
    recipe.materials.forEach((material, materialIndex) => {
      if (!Number.isInteger(material.count) || material.count <= 0) issues.push({ code: 'invalid_value', path: `${path}.materials[${materialIndex}].count`, message: '材料数量必须是正整数', id })
      if (options.itemIds && !hasId(options.itemIds, String(material.itemId))) issues.push({ code: 'missing_item', path: `${path}.materials[${materialIndex}].itemId`, message: `找不到材料「${material.itemId}」`, id: String(material.itemId) })
      if (String(material.itemId) === String(recipe.output.itemId)) issues.push({ code: 'invalid_value', path: `${path}.materials[${materialIndex}].itemId`, message: '菜谱不能直接把产物作为自身材料，避免无限循环', id })
    })
    if (!Number.isInteger(recipe.output.count) || recipe.output.count <= 0) issues.push({ code: 'invalid_value', path: `${path}.output.count`, message: '产物数量必须是正整数', id })
    if (String(recipe.output.buff.foodItemId) !== String(recipe.output.itemId)) issues.push({ code: 'buff_mismatch', path: `${path}.output.buff.foodItemId`, message: '食物 Buff 必须绑定菜谱产物', id })
    if (![1, 2, 3].includes(recipe.output.buff.durationBattles)) issues.push({ code: 'invalid_value', path: `${path}.output.buff.durationBattles`, message: '食物增益场次必须为 1–3', id })
    if (recipe.output.buff.negative) {
      if (!Number.isInteger(recipe.output.buff.negative.turns) || recipe.output.buff.negative.turns < 1 || recipe.output.buff.negative.turns > 2) issues.push({ code: 'invalid_value', path: `${path}.output.buff.negative.turns`, message: '食物负面状态最多持续 2 回合', id })
      if (recipe.output.buff.negative.selfDamageRatio !== undefined && (recipe.output.buff.negative.selfDamageRatio < 0 || recipe.output.buff.negative.selfDamageRatio > .08)) issues.push({ code: 'invalid_value', path: `${path}.output.buff.negative.selfDamageRatio`, message: '食物负面自伤不得超过最大生命 8%', id })
    }
    if (options.itemIds && !hasId(options.itemIds, String(recipe.output.itemId))) issues.push({ code: 'missing_item', path: `${path}.output.itemId`, message: `找不到食物产物「${recipe.output.itemId}」`, id: String(recipe.output.itemId) })
  })
  return { valid: issues.length === 0, issues }
}

function result(status: CookResult['status'], recipeId: RecipeId, inventory: InventoryState, state: CookingSnapshot, message: string, extras: Partial<Pick<CookResult, 'output' | 'events' | 'actionId'>> = {}): CookResult {
  return { status, recipeId, inventory, state, events: [], message, ...extras }
}

export class CookingEngine {
  private readonly recipes: ReadonlyMap<RecipeId, CookingRecipeDefinition>
  private readonly catalog: CookingCatalog
  private readonly eventBus?: EventBus
  private state: CookingSnapshot

  constructor(recipes: readonly CookingRecipeDefinition[], catalog: CookingCatalog, initialState: CookingSnapshot = EMPTY_STATE, eventBus?: EventBus) {
    const itemIds: readonly string[] | ReadonlySet<string> = isArray(catalog.items) ? catalog.items.map((item) => String(item.id)) : new Set<string>((catalog.items as ReadonlyMap<string, ItemDefinition>).keys())
    const validation = validateCookingRecipes(recipes, { itemIds })
    if (!validation.valid) throw new CookingEngineError(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
    if (initialState.version !== 1) throw new CookingEngineError('烹饪快照版本无效。')
    this.recipes = new Map(recipes.map((recipe) => [recipe.id, recipe]))
    this.catalog = catalog
    this.state = cloneState(initialState)
    this.eventBus = eventBus
  }

  getState(): CookingSnapshot { return cloneState(this.state) }

  snapshot(): CookingSnapshot { return this.getState() }

  cook(request: CookRequest): CookResult {
    const recipe = this.recipes.get(request.recipeId)
    if (!recipe) throw new CookingEngineError(`未知菜谱「${request.recipeId}」`)
    const cookedCount = this.state.cookedCounts[String(recipe.id)] ?? 0
    const actionId = request.actionId ?? `cook:${recipe.id}:${cookedCount + 1}`
    if (this.state.processedActionIds.includes(actionId)) return result('duplicate_action', recipe.id, request.inventory, this.getState(), '这次烹饪操作已经处理过。', { actionId })
    if (!Number.isInteger(request.chapter) || request.chapter < recipe.requiredChapter) return result('chapter_locked', recipe.id, request.inventory, this.getState(), `第 ${recipe.requiredChapter} 章后才能使用这张菜谱。`, { actionId })
    if (recipe.unlockCondition) {
      let unlocked = false
      try { unlocked = evaluateCondition(recipe.unlockCondition, request.conditionContext ?? EMPTY_CONDITION_CONTEXT) } catch { unlocked = false }
      if (!unlocked && !request.unlockedRecipeIds?.includes(recipe.id)) return result('condition_locked', recipe.id, request.inventory, this.getState(), recipe.lockedReason ?? '尚未满足菜谱解锁条件。', { actionId })
    }
    for (const material of recipe.materials) {
      const required = recipe.materials.filter((candidate) => String(candidate.itemId) === String(material.itemId)).reduce((total, candidate) => total + candidate.count, 0)
      if (getItemCount(request.inventory, String(material.itemId)) < required) return result('insufficient_materials', recipe.id, request.inventory, this.getState(), `材料「${material.itemId}」数量不足。`, { actionId })
    }
    const output = findItem(this.catalog.items, String(recipe.output.itemId))
    if (!output) throw new CookingEngineError(`菜谱引用未知产物「${recipe.output.itemId}」`)
    if (output.unique && getItemCount(request.inventory, String(recipe.output.itemId)) > 0) return result('unique_output_owned', recipe.id, request.inventory, this.getState(), '这个唯一食物已经在背包中。', { actionId })
    try {
      let inventory = request.inventory
      recipe.materials.forEach((material) => { inventory = removeItem(inventory, String(material.itemId), material.count) })
      inventory = addItem(inventory, output, recipe.output.count)
      this.state = { version: 1, cookedCounts: { ...this.state.cookedCounts, [String(recipe.id)]: cookedCount + 1 }, processedActionIds: [...this.state.processedActionIds, actionId] }
      const event = { id: `${actionId}:cooked`, type: 'crafting.recipe_cooked', occurredAtTick: 0, payload: { recipeId: recipe.id, output: recipe.output }, sourceActionId: actionId }
      this.eventBus?.dispatch(event)
      return result('cooked', recipe.id, inventory, this.getState(), '烹饪完成，食物已放入背包。', { actionId, output: recipe.output, events: [event] })
    } catch (error) {
      if (error instanceof InventoryError) return result('inventory_full', recipe.id, request.inventory, this.getState(), '背包空间不足，材料未扣除；整理背包后可重新烹饪。', { actionId })
      throw error
    }
  }
}

export function createCookingEngine(recipes: readonly CookingRecipeDefinition[], catalog: CookingCatalog, initialState?: CookingSnapshot, eventBus?: EventBus): CookingEngine {
  return new CookingEngine(recipes, catalog, initialState, eventBus)
}
