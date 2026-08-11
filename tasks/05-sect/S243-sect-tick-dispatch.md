---
id: S243
title: 实现战斗场次 Tick 派遣
phase: sect
depends_on: [S242, F006, G101]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现由有效战斗完成事件推进、最多三队并行的派遣周期。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 5 节 Tick 派遣
- `src/systems/sect/dispatch.ts`
- `src/systems/sect/dispatch.test.ts`

## 实现范围

- 只有符合条件的 battle.completed 推进 tick。
- 任务创建时固定 RNG fork 和预计周期。
- 领取结果幂等，未战斗不会增长。

## 验收标准

- 刷新/改系统时间不能推进。
- 重试、逃跑和模拟预览不重复记战斗。
- 三队上限和门人占用冲突有测试。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/sect
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
