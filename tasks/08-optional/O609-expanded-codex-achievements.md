---
id: O609
title: Optional：完善图鉴、成就与稀有称号
phase: optional
release_blocking: false
depends_on: [O604, O605, O608]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

补齐所有 Optional NPC、敌人、装备、技能、食谱和隐藏目标的收集展示。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 复用 unlockable 框架，不建立第二套条件系统。
- 隐藏项只给公平线索，不泄露完整答案。

## 验收标准

- 所有 Optional 内容都有图鉴归属。
- 重复解锁不重复奖励。

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

- 新增 12 条 Optional 图鉴/成就/稀有称号条目，声明线索、描述、事件规则和独立命名空间，并合并到 `ALL_UNLOCKABLES`、商店/图鉴注册与内容校验。

## 验证记录

- Optional 校验、14 项定向 Optional/存档测试、全量单测连续 3 次和 `pnpm build` 均通过。
