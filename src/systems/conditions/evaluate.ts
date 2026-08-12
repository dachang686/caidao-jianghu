import type { Condition, ConditionContext, ConditionLookup, ConditionStat, QuestConditionSnapshot, QuestConditionStatus } from '../../types/conditions'

export class ConditionEvaluationError extends Error {
  readonly path: string

  constructor(path: string, message: string) {
    super(`${path}: ${message}`)
    this.name = 'ConditionEvaluationError'
    this.path = path
  }
}

function isMap<T>(value: ConditionLookup<T>): value is ReadonlyMap<string, T> {
  return value instanceof Map
}

function lookup<T>(source: ConditionLookup<T>, key: string, path: string): T {
  if (isMap(source)) {
    if (!source.has(key)) throw new ConditionEvaluationError(path, `引用不存在「${key}」`)
    return source.get(key) as T
  }
  if (!Object.prototype.hasOwnProperty.call(source, key)) {
    throw new ConditionEvaluationError(path, `引用不存在「${key}」`)
  }
  return source[key] as T
}

function questIsComplete(value: QuestConditionSnapshot | QuestConditionStatus): boolean {
  const status = typeof value === 'string' ? value : value.status
  return status === 'complete' || status === 'completed'
}

function getStat(stats: ConditionContext['stats'], stat: ConditionStat, path: string): number {
  if (!Object.prototype.hasOwnProperty.call(stats, stat)) {
    throw new ConditionEvaluationError(path, `属性引用不存在「${stat}」`)
  }
  const value = stats[stat]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ConditionEvaluationError(path, `属性「${stat}」不是有限数字`)
  }
  return value
}

function isInventoryList(value: ConditionContext['inventory']): value is readonly string[] {
  return Array.isArray(value)
}

function evaluate(condition: Condition, context: ConditionContext, path: string): boolean {
  switch (condition.type) {
    case 'quest_complete': {
      const quest = lookup(context.quests, condition.questId, `${path}.questId`)
      return questIsComplete(quest)
    }
    case 'has_item': {
      const count = condition.count ?? 1
      if (!Number.isInteger(count) || count <= 0) {
        throw new ConditionEvaluationError(`${path}.count`, '数量必须是大于 0 的整数')
      }
      const inventory = context.inventory
      if (isInventoryList(inventory)) {
        return inventory.filter((itemId) => itemId === condition.itemId).length >= count
      }
      return lookup(inventory as ConditionLookup<number>, condition.itemId, `${path}.itemId`) >= count
    }
    case 'stat_gte': {
      if (!Number.isFinite(condition.value)) {
        throw new ConditionEvaluationError(`${path}.value`, '比较值必须是有限数字')
      }
      return getStat(context.stats, condition.stat, `${path}.stat`) >= condition.value
    }
    case 'flag_equals':
      return lookup(context.flags, condition.flag, `${path}.flag`) === condition.value
    case 'not':
      return !evaluate(condition.condition, context, `${path}.condition`)
    case 'all':
      return condition.conditions.every((nested, index) => evaluate(nested, context, `${path}.conditions[${index}]`))
    case 'any':
      return condition.conditions.some((nested, index) => evaluate(nested, context, `${path}.conditions[${index}]`))
    default:
      return assertNever(condition, path)
  }
}

function assertNever(value: never, path: string): never {
  throw new ConditionEvaluationError(path, `未知条件类型「${String((value as { type?: unknown }).type)}」`)
}

export function evaluateCondition(condition: Condition, context: ConditionContext): boolean {
  return evaluate(condition, context, 'condition')
}

export const isConditionMet = evaluateCondition
