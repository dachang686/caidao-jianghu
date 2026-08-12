// ComedyDirector 只选择 cue/effect 请求，不直接修改领域状态或战斗数值。
export { ComedyDirector, ComedyDirectorError, createComedyDirector } from './ComedyDirector'
export {
  EMPTY_MEME_DIRECTOR_SNAPSHOT,
  MemeDirector,
  MemeDirectorError,
  MemeDirectorSnapshotError,
  assertValidMemePackDefinitions,
  createMemeDirector,
  parseMemeDirectorSnapshot,
  restoreMemeDirectorSnapshot,
  selectMeme,
  serializeMemeDirectorSnapshot,
  validateMemePackDefinitions,
} from './MemeDirector'
export {
  SituationComboEngine,
  SituationComboEngineError,
  SituationComboSnapshotError,
  assertValidSituationComboDefinitions,
  createSituationComboEngine,
  parseSituationComboSnapshot,
  restoreSituationComboSnapshot,
  serializeSituationComboSnapshot,
  triggerSituationCombo,
  validateSituationComboDefinitions,
} from './situations'
export {
  InteractionChainEngine,
  InteractionChainEngineError,
  InteractionChainEngineSnapshotError,
  InteractionChainSnapshotError,
  assertValidInteractionChainDefinitions,
  createInteractionChainEngine,
  parseInteractionChainSnapshot,
  restoreInteractionChainSnapshot,
  serializeInteractionChainSnapshot,
  triggerInteractionChain,
  validateInteractionChainDefinitions,
} from './interactions'
export {
  PresentationCueRuntime,
  PresentationCueRuntimeError,
  assertValidPresentationCueDefinitions,
  createPresentationCueRuntime,
  validatePresentationCueDefinitions,
} from './presentation'
