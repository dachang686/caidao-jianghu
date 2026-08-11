---
id: H222
title: 实现递进互动反应链
phase: humor
depends_on: [F014, W204, W205]
status: pending
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
