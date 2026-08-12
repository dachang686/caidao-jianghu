---
id: C322
title: 第3章 黑风寨：任务、对白与情境幽默
phase: chapter-content
depends_on: [C321, W202, W203, H221, H222, H224]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

围绕“山寨也要冲榜”完成第3章 4 个主线任务、2 个手工支线及本章对白和互动幽默。

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

- 已新增第 3 章严格 4 条主线与 2 条手工支线，主线依次通过 NPC 互动、账榜热点、灶房路线和瞭望台传令推进；最后一条只写入 `ch03_boss_ready`、`ch03_autosave_checkpoint` 与 `ch03_mainline_complete` 前置状态。
- 已为曹掌柜、胡大勺、小顺接入本地静态对白、任务引用和状态化互动；对白图的迷惑分支均在两步内回到主线，空白账页递交配置了严肃二次确认。
- 已新增山椒采集情境组合与四级灶房互动链；任务、首次情境奖励和互动阶段奖励均使用唯一 `grantKey`，重复交付/事件由领域引擎幂等处理。
- 已加入清淡/标准/加辣三档补充文案，现代映射为 1/7，低于 40%；本章幽默不改变任务效果，也不伪造系统故障或结算。
- 第 3 章的局部 situation/interaction coverage 已建立；rule 与 Boss presentation coverage 留给 C323 的战斗集成，当前未用占位 cue 注册到全章四层门禁。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过，3 个章节；Node loader 输出 ExperimentalWarning，不影响退出码。
- `pnpm test -- src/systems/quests src/systems/dialogue src/systems/comedy --reporter=dot`：通过，16 个测试文件、50/50 测试通过。
- `pnpm build`：通过，Vite 转换 191 个模块，第 3 章动态 chunk 成功生成。

## 边界

- C322 不实现下一章对白或黑风寨主结算；C323 负责普通敌人/Boss、rule/presentation coverage、战斗奖励和章节 E2E。
