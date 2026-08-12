import { describe, expect, it } from 'vitest'
import { contentManifest } from '../content/manifest'
import { asChapterId, asLocationId } from './ids'
import type { ChapterId, LocationId } from './ids'

describe('内容 ID 与 Manifest', () => {
  it('品牌化 ID 保持值可序列化且不能在类型层混用', () => {
    const chapterId: ChapterId = asChapterId('ch01')
    const locationId: LocationId = asLocationId('xiaoyu-village')
    expect(JSON.stringify({ chapterId, locationId })).toBe('{"chapterId":"ch01","locationId":"xiaoyu-village"}')

    // @ts-expect-error ChapterId must not be accepted where LocationId is required.
    const invalidLocation: LocationId = chapterId
    expect(invalidLocation).toBe(chapterId)
  })

  it('Manifest 可以独立描述当前小愚村入口', () => {
    expect(contentManifest.version).toBe(1)
    expect(contentManifest.chapters).toHaveLength(8)
    expect(contentManifest.chapters[0]).toMatchObject({ title: '小愚村', order: 1 })
    expect(contentManifest.resourceEntrypoints[0]?.path).toBe('./chapters/ch01')
  })
})
