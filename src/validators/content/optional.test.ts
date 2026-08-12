import { describe, expect, it } from 'vitest'
import {
  OPTIONAL_ACTIVE_SKILLS,
  OPTIONAL_PASSIVE_SKILLS,
  OPTIONAL_EQUIPMENT,
  OPTIONAL_FORGING_RECIPES,
  OPTIONAL_COOKING_RECIPES,
  OPTIONAL_DISCIPLE_DEFINITIONS,
  OPTIONAL_DISCIPLE_DISPATCH_EVENTS,
  OPTIONAL_COMMISSION_TEMPLATES,
  OPTIONAL_HIDDEN_BOSSES,
  OPTIONAL_HIDDEN_BOSS_CUES,
  OPTIONAL_POSTGAME_DUNGEONS,
  OPTIONAL_UNLOCKABLES,
} from '../../content'
import { CORE_DISCIPLE_TRAITS } from '../../content'
import { validateOptionalContent } from './optional'

const input = {
  activeSkills: OPTIONAL_ACTIVE_SKILLS,
  passiveSkills: OPTIONAL_PASSIVE_SKILLS,
  equipment: OPTIONAL_EQUIPMENT,
  forgingRecipes: OPTIONAL_FORGING_RECIPES,
  cookingRecipes: OPTIONAL_COOKING_RECIPES,
  disciples: OPTIONAL_DISCIPLE_DEFINITIONS,
  discipleTraits: CORE_DISCIPLE_TRAITS,
  discipleDispatchEvents: OPTIONAL_DISCIPLE_DISPATCH_EVENTS,
  commissions: OPTIONAL_COMMISSION_TEMPLATES,
  hiddenBosses: OPTIONAL_HIDDEN_BOSSES,
  hiddenBossCues: OPTIONAL_HIDDEN_BOSS_CUES,
  dungeons: OPTIONAL_POSTGAME_DUNGEONS,
  unlockables: OPTIONAL_UNLOCKABLES,
}

describe('Optional 内容门禁', () => {
  it('接受完整 Optional 内容集', () => {
    expect(validateOptionalContent(input)).toEqual({ valid: true, issues: [] })
  })

  it('拒绝删除一项主动技能、断开装备来源和秘境节点', () => {
    const broken = validateOptionalContent({
      ...input,
      activeSkills: OPTIONAL_ACTIVE_SKILLS.slice(0, 7),
      equipment: OPTIONAL_EQUIPMENT.map((item, index) => index === 0 ? { ...item, sources: [] } : item),
      dungeons: OPTIONAL_POSTGAME_DUNGEONS.map((dungeon, index) => index === 0 ? { ...dungeon, encounters: dungeon.encounters.slice(0, 2) } : dungeon),
    })
    expect(broken.valid).toBe(false)
    expect(broken.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'activeSkills', code: 'insufficient_count' }),
      expect.objectContaining({ path: 'equipment[0]', code: 'invalid_value' }),
      expect.objectContaining({ path: 'dungeons[0].encounters', code: 'invalid_value' }),
    ]))
  })
})
