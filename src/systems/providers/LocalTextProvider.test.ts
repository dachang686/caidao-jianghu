import { describe, expect, it } from 'vitest'
import { LocalTextProvider } from './LocalTextProvider'
import { CORE_MEME_PACK } from '../../content/memes'

const player = { level: 1, titleIds: [], moralBand: 'mid' as const, fameBand: 'unknown' as const, recentActionTags: [] }

describe('LocalTextProvider', () => {
  it('所有旁白与模板同步返回非空本地纯文本，并受长度限制', () => {
    const provider = new LocalTextProvider()
    const narration = provider.getNarration({ requestId: 'n-1', trigger: 'battle_win', player, memeDensity: 'standard' })
    expect(narration).toMatchObject({ source: 'local', requestId: 'n-1' })
    expect(narration.value).not.toBe('')
    expect(narration.value).not.toMatch(/[<>]/)
    const generated = provider.generateText({ requestId: 'g-1', type: 'item_flavor', safeData: { item: '生锈菜刀', extra: ['a', 'b'] }, memeDensity: 'spicy', maxLength: 24 })
    expect(generated.value.length).toBeLessThanOrEqual(24)
    expect(generated.value).not.toBe('')
  })

  it('未知模板类型和空 requestId 仍返回确定本地回退，不触发网络', () => {
    const provider = new LocalTextProvider()
    const result = provider.generateText({ requestId: '', type: 'unknown-type' as never, safeData: {}, memeDensity: 'mild', maxLength: 120 })
    expect(result.requestId).toBe('local:generated')
    expect(result.source).toBe('local')
    expect(result.value).toContain('这件江湖小事')
  })

  it('对白只改写作者已有 optionId，且密度变化不增加选项', () => {
    const provider = new LocalTextProvider()
    const result = provider.enrichDialogueCopy({ requestId: 'd-1', nodeId: 'node-1', npcId: 'npc-1', player, memeDensity: 'spicy', authoredOptions: [{ optionId: 'a', semanticTag: '好言相劝' }, { optionId: 'b', semanticTag: '先观察' }] })
    expect(result.value.map((patch) => patch.optionId)).toEqual(['a', 'b'])
    expect(result.value).toHaveLength(2)
    expect(result.value.every((patch) => !patch.label.includes('<'))).toBe(true)
  })

  it('通过本地 memePack 调度补充文案，密度切换不改写已经返回的文本', () => {
    const provider = new LocalTextProvider(CORE_MEME_PACK)
    const standard = provider.getNarration({ requestId: 'meme-standard', trigger: 'battle_win', player, memeDensity: 'standard' })
    const spicy = provider.getNarration({ requestId: 'meme-spicy', trigger: 'battle_win', player, memeDensity: 'spicy' })
    expect(standard.source).toBe('local')
    expect(spicy.source).toBe('local')
    expect(standard.value).not.toMatch(/[<>]/)
    expect(spicy.value).not.toMatch(/[<>]/)
    expect(standard.requestId).toBe('meme-standard')
  })
})
