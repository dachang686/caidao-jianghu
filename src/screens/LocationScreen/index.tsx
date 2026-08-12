import type { RegionLoadError, WorldLocationRecord } from '../../types/world'

export interface LocationScreenProps {
  readonly location: WorldLocationRecord | null
  readonly loadState: 'loading' | 'ready' | 'error'
  readonly error?: RegionLoadError
  readonly onRetry: () => void
  readonly onReturnToMap: () => void
  readonly onEnterChapter?: () => void
  readonly onReturnToPreviousLocation?: () => void
  readonly canReturnToPreviousLocation?: boolean
}

/** 页面只渲染加载/领域层给出的状态，区域资源失败时保留明确重试入口。 */
export function LocationScreen({
  location,
  loadState,
  error,
  onRetry,
  onReturnToMap,
  onEnterChapter,
  onReturnToPreviousLocation,
  canReturnToPreviousLocation = false,
}: LocationScreenProps) {
  if (loadState === 'loading') {
    return <main className="location-screen" data-testid="location-screen"><p role="status">正在加载地点内容……</p></main>
  }

  if (loadState === 'error' || !location) {
    return (
      <main className="location-screen location-screen--error" data-testid="location-screen">
        <section role="alert" className="location-load-error">
          <h1>地点暂时打不开</h1>
          <p>{error?.message ?? '没有找到地点内容。'}</p>
          {error?.recoverable && <button type="button" onClick={onRetry}>重试加载</button>}
          <button type="button" onClick={onReturnToMap}>返回地图</button>
        </section>
      </main>
    )
  }

  return (
    <main className="location-screen" data-testid="location-screen">
      <header>
        <p className="eyebrow">当前地点</p>
        <h1>{location.title}</h1>
        <p>{location.description}</p>
      </header>
      <nav className="location-navigation" aria-label="地点导航">
        {canReturnToPreviousLocation && onReturnToPreviousLocation && <button type="button" onClick={onReturnToPreviousLocation}>返回上一地点</button>}
        <button type="button" onClick={onReturnToMap}>打开世界地图</button>
        {onEnterChapter && <button type="button" onClick={onEnterChapter}>进入当前章节</button>}
      </nav>
    </main>
  )
}
