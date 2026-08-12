import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useGameStore } from '../../stores'
import { assignKey, getBindingLabel, INPUT_ACTIONS, INPUT_ACTION_LABELS, resetKeyBindings } from '../../systems/input'
import type { InputAction } from '../../types/settings'

interface SettingsScreenProps {
  readonly footer?: ReactNode
}

const DENSITY_OPTIONS = [
  { id: 'mild', label: '清淡', hint: '少量反应，节奏更安静。' },
  { id: 'standard', label: '标准', hint: '推荐的四层幽默密度。' },
  { id: 'spicy', label: '加辣', hint: '反应更密，笑点更主动。' },
] as const

const TEXT_SPEED_OPTIONS = [
  { id: 'slow', label: '慢', hint: '适合逐句阅读。' },
  { id: 'standard', label: '标准', hint: '默认阅读节奏。' },
  { id: 'fast', label: '快', hint: '减少等待，直接看结果。' },
] as const

const DIFFICULTY_OPTIONS = [
  { id: 'story', label: '剧情', hint: '资源更宽裕，专心看江湖。' },
  { id: 'standard', label: '标准', hint: '数值与意图的推荐平衡。' },
  { id: 'expert', label: '高手', hint: '更看重资源与出招时机。' },
] as const

export function SettingsScreen({ footer }: SettingsScreenProps) {
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)
  const screen = useGameStore((state) => state.screen)
  const [capturingAction, setCapturingAction] = useState<InputAction | null>(null)
  const [status, setStatus] = useState('')
  const difficultyLocked = screen === 'battle'

  const captureKey = (event: KeyboardEvent<HTMLButtonElement>, action: InputAction) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') {
      setCapturingAction(null)
      setStatus('已取消改键。')
      return
    }
    const key = event.code || event.key
    if (!key) return
    setSettings({ keyBindings: assignKey(settings.keyBindings, action, key) })
    setCapturingAction(null)
    setStatus(`${INPUT_ACTION_LABELS[action]}已改为「${getBindingLabel(assignKey(settings.keyBindings, action, key)[action])}」。`)
  }

  return <div className="settings-screen">
    <header className="settings-heading">
      <div>
        <span className="settings-kicker">江湖账本 · 即时生效</span>
        <h2>掌柜的</h2>
        <p>音量、节奏和按键都只影响体验，不会偷偷改动领域结算。</p>
      </div>
    </header>

    <section className="settings-section" aria-labelledby="settings-audio-title">
      <h3 id="settings-audio-title">声音与动态</h3>
      <label className="settings-range"><span>总音量 <output>{Math.round(settings.masterVolume * 100)}%</output></span><input type="range" min="0" max="1" step=".05" value={settings.masterVolume} onChange={(event) => setSettings({ masterVolume: Number(event.target.value) })} /></label>
      <label className="settings-range"><span>背景音乐 <output>{Math.round(settings.musicVolume * 100)}%</output></span><input type="range" min="0" max="1" step=".05" value={settings.musicVolume} onChange={(event) => setSettings({ musicVolume: Number(event.target.value) })} disabled={!settings.bgmEnabled} /></label>
      <label className="settings-range"><span>音效 <output>{Math.round(settings.sfxVolume * 100)}%</output></span><input type="range" min="0" max="1" step=".05" value={settings.sfxVolume} onChange={(event) => setSettings({ sfxVolume: Number(event.target.value) })} disabled={!settings.sfxEnabled} /></label>
      <label className="settings-range"><span>搞笑音效 <output>{Math.round(settings.sillyVolume * 100)}%</output></span><input type="range" min="0" max="1" step=".05" value={settings.sillyVolume} onChange={(event) => setSettings({ sillyVolume: Number(event.target.value) })} disabled={!settings.sfxEnabled || !settings.sillySfxEnabled} /></label>
      <div className="settings-checks">
        <label><input type="checkbox" checked={settings.masterMuted} onChange={(event) => setSettings({ masterMuted: event.target.checked })} /> 总静音</label>
        <label><input type="checkbox" checked={settings.bgmEnabled} onChange={(event) => setSettings({ bgmEnabled: event.target.checked })} /> 背景音乐</label>
        <label><input type="checkbox" checked={settings.sfxEnabled} onChange={(event) => setSettings({ sfxEnabled: event.target.checked })} /> 音效</label>
        <label><input type="checkbox" checked={settings.sillySfxEnabled} onChange={(event) => setSettings({ sillySfxEnabled: event.target.checked })} /> 搞笑音效</label>
        <label><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => setSettings({ reducedMotion: event.target.checked })} /> 减少动态效果</label>
      </div>
    </section>

    <fieldset className="settings-section settings-choice-group">
      <legend>梗密度</legend>
      <div className="settings-choice-grid">
        {DENSITY_OPTIONS.map((option) => <label key={option.id} className={settings.memeDensity === option.id ? 'is-selected' : ''}><input type="radio" name="meme-density" value={option.id} checked={settings.memeDensity === option.id} onChange={() => setSettings({ memeDensity: option.id })} /><b>{option.label}</b><small>{option.hint}</small></label>)}
      </div>
    </fieldset>

    <fieldset className="settings-section settings-choice-group">
      <legend>文本速度</legend>
      <div className="settings-choice-grid">
        {TEXT_SPEED_OPTIONS.map((option) => <label key={option.id} className={settings.textSpeed === option.id ? 'is-selected' : ''}><input type="radio" name="text-speed" value={option.id} checked={settings.textSpeed === option.id} onChange={() => setSettings({ textSpeed: option.id })} /><b>{option.label}</b><small>{option.hint}</small></label>)}
      </div>
    </fieldset>

    <fieldset className="settings-section settings-choice-group">
      <legend>难度{difficultyLocked && <small>（战斗中锁定）</small>}</legend>
      <div className="settings-choice-grid">
        {DIFFICULTY_OPTIONS.map((option) => <label key={option.id} className={settings.difficulty === option.id ? 'is-selected' : ''}><input type="radio" name="difficulty" value={option.id} checked={settings.difficulty === option.id} disabled={difficultyLocked} onChange={() => setSettings({ difficulty: option.id })} /><b>{option.label}</b><small>{option.hint}</small></label>)}
      </div>
    </fieldset>

    <section className="settings-section" aria-labelledby="settings-input-title">
      <div className="settings-section-heading"><h3 id="settings-input-title">输入映射</h3><button type="button" className="settings-reset" onClick={() => { setSettings({ keyBindings: resetKeyBindings() }); setStatus('按键已恢复默认。') }}>恢复默认</button></div>
      <p className="settings-help">表单输入时不会触发战斗快捷键。按键冲突会自动让新设置生效，Tab 仍保留浏览器的焦点顺序。</p>
      <div className="settings-key-list">
        {INPUT_ACTIONS.map((action) => <div className="settings-key-row" key={action}><span><b>{INPUT_ACTION_LABELS[action]}</b><small>{action === 'nextTab' ? '保留原生焦点移动' : '点击右侧按钮后按下新键'}</small></span><button type="button" className={`settings-key-button${capturingAction === action ? ' is-capturing' : ''}`} onClick={() => { setCapturingAction(action); setStatus(`请按下${INPUT_ACTION_LABELS[action]}的新按键。`) }} onKeyDown={(event) => captureKey(event, action)}>{capturingAction === action ? '请按键…' : getBindingLabel(settings.keyBindings[action])}</button></div>)}
      </div>
    </section>

    {status && <p className="settings-status" role="status">{status}</p>}
    {footer && <div className="panel-actions settings-footer">{footer}</div>}
  </div>
}
