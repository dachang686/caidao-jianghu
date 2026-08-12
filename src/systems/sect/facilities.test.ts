import { describe, expect, it } from 'vitest'
import { sectFacilityDefinitions } from '../../content/sect/facilities'
import { asItemId } from '../../types/ids'
import { createSectState } from '../../types/sect'
import {
  createInitialSectUpgradeState,
  upgradeFacility,
  validateSectFacilityDefinitions,
} from './facilities'

const timber = asItemId('item:wood')

function unlockedState() {
  return createInitialSectUpgradeState({
    sect: createSectState({ unlocked: true }),
    wealth: 1000,
    inventory: { capacity: 20, stacks: [{ itemId: timber, count: 2 }], protectedItemIds: [] },
  })
}

describe('sect facilities', () => {
  it('四项设施均有三级配置和非经营收益', () => {
    expect(sectFacilityDefinitions).toHaveLength(4)
    expect(validateSectFacilityDefinitions(sectFacilityDefinitions)).toEqual({ valid: true, issues: [] })
    expect(sectFacilityDefinitions.every((definition) => definition.levels.every((level) => level.benefits.length > 0))).toBe(true)
  })

  it('升级原子扣除银两/材料并通过 Effect executor 产出经营收益', () => {
    const initial = unlockedState()
    const upgraded = upgradeFacility(initial, 'training', sectFacilityDefinitions, 5)
    expect(upgraded.status).toBe('upgraded')
    expect(upgraded.targetLevel).toBe(1)
    expect(upgraded.state.sect.facilities.training).toBe(1)
    expect(upgraded.state.sect.benefits.combatAttackBonus).toBe(1)
    expect(upgraded.state.wealth).toBe(940)
    expect(upgraded.state.inventory.stacks).toEqual([])
    expect(upgraded.effectResult?.state.stats.sectProsperity).toBe(2)

    // 同一份输入快照重复点击，结果相同，不会在领域层隐式二次扣费。
    const duplicate = upgradeFacility(initial, 'training', sectFacilityDefinitions, 5)
    expect(duplicate.state.wealth).toBe(upgraded.state.wealth)
    expect(duplicate.state.inventory).toEqual(upgraded.state.inventory)
    expect(duplicate.grantKey).toBe('sect:training:1')
  })

  it('检查门派解锁、章节、材料和前置等级，失败不修改输入状态', () => {
    const locked = upgradeFacility(createInitialSectUpgradeState(), 'training', sectFacilityDefinitions, 5)
    expect(locked.status).toBe('sect_locked')

    const chapterLocked = upgradeFacility(unlockedState(), 'training', sectFacilityDefinitions, 4)
    expect(chapterLocked.status).toBe('chapter_locked')

    const poor = upgradeFacility({ ...unlockedState(), wealth: 0 }, 'training', sectFacilityDefinitions, 5)
    expect(poor.status).toBe('insufficient_wealth')
    expect(poor.state).toEqual({ ...unlockedState(), wealth: 0 })

    const first = upgradeFacility(unlockedState(), 'training', sectFacilityDefinitions, 5)
    const withoutNextMaterial = upgradeFacility(first.state, 'training', sectFacilityDefinitions, 5)
    expect(withoutNextMaterial.status).toBe('insufficient_materials')
  })
})
