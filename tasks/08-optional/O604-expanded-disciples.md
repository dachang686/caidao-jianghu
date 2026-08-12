---
id: O604
title: Optional：补齐门人 7–12
phase: optional
release_blocking: false
depends_on: [Q410, S246]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

新增 6 名差异化门人、招募事件和派遣性格组合。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 每人 1–2 性格与专属短剧情。
- 补充经营方向但不进入主角战斗。

## 验收标准

- 门人总数 12。
- 无纯数值换皮，派遣后果可预览。

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

- 补齐门人 7–12 共 6 名 Optional 门人，包含特质、派遣事件、对话和离线安全收益；条目使用独立 ID 并通过门人领域注册。

## 验证记录

- Optional 内容校验、门人/派遣相关单测、全量 E2E 和 `pnpm build` 均通过。
