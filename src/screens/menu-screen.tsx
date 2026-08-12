import type { CSSProperties } from 'react'
import menuBackground from '../assets/backgrounds/menu-valley.webp'
import heroSprite from '../assets/characters/hero.webp'
import elderSprite from '../assets/characters/elder.webp'
import catSprite from '../assets/characters/cat.webp'
import { OverlayPanel } from '../components/OverlayPanel'
import { Button, Meter } from '../components/game-ui'
import { useGameStore } from '../stores'

const navItems = [
  { id: 'guide', icon: '🗺️', label: '江湖故事' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'codex', icon: '📜', label: '图鉴' },
  { id: 'settings', icon: '⚙️', label: '设置' },
] as const

export function MenuScreen() {
  const player = useGameStore((state) => state.player)
  const setScreen = useGameStore((state) => state.setScreen)
  const setPanel = useGameStore((state) => state.setPanel)
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)

  return (
    <main className="menu-screen scenic-surface" style={{ '--menu-art': `url(${menuBackground})` } as CSSProperties}>
      <div className="paper-grain" />
      <aside className="menu-rail" aria-label="功能导航">
        <div className="portrait portrait--menu" aria-hidden="true">侠</div>
        <div className="profile-note">
          <strong>{player?.name ?? '无名小侠'}</strong>
          <span>Lv. {player?.level ?? 1}</span>
          <Meter value={player?.hp ?? 0} max={player?.maxHp ?? 100} />
        </div>
        {navItems.map((item) => (
          <button key={item.id} className="rail-action" onClick={() => setPanel(item.id)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </aside>

      <header className="menu-topline">
        <span>一把菜刀也能闯江湖！</span>
        <div><button onClick={() => setPanel('guide')}>⌂ 关于游戏</button><button onClick={() => setPanel('guide')}>? 玩法说明</button></div>
      </header>

      <section className="menu-center">
        <p className="eyebrow">搞笑武侠，轻松江湖</p>
        <h1><span>菜刀</span>闯江湖</h1>
        <p className="brush-strip">单机版</p>
        <div className="menu-actions">
          <Button className="menu-action menu-action--primary" onClick={() => setScreen('creation')}><b>⚔</b><span>开始游戏<small>闯荡江湖，从菜刀起</small></span></Button>
          <Button className="menu-action menu-action--blue" disabled={!player} onClick={() => setScreen('jianghu')}><b>📜</b><span>继续旅程<small>{player ? '上次走到：小愚村' : '还没有江湖旧梦'}</small></span></Button>
          <Button className="menu-action menu-action--green" onClick={() => setPanel('guide')}><b>▤</b><span>新手教程<small>菜刀也能成大虾</small></span></Button>
          <Button className="menu-action menu-action--purple" onClick={() => setPanel('codex')}><b>☯</b><span>更多玩法<small>彩蛋、挑战、成就</small></span></Button>
        </div>
      </section>

      <aside className="menu-sign">
        <b>✓ 单机，无需联网</b><b>✓ 无需注册</b><b>✓ 轻松有趣</b><b>✓ 适合所有年龄</b>
      </aside>
      <div className="menu-hero" aria-hidden="true"><img src={heroSprite} alt="" /><span>小虾米</span></div>
      <div className="menu-cat" aria-hidden="true"><img src={catSprite} alt="" /></div>
      <div className="menu-elder" aria-hidden="true"><img src={elderSprite} alt="" /><q>少侠，你这刀……<br />真是有够霸气的！</q><span>不正经老头</span></div>
      <footer className="menu-footer"><button onClick={() => setSettings({ bgmEnabled: !settings.bgmEnabled })}>🔊 背景音乐：{settings.bgmEnabled ? '开' : '关'}</button><span>⟵ 一个人，也能玩出整个江湖！ ⟶</span><span>江湖虽小，快乐很大</span></footer>
      <OverlayPanel />
    </main>
  )
}
