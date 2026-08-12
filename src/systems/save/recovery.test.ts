import { describe, expect, it } from 'vitest'
import { createMinimalGameSaveV2 } from './schema'
import { createMemorySaveStorage, SaveRepository } from './repository'
import { AutoSaveController } from './autosave'
import { createSaveMigrationRegistry } from './migrations'
import { RecoveryError, SessionRecoveryStore } from './recovery'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}

describe('存档迁移、自动档与临时恢复', () => {
  it('迁移只允许连续版本，缺口和重复注册都会拒绝', () => {
    const registry = createSaveMigrationRegistry()
    registry.register({ from: 2, to: 3, migrate: (input) => ({ ...(input as object), step3: true }) })
    registry.register({ from: 3, to: 4, migrate: (input) => ({ ...(input as object), step4: true }) })
    expect(registry.migrate({}, 2, 4)).toEqual({ step3: true, step4: true })
    expect(() => registry.migrate({}, 2, 5)).toThrow(/缺少 4 -> 5/)
    expect(() => registry.register({ from: 4, to: 6, migrate: (input) => input })).toThrow(/连续/)
  })

  it('只有区域进入、战斗胜利、任务交付会写自动档', async () => {
    const repository = new SaveRepository(createMemorySaveStorage())
    const autosave = new AutoSaveController(repository)
    const save = createMinimalGameSaveV2()
    expect((await autosave.request('battle_started', save)).saved).toBe(false)
    expect((await repository.load('auto'))).toBeNull()
    expect((await autosave.request('dialogue_choice', save)).saved).toBe(false)
    expect((await autosave.request('battle_won', save)).saved).toBe(true)
    expect(await repository.load('auto')).not.toBeNull()
  })

  it('临时档 30 秒后过期，损坏时不会覆盖有效自动档', async () => {
    let now = 1000
    const storage = memoryStorage()
    const recovery = new SessionRecoveryStore(storage, () => now)
    const save = createMinimalGameSaveV2()
    recovery.save(save)
    expect(recovery.recover()).toMatchObject({ status: 'available', save })
    now += 30_001
    expect(recovery.recover()).toEqual({ status: 'expired', save: null })

    recovery.save(save)
    storage.values.set('caidao-jianghu:session-recovery', '{broken')
    expect(recovery.recover()).toEqual({ status: 'corrupt', save: null })
    expect(() => recovery.restore()).not.toThrow()
    recovery.save(save)
    storage.values.set('caidao-jianghu:session-recovery', '{broken')
    expect(() => recovery.restore()).toThrow(RecoveryError)

    const repository = new SaveRepository(createMemorySaveStorage())
    await repository.save('auto', save)
    expect((await repository.load('auto'))?.schemaVersion).toBe(2)
  })
})
