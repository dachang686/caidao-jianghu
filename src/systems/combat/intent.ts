import type { EnemyIntent, EnemyIntentUiSummary } from '../../types/enemy-intent'

export function toEnemyIntentUiSummary(intent: EnemyIntent): EnemyIntentUiSummary {
  return {
    id: intent.id,
    kind: intent.kind,
    label: intent.label,
    summary: intent.summary,
    expectedDamage: Math.max(0, intent.expectedDamage),
    expectedPostureDamage: Math.max(0, intent.expectedPostureDamage),
    guardRatio: Math.max(0, Math.min(1, intent.guardRatio)),
    honest: intent.honest,
  }
}
