import type { DiscipleDefinition, DiscipleDispatchPreview, DiscipleTraitDefinition } from '../../types/disciple'
import type { DiscipleId } from '../../types/ids'
import type { SectState } from '../../types/sect'
import { Button } from '../game-ui'

export interface DiscipleRosterProps {
  readonly sect: SectState
  readonly definitions: readonly DiscipleDefinition[]
  readonly traits: readonly DiscipleTraitDefinition[]
  readonly selectedIds: readonly DiscipleId[]
  readonly preview?: DiscipleDispatchPreview | null
  readonly onRecruit: (discipleId: DiscipleId) => void
  readonly onToggleSelection: (discipleId: DiscipleId) => void
}

export function DiscipleRoster({ sect, definitions, traits, selectedIds, preview, onRecruit, onToggleSelection }: DiscipleRosterProps) {
  const traitMap = new Map(traits.map((trait) => [trait.id, trait]))
  return <section className="sect-roster" aria-labelledby="sect-roster-title"><div className="sect-section-heading"><div><span className="sect-kicker">门人名册</span><h2 id="sect-roster-title">把合适的人派去合适的麻烦</h2></div><strong>{sect.discipleIds.length}/12</strong></div><div className="sect-roster-list">{definitions.map((definition) => {
    const recruited = sect.discipleIds.includes(definition.id)
    const selected = selectedIds.includes(definition.id)
    const dialogueSeen = definition.recruitmentDialogueId ? sect.seenDiscipleDialogueIds.includes(definition.recruitmentDialogueId) : false
    return <article className={`sect-disciple-row ${recruited ? 'is-recruited' : ''} ${selected ? 'is-selected' : ''}`} key={definition.id} data-testid={`sect-disciple-${definition.id}`}>
      <div className="sect-disciple-avatar" aria-hidden="true">{definition.name.slice(0, 1)}</div>
      <div className="sect-disciple-copy"><div className="sect-disciple-name"><h3>{definition.name}</h3>{dialogueSeen && <small>已读短对白</small>}</div><p>{definition.description}</p><div className="sect-trait-list">{definition.traitIds.map((traitId) => <span className="sect-trait" key={traitId}>{traitMap.get(traitId)?.name ?? traitId}</span>)}</div></div>
      <div className="sect-disciple-action">{recruited ? <Button aria-pressed={selected} onClick={() => onToggleSelection(definition.id)}>{selected ? '已编入派遣' : '选择派遣'}</Button> : <Button onClick={() => onRecruit(definition.id)}>招募</Button>}</div>
    </article>
  })}</div>{selectedIds.length > 0 && <div className="sect-preview" aria-live="polite"><strong>派遣预览：{selectedIds.length} 名门人</strong>{preview ? <p>预计场次修正 {preview.durationTicksDelta >= 0 ? '+' : ''}{preview.durationTicksDelta} · 成功率 {preview.successChanceDelta >= 0 ? '+' : ''}{Math.round(preview.successChanceDelta * 100)}% · 质量 {preview.qualityDelta >= 0 ? '+' : ''}{preview.qualityDelta}</p> : <p>正在读取门人性格修正。</p>}</div>}</section>
}
