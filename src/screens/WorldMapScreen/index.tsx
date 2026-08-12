import type { RegionAvailability } from '../../types/world'
import type { WorldRegionId } from '../../types/ids'

export interface WorldMapScreenProps {
  readonly regions: readonly RegionAvailability[]
  readonly onSelectRegion: (regionId: WorldRegionId) => void
}

/** 只展示系统解析好的区域状态；解锁判断和入口条件不在页面重复实现。 */
export function WorldMapScreen({ regions, onSelectRegion }: WorldMapScreenProps) {
  return (
    <main className="world-map-screen" data-testid="world-map-screen">
      <header className="world-map-header">
        <p className="eyebrow">江湖地图</p>
        <h1>走哪条路，先看路牌</h1>
        <p>地图只列出已经登记的真实区域，新的区域接入内容后才会出现。</p>
      </header>
      <section className="world-region-list" aria-label="已登记区域">
        {regions.map((entry) => {
          const locked = entry.status === 'locked'
          return (
            <article className={`world-region-card world-region-card--${entry.status}`} key={entry.region.id}>
              <div>
                <span className="world-region-order">第 {entry.region.order} 区</span>
                <h2>{entry.region.title}</h2>
                {locked && <p className="world-region-lock" role="status">🔒 {entry.reason ?? '该区域尚未解锁。'}</p>}
              </div>
              <button
                type="button"
                disabled={locked}
                aria-label={locked ? `${entry.region.title}：${entry.reason ?? '该区域尚未解锁。'}` : `进入${entry.region.title}`}
                onClick={() => onSelectRegion(entry.region.id)}
              >
                {locked ? '暂不可进入' : '进入区域'}
              </button>
            </article>
          )
        })}
      </section>
    </main>
  )
}
