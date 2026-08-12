/**
 * Branded IDs prevent content references from silently mixing at compile time.
 * Runtime content keeps the underlying value as a plain string for serialization.
 */
export type BrandedId<Brand extends string> = string & { readonly __brand: Brand }

export type ChapterId = BrandedId<'ChapterId'>
export type WorldRegionId = BrandedId<'WorldRegionId'>
export type LocationId = BrandedId<'LocationId'>
export type NpcId = BrandedId<'NpcId'>
export type QuestId = BrandedId<'QuestId'>
export type DialogueId = BrandedId<'DialogueId'>
export type ChoiceId = BrandedId<'ChoiceId'>
export type EnemyId = BrandedId<'EnemyId'>
export type ItemId = BrandedId<'ItemId'>
export type SkillId = BrandedId<'SkillId'>
export type EquipmentId = BrandedId<'EquipmentId'>
export type RecipeId = BrandedId<'RecipeId'>
export type SectId = BrandedId<'SectId'>
export type DiscipleId = BrandedId<'DiscipleId'>
export type CommissionId = BrandedId<'CommissionId'>
export type EndingId = BrandedId<'EndingId'>
export type AssetId = BrandedId<'AssetId'>
export type ContentKey = BrandedId<'ContentKey'>
export type HotspotId = BrandedId<'HotspotId'>
export type GatheringNodeId = BrandedId<'GatheringNodeId'>

export const asChapterId = (value: string): ChapterId => value as ChapterId
export const asWorldRegionId = (value: string): WorldRegionId => value as WorldRegionId
export const asLocationId = (value: string): LocationId => value as LocationId
export const asNpcId = (value: string): NpcId => value as NpcId
export const asQuestId = (value: string): QuestId => value as QuestId
export const asDialogueId = (value: string): DialogueId => value as DialogueId
export const asChoiceId = (value: string): ChoiceId => value as ChoiceId
export const asEnemyId = (value: string): EnemyId => value as EnemyId
export const asItemId = (value: string): ItemId => value as ItemId
export const asSkillId = (value: string): SkillId => value as SkillId
export const asEquipmentId = (value: string): EquipmentId => value as EquipmentId
export const asRecipeId = (value: string): RecipeId => value as RecipeId
export const asSectId = (value: string): SectId => value as SectId
export const asDiscipleId = (value: string): DiscipleId => value as DiscipleId
export const asCommissionId = (value: string): CommissionId => value as CommissionId
export const asEndingId = (value: string): EndingId => value as EndingId
export const asAssetId = (value: string): AssetId => value as AssetId
export const asContentKey = (value: string): ContentKey => value as ContentKey
export const asHotspotId = (value: string): HotspotId => value as HotspotId
export const asGatheringNodeId = (value: string): GatheringNodeId => value as GatheringNodeId
