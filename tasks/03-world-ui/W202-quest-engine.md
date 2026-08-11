---
id: W202
title: 实现任务状态机与幂等交付
phase: world
depends_on: [F004, F005, F006, F007]
status: pending
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
