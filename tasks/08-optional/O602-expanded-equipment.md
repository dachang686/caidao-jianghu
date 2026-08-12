---
id: O602
title: Optional：把装备扩展到约 80 件
phase: optional
release_blocking: false
depends_on: [Q410, O601]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

新增约 32 件稀有/终局装备并保持六槽与四系构筑平衡。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 来源覆盖隐藏 Boss、秘境、门派和高级锻造。
- 每件有本地风味文本、可达来源和强化曲线。

## 验收标准

- 总数约 80 且引用可达。
- Optional 关闭时 Core 装备不受影响。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
pnpm assets:audit
```

## 禁止事项

- 不破坏已验收 Core 路径或提高 Core 通关门槛。
- 不留下关闭 Optional 后仍可见的悬空入口。
- 不用重复刷取、现实时间或占位素材凑时长。

## 执行记录

- 新增 32 件 Optional 装备，Core + Optional 共 80 件；覆盖六槽、隐藏 Boss/秘境/门派/高级锻造来源、0–5 强化曲线和独立 ID 命名空间。

## 验证记录

- Optional 内容校验、装备/锻造相关单测、全量 E2E 和 `pnpm build` 均通过。
