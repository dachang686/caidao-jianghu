---
id: O601
title: Optional：补齐 8 主动与 4 被动武学
phase: optional
release_blocking: false
depends_on: [Q410]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

把武学从 Core 16 主动/8 被动扩展到目标 24 主动/12 被动。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 四系各补 2 主动、1 被动，填补终局构筑而非数值换皮。
- 加入完整预览、内容校验、模拟器和技能树 UI。

## 验收标准

- 目标数量达到 24/12。
- 不存在新无限循环或唯一最优技能。

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
