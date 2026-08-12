import { describe, expect, it } from 'vitest'
import { ch02HotspotDefinitions } from '../../content/hotspots/ch02'
import { loadChapterSync } from '../../content/sync-loader'
import { asChapterId } from '../../types/ids'
import { validateHotspotDefinitions } from './engine'

describe('C311 清河县热点命中层', () => {
  it('桌面与移动端都有归一化坐标，且每个地点至少保留一个可浏览热点', () => {
    const chapter = loadChapterSync(asChapterId('ch02'))
    const result = validateHotspotDefinitions(ch02HotspotDefinitions, chapter.locations.map((location) => String(location.id)))
    expect(result.valid).toBe(true)
    expect(ch02HotspotDefinitions.length).toBeGreaterThanOrEqual(3)
    expect(new Set(ch02HotspotDefinitions.map((hotspot) => hotspot.locationId)).size).toBe(2)
    ch02HotspotDefinitions.forEach((hotspot) => {
      expect(hotspot.layout.desktop.x).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.desktop.x).toBeLessThanOrEqual(1)
      expect(hotspot.layout.mobile).toBeDefined()
      expect(hotspot.layout.mobile!.y).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.mobile!.y).toBeLessThanOrEqual(1)
    })
  })
})
