import { describe, expect, it } from 'vitest'
import { contentManifest } from '../../content/manifest'
import { loadChapterSync } from '../../content/sync-loader'
import { ContentValidationError, assertValidContent, validateContent } from './validate'
import type { SkillDefinition } from '../../types/skill'
import type { PassiveDefinition } from '../../types/skill'

describe('内容加载与校验', () => {
  it('当前小愚村章节可以从 Manifest 同步加载并通过校验', () => {
    const chapter = loadChapterSync(contentManifest.chapters[0].id)
    const result = validateContent(contentManifest, [chapter])
    expect(result).toEqual({ valid: true, issues: [] })
    expect(() => assertValidContent(contentManifest, [chapter])).not.toThrow()
  })

  it('重复 ID 和缺失引用会返回结构化路径错误', () => {
    const chapter = loadChapterSync(contentManifest.chapters[0].id)
    const duplicate = { ...chapter, locations: [...chapter.locations, chapter.locations[0]] }
    const result = validateContent(contentManifest, [duplicate])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'duplicate_id' && issue.path.includes('locations'))).toBe(true)

    const broken = {
      ...chapter,
      locations: [{ ...chapter.locations[0], npcIds: [...chapter.locations[0].npcIds, 'missing-npc' as never] }],
    }
    expect(() => assertValidContent(contentManifest, [broken])).toThrow(ContentValidationError)
    try {
      assertValidContent(contentManifest, [broken])
    } catch (error) {
      expect((error as ContentValidationError).issues.some((issue) => issue.path.includes('npcIds'))).toBe(true)
    }
  })

  it('技能内容校验会发现未知前置和前置循环', () => {
    const skills: SkillDefinition[] = [
      { id: 'skill:a', name: '甲', description: '', school: 'dao', target: 'enemy', qiCost: 0, cooldown: 0, effects: [], preview: { summary: '', values: {} }, prerequisiteIds: ['skill:b'] },
      { id: 'skill:b', name: '乙', description: '', school: 'dao', target: 'enemy', qiCost: 0, cooldown: 0, effects: [], preview: { summary: '', values: {} }, prerequisiteIds: ['skill:a'] },
    ]
    const chapter = loadChapterSync(contentManifest.chapters[0].id)
    const result = validateContent(contentManifest, [chapter], [...skills, { ...skills[0], id: 'skill:c', prerequisiteIds: ['skill:missing'] }])
    expect(result.issues.some((issue) => issue.code === 'skill_prerequisite_cycle')).toBe(true)
    expect(result.issues.some((issue) => issue.code === 'missing_reference' && issue.id === 'skill:missing')).toBe(true)
  })

  it('被动内容校验会发现前置循环', () => {
    const passives: PassiveDefinition[] = [
      { id: 'passive:a', name: '甲', description: '', school: 'dao', effects: [], preview: { summary: '', values: {} }, prerequisiteIds: ['passive:b'] },
      { id: 'passive:b', name: '乙', description: '', school: 'dao', effects: [], preview: { summary: '', values: {} }, prerequisiteIds: ['passive:a'] },
    ]
    const chapter = loadChapterSync(contentManifest.chapters[0].id)
    const result = validateContent(contentManifest, [chapter], [], passives)
    expect(result.issues.some((issue) => issue.code === 'passive_prerequisite_cycle')).toBe(true)
  })
})
