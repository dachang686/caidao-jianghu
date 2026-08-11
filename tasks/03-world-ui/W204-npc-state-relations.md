---
id: W204
title: 实现跨区域 NPC 状态与关系
phase: world
depends_on: [F006, W202, W203]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立 NPC 出现条件、好感/烦躁、已知信息和跨章节延续。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节 NPC 复用策略
- `src/types/npc.ts`
- `src/systems/npcs/`
- `src/content/npcs/`

## 实现范围

- 同一 npcId 跨地点复用，位置与对白由章节状态决定。
- 点击、帮助、欺骗等事件改变有限关系值。
- 关键 NPC 始终保留任务推进动作。

## 验收标准

- 移动区域不复制 NPC 状态。
- 关系上下限和重复事件有测试。
- 存档恢复后 NPC 位置/对白与任务一致。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/npcs
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
