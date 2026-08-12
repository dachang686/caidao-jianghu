---
id: H222
title: 实现递进互动反应链
phase: humor
depends_on: [F014, W204, W205]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现 3–5 级 InteractionChainDefinition、阈值计数和稳定重复反馈。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节“第三层：互动幽默”
- `src/systems/comedy/interactions.ts`
- `src/systems/comedy/interactions.test.ts`

## 实现范围

- 支持 NPC 连点、砍价、交错物品、逃跑等领域事件。
- 达到最后阶段后只返回 stableRepeatCueId。
- progressActionId 始终保留主线入口。

## 验收标准

- 计数可存档且跨区域不丢。
- 快速重复点击不会越级或重复奖励。
- 关键 NPC 链不能覆盖推进动作。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/comedy
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。

## 执行记录

- 基线：`InteractionChainDefinition` 已在 `src/types/comedy.ts` 预留，但互动链引擎与测试文件均不存在；NPC、探索热点和 Effect 请求领域已可提供稳定事件入口。
- 实现：新增 `InteractionChainEngine`，校验 3–5 级严格递增阈值，按链 ID保存计数、阶段领取键、事件/动作幂等键，并支持 NPC 互动、砍价、交错物品、逃跑等由事件类型驱动的链路。
- 重复与主线：跨入新阶段只返回一次阶段 Effect 请求；达到最后阶段后的后续输入只返回 `stableRepeatCueId`。`progressActionId` 作为只读主线入口随匹配结果保留，不被互动链覆盖。
- 存档：提供快照恢复、JSON 序列化/解析和跨区域计数延续；引擎只返回 Effect 请求，不直接修改 NPC、任务或经营状态。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/comedy` ✅（3 个测试文件、11 个测试）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm build` ✅

## 风险与边界

- 互动链目前是通用领域引擎，具体章节的 10 条 Core 链和界面触发接入由后续内容/UI 任务负责；本任务未提前生产后续章节数量。
