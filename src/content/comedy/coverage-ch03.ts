import type { ChapterComedyCoverage, ComedyCoverageDefinition } from '../../types/comedy-coverage'
import { ch03InteractionChainDefinitions, ch03SituationComboDefinitions } from './ch03'
import { CORE_PRESENTATION_CUES } from './presentation'
import { ch03RuleComedyDefinitions } from './rules'

const leaderCue = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch03:leader:defeat')!

const ruleCoverage: readonly ComedyCoverageDefinition[] = ch03RuleComedyDefinitions.map((definition) => ({
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
  copy: '黑风寨主把空旗反卷三遍，终于确认今天的招式确实没有字。',
}))

const situationCoverage: readonly ComedyCoverageDefinition[] = ch03SituationComboDefinitions.map((definition) => ({
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
  copy: '山椒、账榜和灶房同时有记录，黑风寨决定先把锅盖列为证人。',
}))

const interactionCoverage: readonly ComedyCoverageDefinition[] = ch03InteractionChainDefinitions.map((definition) => ({
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
  id: leaderCue.id,
  layer: 'presentation',
  scale: 'major',
  triggerEvent: 'battle.won',
  cooldownGroup: leaderCue.sfxCooldownGroup ?? leaderCue.id,
  firstCueId: leaderCue.id,
  repeatCueId: leaderCue.shortCueId,
  reducedMotionCueId: leaderCue.reducedMotionCueId,
  maxBlockingMs: leaderCue.steps.reduce((total, step) => total + step.durationMs, 0),
  bossCue: true,
  bossId: 'blackwind-leader',
  copy: '黑风寨主把空旗收好，宣布这次败北属于山风，不属于战绩。',
}]

export const CORE_CH03_COMEDY_COVERAGE: readonly ChapterComedyCoverage[] = [{
  chapterId: 'ch03',
  entries: [...ruleCoverage, ...situationCoverage, ...interactionCoverage, ...presentationCoverage],
}]

export const ch03ComedyCoverage = CORE_CH03_COMEDY_COVERAGE
