import { Component, type ErrorInfo, type ReactNode } from 'react'
import { exportGameSave, parseGameSaveExport } from '../../systems/save'
import type { SaveRepository } from '../../systems/save'
import type { GameSaveV2 } from '../../types/save'
import type { ScreenId } from '../../game/types'

export const UI_RECOVERY_KEY = 'caidao-jianghu:ui-recovery-v2'

export function rememberUiRecoverySave(save: GameSaveV2 | null): void {
  if (!save) return
  try { window.sessionStorage.setItem(UI_RECOVERY_KEY, exportGameSave(save)) } catch { /* 临时存储不可用时仍保留当前错误面板。 */ }
}

interface AppErrorBoundaryProps {
  readonly children: ReactNode
  readonly makeSave: () => GameSaveV2 | null
  readonly hydrateSave: (save: GameSaveV2) => void
  readonly setScreen: (screen: ScreenId) => void
  readonly saveRepository?: SaveRepository
}

interface AppErrorBoundaryState {
  readonly error: Error | null
  readonly errorCode: string | null
  readonly message: string
}

function errorCode(error: Error): string {
  const seed = `${error.name}:${error.message}`
  let hash = 2166136261
  for (const character of seed) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return `ERR-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null, errorCode: null, message: '' }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error, errorCode: errorCode(error), message: '' }
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    rememberUiRecoverySave(this.props.makeSave())
    void error
  }

  private clearError = (): void => this.setState({ error: null, errorCode: null, message: '' })

  private recoverAuto = async (): Promise<void> => {
    try {
      const save = await this.props.saveRepository?.load('auto')
      if (!save) { this.setState({ message: '没有找到可验证的自动档；当前备份未被清除。' }); return }
      this.props.hydrateSave(save)
      this.clearError()
    } catch {
      this.setState({ message: '自动档校验失败；当前备份未被清除。' })
    }
  }

  private recoverTemporary = (): void => {
    try {
      const raw = window.sessionStorage.getItem(UI_RECOVERY_KEY)
      if (!raw) { this.setState({ message: '没有找到可验证的临时档；当前备份未被清除。' }); return }
      const save = parseGameSaveExport(raw)
      this.props.hydrateSave(save)
      this.clearError()
    } catch {
      this.setState({ message: '临时档已损坏，未覆盖任何有效存档。' })
    }
  }

  private exportCurrent = (): void => {
    const save = this.props.makeSave()
    if (!save) { this.setState({ message: '当前没有可导出的有效档案。' }); return }
    const href = URL.createObjectURL(new Blob([exportGameSave(save)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'caidao-jianghu-recovery.json'
    link.click()
    URL.revokeObjectURL(href)
    this.setState({ message: '已导出当前可验证数据；未包含凭据或运行堆栈。' })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return <main className="error-recovery-screen" data-testid="error-recovery-panel" role="alert"><section className="error-recovery-card"><p className="error-recovery-kicker">江湖账本暂停了一下</p><h1>页面没有白屏，正在等你选恢复方式</h1><p>普通玩家不会看到运行堆栈。错误编号：<code>{this.state.errorCode}</code></p><p className="error-recovery-message" role="status">{this.state.message || '先尝试临时档；如果校验失败，再回退自动档。'}</p><div className="error-recovery-actions"><button type="button" onClick={this.recoverTemporary}>恢复临时档</button><button type="button" onClick={this.recoverAuto}>恢复自动档</button><button type="button" onClick={this.exportCurrent}>导出当前数据</button><button type="button" onClick={() => this.props.setScreen('menu')}>返回主菜单</button><button type="button" onClick={this.clearError}>重试页面</button></div></section></main>
  }
}
