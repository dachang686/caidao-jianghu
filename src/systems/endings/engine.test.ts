import { describe, expect, it } from 'vitest'
import { CORE_ENDINGS } from '../../content/endings'
import { createEndingState, recordEnding, selectEnding, validateEndingDefinitions } from './engine'

const context = (overrides: Partial<{ moral: number; fame: number; wealth: number; sectProsperity: number; flags: Record<string, boolean> }> = {}) => ({
  quests: {},
  inventory: {},
  stats: { moral: 10, fame: 30, wealth: 150, sectProsperity: 10, ...(overrides.moral === undefined ? {} : { moral: overrides.moral }), ...(overrides.fame === undefined ? {} : { fame: overrides.fame }), ...(overrides.wealth === undefined ? {} : { wealth: overrides.wealth }), ...(overrides.sectProsperity === undefined ? {} : { sectProsperity: overrides.sectProsperity }) },
  flags: { ch08MainlineComplete: true, publicTruthChosen: true, rankingReformed: true, sectCreated: true, quietRouteChosen: true, ...(overrides.flags ?? {}) },
})

describe('ending engine', () => {
  it('校验四个结局并按明确优先级选出候选', () => {
    expect(validateEndingDefinitions(CORE_ENDINGS).valid).toBe(true)
    expect(selectEnding(CORE_ENDINGS, context()).ending?.id).toBe('ending:cleaver-master')
  })

  it('四个结局夹具均可达且最终选择需要二次确认', () => {
    const fixtures = [
      context({ fame: 18, wealth: 10, sectProsperity: 0, flags: { publicTruthChosen: true, rankingReformed: false, sectCreated: false, quietRouteChosen: false } }),
      context({ moral: 0, fame: 30, wealth: 100, sectProsperity: 0, flags: { publicTruthChosen: false, rankingReformed: true, sectCreated: false, quietRouteChosen: false } }),
      context({ moral: 0, fame: 12, wealth: 10, sectProsperity: 8, flags: { publicTruthChosen: false, rankingReformed: false, sectCreated: true, quietRouteChosen: false } }),
      context({ moral: 0, fame: 0, wealth: 120, sectProsperity: 0, flags: { publicTruthChosen: false, rankingReformed: false, sectCreated: false, quietRouteChosen: true } }),
    ]
    fixtures.forEach((fixture, index) => {
      const selection = selectEnding(CORE_ENDINGS, fixture)
      expect(selection.status).toBe('selected')
      expect(selection.ending?.id).toBe(CORE_ENDINGS[index]?.id)
      const ending = selection.ending!
      const pending = recordEnding(createEndingState(), ending, ending.finalChoiceIds[0]!)
      expect(pending.status).toBe('confirmation_required')
      const recorded = recordEnding(createEndingState(), ending, ending.finalChoiceIds[0]!, true)
      expect(recorded.status).toBe('recorded')
      expect(recordEnding(recorded.state, ending, ending.finalChoiceIds[0]!, true).status).toBe('already_recorded')
    })
  })
})
