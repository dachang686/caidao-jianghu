import { useEffect, useRef, useState } from 'react'
import { ScreenShell } from './screens'
import { audioDirector } from './systems/audio'
import { useRootGameStore } from './stores'
import { exportGameSave, parseGameSaveExport } from './systems/save'
import { resolveInputAction } from './systems/input'
import { getStoreServices } from './stores'
import { AppErrorBoundary, UI_RECOVERY_KEY, rememberUiRecoverySave } from './components/errors/AppErrorBoundary'

/** App only owns global services and delegates visual pages to the screen shell. */
function App() {
  const player = useRootGameStore((state) => state.player)
  const quests = useRootGameStore((state) => state.quests)
  const world = useRootGameStore((state) => state.world)
  const skillProgress = useRootGameStore((state) => state.skillProgress)
  const inventoryState = useRootGameStore((state) => state.inventoryState)
  const equipmentLoadout = useRootGameStore((state) => state.equipmentLoadout)
  const equipmentStrengthening = useRootGameStore((state) => state.equipmentStrengthening)
  const forgingSnapshot = useRootGameStore((state) => state.forgingSnapshot)
  const cookingSnapshot = useRootGameStore((state) => state.cookingSnapshot)
  const foodBuffSnapshot = useRootGameStore((state) => state.foodBuffSnapshot)
  const postgame = useRootGameStore((state) => state.postgame)
  const settings = useRootGameStore((state) => state.settings)
  const screen = useRootGameStore((state) => state.screen)
  const currentRegionId = useRootGameStore((state) => state.worldNavigation.currentRegionId)
  const temporaryMode = useRootGameStore((state) => state.temporaryMode)
  const saveStatus = useRootGameStore((state) => state.saveStatus)
  const setSaveStatus = useRootGameStore((state) => state.setSaveStatus)
  const hydrateSaveV2 = useRootGameStore((state) => state.hydrateSaveV2)
  const makeSaveV2 = useRootGameStore((state) => state.makeSaveV2)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const activePanel = useRootGameStore((state) => state.activePanel)
  const activeDialogue = useRootGameStore((state) => state.activeDialogue)
  const activeChapterDialogue = useRootGameStore((state) => state.activeChapterDialogue)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const closeDialogue = useRootGameStore((state) => state.closeDialogue)
  const ready = useRef(false)
  const assetManager = getStoreServices()?.assetManager
  const saveRepository = getStoreServices()?.saveRepository
  const [recoveryMessage, setRecoveryMessage] = useState('')

  useEffect(() => {
    let active = true
    const load = async (): Promise<void> => {
      const save = await saveRepository?.load('auto')
      if (save) {
        if (active) hydrateSaveV2(save)
        return
      }
    }
    load()
      .catch(() => { if (active) setSaveStatus('temporary') })
      .finally(() => { ready.current = true })
    return () => { active = false }
  }, [hydrateSaveV2, saveRepository, setSaveStatus])

  useEffect(() => {
    if (!ready.current || !player || temporaryMode || screen === 'battle' || activeDialogue || activeChapterDialogue) return
    const snapshot = makeSaveV2()
    if (!snapshot) return
    rememberUiRecoverySave(snapshot)
    const timer = window.setTimeout(() => {
      setSaveStatus('saving')
      saveRepository?.save('auto', snapshot).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('temporary'))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [activeChapterDialogue, activeDialogue, makeSaveV2, player, quests, world, skillProgress, inventoryState, equipmentLoadout, equipmentStrengthening, forgingSnapshot, cookingSnapshot, foodBuffSnapshot, postgame, settings, screen, temporaryMode, saveRepository, setSaveStatus])

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
        : currentRegionId
          ? assetManager.releaseGlobal().then(() => assetManager.enterRegion(currentRegionId))
          : assetManager.leaveRegion()
    void lifecycle.catch(() => undefined)
  }, [assetManager, currentRegionId, screen])

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
      else if (activeChapterDialogue) useRootGameStore.getState().closeChapterDialogue()
      else if (activePanel) setPanel(null)
      else toggleBossKey()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeChapterDialogue, activeDialogue, activePanel, closeDialogue, setPanel, settings.keyBindings, toggleBossKey])

  const recoverTemporarySave = () => {
    try {
      const raw = window.sessionStorage.getItem(UI_RECOVERY_KEY)
      if (!raw) { setRecoveryMessage('没有找到可验证的临时档；当前损坏自动档未被覆盖。'); return }
      hydrateSaveV2(parseGameSaveExport(raw))
      setSaveStatus('saved')
      setRecoveryMessage('临时档已恢复，原损坏自动档仍未被覆盖。')
    } catch {
      setRecoveryMessage('临时档校验失败，未覆盖任何有效存档。')
    }
  }

  const retryAutomaticSave = async () => {
    try {
      const save = await saveRepository?.load('auto')
      if (!save) { setRecoveryMessage('没有找到自动档；可以开始新的江湖旅程。'); return }
      hydrateSaveV2(save)
      setSaveStatus('saved')
      setRecoveryMessage('自动档校验通过，已恢复当前旅程。')
    } catch {
      setRecoveryMessage('自动档校验失败；请恢复临时档或清除损坏记录。')
    }
  }

  const exportRecoverySave = () => {
    const save = makeSaveV2()
    if (!save) { setRecoveryMessage('当前没有可导出的有效档案。'); return }
    const href = URL.createObjectURL(new Blob([exportGameSave(save)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'caidao-jianghu-recovery.json'
    link.click()
    URL.revokeObjectURL(href)
    setRecoveryMessage('已导出当前可验证数据；未包含凭据或运行堆栈。')
  }

  const clearInvalidAutomaticSave = async () => {
    await saveRepository?.delete('auto')
    setSaveStatus('idle')
    window.location.reload()
  }

  const recoveryVisible = saveStatus === 'temporary' || saveStatus === 'error'
  return <><AppErrorBoundary makeSave={makeSaveV2} hydrateSave={hydrateSaveV2} setScreen={useRootGameStore.getState().setScreen} saveRepository={saveRepository}><ScreenShell /></AppErrorBoundary>{recoveryVisible && <main className="save-recovery-overlay" data-testid="save-recovery-panel" role="alert"><section className="save-recovery-card"><p className="error-recovery-kicker">江湖账本需要复核</p><h1>没有覆盖你的有效进度</h1><p>自动存档校验失败或本地空间不足。先恢复临时档；清除损坏记录前不会删除其他恢复数据。</p><p className="save-recovery-message" role="status">{recoveryMessage || '请选择一种恢复方式。'}</p><div className="error-recovery-actions"><button type="button" onClick={recoverTemporarySave}>恢复临时档</button><button type="button" onClick={() => { void retryAutomaticSave() }}>重新验证自动档</button><button type="button" onClick={exportRecoverySave}>导出当前数据</button><button type="button" onClick={() => { void clearInvalidAutomaticSave() }}>清除损坏自动档</button></div></section></main>}</>
}

export { App }
