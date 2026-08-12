import { describe, expect, it } from 'vitest'
import { exportGameSave, parseGameSaveExport } from '../systems/save'
import { useRootGameStore } from '../stores'

describe('江湖账本', () => {
  it('能导出并重新校验当前存档', () => {
    useRootGameStore.getState().startNewGame('存档侠', 'clever')
    const save = useRootGameStore.getState().makeSaveV2()
    expect(save?.schemaVersion).toBe(2)
    expect(save).not.toBeNull()
    expect(parseGameSaveExport(exportGameSave(save!))).toMatchObject({ schemaVersion: 2, m1: { player: { name: '存档侠' } } })
  })

  it('拒绝损坏或缺少版本号的存档', () => {
    expect(() => parseGameSaveExport('{"player":{}}')).toThrow('导入结构不完整')
  })
})
