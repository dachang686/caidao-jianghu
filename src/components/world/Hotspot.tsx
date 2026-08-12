import type { CSSProperties } from 'react'
import type { HotspotView } from '../../types/hotspot'

export interface HotspotProps {
  readonly view: HotspotView
  readonly onActivate: (hotspotId: HotspotView['definition']['id']) => void
}

/**
 * 命中层只负责把领域层给出的 view 映射成可访问按钮；背景图和角色视觉不参与命中判断。
 * 坐标使用场景归一化比例，移动端可由内容提供独立 reflow 位置。
 */
export function Hotspot({ view, onActivate }: HotspotProps) {
  const { definition } = view
  const mobile = definition.layout.mobile ?? definition.layout.desktop
  const style = {
    '--hotspot-x': `${definition.layout.desktop.x * 100}%`,
    '--hotspot-y': `${definition.layout.desktop.y * 100}%`,
    '--hotspot-mobile-x': `${mobile.x * 100}%`,
    '--hotspot-mobile-y': `${mobile.y * 100}%`,
  } as CSSProperties
  const locked = !view.available
  const status = view.completed ? '已处理' : view.lockedReason
  return (
    <div className={`world-hotspot ${locked ? 'is-locked' : ''}`} style={style} data-hotspot-id={definition.id}>
      <button
        type="button"
        className="world-hotspot-button"
        disabled={locked}
        tabIndex={definition.keyboardOrder}
        aria-label={locked ? `${definition.label}：${status ?? '当前不可用'}` : `${definition.label}：${definition.description}`}
        title={locked ? status : definition.description}
        onClick={() => onActivate(definition.id)}
      >
        <span className="world-hotspot-label">{definition.label}</span>
      </button>
      {locked && <span className="world-hotspot-reason" role="status">{status}</span>}
    </div>
  )
}
