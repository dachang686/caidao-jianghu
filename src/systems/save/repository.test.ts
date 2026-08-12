import { describe, expect, it } from 'vitest'
import { createMinimalGameSaveV2 } from './schema'
import { exportGameSave, parseGameSaveExport, SaveImportError } from './import-export'
import { createMemorySaveStorage, SaveRepository } from './repository'

function saveAt(wealth: number) {
  return { ...createMinimalGameSaveV2(), player: { ...createMinimalGameSaveV2().player, wealth } }
}

describe('多档存储与导入导出', () => {
  it('手动档互不污染，列表只返回摘要，覆盖前保留备份', async () => {
    const repository = new SaveRepository(createMemorySaveStorage())
    await repository.save('manual-1', saveAt(10))
    await repository.save('manual-2', saveAt(20))
    expect((await repository.load('manual-1'))?.player.wealth).toBe(10)
    expect((await repository.load('manual-2'))?.player.wealth).toBe(20)
    expect(await repository.listSummaries()).toEqual(expect.arrayContaining([
      expect.objectContaining({ slotId: 'manual-1', level: 1 }),
      expect.objectContaining({ slotId: 'manual-2', level: 1 }),
    ]))

    await repository.save('manual-1', saveAt(99))
    expect((await repository.load('manual-1'))?.player.wealth).toBe(99)
    expect((await repository.load('backup'))?.player.wealth).toBe(10)
  })

  it('损坏 JSON、版本、校验和失败时不覆盖原档', async () => {
    const repository = new SaveRepository(createMemorySaveStorage())
    await repository.save('manual-1', saveAt(42))
    const exported = await repository.exportSlot('manual-1')
    expect(exported).not.toBeNull()
    expect(() => parseGameSaveExport('{bad')).toThrow(SaveImportError)
    expect(() => parseGameSaveExport(exported!.replace('"contentVersion": 1', '"contentVersion": 2'), 1)).toThrow(/内容版本/)
    const tampered = exported!.replace('"wealth": 42', '"wealth": 43')
    expect(() => parseGameSaveExport(tampered)).toThrow(/校验和/)
    await expect(repository.importSlot('manual-1', tampered)).rejects.toThrow()
    expect((await repository.load('manual-1'))?.player.wealth).toBe(42)
  })

  it('导出内容不包含运行时或凭据字段，并可导入其他槽位', async () => {
    const source = saveAt(7)
    const exported = exportGameSave(source)
    expect(exported).not.toContain('apiKey')
    expect(exported).not.toContain('"battle"')
    expect(parseGameSaveExport(exported).player.wealth).toBe(7)
    const repository = new SaveRepository(createMemorySaveStorage())
    await repository.importSlot('auto', exported, 1)
    expect((await repository.load('auto'))?.player.wealth).toBe(7)
  })

  it('配额异常会转成可恢复错误，不伪装成保存成功', async () => {
    const memory = createMemorySaveStorage()
    const storage = {
      ...memory,
      async put(): Promise<void> { throw new DOMException('quota', 'QuotaExceededError') },
    }
    const repository = new SaveRepository(storage)
    await expect(repository.save('manual-1', saveAt(12))).rejects.toMatchObject({ code: 'quota_exceeded' })
  })
})
