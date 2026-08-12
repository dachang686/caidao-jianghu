import type { ChapterContent } from './loader'
import { ContentLoadError } from './loader'
import type { ContentManifest } from '../types/content'
import type { ChapterId } from '../types/ids'
import { contentManifest } from './manifest'
import currentChapter from './chapters/ch01'
import ch02Chapter from './chapters/ch02'
import ch03Chapter from './chapters/ch03'
import ch04Chapter from './chapters/ch04'
import ch05Chapter from './chapters/ch05'
import ch06Chapter from './chapters/ch06'
import ch07Chapter from './chapters/ch07'
import ch08Chapter from './chapters/ch08'

const syncChapters = new Map<string, ChapterContent>([
  ['ch01', currentChapter],
  ['ch02', ch02Chapter],
  ['ch03', ch03Chapter],
  ['ch04', ch04Chapter],
  ['ch05', ch05Chapter],
  ['ch06', ch06Chapter],
  ['ch07', ch07Chapter],
  ['ch08', ch08Chapter],
])

function manifestEntry(chapterId: ChapterId, manifest: ContentManifest): ContentManifest['chapters'][number] {
  const entry = manifest.chapters.find((chapter) => chapter.id === chapterId)
  if (!entry) throw new ContentLoadError(chapterId, 'Manifest 中没有注册该章节')
  return entry
}

/** 仅供构建期校验与旧测试使用；浏览器运行时必须走异步动态加载。 */
export function loadChapterSync(chapterId: ChapterId, manifest: ContentManifest = contentManifest): ChapterContent {
  manifestEntry(chapterId, manifest)
  const content = syncChapters.get(chapterId)
  if (!content) throw new ContentLoadError(chapterId, '该章节没有同步入口，请使用异步加载')
  return content
}

export function registerChapterSync(chapterId: ChapterId, content: ChapterContent): () => void {
  syncChapters.set(chapterId, content)
  return () => {
    if (syncChapters.get(chapterId) === content) syncChapters.delete(chapterId)
  }
}
