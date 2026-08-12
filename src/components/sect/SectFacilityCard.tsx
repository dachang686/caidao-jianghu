import type { InventoryState } from '../../types/item'
import type { SectFacilityDefinition, SectFacilityId, SectState } from '../../types/sect'
import { Button } from '../game-ui'

export interface SectFacilityCardProps {
  readonly definition: SectFacilityDefinition
  readonly sect: SectState
  readonly wealth: number
  readonly inventory: InventoryState
  readonly chapter: number
  readonly onUpgrade: (facilityId: SectFacilityId) => void
}

function itemCount(inventory: InventoryState, itemId: string): number {
  return inventory.stacks.find((stack) => stack.itemId === itemId)?.count ?? 0
}

function benefitLabel(benefit: SectFacilityDefinition['levels'][number]['benefits'][number]): string {
  switch (benefit.type) {
    case 'combat_stat_bonus': return `${benefit.stat === 'attack' ? '攻击' : '防御'} +${benefit.delta}`
    case 'unlock_recipe': return `解锁菜谱 ${benefit.recipeId}`
    case 'strengthening_chance_bonus': return `强化成功率 +${Math.round(benefit.delta * 100)}%`
    case 'reveal_region': return `揭示区域 ${benefit.regionId}`
    case 'commission_quality_bonus': return `委托质量 +${benefit.delta}`
    case 'fame_bonus': return `名望 +${benefit.delta}`
  }
}

export function SectFacilityCard({ definition, sect, wealth, inventory, chapter, onUpgrade }: SectFacilityCardProps) {
  const level = sect.facilities[definition.id]
  const next = definition.levels.find((candidate) => candidate.level === level + 1)
  const affordable = next && wealth >= next.cost.silver && next.cost.materials.every((material) => itemCount(inventory, String(material.itemId)) >= material.count)
  const chapterReady = next ? chapter >= next.requiredChapter : false
  return (
    <article className="sect-facility-row" data-testid={`sect-facility-${definition.id}`}>
      <div className="sect-facility-copy">
        <div className="sect-facility-title"><span className="sect-facility-mark">{definition.id === 'training' ? '武' : definition.id === 'kitchen' ? '食' : definition.id === 'forge' ? '铸' : '闻'}</span><div><h3>{definition.name}</h3><p>{definition.description}</p></div></div>
        <div className="sect-level-track" aria-label={`${definition.name}等级`}>
          {[1, 2, 3].map((step) => <span className={step <= level ? 'is-filled' : ''} key={step}>{step}</span>)}
        </div>
      </div>
      <div className="sect-facility-effect">
        {next ? <><strong>升级后</strong>{next.benefits.map((benefit) => <span key={`${benefit.type}-${JSON.stringify(benefit)}`}>{benefitLabel(benefit)}</span>)}</> : <strong>已达三级，收益已生效</strong>}
      </div>
      <div className="sect-facility-action">
        {next ? <><small>成本：{next.cost.silver} 两 · {next.cost.materials.map((material) => `${material.itemId} ×${material.count}`).join('、')}</small><Button disabled={!sect.unlocked || !chapterReady || !affordable} onClick={() => onUpgrade(definition.id)}>{!sect.unlocked ? '门派未解锁' : !chapterReady ? `第 ${next.requiredChapter} 章开放` : !affordable ? '材料或银两不足' : `升级到 ${next.level} 级`}</Button></> : <Button disabled>已完成</Button>}
      </div>
    </article>
  )
}
