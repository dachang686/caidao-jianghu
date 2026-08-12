import type {
  AssetId,
  ChapterId,
  ChoiceId,
  ContentKey,
  DialogueId,
  EnemyId,
  ItemId,
  LocationId,
  NpcId,
  QuestId,
  RecipeId,
  WorldRegionId,
} from './ids'
import type { Condition } from './conditions'
import type { AssetManifest } from './assets'
export type { EquipmentDefinition } from './equipment'
export type { ChoiceDefinition, DialogueNode } from './dialogue'
export type { ItemDefinition } from './item'
export type { NpcDefinition } from './npc'
export type { QuestDefinition } from './quest'
export type { SkillDefinition } from './skill'

/** Structural references keep F003 independent from the later Condition/Effect modules. */
export type DeclarativeReference = Readonly<Record<string, unknown>>

export interface ChapterDefinition {
  id: ChapterId
  title: string
  order: number
  entryLocationId: LocationId
  locationIds: readonly LocationId[]
  resourceEntry: string
}

export type { HotspotDefinition } from './hotspot'

export interface LocationDefinition {
  id: LocationId
  chapterId: ChapterId
  title: string
  description: string
  npcIds: readonly NpcId[]
  questIds: readonly QuestId[]
  regionId?: WorldRegionId
  entryCondition?: Condition
  lockedReason?: string
  returnToLocationId?: LocationId
  assetIds?: readonly AssetId[]
}

export interface EnemyDefinition {
  id: EnemyId
  name: string
  templateId: ContentKey
  tags?: readonly string[]
}

export interface RecipeDefinition {
  id: RecipeId
  name: string
  ingredientItemIds: readonly ItemId[]
  outputItemId: ItemId
}

export interface ChapterIndexEntry {
  id: ChapterId
  title: string
  order: number
  entryLocationId: LocationId
  resourceEntry: string
}

/**
 * 地图只索引已经接入的真实区域；未来区域加入内容后再登记，避免提前生成无功能入口。
 */
export interface RegionIndexEntry {
  id: WorldRegionId
  chapterId: ChapterId
  title: string
  order: number
  entryLocationId: LocationId
  locationIds?: readonly LocationId[]
  resourceEntry: string
  entryCondition?: Condition
  lockedReason?: string
}

export interface ContentResourceEntry {
  key: ContentKey
  path: string
  kind: 'region' | 'chapter' | 'location' | 'dialogue' | 'asset'
}

export interface ContentManifest {
  version: number
  regions: readonly RegionIndexEntry[]
  chapters: readonly ChapterIndexEntry[]
  resourceEntrypoints: readonly ContentResourceEntry[]
  assetManifest?: AssetManifest
}
