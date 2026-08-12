import { contentManifest } from '../content/manifest'
import { CORE_MEME_PACK } from '../content/memes'
import { loadChapter } from '../content/loader'
import { ch01GatheringItems } from '../content/gathering/ch01'
import { EventBus } from '../systems/events'
import { AssetLifecycleManager } from '../systems/assets'
import { LocalTextProvider } from '../systems/providers'
import { createIndexedDbSaveRepository, SaveRepository } from '../systems/save'
import { createWorldRegionLoader } from '../systems/world'
import { assertValidContent } from '../validators/content'
import type { ChapterContent } from '../content/loader'

export interface FoundationRuntime {
  readonly chapter: ChapterContent
  readonly eventBus: EventBus
  readonly saveRepository: SaveRepository
  readonly textProvider: LocalTextProvider
  readonly assetManager: AssetLifecycleManager
  readonly regionLoader: ReturnType<typeof createWorldRegionLoader>
}

export async function createFoundationRuntime(): Promise<FoundationRuntime> {
  const entry = contentManifest.chapters[0]
  if (!entry) throw new Error('ContentManifest 没有注册起始章节。')
  const chapter = await loadChapter(entry.id)
  assertValidContent(contentManifest, [chapter], [], [], ch01GatheringItems)
  if (!contentManifest.assetManifest) throw new Error('ContentManifest 没有注册资源清单。')
  return {
    chapter,
    eventBus: new EventBus(),
    // 浏览器运行时直接使用 V2 仓库；测试可以按需注入 memory storage。
    saveRepository: createIndexedDbSaveRepository(),
    textProvider: new LocalTextProvider(CORE_MEME_PACK),
    assetManager: new AssetLifecycleManager(contentManifest.assetManifest),
    regionLoader: createWorldRegionLoader(),
  }
}
