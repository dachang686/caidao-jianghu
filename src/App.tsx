import { useEffect, useRef, useState } from 'react'
import { ScreenShell } from './screens'
import { audioDirector } from './game/audio'
import { deleteSave, exportSave, loadSave, parseImportedSave, persistSave } from './game/save'
import { useGameStore } from './stores'
import { resolveInputAction } from './systems/input'
import { getStoreServices } from './stores'
import { asWorldRegionId } from './types/ids'
import { AppErrorBoundary, LEGACY_UI_RECOVERY_KEY, rememberUiRecoverySave } from './components/errors/AppErrorBoundary'

const VILLAGE_REGION_ID = asWorldRegionId('xiaoyu-village')

/** App only owns global services and delegates visual pages to the screen shell. */
function App() {
  const player = useGameStore((state) => state.player)
  const quests = useGameStore((state) => state.quests)
  const world = useGameStore((state) => state.world)
  const settings = useGameStore((state) => state.settings)
  const screen = useGameStore((state) => state.screen)
  const temporaryMode = useGameStore((state) => state.temporaryMode)
  const saveStatus = useGameStore((state) => state.saveStatus)
  const setSaveStatus = useGameStore((state) => state.setSaveStatus)
  const hydrateSave = useGameStore((state) => state.hydrateSave)
  const makeSave = useGameStore((state) => state.makeSave)
  const toggleBossKey = useGameStore((state) => state.toggleBossKey)
  const activePanel = useGameStore((state) => state.activePanel)
  const activeDialogue = useGameStore((state) => state.activeDialogue)
  const setPanel = useGameStore((state) => state.setPanel)
  const closeDialogue = useGameStore((state) => state.closeDialogue)
  const ready = useRef(false)
  const assetManager = getStoreServices()?.assetManager
  const [recoveryMessage, setRecoveryMessage] = useState('')

  useEffect(() => {
    let active = true
    loadSave()
      .then((save) => { if (save && active) hydrateSave(save) })
      .catch(() => { if (active) setSaveStatus('temporary') })
      .finally(() => { ready.current = true })
    return () => { active = false }
  }, [hydrateSave, setSaveStatus])

  useEffect(() => {
    if (!ready.current || !player || temporaryMode) return
    const snapshot = makeSave()
    if (!snapshot) return
    rememberUiRecoverySave(snapshot)
    const timer = window.setTimeout(() => {
      setSaveStatus('saving')
      persistSave(snapshot).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('temporary'))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [makeSave, player, quests, world, settings, screen, temporaryMode, setSaveStatus])

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion)
    audioDirector.update(settings)
  }, [settings])

  useEffect(() => {
    if (!assetManager) return
    const lifecycle = screen === 'menu'
      ? assetManager.leaveRegion().then(() => assetManager.preloadGlobal())
      : screen === 'creation'
        ? assetManager.leaveRegion().then(() => assetManager.releaseGlobal())
        : assetManager.releaseGlobal().then(() => assetManager.enterRegion(VILLAGE_REGION_ID))
    void lifecycle.catch(() => undefined)
  }, [assetManager, screen])

  useEffect(() => {
    const activateAudio = () => audioDirector.activate(settings)
    const playTap = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest('button')) audioDirector.play('tap')
    }
    window.addEventListener('pointerdown', activateAudio, { once: true })
    document.addEventListener('click', playTap)
    return () => {
      window.removeEventListener('pointerdown', activateAudio)
      document.removeEventListener('click', playTap)
    }
  }, [settings])

  useEffect(() => {
    audioDirector.setPaused(temporaryMode)
  }, [temporaryMode])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (resolveInputAction(event, settings.keyBindings) !== 'cancel') return
      event.preventDefault()
      if (activeDialogue) closeDialogue()
      else if (activePanel) setPanel(null)
      else toggleBossKey()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeDialogue, activePanel, closeDialogue, setPanel, settings.keyBindings, toggleBossKey])

  const recoverTemporarySave = () => {
    try {
      const raw = window.sessionStorage.getItem(LEGACY_UI_RECOVERY_KEY)
      if (!raw) { setRecoveryMessage('没有找到可验证的临时档；当前损坏自动档未被覆盖。'); return }
      hydrateSave(parseImportedSave(raw))
      setSaveStatus('saved')
      setRecoveryMessage('临时档已恢复，原损坏自动档仍未被覆盖。')
    } catch {
      setRecoveryMessage('临时档校验失败，未覆盖任何有效存档。')
    }
  }

  const retryAutomaticSave = async () => {
    try {
      const save = await loadSave()
      if (!save) { setRecoveryMessage('没有找到自动档；可以开始新的江湖旅程。'); return }
      hydrateSave(save)
      setSaveStatus('saved')
      setRecoveryMessage('自动档校验通过，已恢复当前旅程。')
    } catch {
      setRecoveryMessage('自动档校验失败；请恢复临时档或清除损坏记录。')
    }
  }

  const exportRecoverySave = () => {
    const save = makeSave()
    if (!save) { setRecoveryMessage('当前没有可导出的有效档案。'); return }
    const href = URL.createObjectURL(new Blob([exportSave(save)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'caidao-jianghu-recovery.json'
    link.click()
    URL.revokeObjectURL(href)
    setRecoveryMessage('已导出当前可验证数据；未包含凭据或运行堆栈。')
  }

  const clearInvalidAutomaticSave = async () => {
    await deleteSave()
    setSaveStatus('idle')
    window.location.reload()
  }

  const recoveryVisible = saveStatus === 'temporary' || saveStatus === 'error'
  return <><AppErrorBoundary makeSave={makeSave} hydrateSave={hydrateSave} setScreen={useGameStore.getState().setScreen}><ScreenShell /></AppErrorBoundary>{recoveryVisible && <main className="save-recovery-overlay" data-testid="save-recovery-panel" role="alert"><section className="save-recovery-card"><p className="error-recovery-kicker">江湖账本需要复核</p><h1>没有覆盖你的有效进度</h1><p>自动存档校验失败或本地空间不足。先恢复临时档；清除损坏记录前不会删除其他恢复数据。</p><p className="save-recovery-message" role="status">{recoveryMessage || '请选择一种恢复方式。'}</p><div className="error-recovery-actions"><button type="button" onClick={recoverTemporarySave}>恢复临时档</button><button type="button" onClick={() => { void retryAutomaticSave() }}>重新验证自动档</button><button type="button" onClick={exportRecoverySave}>导出当前数据</button><button type="button" onClick={() => { void clearInvalidAutomaticSave() }}>清除损坏自动档</button></div></section></main>}</>
}

export { App }
