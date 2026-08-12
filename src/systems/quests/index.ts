// 任务只通过领域事件和 Effect executor 推进，页面不直接修改进度或奖励。
export {
  QuestEngine,
  QuestEngineError,
  QuestSnapshotError,
  activateQuest,
  applyQuestEvent,
  assertValidQuestDefinitions,
  createQuestEngine,
  deliverQuest,
  parseQuestSnapshot,
  restoreQuestSnapshot,
  serializeQuestSnapshot,
  validateQuestDefinitions,
} from './engine'
export type {
  QuestActionOutcome,
  QuestDefinition,
  QuestDeliveryOutcome,
  QuestEngineDeliveryOptions,
  QuestEngineOptions,
  QuestEngineState,
  QuestEventOutcome,
  QuestObjective,
  QuestSnapshot,
  QuestTaskState,
  QuestValidationIssue,
  QuestValidationResult,
} from '../../types/quest'
