---
id: O607
title: Optional：制作后四区隐藏 Boss
phase: optional
release_blocking: false
depends_on: [Q410, O601, O602]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

为西域驿路、东海镇、京城、武林大会各制作 1 个隐藏 Boss。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Optional、第 5 节通关后内容

## 实现范围

- 机制与前四 Boss 不重复，奖励服务后期构筑。
- 包含专属幽默演出和减少动态替代。

## 验收标准

- 隐藏 Boss 总数达到 8。
- 全部发现线索可达且无像素狩猎。

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

- 配置第 5–8 章各 1 个 Optional 隐藏 Boss，共 4 个；接入可读意图、两阶段、演出 cue、线索和首胜奖励，八章合计 8 个且每章不重复。

## 验证记录

- Optional 内容校验、隐藏 Boss/战斗单测、混沌路径 E2E 和 `pnpm build` 均通过。
