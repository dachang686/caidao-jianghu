import { loadChapter } from '../../content/loader'
import { contentManifest } from '../../content/manifest'
import type { ChapterContent } from '../../content/loader'
import type { ContentManifest } from '../../types/content'
import type { WorldRegionId, RegionLoadError, RegionLoadResult, WorldRegionLoader } from '../../types/world'

export interface WorldRegionLoaderOptions {
  readonly manifest?: ContentManifest
  readonly loadChapter?: (chapterId: ContentManifest['chapters'][number]['id'], manifest: ContentManifest) => Promise<ChapterContent>
}

function errorResult(regionId: WorldRegionId, code: RegionLoadError['code'], message: string, recoverable: boolean): RegionLoadResult {
  return { status: 'error', regionId, error: { code, regionId, message, recoverable } }
}

/**
 * 区域加载只使用 Manifest 中登记的章节入口；每个区域首次进入才触发已有的动态 import。
 * 加载失败保留为可展示、可重试的结果，不把异常直接抛给 Screen。
 */
export function createWorldRegionLoader(options: WorldRegionLoaderOptions = {}): WorldRegionLoader {
  const manifest = options.manifest ?? contentManifest
  const importer = options.loadChapter ?? loadChapter
  const loaded = new Map<WorldRegionId, ChapterContent>()
  const pending = new Map<WorldRegionId, Promise<RegionLoadResult>>()

  const load = (regionId: WorldRegionId): Promise<RegionLoadResult> => {
    const region = manifest.regions.find((candidate) => candidate.id === regionId)
    if (!region) return Promise.resolve(errorResult(regionId, 'unknown_region', '地图没有登记该区域，无法加载。', false))
    const cached = loaded.get(regionId)
    if (cached) return Promise.resolve({ status: 'loaded', regionId, content: cached })
    const running = pending.get(regionId)
    if (running) return running

    const task = (async (): Promise<RegionLoadResult> => {
      try {
        const content = await importer(region.chapterId, manifest)
        if (content.chapter.id !== region.chapterId) {
          return errorResult(regionId, 'invalid_content', `区域资源返回了错误章节「${content.chapter.id}」。`, false)
        }
        loaded.set(regionId, content)
        return { status: 'loaded', regionId, content }
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知资源加载错误。'
        return errorResult(regionId, 'load_failed', message, true)
      } finally {
        pending.delete(regionId)
      }
    })()
    pending.set(regionId, task)
    return task
  }

  return {
    load,
    isLoaded: (regionId) => loaded.has(regionId),
    clear: (regionId) => {
      if (regionId) loaded.delete(regionId)
      else loaded.clear()
    },
  }
}

export const createRegionContentLoader = createWorldRegionLoader
