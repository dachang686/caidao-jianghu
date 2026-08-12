import { useMemo, useState } from 'react'
import { ALL_UNLOCKABLES } from '../../content/unlockables'
import { useRootGameStore } from '../../stores'
import type { UnlockableDefinition, UnlockableView } from '../../types/unlockable'
import { UnlockableEngine } from '../../systems/unlocks'

const KIND_LABELS: Record<UnlockableDefinition['kind'], string> = {
  npc: '人物',
  enemy: '敌手',
  skill: '招式',
  title: '称号',
  achievement: '成就',
}

const BONUS_LABELS: Record<string, string> = {
  maxHp: '气血上限',
  maxQi: '内力上限',
  attack: '攻击',
  defense: '防御',
  crit: '暴击',
  dodge: '闪避',
  accuracy: '命中',
}

const KINDS = Object.keys(KIND_LABELS) as UnlockableDefinition['kind'][]

function formatBonus(view: UnlockableView): string | null {
  if (!view.unlocked || !view.definition.titleBonus) return null
  const entries = Object.entries(view.definition.titleBonus)
  if (!entries.length) return null
  return entries.map(([stat, value]) => `${BONUS_LABELS[stat] ?? stat} +${value}`).join(' · ')
}

export function CodexScreen() {
  const unlockables = useRootGameStore((state) => state.unlockables)
  const [kind, setKind] = useState<UnlockableDefinition['kind']>('npc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const engine = useMemo(() => new UnlockableEngine(ALL_UNLOCKABLES, unlockables), [unlockables])
  const views = engine.listViews(kind)
  const selected = views.find((view) => view.definition.id === selectedId) ?? views[0]
  const unlockedCount = ALL_UNLOCKABLES.filter((definition) => unlockables.unlockedIds.includes(definition.id)).length
  const diagnostics = engine.getDiagnostics()

  return <div className="codex-screen">
    <header className="codex-header">
      <div>
        <span className="codex-kicker">江湖账本 · 图鉴系统</span>
        <h2>小小图鉴</h2>
        <p>遇见的人、学会的招和丢过的脸，都在这里留一笔。</p>
      </div>
      <div className="codex-progress" aria-label={`已解锁 ${unlockedCount} 项，共 ${ALL_UNLOCKABLES.length} 项`}>
        <strong>{unlockedCount}/{ALL_UNLOCKABLES.length}</strong>
        <span>已留名</span>
      </div>
    </header>

    <nav className="codex-tabs" aria-label="图鉴分类" role="tablist">
      {KINDS.map((entryKind) => {
        const count = engine.listViews(entryKind).filter((view) => view.unlocked).length
        return <button
          key={entryKind}
          type="button"
          role="tab"
          aria-selected={kind === entryKind}
          className={kind === entryKind ? 'is-selected' : ''}
          onClick={() => { setKind(entryKind); setSelectedId(null) }}
        >{KIND_LABELS[entryKind]}<small>{count}/{engine.listViews(entryKind).length}</small></button>
      })}
    </nav>

    <div className="codex-body">
      <div className="codex-entry-list" role="listbox" aria-label={`${KIND_LABELS[kind]}列表`}>
        {views.map((view) => <button
          key={view.definition.id}
          type="button"
          role="option"
          aria-selected={selected?.definition.id === view.definition.id}
          className={`codex-entry ${view.unlocked ? 'is-unlocked' : 'is-locked'}${selected?.definition.id === view.definition.id ? ' is-selected' : ''}`}
          onClick={() => setSelectedId(view.definition.id)}
        >
          <span className="codex-entry-mark" aria-hidden="true">{view.unlocked ? '◆' : '◇'}</span>
          <span><b>{view.displayName}</b><small>{view.unlocked ? '已解锁' : '轮廓未明'}</small></span>
        </button>)}
      </div>

      {selected && <article className={`codex-detail ${selected.unlocked ? 'is-unlocked' : 'is-locked'}`} aria-live="polite">
        <div className="codex-detail-mark" aria-hidden="true">{selected.silhouette ? '？' : '◆'}</div>
        <span className="codex-detail-kind">{KIND_LABELS[selected.definition.kind]}</span>
        <h3>{selected.displayName}</h3>
        <p>{selected.displayDescription}</p>
        {selected.unlocked && formatBonus(selected) && <p className="codex-bonus">称号效果：{formatBonus(selected)}</p>}
        {!selected.unlocked && <p className="codex-clue">线索：{selected.definition.clue}</p>}
        <small className="codex-entry-id">记录编号：{selected.definition.id}</small>
      </article>}
    </div>

    {diagnostics.missingDefinitionIds.length > 0 && <p className="codex-diagnostic" role="status">有 {diagnostics.missingDefinitionIds.length} 条旧记录对应的内容已移除，已保留为可诊断记录。</p>}
  </div>
}
