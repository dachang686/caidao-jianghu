import { describe, expect, it } from 'vitest'
import { ch03HotspotDefinitions } from '../../content/hotspots/ch03'
import { loadChapterSync } from '../../content/sync-loader'
import { asChapterId } from '../../types/ids'
import { validateHotspotDefinitions } from './engine'

describe('C321 黑风寨热点命中层', () => {
  it('桌面与移动端都有归一化坐标，每个地点至少有一个热点和一个安全返回热点', () => {
    const chapter = loadChapterSync(asChapterId('ch03'))
    const result = validateHotspotDefinitions(ch03HotspotDefinitions, chapter.locations.map((location) => String(location.id)))
    expect(result.valid).toBe(true)
    expect(ch03HotspotDefinitions.length).toBeGreaterThanOrEqual(5)
    expect(new Set(ch03HotspotDefinitions.map((hotspot) => hotspot.locationId))).toEqual(new Set(['blackwind-gate', 'blackwind-kitchen', 'blackwind-watchtower']))
    ch03HotspotDefinitions.forEach((hotspot) => {
      expect(hotspot.layout.desktop.x).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.desktop.x).toBeLessThanOrEqual(1)
      expect(hotspot.layout.desktop.y).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.desktop.y).toBeLessThanOrEqual(1)
      expect(hotspot.layout.mobile).toBeDefined()
      expect(hotspot.layout.mobile!.x).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.mobile!.x).toBeLessThanOrEqual(1)
      expect(hotspot.layout.mobile!.y).toBeGreaterThanOrEqual(0)
      expect(hotspot.layout.mobile!.y).toBeLessThanOrEqual(1)
    })
    expect(ch03HotspotDefinitions.filter((hotspot) => hotspot.label.includes('回到')).length).toBe(2)
  })
})
