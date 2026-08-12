import type { SkillDefinition } from '../../types/skill'
import { daoSkills } from './dao'
import { miscSkills } from './misc'
import { mouthSkills } from './mouth'
import { passiveSkills } from './passives'
import { survivalSkills } from './survival'
import { OPTIONAL_ACTIVE_SKILLS, OPTIONAL_PASSIVE_SKILLS } from './optional'
export { CORE_PASSIVE_SKILLS, passiveSkills } from './passives'
export { OPTIONAL_ACTIVE_SKILLS, OPTIONAL_PASSIVE_SKILLS }

export { daoSkills } from './dao'
export { mouthSkills } from './mouth'
export { survivalSkills } from './survival'
export { miscSkills } from './misc'

export const coreActiveSkills: readonly SkillDefinition[] = [...daoSkills, ...mouthSkills, ...survivalSkills, ...miscSkills]
export const CORE_ACTIVE_SKILLS = coreActiveSkills
export const allActiveSkills: readonly SkillDefinition[] = [...coreActiveSkills, ...OPTIONAL_ACTIVE_SKILLS]
export const allPassiveSkills = [...passiveSkills, ...OPTIONAL_PASSIVE_SKILLS] as const
export const ALL_ACTIVE_SKILLS = allActiveSkills
export const ALL_PASSIVE_SKILLS = allPassiveSkills
