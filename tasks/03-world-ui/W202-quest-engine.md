---
id: W202
title: 实现任务状态机与幂等交付
phase: world
depends_on: [F004, F005, F006, F007]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现 locked/available/active/ready/completed 状态、目标进度和奖励交付。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节主线与第 9 节任务校验
- `src/types/quest.ts`
- `src/systems/quests/`
- `src/systems/quests/*.test.ts`

## 实现范围

- 任务条件与目标订阅 DomainEvent，组件不直接计数。
- 主线置顶，普通任务最多 6、程序委托最多 3。
- 交付调用 Effect executor，并记录 reward grantKey。

## 验收标准

- 重复事件、重复交付和乱序加载均幂等。
- 迷惑分支不能让任务永久无可用动作。
- 任务快照可安全序列化。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/quests
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。

## 执行记录

- 基线：仓库只有旧 Demo 的三态任务数组，没有声明式目标、事件订阅、任务上限或 V2 任务快照。
- 实现：新增 `QuestDefinition`、目标事件匹配、locked/available/active/ready/completed 状态机；主线自动置顶，普通任务/程序委托活动上限分别为 6/3；事件先到时进入待处理队列，接取后按事件 ID 幂等重放。
- 奖励：交付统一调用 Effect executor，自动为奖励效果补齐稳定子 grantKey，并在任务快照记录任务级 grantKey；重复事件、重复交付和快照恢复不会重复推进或发奖。
- 校验与订阅：新增任务定义校验、EventBus 订阅/清理、JSON 快照序列化/解析和恢复 API；内容校验接入任务定义校验。
- 验证：`pnpm lint`、`pnpm test -- src/systems/quests`（1 file / 6 tests）、`pnpm content:validate`、`pnpm build` 均通过。
- 风险：当前小愚村内容仍是 F007 的最小章节定义，尚未在本任务提前批量迁移后续章节任务。
