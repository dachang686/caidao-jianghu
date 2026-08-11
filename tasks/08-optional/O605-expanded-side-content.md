---
id: O605
title: Optional：扩展至 36 条支线/委托内容
phase: optional
release_blocking: false
depends_on: [Q410, S244]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

补齐完整目标的支线与手工委托内容，避免程序化模板重复疲劳。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 优先跨区 NPC、门人和结局后一次性故事。
- 同时活跃上限保持不变。

## 验收标准

- 手工支线/委托内容总量达到计划目标。
- 每条均可完成、奖励幂等且无跑腿注水。

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
