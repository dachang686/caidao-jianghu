import type { ChangeEvent } from 'react'
import { Button } from './game-ui'
import { useGameStore } from '../stores'
import { deleteSave, exportSave, parseImportedSave, persistSave } from '../game/save'
import { SkillTreePanel } from './skills/SkillTreePanel'
import { EquipmentPanel, InventoryPanel } from './inventory/InventoryEquipmentPanel'
import { CodexScreen } from '../screens/CodexScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

export function OverlayPanel() {
  const activePanel = useGameStore((state) => state.activePanel)
  const setPanel = useGameStore((state) => state.setPanel)
  const player = useGameStore((state) => state.player)
  const optionalEnabled = useGameStore((state) => state.world.systemUnlocks.postgameContinue)
  const makeSave = useGameStore((state) => state.makeSave)
  const importSave = useGameStore((state) => state.importSave)
  const setSaveStatus = useGameStore((state) => state.setSaveStatus)
  if (!activePanel) return null
  const save = makeSave()
  const downloadSave = () => {
    if (!save) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([exportSave(save)], { type: 'application/json' }))
    link.download = `caidao-jianghu-${save.player.name}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const uploadSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = parseImportedSave(await file.text())
      importSave(imported)
      await persistSave(imported)
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      window.alert(error instanceof Error ? error.message : '导入失败')
    }
  }
  return <div className="panel-layer" role="dialog" aria-modal="true"><section className="overlay-panel"><button className="dialogue-close" type="button" onClick={() => setPanel(null)} aria-label="关闭面板">×</button>
    {activePanel === 'inventory' && player && <InventoryPanel />}
    {activePanel === 'skills' && player && <SkillTreePanel playerLevel={player.level} optionalEnabled={optionalEnabled} onClose={() => setPanel(null)} />}
    {activePanel === 'equipment' && player && <EquipmentPanel />}
    {activePanel === 'codex' && <CodexScreen />}
    {activePanel === 'guide' && <><h2>新手教程</h2><div className="detail-list"><div><b>先点人</b><span>客栈前的老头、白大侠和大黄猫都能互动。</span></div><div><b>再看任务</b><span>完成老头教学后，可挑战白大侠或帮王大娘找猫。</span></div><div><b>最后记账</b><span>关键进度会自动写入浏览器的江湖账本。</span></div></div></>}
    {activePanel === 'settings' && <SettingsScreen footer={<><Button onClick={downloadSave}>导出存档</Button><label className="ink-button">导入存档<input type="file" accept="application/json" onChange={uploadSave} /></label><Button onClick={() => { deleteSave(); window.location.reload() }}>告老还乡</Button></>} />}
  </section></div>
}
