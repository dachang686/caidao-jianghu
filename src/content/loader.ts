import type { ChapterDefinition, ContentManifest, DialogueNode, HotspotDefinition, LocationDefinition, NpcDefinition, QuestDefinition } from '../types/content'
import type { GatheringNodeDefinition } from '../types/gathering'
import type { ChapterId } from '../types/ids'
import type { ChapterEnemyDefinition } from '../types/chapter-combat'
import { contentManifest } from './manifest'

export interface ChapterContent {
  readonly chapter: ChapterDefinition
  readonly locations: readonly LocationDefinition[]
  readonly npcs: readonly NpcDefinition[]
  readonly quests: readonly QuestDefinition[]
  readonly hotspots?: readonly HotspotDefinition[]
  readonly gatheringNodes?: readonly GatheringNodeDefinition[]
  readonly enemies?: readonly ChapterEnemyDefinition[]
  readonly dialogues?: readonly DialogueNode[]
}

export type ChapterLoader = () => Promise<ChapterContent>

export class ContentLoadError extends Error {
  readonly chapterId: string

  constructor(chapterId: string, message: string) {
    super(`章节「${chapterId}」加载失败：${message}`)
    this.name = 'ContentLoadError'
    this.chapterId = chapterId
  }
}

const asyncChapters = new Map<string, ChapterLoader>([
  ['ch01', async () => (await import('./chapters/ch01')).default],
  ['ch02', async () => (await import('./chapters/ch02')).default],
  ['ch03', async () => (await import('./chapters/ch03')).default],
  ['ch04', async () => (await import('./chapters/ch04')).default],
  ['ch05', async () => (await import('./chapters/ch05')).default],
  ['ch06', async () => (await import('./chapters/ch06')).default],
  ['ch07', async () => (await import('./chapters/ch07')).default],
  ['ch08', async () => (await import('./chapters/ch08')).default],
])

function manifestEntry(chapterId: ChapterId, manifest: ContentManifest): ContentManifest['chapters'][number] {
  const entry = manifest.chapters.find((chapter) => chapter.id === chapterId)
  if (!entry) throw new ContentLoadError(chapterId, 'Manifest 中没有注册该章节')
  return entry
}

export async function loadChapter(chapterId: ChapterId, manifest: ContentManifest = contentManifest): Promise<ChapterContent> {
  manifestEntry(chapterId, manifest)
  const loader = asyncChapters.get(chapterId)
  if (!loader) throw new ContentLoadError(chapterId, '该章节没有动态 import 入口')
  const content = await loader()
  if (content.chapter.id !== chapterId) throw new ContentLoadError(chapterId, `加载内容 ID 为「${content.chapter.id}」`)
  return content
}

export function registerChapterLoader(chapterId: ChapterId, loader: ChapterLoader): () => void {
  asyncChapters.set(chapterId, loader)
  return () => {
    if (asyncChapters.get(chapterId) === loader) asyncChapters.delete(chapterId)
  }
}
