---
id: C332
title: 第4章 青云山：任务、对白与情境幽默
phase: chapter-content
depends_on: [C331, W202, W203, H221, H222, H224]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

围绕“名门的门面工程”完成第4章 4 个主线任务、2 个手工支线及本章对白和互动幽默。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节剧情、第 6 节四层诙谐设计
- 本章场景任务与上一章结束状态

## 实现范围

- 主线严格为 4 个、支线为 2 个；共同推进《百味刀谱》与百晓榜主线。
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

- 新增青云山严格 4 条主线与 2 条手工支线；主线依次登记山门、检查规训、确认药圃路线和核对听云台，末条设置 `ch04_boss_ready`、`ch04_autosave_checkpoint`、`ch04_mainline_complete`。
- 为林小门、苏青禾、钟小响接入状态化静态对白；每个 NPC 含迷惑分支及返回路径，章节总计 6 个迷惑分支，掌门核验选项使用严肃二次确认。
- 新增青云山情境组合与四级铜钟互动链，首次奖励使用唯一 grantKey 且重复事件幂等；主线不依赖采集材料墙。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（4 chapters；仅 Node experimental loader warning）。
- `pnpm test -- src/systems/quests/ch04-content.test.ts src/systems/dialogue/ch04-content.test.ts src/systems/comedy/ch04-content.test.ts --reporter=dot`：3 个文件、7 个测试通过。
- `pnpm build`：通过，207 modules transformed。
