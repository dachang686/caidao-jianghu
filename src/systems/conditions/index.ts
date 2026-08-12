// 纯领域模块：只依赖 types，不导入 React、Zustand 或浏览器服务。
export { ConditionEvaluationError, evaluateCondition, isConditionMet } from './evaluate'
export type { ConditionContext, ConditionEvalContext } from '../../types/conditions'
