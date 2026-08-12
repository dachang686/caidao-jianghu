import type { ChapterComedyCoverage, ComedyCoverageDefinition } from '../../types/comedy-coverage'
import { ch04InteractionChainDefinitions, ch04SituationComboDefinitions } from './ch04'
import { CORE_PRESENTATION_CUES } from './presentation'
import { ch04RuleComedyDefinitions } from './rules'

const masterCue = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch04:master:defeat')!

const ruleCoverage: readonly ComedyCoverageDefinition[] = ch04RuleComedyDefinitions.map((definition) => ({
  id: definition.id,
  layer: 'rule',
  scale: 'minor',
  triggerEvent: 'battle.boss_intent_previewed',
  cooldownGroup: definition.id,
  firstCueId: `${definition.id}:first`,
  repeatCueId: `${definition.id}:repeat`,
  reducedMotionCueId: definition.presentationCueId,
  maxBlockingMs: 180,
  previewStatKeys: definition.previewStatKeys,
  copy: '青云掌门把门规念了三遍，终于确认礼法反噬确实会先写在意图栏。',
}))

const situationCoverage: readonly ComedyCoverageDefinition[] = ch04SituationComboDefinitions.map((definition) => ({
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
  copy: '青蘅草、山门名册和药圃同时有记录，青云山决定先把云气登记成证人。',
}))

const interactionCoverage: readonly ComedyCoverageDefinition[] = ch04InteractionChainDefinitions.map((definition) => ({
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
  id: masterCue.id,
  layer: 'presentation',
  scale: 'major',
  triggerEvent: 'battle.won',
  cooldownGroup: masterCue.sfxCooldownGroup ?? masterCue.id,
  firstCueId: masterCue.id,
  repeatCueId: masterCue.shortCueId,
  reducedMotionCueId: masterCue.reducedMotionCueId,
  maxBlockingMs: masterCue.steps.reduce((total, step) => total + step.durationMs, 0),
  bossCue: true,
  bossId: 'qingyun-master',
  copy: '青云掌门收起折扇，承认门面验收通过，规则终于写短了。',
}]

export const CORE_CH04_COMEDY_COVERAGE: readonly ChapterComedyCoverage[] = [{
  chapterId: 'ch04',
  entries: [...ruleCoverage, ...situationCoverage, ...interactionCoverage, ...presentationCoverage],
}]

export const ch04ComedyCoverage = CORE_CH04_COMEDY_COVERAGE
