import type { EquipmentId } from './ids'
import type { DerivedCombatStats } from './skill'

export type EquipmentSlot = 'weapon' | 'head' | 'body' | 'feet' | 'accessory' | 'manual'

export type EquipmentStat = keyof Pick<DerivedCombatStats, 'maxHp' | 'maxQi' | 'attack' | 'defense' | 'posture' | 'accuracy' | 'dodge' | 'crit' | 'qiRecovery' | 'healingMultiplier' | 'damageWhenPostureBroken'>

export type EquipmentSourceKind = 'forging' | 'loot' | 'vendor' | 'quest' | 'commission'

export interface EquipmentSource {
  readonly kind: EquipmentSourceKind
  readonly id: string
  readonly label?: string
}

export interface EquipmentUpgradePoint {
  readonly level: number
  readonly statDelta: Partial<Record<EquipmentStat, number>>
}

export interface EquipmentModifier {
  readonly stat: EquipmentStat
  readonly operation: 'add' | 'multiply'
  readonly value: number
}

export interface EquipmentDefinition {
  readonly id: EquipmentId | string
  readonly itemId: string
  readonly slot: EquipmentSlot
  readonly name: string
  readonly description: string
  readonly modifiers: readonly EquipmentModifier[]
  readonly unique?: boolean
  /** Core 内容元数据：用于进度报告、来源审计和商店展示。 */
  readonly chapter?: number
  readonly stage?: string
  readonly price?: number
  readonly sellPrice?: number
  readonly sources?: readonly EquipmentSource[]
  readonly upgradeCurve?: readonly EquipmentUpgradePoint[]
  readonly protectable?: boolean
  readonly buildTags?: readonly string[]
}

export interface EquipmentLoadout {
  readonly weapon: string | null
  readonly head: string | null
  readonly body: string | null
  readonly feet: string | null
  readonly accessory: string | null
  readonly manual: string | null
}
