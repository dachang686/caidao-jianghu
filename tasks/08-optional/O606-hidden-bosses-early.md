---
id: O606
title: Optional：制作前四区隐藏 Boss
phase: optional
release_blocking: false
depends_on: [Q410, O601, O602]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

为小愚村、清河县、黑风寨、青云山各制作 1 个隐藏 Boss。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 每个 Boss 有发现线索、专属机制、资产和首次奖励。
- 复用统一战斗引擎。

## 验收标准

- 4 Boss 均可选、可重试且不阻塞主线。
- 标准终局构筑不存在固定必败。

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
