import { evaluateCondition } from '../conditions/evaluate'
import { addItem, getItemCount, InventoryError, removeItem } from '../inventory/inventory'
import type { EventBus } from '../events/event-bus'
import type { ConditionContext } from '../../types/conditions'
import type { EquipmentDefinition } from '../../types/equipment'
import type { ForgeRecipeDefinition, ForgeRequest, ForgeResult, ForgingCatalog, ForgingSnapshot } from '../../types/recipe'
import type { RecipeId } from '../../types/ids'
import type { ItemDefinition, InventoryState } from '../../types/item'

export interface ForgingValidationIssue {
  readonly code: 'duplicate_id' | 'missing_item' | 'invalid_value' | 'missing_equipment'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface ForgingValidationResult {
  readonly valid: boolean
  readonly issues: readonly ForgingValidationIssue[]
}

export class ForgingEngineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ForgingEngineError'
  }
}

const EMPTY_STATE: ForgingSnapshot = { version: 1, craftedCounts: {}, processedActionIds: [] }
const EMPTY_CONDITION_CONTEXT: ConditionContext = { quests: {}, inventory: {}, stats: {}, flags: {} }

function isArray<T>(value: readonly T[] | ReadonlyMap<string, T>): value is readonly T[] {
  return Array.isArray(value)
}

function findItem(items: ForgingCatalog['items'], id: string): ItemDefinition | undefined {
  if (isArray(items)) return items.find((item) => String(item.id) === id)
  return (items as ReadonlyMap<string, ItemDefinition>).get(id)
}

function findEquipment(equipment: ForgingCatalog['equipment'], id: string): EquipmentDefinition | undefined {
  if (!equipment) return undefined
  if (isArray(equipment)) return equipment.find((definition) => String(definition.id) === id)
  return (equipment as ReadonlyMap<string, EquipmentDefinition>).get(id)
}

function cloneState(state: ForgingSnapshot): ForgingSnapshot {
  return { version: 1, craftedCounts: { ...state.craftedCounts }, processedActionIds: [...state.processedActionIds] }
}

function hasId(values: readonly string[] | ReadonlySet<string>, id: string): boolean {
  return typeof (values as ReadonlySet<string>).has === 'function' ? (values as ReadonlySet<string>).has(id) : (values as readonly string[]).includes(id)
}

export function validateForgingRecipes(
  recipes: readonly ForgeRecipeDefinition[],
  options: { readonly chapterId?: string; readonly itemIds?: readonly string[] | ReadonlySet<string>; readonly equipmentIds?: readonly string[] | ReadonlySet<string> } = {},
): ForgingValidationResult {
  const issues: ForgingValidationIssue[] = []
  const seen = new Set<string>()
  recipes.forEach((recipe, index) => {
    const path = `recipes[${index}]`
    const id = String(recipe.id)
    if (seen.has(id)) issues.push({ code: 'duplicate_id', path: `${path}.id`, message: `重复配方 ID「${id}」`, id })
    seen.add(id)
    if (options.chapterId && String(recipe.chapterId) !== options.chapterId) issues.push({ code: 'invalid_value', path: `${path}.chapterId`, message: '配方章节与内容阶段不匹配', id })
    if (!recipe.name.trim() || !recipe.description.trim()) issues.push({ code: 'invalid_value', path: `${path}.name`, message: '配方名称和说明不能为空', id })
    if (!Number.isInteger(recipe.requiredChapter) || recipe.requiredChapter < 1) issues.push({ code: 'invalid_value', path: `${path}.requiredChapter`, message: '配方开放章节必须是正整数', id })
    if (recipe.materials.length === 0) issues.push({ code: 'invalid_value', path: `${path}.materials`, message: '配方至少需要一种材料', id })
    recipe.materials.forEach((material, materialIndex) => {
      if (!Number.isInteger(material.count) || material.count <= 0) issues.push({ code: 'invalid_value', path: `${path}.materials[${materialIndex}].count`, message: '材料数量必须是正整数', id })
      if (options.itemIds && !hasId(options.itemIds, String(material.itemId))) issues.push({ code: 'missing_item', path: `${path}.materials[${materialIndex}].itemId`, message: `找不到材料「${material.itemId}」`, id: String(material.itemId) })
    })
    if (!Number.isInteger(recipe.output.count) || recipe.output.count <= 0) issues.push({ code: 'invalid_value', path: `${path}.output.count`, message: '产物数量必须是正整数', id })
    if (options.itemIds && !hasId(options.itemIds, String(recipe.output.itemId))) issues.push({ code: 'missing_item', path: `${path}.output.itemId`, message: `找不到产物「${recipe.output.itemId}」`, id: String(recipe.output.itemId) })
    if (recipe.output.equipmentId && options.equipmentIds && !hasId(options.equipmentIds, String(recipe.output.equipmentId))) issues.push({ code: 'missing_equipment', path: `${path}.output.equipmentId`, message: `找不到装备定义「${recipe.output.equipmentId}」`, id: String(recipe.output.equipmentId) })
  })
  return { valid: issues.length === 0, issues }
}

function result(status: ForgeResult['status'], recipeId: RecipeId, inventory: InventoryState, equipmentIds: readonly string[], state: ForgingSnapshot, message: string, extras: Partial<Pick<ForgeResult, 'output' | 'events' | 'actionId'>> = {}): ForgeResult {
  return { status, recipeId, inventory, equipmentIds: [...equipmentIds], state, events: [], message, ...extras }
}

export class ForgingEngine {
  private readonly recipes: ReadonlyMap<RecipeId, ForgeRecipeDefinition>
  private readonly catalog: ForgingCatalog
  private readonly eventBus?: EventBus
  private state: ForgingSnapshot

  constructor(recipes: readonly ForgeRecipeDefinition[], catalog: ForgingCatalog, initialState: ForgingSnapshot = EMPTY_STATE, eventBus?: EventBus) {
    const itemIds: readonly string[] | ReadonlySet<string> = isArray(catalog.items) ? catalog.items.map((item) => String(item.id)) : new Set<string>((catalog.items as ReadonlyMap<string, ItemDefinition>).keys())
    const equipmentIds = catalog.equipment === undefined
      ? undefined
      : isArray(catalog.equipment) ? catalog.equipment.map((equipment) => String(equipment.id)) : new Set<string>((catalog.equipment as ReadonlyMap<string, EquipmentDefinition>).keys())
    const validation = validateForgingRecipes(recipes, { itemIds, equipmentIds })
    if (!validation.valid) throw new ForgingEngineError(validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'))
    if (initialState.version !== 1) throw new ForgingEngineError('锻造快照版本无效。')
    this.recipes = new Map(recipes.map((recipe) => [recipe.id, recipe]))
    this.catalog = catalog
    this.state = cloneState(initialState)
    this.eventBus = eventBus
  }

  getState(): ForgingSnapshot { return cloneState(this.state) }

  snapshot(): ForgingSnapshot { return this.getState() }

  craft(request: ForgeRequest): ForgeResult {
    const recipe = this.recipes.get(request.recipeId)
    if (!recipe) throw new ForgingEngineError(`未知配方「${request.recipeId}」`)
    const craftedCount = this.state.craftedCounts[String(recipe.id)] ?? 0
    const actionId = request.actionId ?? `forge:${recipe.id}:${craftedCount + 1}`
    if (this.state.processedActionIds.includes(actionId)) return result('duplicate_action', recipe.id, request.inventory, request.equipmentIds, this.getState(), '这次锻造操作已经处理过。', { actionId })
    if (!Number.isInteger(request.chapter) || request.chapter < recipe.requiredChapter) return result('chapter_locked', recipe.id, request.inventory, request.equipmentIds, this.getState(), `第 ${recipe.requiredChapter} 章后才能使用这张配方。`, { actionId })
    if (recipe.unlockCondition) {
      let unlocked = false
      try { unlocked = evaluateCondition(recipe.unlockCondition, request.conditionContext ?? EMPTY_CONDITION_CONTEXT) } catch { unlocked = false }
      if (!unlocked && !request.unlockedRecipeIds?.includes(recipe.id)) return result('condition_locked', recipe.id, request.inventory, request.equipmentIds, this.getState(), recipe.lockedReason ?? '尚未满足配方解锁条件。', { actionId })
    }
    for (const material of recipe.materials) {
      const required = recipe.materials.filter((candidate) => String(candidate.itemId) === String(material.itemId)).reduce((total, candidate) => total + candidate.count, 0)
      if (getItemCount(request.inventory, String(material.itemId)) < required) return result('insufficient_materials', recipe.id, request.inventory, request.equipmentIds, this.getState(), `材料「${material.itemId}」数量不足。`, { actionId })
    }
    const output = findItem(this.catalog.items, String(recipe.output.itemId))
    if (!output) throw new ForgingEngineError(`配方引用未知产物「${recipe.output.itemId}」`)
    if (recipe.output.equipmentId && findEquipment(this.catalog.equipment, String(recipe.output.equipmentId)) === undefined) throw new ForgingEngineError(`配方引用未知装备「${recipe.output.equipmentId}」`)
    if (recipe.output.equipmentId && request.equipmentIds.includes(String(recipe.output.equipmentId))) return result('unique_output_owned', recipe.id, request.inventory, request.equipmentIds, this.getState(), '这件装备已经在当前装备收藏中。', { actionId })
    if (output.unique && getItemCount(request.inventory, String(recipe.output.itemId)) > 0) return result('unique_output_owned', recipe.id, request.inventory, request.equipmentIds, this.getState(), '这个唯一产物已经在背包中。', { actionId })
    try {
      let inventory = request.inventory
      recipe.materials.forEach((material) => { inventory = removeItem(inventory, String(material.itemId), material.count) })
      inventory = addItem(inventory, output, recipe.output.count)
      const nextEquipmentIds = recipe.output.equipmentId ? [...request.equipmentIds, String(recipe.output.equipmentId)] : [...request.equipmentIds]
      this.state = { version: 1, craftedCounts: { ...this.state.craftedCounts, [String(recipe.id)]: craftedCount + 1 }, processedActionIds: [...this.state.processedActionIds, actionId] }
      const event = { id: `${actionId}:crafted`, type: 'crafting.recipe_crafted', occurredAtTick: 0, payload: { recipeId: recipe.id, output: recipe.output }, sourceActionId: actionId }
      this.eventBus?.dispatch(event)
      return result('crafted', recipe.id, inventory, nextEquipmentIds, this.getState(), '锻造完成，产物已放入背包。', { actionId, output: recipe.output, events: [event] })
    } catch (error) {
      if (error instanceof InventoryError) return result('inventory_full', recipe.id, request.inventory, request.equipmentIds, this.getState(), '背包空间不足，材料未扣除；整理背包后可重新锻造。', { actionId })
      throw error
    }
  }
}

export function createForgingEngine(recipes: readonly ForgeRecipeDefinition[], catalog: ForgingCatalog, initialState?: ForgingSnapshot, eventBus?: EventBus): ForgingEngine {
  return new ForgingEngine(recipes, catalog, initialState, eventBus)
}

export function restoreForgingSnapshot(recipes: readonly ForgeRecipeDefinition[], catalog: ForgingCatalog, snapshot: ForgingSnapshot, eventBus?: EventBus): ForgingEngine {
  return createForgingEngine(recipes, catalog, snapshot, eventBus)
}
