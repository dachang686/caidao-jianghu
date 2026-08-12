import type { ChapterContent } from '../../content/loader'
import type { ContentManifest, DialogueNode } from '../../types/content'
import type { SkillDefinition } from '../../types/skill'
import { validateSkillDefinitions } from '../../systems/skills/registry'
import type { PassiveDefinition } from '../../types/skill'
import { validatePassiveDefinitions } from '../../systems/skills/passive-tree'
import { validateQuestDefinitions } from '../../systems/quests/index'
import { validateDialogueGraph } from '../../systems/dialogue/engine'
import { validateNpcDefinitions } from '../../systems/npcs/engine'
import { validateHotspotDefinitions } from '../../systems/exploration/engine'
import { validateGatheringDefinitions } from '../../systems/gathering/engine'
import type { ItemDefinition } from '../../types/item'
import { validateAssetManifest } from '../../systems/assets'
import { validateChapterEnemyDefinitions } from './enemies'

export interface ContentValidationIssue {
  readonly code: 'duplicate_id' | 'missing_reference' | 'invalid_value' | 'manifest_version' | 'skill_prerequisite_cycle' | 'passive_prerequisite_cycle' | 'enemy_content_invalid'
  readonly path: string
  readonly message: string
  readonly id?: string
}

export interface ContentValidationResult {
  readonly valid: boolean
  readonly issues: readonly ContentValidationIssue[]
}

export class ContentValidationError extends Error {
  readonly issues: readonly ContentValidationIssue[]

  constructor(issues: readonly ContentValidationIssue[]) {
    super(issues.map((issue) => `${issue.path} [${issue.code}] ${issue.message}`).join('\n'))
    this.name = 'ContentValidationError'
    this.issues = issues
  }
}

function duplicateIds(values: readonly { id: string }[], path: string, issues: ContentValidationIssue[]): void {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (seen.has(value.id)) {
      issues.push({ code: 'duplicate_id', path: `${path}[${index}].id`, message: `重复 ID「${value.id}」`, id: value.id })
    }
    seen.add(value.id)
  })
}

function duplicateValues(values: readonly string[], path: string, issues: ContentValidationIssue[]): void {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (seen.has(value)) issues.push({ code: 'duplicate_id', path: `${path}[${index}]`, message: `重复 ID「${value}」`, id: value })
    seen.add(value)
  })
}

function hasId(values: readonly { id: string }[], id: string): boolean {
  return values.some((value) => value.id === id)
}

function requireNonEmpty(value: string, path: string, issues: ContentValidationIssue[]): void {
  if (!value.trim()) issues.push({ code: 'invalid_value', path, message: '值不能为空' })
}

function validateDialogues(dialogues: readonly DialogueNode[], issues: ContentValidationIssue[]): void {
  const startNode = dialogues[0]
  if (!startNode) return
  const result = validateDialogueGraph({ id: 'content-dialogues', startNodeId: startNode.id, nodes: dialogues, maxConfusingHops: 2 })
  result.issues.forEach((issue) => {
    const code: ContentValidationIssue['code'] = issue.code === 'duplicate_id' ? 'duplicate_id' : issue.code === 'missing_reference' ? 'missing_reference' : 'invalid_value'
    issues.push({ code, path: issue.path.replace(/^nodes/, 'dialogues'), message: issue.message })
  })
}

export function validateContent(
  manifest: ContentManifest,
  chapters: readonly ChapterContent[],
  skills: readonly SkillDefinition[] = [],
  passives: readonly PassiveDefinition[] = [],
  gatheringItems: readonly ItemDefinition[] = [],
): ContentValidationResult {
  const issues: ContentValidationIssue[] = []
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    issues.push({ code: 'manifest_version', path: 'manifest.version', message: 'Manifest 版本必须是大于 0 的整数' })
  }
  duplicateIds(manifest.chapters, 'manifest.chapters', issues)
  duplicateIds(manifest.regions, 'manifest.regions', issues)
  const chapterIds = manifest.chapters.map((chapter) => chapter.id)
  const regionIds = manifest.regions.map((region) => region.id)
  const assetIds = new Set((manifest.assetManifest?.assets ?? []).map((asset) => String(asset.id)))
  const assetsByRegion = new Map((manifest.assetManifest?.regions ?? []).map((region) => [String(region.regionId), new Set(region.assetIds.map(String))]))
  const assetResult = validateAssetManifest(manifest.assetManifest)
  assetResult.issues.forEach((issue) => {
    const code: ContentValidationIssue['code'] = issue.code === 'duplicate_id' || issue.code === 'duplicate_reference' ? 'duplicate_id' : issue.code === 'missing_reference' ? 'missing_reference' : 'invalid_value'
    issues.push({ code, path: issue.path, message: issue.message, id: issue.id })
  })
  const resourceKeys = manifest.resourceEntrypoints.map((entry) => entry.key)
  duplicateValues(resourceKeys, 'manifest.resourceEntrypoints', issues)
  manifest.chapters.forEach((chapter, index) => {
    requireNonEmpty(chapter.title, `manifest.chapters[${index}].title`, issues)
    requireNonEmpty(chapter.resourceEntry, `manifest.chapters[${index}].resourceEntry`, issues)
    if (!Number.isInteger(chapter.order) || chapter.order < 1) {
      issues.push({ code: 'invalid_value', path: `manifest.chapters[${index}].order`, message: '章节顺序必须是大于 0 的整数', id: chapter.id })
    }
  })
  manifest.regions.forEach((region, index) => {
    requireNonEmpty(region.title, `manifest.regions[${index}].title`, issues)
    requireNonEmpty(region.resourceEntry, `manifest.regions[${index}].resourceEntry`, issues)
    if (!chapterIds.includes(region.chapterId)) {
      issues.push({ code: 'missing_reference', path: `manifest.regions[${index}].chapterId`, message: `找不到章节「${region.chapterId}」`, id: region.chapterId })
    }
    if (!Number.isInteger(region.order) || region.order < 1) {
      issues.push({ code: 'invalid_value', path: `manifest.regions[${index}].order`, message: '区域顺序必须是大于 0 的整数', id: region.id })
    }
    if (region.locationIds && !region.locationIds.includes(region.entryLocationId)) {
      issues.push({ code: 'invalid_value', path: `manifest.regions[${index}].entryLocationId`, message: '区域入口地点必须属于该区域', id: region.entryLocationId })
    }
    const regionResource = manifest.resourceEntrypoints.find((entry) => entry.path === region.resourceEntry && entry.kind === 'region')
    if (!regionResource) {
      issues.push({ code: 'missing_reference', path: `manifest.regions[${index}].resourceEntry`, message: `找不到区域资源入口「${region.resourceEntry}」`, id: region.id })
    }
  })
  manifest.resourceEntrypoints.forEach((entry, index) => {
    requireNonEmpty(entry.key, `manifest.resourceEntrypoints[${index}].key`, issues)
    requireNonEmpty(entry.path, `manifest.resourceEntrypoints[${index}].path`, issues)
    if (!resourceKeys.includes(entry.key)) return
  })

  const chaptersById = new Map(chapters.map((chapter) => [chapter.chapter.id, chapter]))
  chapters.forEach((content, contentIndex) => {
    const chapterPath = `chapters[${contentIndex}]`
    if (!chapterIds.includes(content.chapter.id)) {
      issues.push({ code: 'missing_reference', path: `${chapterPath}.chapter.id`, message: `Manifest 未注册章节「${content.chapter.id}」`, id: content.chapter.id })
    }
    if (chaptersById.get(content.chapter.id) !== content && chapters.some((other) => other !== content && other.chapter.id === content.chapter.id)) {
      issues.push({ code: 'duplicate_id', path: `${chapterPath}.chapter.id`, message: `重复章节 ID「${content.chapter.id}」`, id: content.chapter.id })
    }
    duplicateIds(content.locations, `${chapterPath}.locations`, issues)
    duplicateIds(content.npcs, `${chapterPath}.npcs`, issues)
    duplicateIds(content.quests, `${chapterPath}.quests`, issues)
    const questResult = validateQuestDefinitions(content.quests)
    questResult.issues.forEach((issue) => {
      issues.push({
        code: issue.code === 'duplicate_id' || issue.code === 'duplicate_objective_id' ? 'duplicate_id' : 'invalid_value',
        path: `${chapterPath}.${issue.path}`,
        message: issue.message,
        id: issue.id,
      })
    })
    const npcResult = validateNpcDefinitions(content.npcs)
    npcResult.issues.forEach((issue) => {
      issues.push({
        code: issue.code === 'duplicate_id' ? 'duplicate_id' : 'invalid_value',
        path: `${chapterPath}.${issue.path}`,
        message: issue.message,
        id: issue.id,
      })
    })
    const hotspotResult = validateHotspotDefinitions(content.hotspots ?? [], content.locations.map((location) => String(location.id)))
    hotspotResult.issues.forEach((issue) => {
      issues.push({
        code: issue.code === 'duplicate_id' ? 'duplicate_id' : issue.code === 'missing_location' ? 'missing_reference' : 'invalid_value',
        path: `${chapterPath}.${issue.path}`,
        message: issue.message,
        id: issue.id,
      })
    })
    const gatheringResult = validateGatheringDefinitions(content.gatheringNodes ?? [], {
      locationIds: content.locations.map((location) => String(location.id)),
      chapterId: String(content.chapter.id),
      itemIds: gatheringItems.length > 0 ? gatheringItems.map((item) => String(item.id)) : undefined,
    })
    gatheringResult.issues.forEach((issue) => {
      issues.push({
        code: issue.code === 'duplicate_id' ? 'duplicate_id' : issue.code === 'missing_location' || issue.code === 'missing_item' ? 'missing_reference' : 'invalid_value',
        path: `${chapterPath}.${issue.path}`,
        message: issue.message,
        id: issue.id,
      })
    })
    if (content.dialogues) validateDialogues(content.dialogues, issues)
    if (content.enemies) {
      const enemyResult = validateChapterEnemyDefinitions(content.enemies, String(content.chapter.id))
      enemyResult.issues.forEach((issue) => {
        issues.push({
          code: issue.code === 'duplicate_id' ? 'duplicate_id' : issue.code === 'missing_reference' ? 'missing_reference' : 'enemy_content_invalid',
          path: `${chapterPath}.${issue.path}`,
          message: issue.message,
          id: issue.id,
        })
      })
    }
    content.locations.forEach((location, locationIndex) => {
      if (location.chapterId !== content.chapter.id) {
        issues.push({ code: 'invalid_value', path: `${chapterPath}.locations[${locationIndex}].chapterId`, message: '地点所属章节不匹配', id: location.id })
      }
      if (location.regionId && !regionIds.includes(location.regionId)) {
        issues.push({ code: 'missing_reference', path: `${chapterPath}.locations[${locationIndex}].regionId`, message: `找不到区域「${location.regionId}」`, id: location.regionId })
      }
      if (location.regionId) {
        const region = manifest.regions.find((candidate) => candidate.id === location.regionId)
        if (region && region.chapterId !== location.chapterId) {
          issues.push({ code: 'invalid_value', path: `${chapterPath}.locations[${locationIndex}].regionId`, message: '地点所属区域与章节不匹配', id: location.id })
        }
      }
      location.assetIds?.forEach((assetId, assetIndex) => {
        if (manifest.assetManifest && !assetIds.has(String(assetId))) {
          issues.push({ code: 'missing_reference', path: `${chapterPath}.locations[${locationIndex}].assetIds[${assetIndex}]`, message: `找不到资源「${assetId}」`, id: assetId })
        } else if (manifest.assetManifest && location.regionId && !assetsByRegion.get(String(location.regionId))?.has(String(assetId))) {
          issues.push({ code: 'missing_reference', path: `${chapterPath}.locations[${locationIndex}].assetIds[${assetIndex}]`, message: `资源「${assetId}」未登记在所属区域清单`, id: assetId })
        }
      })
      location.npcIds.forEach((npcId, npcIndex) => {
        if (!hasId(content.npcs, npcId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.locations[${locationIndex}].npcIds[${npcIndex}]`, message: `找不到 NPC「${npcId}」`, id: npcId })
      })
      location.questIds.forEach((questId, questIndex) => {
        if (!hasId(content.quests, questId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.locations[${locationIndex}].questIds[${questIndex}]`, message: `找不到任务「${questId}」`, id: questId })
      })
    })
    content.npcs.forEach((npc, npcIndex) => {
      npc.locationIds.forEach((locationId, locationIndex) => {
        if (!hasId(content.locations, locationId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].locationIds[${locationIndex}]`, message: `找不到地点「${locationId}」`, id: locationId })
      })
      npc.dialogueIds?.forEach((dialogueId, dialogueIndex) => {
        if (!content.dialogues || !hasId(content.dialogues, dialogueId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].dialogueIds[${dialogueIndex}]`, message: `找不到对白「${dialogueId}」`, id: dialogueId })
      })
      npc.appearances?.forEach((appearance, appearanceIndex) => {
        if (appearance.chapterId && appearance.chapterId !== content.chapter.id) return
        if (!hasId(content.locations, appearance.locationId)) {
          issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].appearances[${appearanceIndex}].locationId`, message: `找不到地点「${appearance.locationId}」`, id: appearance.locationId })
        }
        appearance.dialogueIds?.forEach((dialogueId, dialogueIndex) => {
          if (!content.dialogues || !hasId(content.dialogues, dialogueId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].appearances[${appearanceIndex}].dialogueIds[${dialogueIndex}]`, message: `找不到对白「${dialogueId}」`, id: dialogueId })
        })
        appearance.questIds?.forEach((questId, questIndex) => {
          if (!hasId(content.quests, questId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].appearances[${appearanceIndex}].questIds[${questIndex}]`, message: `找不到任务「${questId}」`, id: questId })
        })
      })
      npc.taskQuestIds?.forEach((questId, questIndex) => {
        if (!hasId(content.quests, questId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.npcs[${npcIndex}].taskQuestIds[${questIndex}]`, message: `找不到任务「${questId}」`, id: questId })
      })
    })
    content.quests.forEach((quest, questIndex) => {
      if (quest.chapterId !== content.chapter.id) issues.push({ code: 'invalid_value', path: `${chapterPath}.quests[${questIndex}].chapterId`, message: '任务所属章节不匹配', id: quest.id })
      if (quest.giverNpcId && !hasId(content.npcs, quest.giverNpcId)) issues.push({ code: 'missing_reference', path: `${chapterPath}.quests[${questIndex}].giverNpcId`, message: `找不到 NPC「${quest.giverNpcId}」`, id: quest.giverNpcId })
      if (quest.dialogueId && (!content.dialogues || !hasId(content.dialogues, quest.dialogueId))) issues.push({ code: 'missing_reference', path: `${chapterPath}.quests[${questIndex}].dialogueId`, message: `找不到对白「${quest.dialogueId}」`, id: quest.dialogueId })
    })
  })
  const skillResult = validateSkillDefinitions(skills)
  skillResult.issues.forEach((issue) => {
    issues.push({
      code: issue.code === 'prerequisite_cycle' ? 'skill_prerequisite_cycle' : issue.code === 'missing_prerequisite' ? 'missing_reference' : issue.code === 'duplicate_id' ? 'duplicate_id' : 'invalid_value',
      path: issue.path,
      message: issue.message,
      id: issue.id,
    })
  })
  const passiveResult = validatePassiveDefinitions(passives)
  passiveResult.issues.forEach((issue) => {
    issues.push({
      code: issue.code === 'prerequisite_cycle' ? 'passive_prerequisite_cycle' : issue.code === 'missing_prerequisite' ? 'missing_reference' : issue.code === 'duplicate_id' ? 'duplicate_id' : 'invalid_value',
      path: issue.path,
      message: issue.message,
      id: issue.id,
    })
  })
  return { valid: issues.length === 0, issues }
}

export function assertValidContent(manifest: ContentManifest, chapters: readonly ChapterContent[], skills: readonly SkillDefinition[] = [], passives: readonly PassiveDefinition[] = [], gatheringItems: readonly ItemDefinition[] = []): void {
  const result = validateContent(manifest, chapters, skills, passives, gatheringItems)
  if (!result.valid) throw new ContentValidationError(result.issues)
}
