// 门派设施只通过升级领域动作扣费和产生收益，不读写现实时间或页面状态。
export { SectFacilityError, assertValidSectFacilityDefinitions, createInitialSectUpgradeState, upgradeFacility, validateSectFacilityDefinitions } from './facilities'
export type { SectFacilityValidationIssue, SectFacilityValidationResult } from './facilities'
export {
  BATTLE_COMPLETED_EVENT,
  DispatchEngineError,
  SectDispatchEngine,
  advanceDispatch,
  claimDispatch,
  createDispatchEngine,
  isEligibleBattleCompletedEvent,
  parseDispatchSnapshot,
  restoreDispatchSnapshot,
  serializeDispatchSnapshot,
  startDispatch,
} from './dispatch'
export {
  DiscipleEngineError,
  DiscipleRoster,
  assertValidDiscipleDefinitions,
  createDiscipleRoster,
  markDiscipleDialogueSeen,
  previewDiscipleDispatch,
  recruitDisciple,
  validateDiscipleDefinitions,
  validateDiscipleDispatchEventDefinitions,
} from './disciples'
