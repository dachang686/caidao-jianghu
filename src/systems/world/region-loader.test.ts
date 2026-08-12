import { describe, expect, it } from 'vitest'
import { contentManifest } from '../../content/manifest'
import type { ChapterContent } from '../../content/loader'
import { createWorldRegionLoader } from './region-loader'

describe('world region loader', () => {
  it('按区域首次加载并缓存已成功内容，清理后可再次加载', async () => {
    let calls = 0
    const chapter = {
      chapter: {
        id: contentManifest.chapters[0]!.id,
        title: '小愚村',
        order: 1,
        entryLocationId: contentManifest.chapters[0]!.entryLocationId,
        locationIds: [contentManifest.chapters[0]!.entryLocationId],
        resourceEntry: './chapters/ch01',
      },
      locations: [],
      npcs: [],
      quests: [],
    } satisfies ChapterContent
    const loader = createWorldRegionLoader({
      loadChapter: async () => {
        calls += 1
        return chapter
      },
    })
    const regionId = contentManifest.regions[0]!.id
    expect(loader.isLoaded(regionId)).toBe(false)
    const first = await loader.load(regionId)
    const second = await loader.load(regionId)
    expect(first.status).toBe('loaded')
    expect(second.status).toBe('loaded')
    expect(calls).toBe(1)
    expect(loader.isLoaded(regionId)).toBe(true)
    loader.clear(regionId)
    expect(loader.isLoaded(regionId)).toBe(false)
  })

  it('资源失败返回可恢复错误，未知区域不会伪装成可重试加载', async () => {
    const loader = createWorldRegionLoader({
      loadChapter: async () => { throw new Error('本地资源读取失败') },
    })
    const failed = await loader.load(contentManifest.regions[0]!.id)
    expect(failed).toMatchObject({ status: 'error', error: { code: 'load_failed', recoverable: true } })

    const unknown = await loader.load('region:missing' as typeof contentManifest.regions[number]['id'])
    expect(unknown).toMatchObject({ status: 'error', error: { code: 'unknown_region', recoverable: false } })
  })
})
