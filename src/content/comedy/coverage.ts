import type { ChapterComedyCoverage, ComedyCoverageDefinition } from '../../types/comedy-coverage'
import { ch01InteractionChainDefinitions, ch01SituationComboDefinitions } from './ch01'
import { CORE_PRESENTATION_CUES } from './presentation'
import { ch01RuleComedyDefinitions } from './rules'

const victoryCue = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch01:bai:defeat')!

const ruleCoverage = ch01RuleComedyDefinitions.map((definition): ComedyCoverageDefinition => ({
  id: definition.id,
  layer: 'rule',
  scale: 'minor',
  triggerEvent: definition.id.includes(':bai:') ? 'battle.boss_intent_previewed' : 'battle.intent_previewed',
  cooldownGroup: definition.id,
  firstCueId: `${definition.id}:first`,
  repeatCueId: `${definition.id}:repeat`,
  reducedMotionCueId: definition.presentationCueId,
  maxBlockingMs: 180,
  previewStatKeys: definition.previewStatKeys,
  copy: definition.id.includes(':bai:') ? '白大侠转得很认真，认真到把自己转晕。' : '敌方意图老实到像提前交了答题卡。',
}))

const situationCoverage = ch01SituationComboDefinitions.map((definition): ComedyCoverageDefinition => ({
  id: definition.id,
  layer: 'situation',
  scale: definition.scale,
  triggerEvent: definition.triggerEvent,
  cooldownGroup: definition.cooldownGroup,
  firstCueId: definition.firstCueId,
  repeatCueId: definition.repeatCueId,
  reducedMotionCueId: definition.reducedMotionCueId,
  maxBlockingMs: definition.maxBlockingMs,
  effects: definition.effects,
  copy: '猫的验收意见和山路止血草同时抵达，客栈账本决定先记鱼干。',
}))

const interactionCoverage = ch01InteractionChainDefinitions.map((definition): ComedyCoverageDefinition => ({
  id: definition.id,
  layer: 'interaction',
  scale: 'minor',
  triggerEvent: definition.triggerEvent,
  cooldownGroup: definition.id,
  firstCueId: definition.stages[0]!.cueId,
  repeatCueId: definition.stableRepeatCueId,
  reducedMotionCueId: `${definition.stableRepeatCueId}:static`,
  maxBlockingMs: 360,
  effects: definition.stages.flatMap((stage) => stage.effects),
}))

const presentationCoverage: readonly ComedyCoverageDefinition[] = [{
  id: victoryCue.id,
  layer: 'presentation',
  scale: 'major',
  triggerEvent: 'battle.won',
  cooldownGroup: victoryCue.sfxCooldownGroup ?? victoryCue.id,
  firstCueId: victoryCue.id,
  repeatCueId: victoryCue.shortCueId,
  reducedMotionCueId: victoryCue.reducedMotionCueId,
  maxBlockingMs: victoryCue.steps.reduce((total, step) => total + step.durationMs, 0),
  bossCue: true,
  bossId: 'bai-daxia',
  copy: '白大侠抱拳，擂台木牌开始记账。',
}]

export const CORE_CH01_COMEDY_COVERAGE: readonly ChapterComedyCoverage[] = [{
  chapterId: 'ch01',
  entries: [...ruleCoverage, ...situationCoverage, ...interactionCoverage, ...presentationCoverage],
}]

export const ch01ComedyCoverage = CORE_CH01_COMEDY_COVERAGE
