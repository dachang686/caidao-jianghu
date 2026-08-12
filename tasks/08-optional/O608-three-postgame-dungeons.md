---
id: O608
title: Optional：制作三处通关后秘境
phase: optional
release_blocking: false
depends_on: [O606, O607, O603]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

制作三处高难秘境的遭遇链、资源消耗、首通奖励和可重复规则。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 每处具有独立主题与 3–5 场可退出遭遇。
- 失败不清除主线/装备，重复收益回落。

## 验收标准

- 三秘境均可在纯离线状态完成。
- 中断/刷新恢复到一致安全节点。

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

- 新增三处通关后秘境，分别配置 3–5 个遭遇、资源消耗、安全退出点、重复收益衰减、失败保留 Core/装备和离线安全标记。

## 验证记录

- Optional 内容校验、秘境引擎单测、存档恢复/黄金路径 E2E 和 `pnpm build` 均通过。
