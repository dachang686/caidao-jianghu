import type { ChapterComedyCoverage, ComedyCoverageDefinition } from '../../types/comedy-coverage'
import { ch02InteractionChainDefinitions, ch02SituationComboDefinitions } from './ch02'
import { CORE_PRESENTATION_CUES } from './presentation'
import { ch02RuleComedyDefinitions } from './rules'

const bangsiCue = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch02:bangsi:defeat')!

const ruleCoverage: readonly ComedyCoverageDefinition[] = ch02RuleComedyDefinitions.map((definition) => ({
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
  copy: '榜下捕快把空白卷宗翻了三遍，终于确认今天确实没有内容。',
}))

const situationCoverage: readonly ComedyCoverageDefinition[] = ch02SituationComboDefinitions.map((definition) => ({
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
  copy: '莲子和榜单线索同时到手，清河县决定先把药篮登记成证人。',
}))

const interactionCoverage: readonly ComedyCoverageDefinition[] = ch02InteractionChainDefinitions.map((definition) => ({
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
  id: bangsiCue.id,
  layer: 'presentation',
  scale: 'major',
  triggerEvent: 'battle.won',
  cooldownGroup: bangsiCue.sfxCooldownGroup ?? bangsiCue.id,
  firstCueId: bangsiCue.id,
  repeatCueId: bangsiCue.shortCueId,
  reducedMotionCueId: bangsiCue.reducedMotionCueId,
  maxBlockingMs: bangsiCue.steps.reduce((total, step) => total + step.durationMs, 0),
  bossCue: true,
  bossId: 'bangsi',
  copy: '榜下捕快把败诉公文盖成了“下次再说”。',
}]

export const CORE_CH02_COMEDY_COVERAGE: readonly ChapterComedyCoverage[] = [{
  chapterId: 'ch02',
  entries: [...ruleCoverage, ...situationCoverage, ...interactionCoverage, ...presentationCoverage],
}]

export const ch02ComedyCoverage = CORE_CH02_COMEDY_COVERAGE
