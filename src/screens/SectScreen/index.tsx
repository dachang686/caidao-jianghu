import { useMemo, useRef, useState } from 'react'
import type { CommissionSnapshot } from '../../types/commission'
import type { DiscipleDefinition, DiscipleDispatchPreview, DiscipleTraitDefinition } from '../../types/disciple'
import type { DiscipleId } from '../../types/ids'
import type { SectDispatchSnapshot } from '../../types/dispatch'
import type { SectFacilityDefinition, SectFacilityId, SectState } from '../../types/sect'
import type { InventoryState } from '../../types/item'
import type { PostgameDifficulty, PostgameState } from '../../types/postgame'
import { DispatchQueue, DiscipleRoster, SectFacilityCard } from '../../components/sect'
import { Button } from '../../components/game-ui'
import { previewDiscipleDispatch } from '../../systems/sect'

export interface SectScreenProps {
  readonly sect: SectState
  readonly wealth: number
  readonly inventory: InventoryState
  readonly chapter: number
  readonly facilityDefinitions: readonly SectFacilityDefinition[]
  readonly discipleDefinitions: readonly DiscipleDefinition[]
  readonly discipleTraits: readonly DiscipleTraitDefinition[]
  readonly dispatch: SectDispatchSnapshot
  readonly commissions?: CommissionSnapshot
  readonly dispatchPreview?: DiscipleDispatchPreview | null
  readonly message?: string
  readonly onUpgrade: (facilityId: SectFacilityId) => void
  readonly onRecruit: (discipleId: DiscipleId) => void
  readonly onStartDispatch: (discipleIds: readonly DiscipleId[]) => void
  readonly onClaimDispatch: (dispatchId: string) => void
  readonly onClaimCommission?: (instanceId: string) => void
  readonly onCompleteCommission?: (instanceId: string) => void
  readonly postgame?: Pick<PostgameState, 'unlocked' | 'difficulty'>
  readonly onSetPostgameDifficulty?: (difficulty: PostgameDifficulty) => void
  readonly onGenerateCommission?: () => void
  readonly onClose?: () => void
}

export function SectScreen({ sect, wealth, inventory, chapter, facilityDefinitions, discipleDefinitions, discipleTraits, dispatch, commissions, dispatchPreview, message = '设施收益会回流到战力、配方、情报、名望或门派繁荣。', onUpgrade, onRecruit, onStartDispatch, onClaimDispatch, onClaimCommission, onCompleteCommission, postgame, onSetPostgameDifficulty, onGenerateCommission, onClose }: SectScreenProps) {
  const [selectedIds, setSelectedIds] = useState<DiscipleId[]>([])
  const selectedPreview = useMemo(() => {
    if (selectedIds.length === 0) return null
    return previewDiscipleDispatch(selectedIds, discipleDefinitions, discipleTraits)
  }, [discipleDefinitions, discipleTraits, selectedIds])
  const pendingActions = useRef(new Set<string>())
  const runOnce = (key: string, action: () => void) => {
    if (pendingActions.current.has(key)) return
    pendingActions.current.add(key)
    try {
      action()
    } finally {
      queueMicrotask(() => pendingActions.current.delete(key))
    }
  }
  const toggleSelection = (discipleId: DiscipleId) => setSelectedIds((current) => current.includes(discipleId) ? current.filter((id) => id !== discipleId) : [...current, discipleId])
  const startDispatch = () => {
    if (selectedIds.length === 0) return
    runOnce(`dispatch:${selectedIds.join(',')}`, () => {
      onStartDispatch(selectedIds)
      setSelectedIds([])
    })
  }
  return <main className="sect-screen" data-testid="sect-screen"><div className="sect-screen-inner"><header className="sect-header"><div><span className="sect-kicker">第五章后开放 · 门派经营</span><h1>把江湖账本管得像样一点</h1><p>设施、门人和派遣共享一套可保存的领域状态。</p></div><div className="sect-header-actions"><span className="sect-wealth">🪙 {wealth} 两</span>{onClose && <button className="sect-close" type="button" onClick={onClose} aria-label="关闭门派页面">×</button>}</div></header><p className="sect-status" role="status" aria-live="polite">{message}</p>{!sect.unlocked && <div className="sect-locked" role="status"><strong>门派尚未解锁</strong><span>完成第五章主线后，这里的设施与派遣会开放。</span></div>}<section className="sect-benefit-strip" aria-label="当前门派收益"><div><span>战力</span><strong>攻击 +{sect.benefits.combatAttackBonus} · 防御 +{sect.benefits.combatDefenseBonus}</strong></div><div><span>成长</span><strong>菜谱 {sect.benefits.unlockedRecipeIds.length} · 强化 +{Math.round(sect.benefits.strengtheningChanceBonus * 100)}%</strong></div><div><span>江湖</span><strong>名望 +{sect.benefits.fameBonus} · 繁荣收益已入账</strong></div></section><div className="sect-main-grid"><section className="sect-facilities" aria-labelledby="sect-facilities-title"><div className="sect-section-heading"><div><span className="sect-kicker">四项设施</span><h2 id="sect-facilities-title">把资源投到能看见的地方</h2></div><span>第 {chapter} 章</span></div><div className="sect-facility-list">{facilityDefinitions.map((definition) => <SectFacilityCard key={definition.id} definition={definition} sect={sect} wealth={wealth} inventory={inventory} chapter={chapter} onUpgrade={(facilityId) => runOnce(`upgrade:${facilityId}`, () => onUpgrade(facilityId))} />)}</div></section><aside className="sect-side-column"><DiscipleRoster sect={sect} definitions={discipleDefinitions} traits={discipleTraits} selectedIds={selectedIds} preview={dispatchPreview ?? selectedPreview} onRecruit={(discipleId) => runOnce(`recruit:${discipleId}`, () => onRecruit(discipleId))} onToggleSelection={toggleSelection} /><Button className="sect-dispatch-start" disabled={selectedIds.length === 0} onClick={startDispatch}>{selectedIds.length ? `派遣 ${selectedIds.length} 名门人` : '选择门人后派遣'}</Button><DispatchQueue dispatch={dispatch} commissions={commissions} postgame={postgame} onSetPostgameDifficulty={onSetPostgameDifficulty} onGenerateCommission={onGenerateCommission} onClaimDispatch={(dispatchId) => runOnce(`claim-dispatch:${dispatchId}`, () => onClaimDispatch(dispatchId))} onClaimCommission={onClaimCommission ? (instanceId) => runOnce(`claim-commission:${instanceId}`, () => onClaimCommission(instanceId)) : undefined} onCompleteCommission={onCompleteCommission ? (instanceId) => runOnce(`complete-commission:${instanceId}`, () => onCompleteCommission(instanceId)) : undefined} /></aside></div></div></main>
}
