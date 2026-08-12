import { contentManifest } from '../src/content/manifest'
import { loadChapterSync } from '../src/content/sync-loader'
import { validateContent } from '../src/validators/content/validate'
import { validateCoreContentCounts, validateOptionalContent } from '../src/validators/content'
import { sectFacilityDefinitions } from '../src/content/sect/facilities'
import { validateSectFacilityDefinitions } from '../src/systems/sect/facilities'
import { discipleDefinitions, discipleDispatchEventDefinitions, discipleTraitDefinitions } from '../src/content/sect/disciples'
import { validateDiscipleDefinitions, validateDiscipleDispatchEventDefinitions } from '../src/systems/sect/disciples'
import { discipleDialogueDefinitions } from '../src/content/dialogues/disciples'
import { validateDialogueGraph } from '../src/systems/dialogue/engine'
import { commissionTemplates } from '../src/content/commissions/templates'
import { validateCommissionTemplates } from '../src/systems/commissions/engine'
import { ch01GatheringItems } from '../src/content/gathering/ch01'
import { ch02GatheringItems } from '../src/content/gathering/ch02'
import { ch03GatheringItems } from '../src/content/gathering/ch03'
import { ch04GatheringItems } from '../src/content/gathering/ch04'
import { ch05GatheringItems } from '../src/content/gathering/ch05'
import { ch06GatheringItems } from '../src/content/gathering/ch06'
import { ch07GatheringItems } from '../src/content/gathering/ch07'
import { ch08GatheringItems } from '../src/content/gathering/ch08'
import { coreForgingEquipment, coreForgingItems, coreForgingRecipes } from '../src/content/recipes/forging'
import { validateForgingRecipes } from '../src/systems/crafting/forging'
import { coreCookingItems, coreCookingRecipes } from '../src/content/recipes/cooking'
import { validateCookingRecipes } from '../src/systems/crafting/cooking'
import { ALL_UNLOCKABLES } from '../src/content/unlockables'
import { validateUnlockableDefinitions } from '../src/systems/unlocks'
import { CORE_MEME_PACK } from '../src/content/memes'
import { validateMemePackDefinitions } from '../src/systems/comedy'
import { sectSituationComboDefinitions } from '../src/content/comedy'
import { CH01_DENSITY_COPY, CH01_DIALOGUE_GRAPH, CH02_DENSITY_COPY, CH02_DIALOGUE_GRAPH, CH02_MODERN_MAPPING_LINES, CH03_DENSITY_COPY, CH03_DIALOGUE_GRAPH, CH03_MODERN_MAPPING_LINES, CH04_DENSITY_COPY, CH04_DIALOGUE_GRAPH, CH04_MODERN_MAPPING_LINES, CORE_CH01_COMEDY_COVERAGE, CORE_CH02_COMEDY_COVERAGE, CORE_CH03_COMEDY_COVERAGE, CORE_CH04_COMEDY_COVERAGE, CORE_PRESENTATION_CUES, ch01InteractionChainDefinitions, ch01SituationComboDefinitions, ch02InteractionChainDefinitions, ch02SituationComboDefinitions, ch03InteractionChainDefinitions, ch03SituationComboDefinitions, ch04InteractionChainDefinitions, ch04SituationComboDefinitions } from '../src/content'
import { validateInteractionChainDefinitions, validatePresentationCueDefinitions, validateSituationComboDefinitions } from '../src/systems/comedy'
import { validateComedyCoverage } from '../src/validators/content/comedy'
import { CH05_DENSITY_COPY, CH05_DIALOGUE_GRAPH, CH05_MODERN_MAPPING_LINES, CH06_DENSITY_COPY, CH06_DIALOGUE_GRAPH, CH06_MODERN_MAPPING_LINES, CH07_DENSITY_COPY, CH07_DIALOGUE_GRAPH, CH07_MODERN_MAPPING_LINES, CH08_DENSITY_COPY, CH08_DIALOGUE_GRAPH, CH08_MODERN_MAPPING_LINES, CORE_CH05_COMEDY_COVERAGE, CORE_CH06_COMEDY_COVERAGE, CORE_CH07_COMEDY_COVERAGE, CORE_CH08_COMEDY_COVERAGE, ch05InteractionChainDefinitions, ch05SituationComboDefinitions, ch06InteractionChainDefinitions, ch06SituationComboDefinitions, ch07InteractionChainDefinitions, ch07SituationComboDefinitions, ch08InteractionChainDefinitions, ch08SituationComboDefinitions } from '../src/content'
import { CORE_ENEMY_BEHAVIOR_TEMPLATES, CORE_ENEMY_ENCOUNTERS, CORE_ENEMY_VARIANTS } from '../src/content'
import { validateCoreEnemyRoster } from '../src/validators/content/enemy-roster'
import { POSTGAME_COMMISSION_TEMPLATES } from '../src/content/commissions/postgame'
import { CORE_ENDINGS, CORE_ENDING_DIALOGUES, CORE_ENDING_COMEDY } from '../src/content'
import { validateCoreEndingContent } from '../src/validators/content/endings'
import {
  CORE_ACTIVE_SKILLS,
  CORE_PASSIVE_SKILLS,
  OPTIONAL_ACTIVE_SKILLS,
  OPTIONAL_PASSIVE_SKILLS,
  OPTIONAL_EQUIPMENT,
  OPTIONAL_EQUIPMENT_FORGING_RECIPES,
  OPTIONAL_EQUIPMENT_ITEMS,
  OPTIONAL_EQUIPMENT_MATERIALS,
  OPTIONAL_FORGING_ITEMS,
  OPTIONAL_FORGING_RECIPES,
  OPTIONAL_COOKING_ITEMS,
  OPTIONAL_COOKING_RECIPES,
  OPTIONAL_DISCIPLE_DEFINITIONS,
  OPTIONAL_DISCIPLE_DISPATCH_EVENTS,
  OPTIONAL_COMMISSION_TEMPLATES,
  OPTIONAL_HIDDEN_BOSSES,
  OPTIONAL_HIDDEN_BOSS_CUES,
  OPTIONAL_POSTGAME_DUNGEONS,
  OPTIONAL_UNLOCKABLES,
  CORE_DISCIPLE_DEFINITIONS,
  CORE_DISCIPLE_TRAITS,
  CORE_COMMISSION_TEMPLATES,
} from '../src/content'
import { validateSkillDefinitions } from '../src/systems/skills/registry'
import { validatePassiveDefinitions } from '../src/systems/skills/passive-tree'

const fixture = process.argv.find((argument) => argument.startsWith('--fixture='))?.slice('--fixture='.length)
const loadedChapters = contentManifest.chapters.map((entry) => loadChapterSync(entry.id))
const chapters = fixture === 'duplicate'
  ? loadedChapters.map((chapter, index) => index === 0 ? { ...chapter, locations: [...chapter.locations, chapter.locations[0]] } : chapter)
  : loadedChapters
const allCoreQuests = chapters.flatMap((chapter) => chapter.quests)
const allCoreEnemies = chapters.flatMap((chapter) => chapter.enemies ?? [])
const result = validateContent(contentManifest, chapters, [...CORE_ACTIVE_SKILLS, ...OPTIONAL_ACTIVE_SKILLS], [...CORE_PASSIVE_SKILLS, ...OPTIONAL_PASSIVE_SKILLS], [...ch01GatheringItems, ...ch02GatheringItems, ...ch03GatheringItems, ...ch04GatheringItems, ...ch05GatheringItems, ...ch06GatheringItems, ...ch07GatheringItems, ...ch08GatheringItems])
const facilityResult = validateSectFacilityDefinitions(sectFacilityDefinitions)
const discipleResult = validateDiscipleDefinitions(discipleDefinitions, discipleTraitDefinitions)
const discipleDispatchResult = validateDiscipleDispatchEventDefinitions(discipleDispatchEventDefinitions, discipleDefinitions, discipleTraitDefinitions)
const discipleDialogueResult = validateDialogueGraph({ id: 'content:disciple-dialogues', startNodeId: discipleDialogueDefinitions[0]!.id, nodes: discipleDialogueDefinitions, maxConfusingHops: 2 })
const commissionResult = validateCommissionTemplates(commissionTemplates)
const postgameCommissionResult = validateCommissionTemplates(POSTGAME_COMMISSION_TEMPLATES)
const forgingResult = validateForgingRecipes(coreForgingRecipes, {
  itemIds: coreForgingItems.map((item) => String(item.id)),
  equipmentIds: coreForgingEquipment.map((equipment) => String(equipment.id)),
})
const enemyRosterResult = validateCoreEnemyRoster(CORE_ENEMY_BEHAVIOR_TEMPLATES, CORE_ENEMY_VARIANTS, CORE_ENEMY_ENCOUNTERS)
const endingResult = validateCoreEndingContent(CORE_ENDINGS, CORE_PRESENTATION_CUES.map((cue) => cue.id), CORE_ENDING_DIALOGUES, CORE_ENDING_COMEDY)
const cookingResult = validateCookingRecipes(coreCookingRecipes, { itemIds: coreCookingItems.map((item) => String(item.id)) })
const coreCountResult = validateCoreContentCounts({
  mainlineQuests: allCoreQuests.filter((quest) => quest.kind === 'main').length,
  sideQuests: allCoreQuests.filter((quest) => quest.kind === 'side').length,
  bosses: allCoreEnemies.filter((enemy) => enemy.role === 'boss').length,
  activeSkills: CORE_ACTIVE_SKILLS.length,
  passiveSkills: CORE_PASSIVE_SKILLS.length,
  equipment: coreForgingEquipment.length,
  forgingRecipes: coreForgingRecipes.length,
  cookingRecipes: coreCookingRecipes.length,
  disciples: CORE_DISCIPLE_DEFINITIONS.length,
  commissionTemplates: CORE_COMMISSION_TEMPLATES.length,
  endings: CORE_ENDINGS.length,
  enemyTemplates: CORE_ENEMY_BEHAVIOR_TEMPLATES.length,
  enemyVariants: CORE_ENEMY_VARIANTS.length,
})
const optionalSkillResult = validateSkillDefinitions([...CORE_ACTIVE_SKILLS, ...OPTIONAL_ACTIVE_SKILLS])
const optionalPassiveResult = validatePassiveDefinitions([...CORE_PASSIVE_SKILLS, ...OPTIONAL_PASSIVE_SKILLS])
const optionalForgingResult = validateForgingRecipes([...OPTIONAL_FORGING_RECIPES, ...OPTIONAL_EQUIPMENT_FORGING_RECIPES], {
  itemIds: [...OPTIONAL_EQUIPMENT_MATERIALS, ...OPTIONAL_FORGING_ITEMS, ...OPTIONAL_EQUIPMENT_ITEMS].map((item) => String(item.id)),
  equipmentIds: OPTIONAL_EQUIPMENT.map((equipment) => String(equipment.id)),
})
const optionalCookingResult = validateCookingRecipes(OPTIONAL_COOKING_RECIPES, {
  itemIds: [...OPTIONAL_EQUIPMENT_MATERIALS, ...OPTIONAL_COOKING_ITEMS].map((item) => String(item.id)),
})
const optionalDiscipleResult = validateDiscipleDefinitions(OPTIONAL_DISCIPLE_DEFINITIONS, CORE_DISCIPLE_TRAITS)
const optionalDiscipleDispatchResult = validateDiscipleDispatchEventDefinitions(OPTIONAL_DISCIPLE_DISPATCH_EVENTS, OPTIONAL_DISCIPLE_DEFINITIONS, CORE_DISCIPLE_TRAITS)
const optionalCommissionResult = validateCommissionTemplates(OPTIONAL_COMMISSION_TEMPLATES)
const optionalCueResult = validatePresentationCueDefinitions(OPTIONAL_HIDDEN_BOSS_CUES)
const optionalResult = validateOptionalContent({
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
  coreIds: new Set([...CORE_ACTIVE_SKILLS, ...CORE_PASSIVE_SKILLS, ...coreForgingEquipment, ...CORE_DISCIPLE_DEFINITIONS, ...CORE_COMMISSION_TEMPLATES].map((item) => String(item.id))),
})
const unlockableResult = validateUnlockableDefinitions(ALL_UNLOCKABLES)
const memeResult = validateMemePackDefinitions(CORE_MEME_PACK)
const sectSituationResult = validateSituationComboDefinitions(sectSituationComboDefinitions)
const ch01DialogueResult = validateDialogueGraph(CH01_DIALOGUE_GRAPH)
const ch01SituationResult = validateSituationComboDefinitions(ch01SituationComboDefinitions)
const ch01InteractionResult = validateInteractionChainDefinitions(ch01InteractionChainDefinitions)
const ch02DialogueResult = validateDialogueGraph(CH02_DIALOGUE_GRAPH)
const ch02SituationResult = validateSituationComboDefinitions(ch02SituationComboDefinitions)
const ch02InteractionResult = validateInteractionChainDefinitions(ch02InteractionChainDefinitions)
const ch03DialogueResult = validateDialogueGraph(CH03_DIALOGUE_GRAPH)
const ch03SituationResult = validateSituationComboDefinitions(ch03SituationComboDefinitions)
const ch03InteractionResult = validateInteractionChainDefinitions(ch03InteractionChainDefinitions)
const ch04DialogueResult = validateDialogueGraph(CH04_DIALOGUE_GRAPH)
const ch04SituationResult = validateSituationComboDefinitions(ch04SituationComboDefinitions)
const ch04InteractionResult = validateInteractionChainDefinitions(ch04InteractionChainDefinitions)
const ch05DialogueResult = validateDialogueGraph(CH05_DIALOGUE_GRAPH)
const ch05SituationResult = validateSituationComboDefinitions(ch05SituationComboDefinitions)
const ch05InteractionResult = validateInteractionChainDefinitions(ch05InteractionChainDefinitions)
const ch06DialogueResult = validateDialogueGraph(CH06_DIALOGUE_GRAPH)
const ch06SituationResult = validateSituationComboDefinitions(ch06SituationComboDefinitions)
const ch06InteractionResult = validateInteractionChainDefinitions(ch06InteractionChainDefinitions)
const ch07DialogueResult = validateDialogueGraph(CH07_DIALOGUE_GRAPH)
const ch07SituationResult = validateSituationComboDefinitions(ch07SituationComboDefinitions)
const ch07InteractionResult = validateInteractionChainDefinitions(ch07InteractionChainDefinitions)
const ch08DialogueResult = validateDialogueGraph(CH08_DIALOGUE_GRAPH)
const ch08SituationResult = validateSituationComboDefinitions(ch08SituationComboDefinitions)
const ch08InteractionResult = validateInteractionChainDefinitions(ch08InteractionChainDefinitions)
const presentationCueResult = validatePresentationCueDefinitions(CORE_PRESENTATION_CUES)
const comedyCoverageResult = validateComedyCoverage([...CORE_CH01_COMEDY_COVERAGE, ...CORE_CH02_COMEDY_COVERAGE, ...CORE_CH03_COMEDY_COVERAGE, ...CORE_CH04_COMEDY_COVERAGE, ...CORE_CH05_COMEDY_COVERAGE, ...CORE_CH06_COMEDY_COVERAGE, ...CORE_CH07_COMEDY_COVERAGE, ...CORE_CH08_COMEDY_COVERAGE])
const ch01DensityValid = (['mild', 'standard', 'spicy'] as const).every((density) => {
  const copy = CH01_DENSITY_COPY[density]
  return copy.length > 0 && copy.every((line) => line.trim().length > 0)
})
const ch02DensityLines = (['mild', 'standard', 'spicy'] as const).flatMap((density) => [...CH02_DENSITY_COPY[density]])
const ch02DensityValid = (['mild', 'standard', 'spicy'] as const).every((density) => {
  const copy = CH02_DENSITY_COPY[density]
  return copy.length > 0 && copy.every((line) => line.trim().length > 0)
}) && CH02_MODERN_MAPPING_LINES.length / Math.max(1, ch02DensityLines.length) <= 0.4
const ch03DensityLines = (['mild', 'standard', 'spicy'] as const).flatMap((density) => [...CH03_DENSITY_COPY[density]])
const ch03DensityValid = (['mild', 'standard', 'spicy'] as const).every((density) => {
  const copy = CH03_DENSITY_COPY[density]
  return copy.length > 0 && copy.every((line) => line.trim().length > 0)
}) && CH03_MODERN_MAPPING_LINES.length / Math.max(1, ch03DensityLines.length) <= 0.4
const ch04DensityLines = (['mild', 'standard', 'spicy'] as const).flatMap((density) => [...CH04_DENSITY_COPY[density]])
const ch04DensityValid = (['mild', 'standard', 'spicy'] as const).every((density) => {
  const copy = CH04_DENSITY_COPY[density]
  return copy.length > 0 && copy.every((line) => line.trim().length > 0)
}) && CH04_MODERN_MAPPING_LINES.length / Math.max(1, ch04DensityLines.length) <= 0.4
const lateDensityValid = ([CH05_DENSITY_COPY, CH06_DENSITY_COPY, CH07_DENSITY_COPY, CH08_DENSITY_COPY] as const).every((copy, index) => {
  const lines = (['mild', 'standard', 'spicy'] as const).flatMap((density) => [...copy[density]])
  const modernLines = [CH05_MODERN_MAPPING_LINES, CH06_MODERN_MAPPING_LINES, CH07_MODERN_MAPPING_LINES, CH08_MODERN_MAPPING_LINES][index]!
  return (['mild', 'standard', 'spicy'] as const).every((density) => copy[density].length > 0 && copy[density].every((line) => line.trim().length > 0)) && modernLines.length / Math.max(1, lines.length) <= 0.4
})

if (!result.valid || !facilityResult.valid || !discipleResult.valid || !discipleDispatchResult.valid || !discipleDialogueResult.valid || !commissionResult.valid || !postgameCommissionResult.valid || !forgingResult.valid || !enemyRosterResult.valid || !endingResult.valid || !cookingResult.valid || !coreCountResult.valid || !optionalSkillResult.valid || !optionalPassiveResult.valid || !optionalForgingResult.valid || !optionalCookingResult.valid || !optionalDiscipleResult.valid || !optionalDiscipleDispatchResult.valid || !optionalCommissionResult.valid || !optionalCueResult.valid || !optionalResult.valid || !unlockableResult.valid || !memeResult.valid || !sectSituationResult.valid || !ch01DialogueResult.valid || !ch01SituationResult.valid || !ch01InteractionResult.valid || !ch02DialogueResult.valid || !ch02SituationResult.valid || !ch02InteractionResult.valid || !ch03DialogueResult.valid || !ch03SituationResult.valid || !ch03InteractionResult.valid || !ch04DialogueResult.valid || !ch04SituationResult.valid || !ch04InteractionResult.valid || !ch05DialogueResult.valid || !ch05SituationResult.valid || !ch05InteractionResult.valid || !ch06DialogueResult.valid || !ch06SituationResult.valid || !ch06InteractionResult.valid || !ch07DialogueResult.valid || !ch07SituationResult.valid || !ch07InteractionResult.valid || !ch08DialogueResult.valid || !ch08SituationResult.valid || !ch08InteractionResult.valid || !presentationCueResult.valid || !comedyCoverageResult.valid || !ch01DensityValid || !ch02DensityValid || !ch03DensityValid || !ch04DensityValid || !lateDensityValid) {
  for (const issue of result.issues) console.error(JSON.stringify(issue))
  for (const issue of facilityResult.issues) console.error(JSON.stringify({ ...issue, path: `sect.${issue.path}` }))
  for (const issue of discipleResult.issues) console.error(JSON.stringify({ ...issue, path: `sect.${issue.path}` }))
  for (const issue of discipleDispatchResult.issues) console.error(JSON.stringify({ ...issue, path: `sect.${issue.path}` }))
  for (const issue of discipleDialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.disciples.${issue.path}` }))
  for (const issue of commissionResult.issues) console.error(JSON.stringify({ ...issue, path: `commissions.${issue.path}` }))
  for (const issue of postgameCommissionResult.issues) console.error(JSON.stringify({ ...issue, path: `commissions.postgame.${issue.path}` }))
  for (const issue of forgingResult.issues) console.error(JSON.stringify({ ...issue, path: `recipes.${issue.path}` }))
  for (const issue of enemyRosterResult.issues) console.error(JSON.stringify({ ...issue, path: `enemies.roster.${issue.path}` }))
  for (const issue of endingResult.issues) console.error(JSON.stringify({ ...issue, path: `endings.${issue.path}` }))
  for (const issue of cookingResult.issues) console.error(JSON.stringify({ ...issue, path: `cooking.${issue.path}` }))
  for (const issue of coreCountResult.issues) console.error(JSON.stringify(issue))
  for (const issue of optionalSkillResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.skills.${issue.path}` }))
  for (const issue of optionalPassiveResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.passives.${issue.path}` }))
  for (const issue of optionalForgingResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.forging.${issue.path}` }))
  for (const issue of optionalCookingResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.cooking.${issue.path}` }))
  for (const issue of optionalDiscipleResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.disciples.${issue.path}` }))
  for (const issue of optionalDiscipleDispatchResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.disciples.${issue.path}` }))
  for (const issue of optionalCommissionResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.commissions.${issue.path}` }))
  for (const issue of optionalCueResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.presentation.${issue.path}` }))
  for (const issue of optionalResult.issues) console.error(JSON.stringify({ ...issue, path: `optional.${issue.path}` }))
  for (const issue of unlockableResult.issues) console.error(JSON.stringify({ ...issue, path: `unlockables.${issue.path}` }))
  for (const issue of memeResult.issues) console.error(JSON.stringify({ ...issue, path: `memes.${issue.path}` }))
  for (const issue of sectSituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.sect.${issue.path}` }))
  for (const issue of ch01DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch01.${issue.path}` }))
  for (const issue of ch01SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch01.situations.${issue.path}` }))
  for (const issue of ch01InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch01.interactions.${issue.path}` }))
  for (const issue of ch02DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch02.${issue.path}` }))
  for (const issue of ch02SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch02.situations.${issue.path}` }))
  for (const issue of ch02InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch02.interactions.${issue.path}` }))
  for (const issue of ch03DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch03.${issue.path}` }))
  for (const issue of ch03SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch03.situations.${issue.path}` }))
  for (const issue of ch03InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch03.interactions.${issue.path}` }))
  for (const issue of ch04DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch04.${issue.path}` }))
  for (const issue of ch04SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch04.situations.${issue.path}` }))
  for (const issue of ch04InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch04.interactions.${issue.path}` }))
  for (const issue of ch05DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch05.${issue.path}` }))
  for (const issue of ch05SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch05.situations.${issue.path}` }))
  for (const issue of ch05InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch05.interactions.${issue.path}` }))
  for (const issue of ch06DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch06.${issue.path}` }))
  for (const issue of ch06SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch06.situations.${issue.path}` }))
  for (const issue of ch06InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch06.interactions.${issue.path}` }))
  for (const issue of ch07DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch07.${issue.path}` }))
  for (const issue of ch07SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch07.situations.${issue.path}` }))
  for (const issue of ch07InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch07.interactions.${issue.path}` }))
  for (const issue of ch08DialogueResult.issues) console.error(JSON.stringify({ ...issue, path: `dialogues.ch08.${issue.path}` }))
  for (const issue of ch08SituationResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch08.situations.${issue.path}` }))
  for (const issue of ch08InteractionResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.ch08.interactions.${issue.path}` }))
  for (const issue of presentationCueResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.presentation.${issue.path}` }))
  for (const issue of comedyCoverageResult.issues) console.error(JSON.stringify({ ...issue, path: `comedy.coverage.${issue.path}` }))
  if (!ch01DensityValid) console.error(JSON.stringify({ code: 'invalid_value', path: 'dialogues.ch01.densityCopy', message: '清淡、标准、加辣三档补充文案必须均非空' }))
  if (!ch02DensityValid) console.error(JSON.stringify({ code: 'invalid_value', path: 'dialogues.ch02.densityCopy', message: '清河县三档补充文案不能为空，现代映射不得超过 40%' }))
  if (!ch03DensityValid) console.error(JSON.stringify({ code: 'invalid_value', path: 'dialogues.ch03.densityCopy', message: '黑风寨三档补充文案不能为空，现代映射不得超过 40%' }))
  if (!ch04DensityValid) console.error(JSON.stringify({ code: 'invalid_value', path: 'dialogues.ch04.densityCopy', message: '青云山三档补充文案不能为空，现代映射不得超过 40%' }))
  if (!lateDensityValid) console.error(JSON.stringify({ code: 'invalid_value', path: 'dialogues.ch05-08.densityCopy', message: '后四章三档补充文案不能为空，现代映射不得超过 40%' }))
  process.exitCode = 1
} else {
  console.log(`content:validate passed (${chapters.length} chapter)`)
}
