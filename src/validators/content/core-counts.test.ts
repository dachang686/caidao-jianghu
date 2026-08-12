import { describe, expect, it } from 'vitest'
import { validateCoreContentCounts } from './core-counts'

const complete = {
  mainlineQuests: 28,
  sideQuests: 16,
  bosses: 8,
  activeSkills: 16,
  passiveSkills: 8,
  equipment: 48,
  forgingRecipes: 12,
  cookingRecipes: 8,
  disciples: 6,
  commissionTemplates: 12,
  endings: 4,
  enemyTemplates: 12,
  enemyVariants: 24,
}

describe('Core 内容数量门禁', () => {
  it('接受达到最低数量的 Core 数据集', () => {
    expect(validateCoreContentCounts(complete)).toEqual({ valid: true, issues: [] })
  })

  it('对任一不足项返回可定位的失败 fixture', () => {
    const result = validateCoreContentCounts({ ...complete, equipment: 47 })
    expect(result.valid).toBe(false)
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ path: 'core.equipment', code: 'insufficient_count' })]))
  })
})

