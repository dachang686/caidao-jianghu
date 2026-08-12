import { describe, expect, it } from 'vitest'
import { CORE_CH01_COMEDY_COVERAGE } from '../../content/comedy/coverage'
import type { ChapterComedyCoverage, ComedyCoverageDefinition } from '../../types/comedy-coverage'
import { validateComedyCoverage } from './comedy'

const base: ComedyCoverageDefinition = {
  id: 'fixture:rule',
  layer: 'rule',
  scale: 'minor',
  triggerEvent: 'battle.intent_previewed',
  cooldownGroup: 'fixture:rule',
  firstCueId: 'cue:fixture:first',
  repeatCueId: 'cue:fixture:repeat',
  reducedMotionCueId: 'cue:fixture:static',
  maxBlockingMs: 200,
  previewStatKeys: ['expectedDamage'],
}

const validChapter: ChapterComedyCoverage = {
  chapterId: 'fixture-ch01',
  entries: [
    base,
    { ...base, id: 'fixture:situation', layer: 'situation', triggerEvent: 'item.gained' },
    { ...base, id: 'fixture:interaction', layer: 'interaction', triggerEvent: 'npc.interaction', previewStatKeys: undefined },
    { ...base, id: 'fixture:presentation', layer: 'presentation', scale: 'major', triggerEvent: 'battle.won', bossCue: true, bossId: 'bai-daxia', previewStatKeys: undefined },
  ],
}

describe('四层幽默覆盖与安全校验', () => {
  it('本章四层覆盖字段完整，且默认只报告当前累计数量不强行伪造后续 Core 内容', () => {
    const result = validateComedyCoverage(CORE_CH01_COMEDY_COVERAGE)
    expect(result).toMatchObject({ valid: true, counts: { rule: 2, situation: 1, interaction: 2, presentation: 1, bossCues: 1 } })
  })

  it('缺失层、严格 Core 数量和 Boss cue 各自可定位', () => {
    const missing = validateComedyCoverage([{ ...validChapter, entries: validChapter.entries.filter((entry) => entry.layer !== 'rule') }])
    expect(missing.issues.some((issue) => issue.code === 'missing_layer' && issue.path.includes('entries'))).toBe(true)

    const strict = validateComedyCoverage([validChapter], { enforceCoreMinimums: true })
    expect(strict.issues.some((issue) => issue.code === 'core_count' && issue.path === 'core.rule')).toBe(true)
    expect(strict.issues.some((issue) => issue.code === 'boss_cue_count' && issue.path === 'core.bossCues')).toBe(true)
  })

  it('严格模式接受计划中的 Core 最低量', () => {
    const makeEntries = (layer: ComedyCoverageDefinition['layer'], count: number): ComedyCoverageDefinition[] => Array.from({ length: count }, (_, index) => ({
      ...base,
      id: `fixture:core:${layer}:${index}`,
      layer,
      triggerEvent: `fixture.${layer}.${index}`,
      previewStatKeys: layer === 'rule' ? ['expectedDamage'] : undefined,
      bossCue: layer === 'presentation',
      bossId: layer === 'presentation' ? `boss:${index}` : undefined,
    }))
    const result = validateComedyCoverage([{
      chapterId: 'fixture-core',
      entries: [
        ...makeEntries('rule', 8),
        ...makeEntries('situation', 12),
        ...makeEntries('interaction', 10),
        ...makeEntries('presentation', 8),
      ],
    }], { enforceCoreMinimums: true })
    expect(result.valid).toBe(true)
    expect(result.counts).toEqual({ rule: 8, situation: 12, interaction: 10, presentation: 8, bossCues: 8 })
  })

  it('Optional 关闭时不占 Core 门槛，打开后才计入数量', () => {
    const optional = { ...base, id: 'fixture:optional-rule', required: false }
    const chapter = { ...validChapter, entries: [...validChapter.entries, optional] }
    expect(validateComedyCoverage([chapter]).counts.rule).toBe(1)
    expect(validateComedyCoverage([chapter], { includeOptional: true }).counts.rule).toBe(2)
  })

  it('分别拒绝关键物品删除、永久减益和超时演出', () => {
    const deleted = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, effects: [{ type: 'delete_item', itemId: 'item:key' } as never] }] }])
    expect(deleted.issues.some((issue) => issue.code === 'forbidden_effect')).toBe(true)

    const negativeItem = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, effects: [{ type: 'give_item', itemId: 'item:key', count: -1 } as never] }] }])
    expect(negativeItem.issues.some((issue) => issue.code === 'forbidden_effect' && issue.path.includes('count'))).toBe(true)

    const debuffed = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, effects: [{ type: 'change_stat', stat: 'fame', delta: -1 }] }] }])
    expect(debuffed.issues.some((issue) => issue.code === 'forbidden_effect' && issue.path.includes('delta'))).toBe(true)

    const slow = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, maxBlockingMs: 1201 }] }])
    expect(slow.issues.some((issue) => issue.code === 'duration_limit')).toBe(true)
  })

  it('拒绝同一触发事件的多个 major、缺失预览/反馈和假结算文案', () => {
    const duplicateMajor = validateComedyCoverage([{ ...validChapter, entries: [
      { ...base, id: 'fixture:major-a', scale: 'major', triggerEvent: 'battle.won' },
      { ...base, id: 'fixture:major-b', scale: 'major', triggerEvent: 'battle.won' },
      ...validChapter.entries.filter((entry) => entry.layer === 'situation' || entry.layer === 'interaction'),
    ] }])
    expect(duplicateMajor.issues.filter((issue) => issue.code === 'multiple_major')).toHaveLength(2)

    const missing = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, previewStatKeys: [], repeatCueId: '' }] }])
    expect(missing.issues.some((issue) => issue.code === 'missing_preview')).toBe(true)
    expect(missing.issues.some((issue) => issue.code === 'missing_feedback')).toBe(true)

    const fake = validateComedyCoverage([{ ...validChapter, entries: [{ ...base, copy: '系统故障：存档损坏，请支付费用恢复。' }] }])
    expect(fake.issues.some((issue) => issue.code === 'fake_settlement')).toBe(true)
  })
})
