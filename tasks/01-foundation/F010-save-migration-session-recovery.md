---
id: F010
title: 实现增量迁移与崩溃恢复
phase: foundation
depends_on: [F009]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现连续 SaveMigration 注册、自动档触发规则与 sessionStorage 临时恢复。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节“GameSaveV2”
- `src/systems/save/migrations.ts`
- `src/systems/save/recovery.ts`
- `src/systems/save/*.test.ts`

## 实现范围

- 迁移只允许 n 到 n+1 连续执行；不实现 Demo V1 迁移。
- 仅区域进入、战斗胜利、任务交付触发自动档；战斗/对话中途禁止。
- 30 秒临时档只保存一致快照，并提供清理和恢复 API。

## 验收标准

- 跨缺失迁移版本会拒绝而非猜测补全。
- 关键触发点自动档测试通过，禁止点不会写档。
- 损坏临时档不会覆盖有效自动档。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/save
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- 新增连续 `SaveMigrationRegistry`，缺失版本拒绝猜测补全；新增自动档控制器，仅允许区域进入、战斗胜利、任务交付触发。
- 新增 30 秒 sessionStorage 临时恢复 API，临时档同样经过 V2 schema/checksum 校验，损坏或过期不会触碰有效自动档。
- 验证结果：`pnpm lint`、`pnpm test -- src/systems/save`、`pnpm build` 均通过。
