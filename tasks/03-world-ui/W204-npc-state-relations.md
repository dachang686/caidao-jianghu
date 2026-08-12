---
id: W204
title: 实现跨区域 NPC 状态与关系
phase: world
depends_on: [F006, W202, W203]
status: done
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

## 实现记录

- 新增 `src/types/npc.ts` 与 `src/systems/npcs/engine.ts`：以唯一 npcId 保存关系、已知信息和已处理事件；位置、对白和任务动作由章节/地点/条件出现规则解析。
- 新增 `src/content/npcs/ch01.ts`，将小愚村 NPC 内容接入出现规则；关键 NPC 保留任务推进动作。
- 互动事件通过 EventBus 接入，点击、帮助、欺骗使用有限关系值并按事件 ID 幂等；关系上下限统一在领域层截断。
- `GameSaveV2` 与 Zod schema 新增 NPC 快照，旧存档缺少字段时使用空状态默认值；恢复后继续由当前章节/地点和任务状态解析 NPC 位置、对白与任务动作。
- 内容 validator 已接入 NPC 定义、出现规则和任务/对白引用校验。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/npcs`：通过（1 个文件，3 个测试）。
- `pnpm content:validate`：通过（1 个章节；Node 仅输出实验性 loader warning）。
- `pnpm build`：通过。
- `pnpm test -- src/systems/save/schema.test.ts`：通过（含 NPC 存档恢复兼容性测试）。

## 风险

- 当前仓库只登记小愚村章节，跨章节规则由通用出现定义支持，后续章节内容再补充实际跨区 NPC 规则。
