import type { InputAction, KeyBindingMap } from '../../types/settings'

export const INPUT_ACTIONS: readonly InputAction[] = ['confirm', 'cancel', 'nextTab', 'skill1', 'skill2', 'skill3', 'skill4', 'skill5', 'skill6']

export const INPUT_ACTION_LABELS: Readonly<Record<InputAction, string>> = {
  confirm: '确认 / 继续',
  cancel: '返回 / 关闭',
  nextTab: '切换分类',
  skill1: '技能槽 1',
  skill2: '技能槽 2',
  skill3: '技能槽 3',
  skill4: '技能槽 4',
  skill5: '技能槽 5',
  skill6: '技能槽 6',
}

export const DEFAULT_KEY_BINDINGS: KeyBindingMap = {
  confirm: ['Enter', 'Space'],
  cancel: ['Escape'],
  nextTab: ['Tab'],
  skill1: ['Digit1'],
  skill2: ['Digit2'],
  skill3: ['Digit3'],
  skill4: ['Digit4'],
  skill5: ['Digit5'],
  skill6: ['Digit6'],
}

export interface KeyBindingConflict {
  readonly key: string
  readonly winner: InputAction
  readonly loser: InputAction
}

export interface KeyBindingResolution {
  readonly bindings: KeyBindingMap
  readonly conflicts: readonly KeyBindingConflict[]
}

function normalizeKey(key: string): string {
  const value = key.trim()
  if (value === ' ') return 'Space'
  if (value === 'Esc') return 'Escape'
  if (/^[1-6]$/.test(value)) return `Digit${value}`
  return value
}

function sourceKeys(source: Partial<Record<InputAction, readonly string[]>> | undefined, action: InputAction): readonly string[] {
  return source?.[action] ?? DEFAULT_KEY_BINDINGS[action]
}

export function resolveKeyConflicts(input?: Partial<Record<InputAction, readonly string[]>>): KeyBindingResolution {
  const bindings: Record<InputAction, string[]> = {} as Record<InputAction, string[]>
  const conflicts: KeyBindingConflict[] = []
  const owner = new Map<string, InputAction>()
  INPUT_ACTIONS.forEach((action) => {
    bindings[action] = []
    sourceKeys(input, action).forEach((rawKey) => {
      const key = normalizeKey(rawKey)
      if (!key) return
      const previous = owner.get(key)
      if (previous) {
        conflicts.push({ key, winner: previous, loser: action })
        return
      }
      owner.set(key, action)
      bindings[action].push(key)
    })
  })
  return { bindings, conflicts }
}

export function normalizeKeyBindings(input?: Partial<Record<InputAction, readonly string[]>>): KeyBindingMap {
  return resolveKeyConflicts(input).bindings
}

export function assignKey(bindings: KeyBindingMap, action: InputAction, rawKey: string): KeyBindingMap {
  const key = normalizeKey(rawKey)
  if (!key) return bindings
  const next: Record<InputAction, readonly string[]> = { ...bindings }
  INPUT_ACTIONS.forEach((candidate) => {
    next[candidate] = next[candidate].filter((boundKey) => boundKey !== key)
  })
  next[action] = [...next[action], key]
  return normalizeKeyBindings(next)
}

export function resetKeyBindings(): KeyBindingMap {
  return normalizeKeyBindings(DEFAULT_KEY_BINDINGS)
}

export function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false
  const element = target as HTMLElement
  const tagName = element.tagName?.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || element.isContentEditable === true || element.getAttribute?.('contenteditable') === 'true'
}

function eventKeys(event: KeyboardEvent): readonly string[] {
  return [...new Set([normalizeKey(event.code), normalizeKey(event.key)].filter(Boolean))]
}

export function resolveInputAction(event: KeyboardEvent, bindings: KeyBindingMap): InputAction | null {
  if (event.defaultPrevented || event.isComposing || isTextEntryTarget(event.target)) return null
  const keys = eventKeys(event)
  return INPUT_ACTIONS.find((action) => bindings[action].some((key) => keys.includes(key))) ?? null
}

export function getBindingLabel(keys: readonly string[]): string {
  return keys.map((key) => key === 'Space' ? '空格' : key.startsWith('Digit') ? key.slice('Digit'.length) : key).join(' / ')
}

export { canChangeDifficulty, clampVolume, updateGameSettings } from './settings'
export type { SettingsUpdateResult } from './settings'
