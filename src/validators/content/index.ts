// 构建期校验只读取内容并返回诊断，不修改运行状态。
export { ContentValidationError, assertValidContent, validateContent } from './validate'
export type { ContentValidationIssue, ContentValidationResult } from './validate'
export { CORE_COMEDY_MINIMUMS, assertValidComedyCoverage, validateComedyCoverage } from './comedy'
export { assertValidCoreEnemyRoster, validateCoreEnemyRoster } from './enemy-roster'
export type { EnemyRosterValidationIssue, EnemyRosterValidationResult } from './enemy-roster'
export { validateCoreEndingContent } from './endings'
export type { CoreEndingValidationIssue, CoreEndingValidationResult } from './endings'
export { CORE_MINIMUMS, validateCoreContentCounts } from './core-counts'
export type { CoreContentCountInput, CoreContentCountIssue, CoreContentCountResult } from './core-counts'
export { OPTIONAL_MINIMUMS, validateOptionalContent } from './optional'
export type { OptionalContentInput, OptionalContentValidationIssue, OptionalContentValidationResult } from './optional'
export type {
  ComedyCoverageCounts,
  ComedyCoverageIssueCode,
  ComedyCoverageValidationIssue,
  ComedyCoverageValidationOptions,
  ComedyCoverageValidationResult,
} from './comedy'
export { assertValidChapterEnemyDefinitions, validateChapterEnemyDefinitions } from './enemies'
export type { ChapterEnemyValidationIssue, ChapterEnemyValidationIssueCode, ChapterEnemyValidationResult } from './enemies'
