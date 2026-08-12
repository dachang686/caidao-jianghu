import { describe, expect, it } from 'vitest'
import { PauseController } from './pause-controller'

describe('PauseController', () => {
  it('老板键暂停和恢复只改变暂停态，不推进动作', () => {
    const controller = new PauseController()
    expect(controller.toggle('battle-skill-1')).toEqual({ paused: true, reason: 'boss-key', focusToken: 'battle-skill-1' })
    expect(controller.toggle()).toEqual({ paused: false, reason: null, focusToken: 'battle-skill-1' })
  })
})
