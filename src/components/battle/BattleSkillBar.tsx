import type { SkillId } from '../../game/types'

export interface BattleSkillView {
  readonly slot: number
  readonly skillId: SkillId | null
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly costLabel: string
  readonly disabled: boolean
  readonly disabledReason?: string
  readonly onUse: () => void
}

export function BattleSkillBar({ skills }: { readonly skills: readonly BattleSkillView[] }) {
  return (
    <section className="battle-skill-panel" aria-label="技能栏">
      <div className="battle-skill-panel__heading"><h2>出招</h2><span>按 1–6 快捷使用</span></div>
      <div className="battle-skill-grid">
        {skills.map((skill) => (
          <button
            className={`battle-skill-slot${skill.skillId ? '' : ' is-empty'}`}
            data-skill-slot={skill.slot}
            disabled={skill.disabled}
            key={skill.slot}
            onClick={skill.onUse}
            type="button"
            aria-keyshortcuts={String(skill.slot)}
            aria-label={`${skill.slot}号位，${skill.name}${skill.disabledReason ? `，${skill.disabledReason}` : ''}`}
            title={skill.disabledReason ?? skill.description}
          >
            <span className="battle-skill-slot__key" aria-hidden="true">{skill.slot}</span>
            <i aria-hidden="true">{skill.icon}</i>
            <strong>{skill.name}</strong>
            <small>{skill.costLabel}</small>
            {skill.disabledReason && <em>{skill.disabledReason}</em>}
          </button>
        ))}
      </div>
    </section>
  )
}
