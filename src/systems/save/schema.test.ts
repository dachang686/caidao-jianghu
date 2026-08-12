import { describe, expect, it } from 'vitest'
import { createMinimalGameSaveV2, gameSaveV2Schema, parseGameSaveV2, GameSaveValidationError } from './schema'

describe('GameSaveV2 schema', () => {
  it('接受有效最小档与包含完整领域模块的档案', () => {
    const minimal = createMinimalGameSaveV2()
    expect(gameSaveV2Schema.safeParse(minimal).success).toBe(true)
    const full = {
      ...minimal,
      chapterId: 'ch01',
      tasks: [{ questId: 'quest:intro', status: 'completed', progress: 1 }],
      items: [{ itemId: 'item:cleaver', count: 1 }],
      skills: { unlockedSkillIds: ['skill:slash'], activeSkillIds: ['skill:slash'], skillPoints: 2 },
      recipeIds: ['recipe:soup'],
      sect: { unlocked: true, facilities: { training: 1, kitchen: 2, forge: 0, intel: 1 }, discipleIds: ['disciple:a'], dispatches: [{ dispatchId: 'dispatch:a', progressTicks: 3 }] },
      commissions: { activeIds: ['commission:a'], completedIds: [] },
      endings: { seenIds: ['ending:chef'], chosenId: 'ending:chef' },
      contentKeys: ['line:intro'],
      defeatedEnemyIds: ['enemy:bai'],
    }
    expect(parseGameSaveV2(full).sect.unlocked).toBe(true)
  })

  it('保存并恢复跨区域 NPC 的唯一关系状态与已处理事件', () => {
    const minimal = createMinimalGameSaveV2()
    const save = {
      ...minimal,
      npcs: {
        states: [{ npcId: 'npc:traveler', favor: 9, irritation: 1, knownInfoIds: ['info:road'] }],
        processedEventIds: ['event:npc-help'],
      },
    }
    expect(parseGameSaveV2(save).npcs).toEqual(save.npcs)
    const legacy = { ...save }
    delete (legacy as { npcs?: unknown }).npcs
    expect(parseGameSaveV2(legacy).npcs).toEqual({ states: [], processedEventIds: [] })
  })

  it('缺字段和非法值返回包含字段路径的错误', () => {
    const minimal = createMinimalGameSaveV2()
    const missing = { ...minimal, player: undefined }
    expect(() => parseGameSaveV2(missing)).toThrow(/player/)
    expect(() => parseGameSaveV2({ ...minimal, rng: { ...minimal.rng, state: -1 } })).toThrow(/rng\.state/)
    expect(() => parseGameSaveV2({ ...minimal, items: [{ itemId: 'item:fish', count: 0 }] })).toThrow(GameSaveValidationError)
  })

  it('拒绝 UI 中间态、Provider/事件订阅和任何凭据字段', () => {
    const minimal = createMinimalGameSaveV2() as unknown as Record<string, unknown>
    expect(gameSaveV2Schema.safeParse({ ...minimal, battle: { turn: 'player' } }).success).toBe(false)
    expect(gameSaveV2Schema.safeParse({ ...minimal, activeDialogue: 'old-man' }).success).toBe(false)
    expect(gameSaveV2Schema.safeParse({ ...minimal, provider: { name: 'local' } }).success).toBe(false)
    expect(gameSaveV2Schema.safeParse({ ...minimal, settings: { ...minimal.settings as object, aiEnhancement: { enabled: true, provider: 'none', apiKey: 'secret' } } }).success).toBe(false)
    expect(JSON.stringify(minimal)).not.toContain('apiKey')
  })
})
