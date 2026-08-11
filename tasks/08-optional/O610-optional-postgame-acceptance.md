---
id: O610
title: Optional：验收 5–8 小时通关后内容
phase: optional
release_blocking: false
depends_on: [O601, O602, O603, O604, O605, O606, O607, O608, O609]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

验证门派、委托、秘境和隐藏 Boss 构成 5–8 小时可选循环。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 记录真实通关后游玩时长、重复模板频率和收益曲线。
- 运行全量 Core + Optional 校验与离线发布检查。

## 验收标准

- 实际记录落在 5–8 小时目标或给出基于证据的调整。
- Core 关闭 Optional 开关时仍完整，开启后无悬空入口。

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
