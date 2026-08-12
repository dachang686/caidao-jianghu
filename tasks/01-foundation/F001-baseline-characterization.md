---
id: F001
title: 锁定 Demo 行为基线
phase: foundation
depends_on: []
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

在任何架构迁移前，用可重复测试锁定当前创角、找猫、白大侠战斗、存档和响应式主流程。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 10 节 M1、第 11 节测试矩阵
- `src/game/*.test.ts`
- `e2e/game-flow.spec.ts`

## 实现范围

- 补充现有 store/save 的特征测试，覆盖当前公开动作与关键状态转换。
- 为现有 E2E 稳定补齐语义化选择器或 `data-testid`，只做测试可观测性修改。
- 记录当前测试数量与关键断言，禁止改变游戏数值或文案。

## 验收标准

- 现有 Demo 主线和找猫流程均有回归断言。
- 刷新继续、战败重试、老板键和移动端无横向溢出至少各有一条断言。
- 全部既有测试继续通过。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- 基线测试：`pnpm lint` 通过；`pnpm test` 基线为 2 个测试文件、6 个断言；`pnpm test:e2e` 基线为 8 个场景（桌面/移动双项目）。
- 补充回归：战败后资源恢复与原地重试、移动端无横向溢出；为战败结果和重试按钮补充 `data-testid`。
- 验证结果：F001 修改后 `pnpm lint`、`pnpm test`（7 个断言）、`pnpm test:e2e`（8 个场景）均通过。
