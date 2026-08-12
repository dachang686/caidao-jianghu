import type { PresentationCueDefinition } from '../../types/comedy'

/** Core 演出只表现已完成的战斗/情境结果，不拥有任何领域结算权限。 */
export const CORE_PRESENTATION_CUES: readonly PresentationCueDefinition[] = [
  {
    id: 'presentation:battle:victory',
    steps: [
      { type: 'anticipation', durationMs: 120 },
      { type: 'action', durationMs: 180 },
      { type: 'pause', durationMs: 120 },
      { type: 'reaction', durationMs: 220 },
    ],
    shortCueId: 'cue:battle:victory:short',
    reducedMotionCueId: 'cue:battle:victory:static',
    sfxCooldownGroup: 'battle-victory',
  },
  {
    id: 'presentation:battle:defeat',
    steps: [
      { type: 'anticipation', durationMs: 100 },
      { type: 'action', durationMs: 160 },
      { type: 'pause', durationMs: 100 },
      { type: 'reaction', durationMs: 200 },
    ],
    shortCueId: 'cue:battle:defeat:short',
    reducedMotionCueId: 'cue:battle:defeat:static',
    sfxCooldownGroup: 'battle-defeat',
  },
  {
    id: 'presentation:ch01:bai:defeat',
    steps: [
      { type: 'anticipation', durationMs: 180 },
      { type: 'action', durationMs: 260 },
      { type: 'pause', durationMs: 280 },
      { type: 'reaction', durationMs: 260 },
    ],
    shortCueId: 'cue:ch01:bai:defeat:short',
    reducedMotionCueId: 'cue:ch01:bai:defeat:static',
    sfxCooldownGroup: 'ch01-bai-defeat',
  },
  {
    id: 'presentation:ch02:bangsi:defeat',
    steps: [
      { type: 'anticipation', durationMs: 180 },
      { type: 'action', durationMs: 240 },
      { type: 'pause', durationMs: 260 },
      { type: 'reaction', durationMs: 220 },
    ],
    shortCueId: 'cue:ch02:bangsi:defeat:short',
    reducedMotionCueId: 'cue:ch02:bangsi:defeat:static',
    sfxCooldownGroup: 'ch02-bangsi-defeat',
  },
  {
    id: 'presentation:ch03:leader:defeat',
    steps: [
      { type: 'anticipation', durationMs: 180 },
      { type: 'action', durationMs: 260 },
      { type: 'pause', durationMs: 280 },
      { type: 'reaction', durationMs: 240 },
    ],
    shortCueId: 'presentation:ch03:leader:defeat:short',
    reducedMotionCueId: 'presentation:ch03:leader:defeat:static',
    sfxCooldownGroup: 'ch03-leader-defeat',
  },
  {
    id: 'presentation:ch04:master:defeat',
    steps: [
      { type: 'anticipation', durationMs: 180 },
      { type: 'action', durationMs: 240 },
      { type: 'pause', durationMs: 260 },
      { type: 'reaction', durationMs: 220 },
    ],
    shortCueId: 'presentation:ch04:master:defeat:short',
    reducedMotionCueId: 'presentation:ch04:master:defeat:static',
    sfxCooldownGroup: 'ch04-master-defeat',
  },
  { id: 'presentation:ch05:twin:defeat', steps: [{ type: 'anticipation', durationMs: 180 }, { type: 'action', durationMs: 250 }, { type: 'pause', durationMs: 260 }, { type: 'reaction', durationMs: 230 }], shortCueId: 'cue:ch05:twin:defeat:short', reducedMotionCueId: 'cue:ch05:twin:defeat:static', sfxCooldownGroup: 'ch05-twin-defeat' },
  { id: 'presentation:ch06:tide:defeat', steps: [{ type: 'anticipation', durationMs: 180 }, { type: 'action', durationMs: 250 }, { type: 'pause', durationMs: 260 }, { type: 'reaction', durationMs: 230 }], shortCueId: 'cue:ch06:tide:defeat:short', reducedMotionCueId: 'cue:ch06:tide:defeat:static', sfxCooldownGroup: 'ch06-tide-defeat' },
  { id: 'presentation:ch07:governor:defeat', steps: [{ type: 'anticipation', durationMs: 180 }, { type: 'action', durationMs: 250 }, { type: 'pause', durationMs: 260 }, { type: 'reaction', durationMs: 230 }], shortCueId: 'cue:ch07:governor:defeat:short', reducedMotionCueId: 'cue:ch07:governor:defeat:static', sfxCooldownGroup: 'ch07-governor-defeat' },
  { id: 'presentation:ch08:master:defeat', steps: [{ type: 'anticipation', durationMs: 180 }, { type: 'action', durationMs: 250 }, { type: 'pause', durationMs: 260 }, { type: 'reaction', durationMs: 230 }], shortCueId: 'cue:ch08:master:defeat:short', reducedMotionCueId: 'cue:ch08:master:defeat:static', sfxCooldownGroup: 'ch08-master-defeat' },
  { id: 'presentation:ending:cleaver-master', steps: [{ type: 'anticipation', durationMs: 220 }, { type: 'action', durationMs: 300 }, { type: 'pause', durationMs: 320 }, { type: 'reaction', durationMs: 260 }], shortCueId: 'cue:ending:cleaver-master:short', reducedMotionCueId: 'cue:ending:cleaver-master:static', sfxCooldownGroup: 'ending-cleaver-master' },
  { id: 'presentation:ending:hot-list-leader', steps: [{ type: 'anticipation', durationMs: 220 }, { type: 'action', durationMs: 300 }, { type: 'pause', durationMs: 320 }, { type: 'reaction', durationMs: 260 }], shortCueId: 'cue:ending:hot-list-leader:short', reducedMotionCueId: 'cue:ending:hot-list-leader:static', sfxCooldownGroup: 'ending-hot-list-leader' },
  { id: 'presentation:ending:sect-founder', steps: [{ type: 'anticipation', durationMs: 220 }, { type: 'action', durationMs: 300 }, { type: 'pause', durationMs: 320 }, { type: 'reaction', durationMs: 260 }], shortCueId: 'cue:ending:sect-founder:short', reducedMotionCueId: 'cue:ending:sect-founder:static', sfxCooldownGroup: 'ending-sect-founder' },
  { id: 'presentation:ending:retired-proprietor', steps: [{ type: 'anticipation', durationMs: 220 }, { type: 'action', durationMs: 300 }, { type: 'pause', durationMs: 320 }, { type: 'reaction', durationMs: 260 }], shortCueId: 'cue:ending:retired-proprietor:short', reducedMotionCueId: 'cue:ending:retired-proprietor:static', sfxCooldownGroup: 'ending-retired-proprietor' },
]

export const corePresentationCues = CORE_PRESENTATION_CUES
