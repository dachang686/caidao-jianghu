import type { ChangeEvent } from 'react'
import { Button } from './game-ui'
import { getStoreServices, useRootGameStore } from '../stores'
import { exportGameSave, parseGameSaveExport } from '../systems/save'
import { SkillTreePanel } from './skills/SkillTreePanel'
import { EquipmentPanel, InventoryPanel } from './inventory/InventoryEquipmentPanel'
import { CodexScreen } from '../screens/CodexScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

export function OverlayPanel() {
  const activePanel = useRootGameStore((state) => state.activePanel)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const player = useRootGameStore((state) => state.player)
  const optionalEnabled = useRootGameStore((state) => state.world.systemUnlocks.postgameContinue)
  const makeSaveV2 = useRootGameStore((state) => state.makeSaveV2)
  const importSaveV2 = useRootGameStore((state) => state.importSaveV2)
  const setSaveStatus = useRootGameStore((state) => state.setSaveStatus)
  if (!activePanel) return null
  const save = makeSaveV2()
  const saveRepository = getStoreServices()?.saveRepository
  const downloadSave = () => {
    if (!save) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([exportGameSave(save)], { type: 'application/json' }))
    link.download = `caidao-jianghu-${player?.name ?? 'save'}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const uploadSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = parseGameSaveExport(await file.text())
      importSaveV2(imported)
      await saveRepository?.save('auto', imported)
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      window.alert(error instanceof Error ? error.message : '导入失败')
    }
  }
  const retireSave = async () => {
    await saveRepository?.delete('auto')
    window.location.reload()
  }
  return <div className="panel-layer" role="dialog" aria-modal="true"><section className="overlay-panel"><button className="dialogue-close" type="button" onClick={() => setPanel(null)} aria-label="关闭面板">×</button>
    {activePanel === 'inventory' && player && <InventoryPanel />}
    {activePanel === 'skills' && player && <SkillTreePanel optionalEnabled={optionalEnabled} onClose={() => setPanel(null)} />}
    {activePanel === 'equipment' && player && <EquipmentPanel />}
    {activePanel === 'codex' && <CodexScreen />}
    {activePanel === 'guide' && <><h2>新手教程</h2><div className="detail-list"><div><b>先点人</b><span>客栈前的老头、白大侠和大黄猫都能互动。</span></div><div><b>再看任务</b><span>完成老头教学后，可挑战白大侠或帮王大娘找猫。</span></div><div><b>最后记账</b><span>关键进度会自动写入浏览器的江湖账本。</span></div></div></>}
    {activePanel === 'settings' && <SettingsScreen footer={<><Button onClick={downloadSave}>导出存档</Button><label className="ink-button">导入存档<input type="file" accept="application/json" onChange={uploadSave} /></label><Button onClick={() => { void retireSave() }}>告老还乡</Button></>} />}
  </section></div>
}
