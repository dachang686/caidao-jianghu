import { describe, expect, it } from 'vitest'
import { ch04HotspotDefinitions } from '../../content/hotspots/ch04'
import { loadChapterSync } from '../../content/sync-loader'
import { asChapterId } from '../../types/ids'
import { validateHotspotDefinitions } from './engine'

describe('C331 青云山热点命中层', () => {
  it('桌面与移动端都有归一化坐标，每个地点至少有一个热点和一个安全返回热点', () => {
    const chapter = loadChapterSync(asChapterId('ch04'))
    const result = validateHotspotDefinitions(ch04HotspotDefinitions, chapter.locations.map((location) => String(location.id)))
    expect(result.valid).toBe(true)
    expect(ch04HotspotDefinitions.length).toBeGreaterThanOrEqual(5)
    expect(new Set(ch04HotspotDefinitions.map((hotspot) => hotspot.locationId))).toEqual(new Set(['qingyun-gate', 'qingyun-herb-garden', 'qingyun-bell-terrace']))
    ch04HotspotDefinitions.forEach((hotspot) => {
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
    expect(ch04HotspotDefinitions.filter((hotspot) => hotspot.label.includes('回到')).length).toBe(2)
  })
})
