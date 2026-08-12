export interface SaveMigration {
  readonly from: number
  readonly to: number
  readonly migrate: (input: unknown) => unknown
}

export class SaveMigrationError extends Error {
  readonly from: number
  readonly to: number

  constructor(message: string, from: number, to: number) {
    super(message)
    this.name = 'SaveMigrationError'
    this.from = from
    this.to = to
  }
}

export class SaveMigrationRegistry {
  private readonly migrations = new Map<number, SaveMigration>()

  register(migration: SaveMigration): () => void {
    if (!Number.isInteger(migration.from) || !Number.isInteger(migration.to) || migration.to !== migration.from + 1) {
      throw new SaveMigrationError('迁移必须是连续的 n -> n+1 版本。', migration.from, migration.to)
    }
    if (this.migrations.has(migration.from)) {
      throw new SaveMigrationError(`版本 ${migration.from} 已注册迁移。`, migration.from, migration.to)
    }
    this.migrations.set(migration.from, migration)
    return () => {
      if (this.migrations.get(migration.from) === migration) this.migrations.delete(migration.from)
    }
  }

  migrate(input: unknown, from: number, to: number): unknown {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) {
      throw new SaveMigrationError('迁移版本范围无效。', from, to)
    }
    let value = input
    for (let version = from; version < to; version += 1) {
      const migration = this.migrations.get(version)
      if (!migration) throw new SaveMigrationError(`缺少 ${version} -> ${version + 1} 迁移，拒绝猜测补全。`, version, version + 1)
      try {
        value = migration.migrate(value)
      } catch (error) {
        throw new SaveMigrationError(`执行 ${version} -> ${version + 1} 迁移失败：${error instanceof Error ? error.message : '未知错误'}`, version, version + 1)
      }
    }
    return value
  }
}

export const createSaveMigrationRegistry = () => new SaveMigrationRegistry()
