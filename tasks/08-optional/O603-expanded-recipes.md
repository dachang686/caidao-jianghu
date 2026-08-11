---
id: O603
title: Optional：补齐 24 锻造与 16 菜谱
phase: optional
release_blocking: false
depends_on: [Q410, O602]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

把配方从 Core 12/8 扩展到目标 24 个锻造与 16 个菜谱。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 高级配方服务 Optional 装备、秘境和后期构筑。
- 材料来源可达，不引入真实等待。

## 验收标准

- 目标数量达到 24/16。
- 无材料循环、无限套利或隐藏致死负面。

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
