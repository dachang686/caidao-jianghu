import { describe, expect, it } from 'vitest'
import { parseImportedSave } from './save'
import { useGameStore } from './store'

describe('江湖账本', () => {
  it('能导出并重新校验当前存档', () => {
    useGameStore.getState().startNewGame('存档侠', 'clever')
    const save = useGameStore.getState().makeSave()
    expect(save?.version).toBe(1)
    expect(save).not.toBeNull()
    expect(parseImportedSave(JSON.stringify(save))).toMatchObject({ version: 1, player: { name: '存档侠' } })
  })

  it('拒绝损坏或缺少版本号的存档', () => {
    expect(() => parseImportedSave('{"player":{}}')).toThrow('不能导入')
  })
})
