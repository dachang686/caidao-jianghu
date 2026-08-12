// 依赖方向：content -> types；内容配置不得反向导入 UI、store 或 system 单例。
export { CONTENT_MANIFEST, contentManifest } from './manifest'
export { CORE_ASSET_IDS, CORE_ASSETS, CORE_ASSET_MANIFEST, coreAssetManifest } from './assets'
export { ContentLoadError, loadChapter, registerChapterLoader } from './loader'
export { loadChapterSync, registerChapterSync } from './sync-loader'
export type { ChapterContent, ChapterLoader } from './loader'
export * from './skills'
export * from './loot'
export { CORE_SECT_FACILITIES, sectFacilityDefinitions } from './sect/facilities'
export { CH01_HOTSPOTS, ch01HotspotDefinitions } from './hotspots/ch01'
export { CH02_HOTSPOTS, ch02HotspotDefinitions } from './hotspots/ch02'
export { CH03_HOTSPOTS, ch03HotspotDefinitions } from './hotspots/ch03'
export { CH04_HOTSPOTS, ch04HotspotDefinitions } from './hotspots/ch04'
export { CORE_GATHERING_ITEMS, CORE_GATHERING_NODES, ch01GatheringItems, ch01GatheringNodes } from './gathering/ch01'
export { CORE_CH02_GATHERING_ITEMS, CORE_CH02_GATHERING_NODES, ch02GatheringItems, ch02GatheringNodes } from './gathering/ch02'
export { CORE_CH03_GATHERING_ITEMS, CORE_CH03_GATHERING_NODES, ch03GatheringItems, ch03GatheringNodes } from './gathering/ch03'
export { CORE_CH04_GATHERING_ITEMS, CORE_CH04_GATHERING_NODES, ch04GatheringItems, ch04GatheringNodes } from './gathering/ch04'
export { CORE_CH05_GATHERING_ITEMS, CORE_CH05_GATHERING_NODES, ch05GatheringItems, ch05GatheringNodes } from './gathering/ch05'
export { CORE_CH06_GATHERING_ITEMS, CORE_CH06_GATHERING_NODES, ch06GatheringItems, ch06GatheringNodes } from './gathering/ch06'
export { CORE_CH07_GATHERING_ITEMS, CORE_CH07_GATHERING_NODES, ch07GatheringItems, ch07GatheringNodes } from './gathering/ch07'
export { CORE_CH08_GATHERING_ITEMS, CORE_CH08_GATHERING_NODES, ch08GatheringItems, ch08GatheringNodes } from './gathering/ch08'
export { FORGING_RECIPES, coreForgingEquipment, coreForgingItems, coreForgingRecipes } from './recipes/forging'
export { CORE_EARLY_EQUIPMENT, CORE_EARLY_EQUIPMENT_ITEMS, CORE_EARLY_FORGING_RECIPES, CORE_EARLY_UPGRADE_CURVE, CORE_LATE_EQUIPMENT, CORE_LATE_EQUIPMENT_ITEMS, CORE_LATE_FORGING_RECIPES, CORE_LATE_UPGRADE_CURVE, OPTIONAL_EQUIPMENT, OPTIONAL_EQUIPMENT_FORGING_RECIPES, OPTIONAL_EQUIPMENT_ITEMS, OPTIONAL_EQUIPMENT_MATERIALS } from './items/equipment'
export { CORE_VENDOR_OFFERS, CORE_VENDOR_ITEMS, getCoreEquipmentMarketItem, getCoreVendorOffer } from './vendors'
export { COOKING_RECIPES, coreCookingItems, coreCookingRecipes, coreFoodBuffs } from './recipes/cooking'
export { OPTIONAL_COOKING_BUFFS, OPTIONAL_COOKING_ITEMS, OPTIONAL_COOKING_RECIPES, OPTIONAL_FORGING_ITEMS, OPTIONAL_FORGING_RECIPES } from './recipes/optional'
export { OPTIONAL_POSTGAME_DUNGEONS } from './postgame'
export { ALL_UNLOCKABLES, CORE_UNLOCKABLES, OPTIONAL_UNLOCKABLES, unlockableDefinitions } from './unlockables'
export { CH01_ENEMY_DEFINITIONS, ch01EnemyDefinitions } from './enemies'
export { CH02_ENEMY_DEFINITIONS, ch02EnemyDefinitions } from './enemies'
export { CH03_ENEMY_DEFINITIONS, ch03EnemyDefinitions } from './enemies'
export { CH04_ENEMY_DEFINITIONS, ch04EnemyDefinitions } from './enemies/ch04'
export { CH05_ENEMY_DEFINITIONS, ch05EnemyDefinitions } from './enemies/ch05'
export { CH06_ENEMY_DEFINITIONS, ch06EnemyDefinitions } from './enemies/ch06'
export { CH07_ENEMY_DEFINITIONS, ch07EnemyDefinitions } from './enemies/ch07'
export { CH08_ENEMY_DEFINITIONS, ch08EnemyDefinitions } from './enemies/ch08'
export { OPTIONAL_HIDDEN_BOSS_CUES, OPTIONAL_HIDDEN_BOSS_DISCOVERY_CLUES, OPTIONAL_HIDDEN_BOSS_REWARDS, OPTIONAL_HIDDEN_BOSSES } from './enemies/optional-hidden'
export { CORE_ENEMY_BEHAVIOR_TEMPLATES, CORE_ENEMY_TEMPLATES, coreEnemyBehaviorTemplates } from './enemies/templates'
export { CORE_ENEMY_ENCOUNTERS, CORE_ENEMY_REGION_ROSTERS, CORE_ENEMY_VARIANTS, coreEnemyVariants } from './enemies/regions'
export { CORE_ENDING_CHOICES, CORE_ENDINGS, CORE_ENDING_IDS, coreEndingDefinitions } from './endings'
export { CORE_ENDING_DIALOGUES } from './dialogues/endings'
export { CORE_ENDING_COMEDY } from './comedy/endings'
export { CORE_COMMISSION_TEMPLATES, commissionTemplates } from './commissions/templates'
export { CORE_POSTGAME_COMMISSION_TEMPLATES, POSTGAME_COMMISSION_PACK, POSTGAME_COMMISSION_TEMPLATES } from './commissions/postgame'
export { ALL_COMMISSION_TEMPLATES, OPTIONAL_COMMISSION_TEMPLATES } from './commissions/optional'
export { CORE_BUILD_PROFILES, CORE_CHAPTER_PROGRESSION_BUDGETS, getChapterProgressionBudget } from './balance/progression'
export { ch02NpcDefinitions } from './npcs/ch02'
export { ch03NpcDefinitions } from './npcs/ch03'
export { ch04NpcDefinitions } from './npcs/ch04'
export { ch05NpcDefinitions } from './npcs/ch05'
export { ch06NpcDefinitions } from './npcs/ch06'
export { ch07NpcDefinitions } from './npcs/ch07'
export { ch08NpcDefinitions } from './npcs/ch08'
export { CH02_QUESTS, CORE_CH02_QUESTS } from './quests/ch02'
export { CH03_QUESTS, CORE_CH03_QUESTS } from './quests/ch03'
export { CH04_QUESTS, CORE_CH04_QUESTS } from './quests/ch04'
export { CH05_QUESTS, CORE_CH05_QUESTS } from './quests/ch05'
export { CH06_QUESTS, CORE_CH06_QUESTS } from './quests/ch06'
export { CH07_QUESTS, CORE_CH07_QUESTS } from './quests/ch07'
export { CH08_QUESTS, CORE_CH08_QUESTS } from './quests/ch08'
export {
  CH02_DIALOGUE_COPY_KEYS,
  CH02_DIALOGUE_GRAPH,
  CH02_DENSITY_COPY,
  CH02_MODERN_MAPPING_LINES,
  CORE_CH02_DIALOGUES,
  ch02DialogueDefinitions,
} from './dialogues/ch02'
export {
  CH03_DIALOGUE_COPY_KEYS,
  CH03_DIALOGUE_GRAPH,
  CH03_DENSITY_COPY,
  CH03_MODERN_MAPPING_LINES,
  CORE_CH03_DIALOGUES,
  ch03DialogueDefinitions,
} from './dialogues/ch03'
export {
  CH04_DIALOGUE_COPY_KEYS,
  CH04_DIALOGUE_GRAPH,
  CH04_DENSITY_COPY,
  CH04_MODERN_MAPPING_LINES,
  CORE_CH04_DIALOGUES,
  ch04DialogueDefinitions,
} from './dialogues/ch04'
export { CH05_DIALOGUE_COPY_KEYS, CH05_DIALOGUE_GRAPH, CH05_DENSITY_COPY, CH05_MODERN_MAPPING_LINES, CORE_CH05_DIALOGUES, ch05DialogueDefinitions } from './dialogues/ch05'
export { CH06_DIALOGUE_COPY_KEYS, CH06_DIALOGUE_GRAPH, CH06_DENSITY_COPY, CH06_MODERN_MAPPING_LINES, CORE_CH06_DIALOGUES, ch06DialogueDefinitions } from './dialogues/ch06'
export { CH07_DIALOGUE_COPY_KEYS, CH07_DIALOGUE_GRAPH, CH07_DENSITY_COPY, CH07_MODERN_MAPPING_LINES, CORE_CH07_DIALOGUES, ch07DialogueDefinitions } from './dialogues/ch07'
export { CH08_DIALOGUE_COPY_KEYS, CH08_DIALOGUE_GRAPH, CH08_DENSITY_COPY, CH08_MODERN_MAPPING_LINES, CORE_CH08_DIALOGUES, ch08DialogueDefinitions } from './dialogues/ch08'
export { CH01_BOSS_REWARD } from './chapters/ch01-combat'
export { CH02_BOSS_REWARD } from './chapters/ch02-combat'
export { CH03_BOSS_REWARD } from './chapters/ch03-combat'
export { CH04_BOSS_REWARD } from './chapters/ch04-combat'
export { CH05_BOSS_REWARD } from './chapters/ch05-combat'
export { CH06_BOSS_REWARD } from './chapters/ch06-combat'
export { CH07_BOSS_REWARD } from './chapters/ch07-combat'
export { CH08_BOSS_REWARD } from './chapters/ch08-combat'
export { CORE_MEME_PACK, coreMemePack } from './memes'
export { CORE_DISCIPLE_DEFINITIONS, CORE_DISCIPLE_DISPATCH_EVENTS, CORE_DISCIPLE_TRAITS, discipleDefinitions, discipleDispatchEventDefinitions, discipleTraitDefinitions } from './sect/disciples'
export { OPTIONAL_DISCIPLE_DEFINITIONS, OPTIONAL_DISCIPLE_DIALOGUES, OPTIONAL_DISCIPLE_DISPATCH_EVENTS } from './sect/optional-disciples'
export { CORE_DISCIPLE_DIALOGUES, discipleDialogueDefinitions } from './dialogues'
export { CORE_SECT_SITUATION_COMBOS, sectSituationComboDefinitions } from './comedy'
export {
  CH01_DENSITY_COPY,
  CH01_DIALOGUE_COPY_KEYS,
  CH01_DIALOGUE_GRAPH,
  CORE_CH01_DIALOGUES,
  ch01DialogueDefinitions,
} from './dialogues'
export {
  CH01_COMEDY_COPY,
  CH01_COMEDY_ITEM,
  CORE_CH01_INTERACTION_CHAINS,
  CORE_CH01_SITUATION_COMBOS,
  ch01InteractionChainDefinitions,
  ch01SituationComboDefinitions,
} from './comedy'
export { CORE_PRESENTATION_CUES, corePresentationCues } from './comedy'
export { CH02_COMEDY_COPY, CORE_CH02_INTERACTION_CHAINS, CORE_CH02_SITUATION_COMBOS, ch02InteractionChainDefinitions, ch02SituationComboDefinitions } from './comedy'
export { CH03_COMEDY_COPY, CORE_CH03_INTERACTION_CHAINS, CORE_CH03_SITUATION_COMBOS, ch03InteractionChainDefinitions, ch03SituationComboDefinitions } from './comedy'
export { CH04_COMEDY_COPY, CORE_CH04_INTERACTION_CHAINS, CORE_CH04_SITUATION_COMBOS, ch04InteractionChainDefinitions, ch04SituationComboDefinitions } from './comedy'
export { CH05_COMEDY_COPY, CORE_CH05_INTERACTION_CHAINS, CORE_CH05_SITUATION_COMBOS, ch05InteractionChainDefinitions, ch05SituationComboDefinitions } from './comedy'
export { CH06_COMEDY_COPY, CORE_CH06_INTERACTION_CHAINS, CORE_CH06_SITUATION_COMBOS, ch06InteractionChainDefinitions, ch06SituationComboDefinitions } from './comedy'
export { CH07_COMEDY_COPY, CORE_CH07_INTERACTION_CHAINS, CORE_CH07_SITUATION_COMBOS, ch07InteractionChainDefinitions, ch07SituationComboDefinitions } from './comedy'
export { CH08_COMEDY_COPY, CORE_CH08_INTERACTION_CHAINS, CORE_CH08_SITUATION_COMBOS, ch08InteractionChainDefinitions, ch08SituationComboDefinitions } from './comedy'
export { CORE_CH01_COMEDY_COVERAGE, CORE_CH02_COMEDY_COVERAGE, CORE_CH03_COMEDY_COVERAGE, CORE_CH04_COMEDY_COVERAGE, CORE_CH01_RULES, CORE_CH02_RULES, CORE_CH03_RULES, CORE_CH04_RULES, ch01ComedyCoverage, ch01RuleComedyDefinitions, ch02ComedyCoverage, ch02RuleComedyDefinitions, ch03ComedyCoverage, ch03RuleComedyDefinitions, ch04ComedyCoverage, ch04RuleComedyDefinitions } from './comedy'
export { CORE_CH05_COMEDY_COVERAGE, CORE_CH06_COMEDY_COVERAGE, CORE_CH07_COMEDY_COVERAGE, CORE_CH08_COMEDY_COVERAGE, CORE_CH05_RULES, CORE_CH06_RULES, CORE_CH07_RULES, CORE_CH08_RULES, ch05ComedyCoverage, ch05RuleComedyDefinitions, ch06ComedyCoverage, ch06RuleComedyDefinitions, ch07ComedyCoverage, ch07RuleComedyDefinitions, ch08ComedyCoverage, ch08RuleComedyDefinitions } from './comedy'
