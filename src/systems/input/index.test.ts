import { describe, expect, it } from 'vitest'
import { DEFAULT_KEY_BINDINGS, assignKey, getBindingLabel, isTextEntryTarget, normalizeKeyBindings, resolveInputAction, resolveKeyConflicts, resetKeyBindings } from './index'

function keyEvent(code: string, key = code, target?: EventTarget): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { code, key, bubbles: true })
  if (target) Object.defineProperty(event, 'target', { value: target })
  return event
}

describe('input mapping', () => {
  it('resolves duplicate mappings deterministically and lets assignment move a key', () => {
    const resolution = resolveKeyConflicts({ confirm: ['KeyX'], cancel: ['KeyX'], skill1: ['1'] })
    expect(resolution.bindings.confirm).toEqual(['KeyX'])
    expect(resolution.bindings.cancel).toEqual([])
    expect(resolution.bindings.skill1).toEqual(['Digit1'])
    expect(resolution.conflicts).toEqual([{ key: 'KeyX', winner: 'confirm', loser: 'cancel' }])
    expect(assignKey(resolution.bindings, 'cancel', 'KeyX').cancel).toEqual(['KeyX'])
    expect(assignKey(resolution.bindings, 'cancel', 'KeyX').confirm).toEqual([])
  })

  it('maps Space, Escape, Tab and 1–6 without intercepting text entry', () => {
    const bindings = resetKeyBindings()
    expect(resolveInputAction(keyEvent('Space', ' '), bindings)).toBe('confirm')
    expect(resolveInputAction(keyEvent('Escape'), bindings)).toBe('cancel')
    expect(resolveInputAction(keyEvent('Tab'), bindings)).toBe('nextTab')
    expect(resolveInputAction(keyEvent('Digit6', '6'), bindings)).toBe('skill6')
    const input = document.createElement('input')
    expect(isTextEntryTarget(input)).toBe(true)
    expect(resolveInputAction(keyEvent('Digit1', '1', input), bindings)).toBeNull()
  })

  it('keeps the default map complete and displays readable labels', () => {
    const normalized = normalizeKeyBindings(DEFAULT_KEY_BINDINGS)
    expect(Object.keys(normalized)).toHaveLength(9)
    expect(getBindingLabel(normalized.confirm)).toBe('Enter / 空格')
  })
})
