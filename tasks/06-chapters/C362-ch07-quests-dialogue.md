---
id: C362
title: 第7章 京城：任务、对白与情境幽默
phase: chapter-content
depends_on: [C361, W202, W203, H221, H222, H224]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

围绕“百晓榜幕后交易”完成第7章 3 个主线任务、2 个手工支线及本章对白和互动幽默。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节剧情、第 6 节四层诙谐设计
- 本章场景任务与上一章结束状态

## 实现范围

- 主线严格为 3 个、支线为 2 个；共同推进《百味刀谱》与百晓榜主线。
- 至少 3 名 NPC 获得状态化短对话；跨区域角色沿用同一 npcId。
- 制作至少 1 组自然 SituationCombo 和 1 条 3–5 级 InteractionChain；首次奖励必须幂等。
- 每个迷惑分支最多绕行两个节点回到可推进路径；不可逆选择使用严肃二次确认。
- 为清淡/标准/加辣提供补充文案，现代映射不超过本章幽默约 40%，不改变任务效果。

## 验收标准

- 所有主线节点静态可达，任一选项组合都不会锁死章节。
- 任务奖励 grantKey 唯一，重复交付不重复发放。
- 本章至少一个纯江湖内部笑点，不依赖短期热点。
- 完成最后主线后产生明确 Boss 前置状态和自动存档点。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/quests src/systems/dialogue src/systems/comedy
pnpm build
```

## 禁止事项

- 不用刷怪、等待或材料墙填充主线时长。
- 不让 AI/LocalTextProvider 生成任务逻辑或 Effect。
- 不写下一章对白或 Boss 结算。

## 执行记录

- 已完成第7章3个主线任务、2个支线任务、4名 NPC 状态化对白、迷惑分支确认、情境组合和4级互动链。
- 已加入幂等奖励、Boss 前置状态、自动存档点及清淡/标准/加辣文案覆盖。

## 验证记录

- `pnpm lint` 通过。
- `pnpm content:validate` 通过（对白图、任务可达性、幽默四层覆盖）。
- 第7章任务数量与 grantKey 唯一性通过内容校验。
- `pnpm build` 通过（282 modules transformed）。
