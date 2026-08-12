// 纯领域模块：Effect 只产生新状态、事件和导航意图，不直接调用 UI/音频/存档。
export { EffectExecutionError, applyEffects, executeEffects, runEffects } from './execute'
export type { EffectExecutionResult } from '../../types/effects'
