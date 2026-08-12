---
id: S243
title: 实现战斗场次 Tick 派遣
phase: sect
depends_on: [S242, F006, G101]
status: done
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

## 实现记录

- 新增 `src/types/dispatch.ts` 与 `src/systems/sect/dispatch.ts`：基于有效 `battle.completed` 事件推进派遣场次 Tick，不读取现实时间、刷新或页面生命周期。
- 创建队伍时固定 `DeterministicRng.fork` 快照和预计周期；同时最多 3 队，活动门人不能重复占用。
- 逃跑、重试、模拟/预览事件和重复事件均不会推进；EventBus 订阅只处理有效战斗完成事件。
- 完成领取结果使用保存的任务 RNG 生成并写入任务状态，重复领取返回同一结果；提供快照 JSON 化/恢复接口。
- 新增派遣测试，覆盖有效事件筛选、Tick、固定 RNG、三队上限、门人冲突、EventBus 和领取幂等。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/sect`：通过（3 个文件，9 个测试）。
- `pnpm build`：通过。

## 风险

- 派遣奖励内容与委托模板由后续 S244 接入；本任务只结算周期、固定结果种子和领取幂等。
