---
id: C302
title: 第1章 小愚村：任务、对白与情境幽默
phase: chapter-content
depends_on: [C301, W202, W203, H221, H222, H224]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

围绕“菜刀入江湖”完成第1章 3 个主线任务、2 个手工支线及本章对白和互动幽默。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节剧情、第 6 节四层诙谐设计
- 本章场景任务与上一章结束状态

## 实现范围

- 主线严格为 3 个、支线为 2 个；共同推进《百味刀谱》与百晓榜主线。
- 至少 3 名 NPC 获得状态化短对话；跨区域角色沿用同一 npcId。
- 制作至少 1 组自然 SituationCombo 和 2 条 3–5 级 InteractionChain；首次奖励必须幂等。
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

- 将第 1 章内容固定为 3 条主线（`first-steps`、`manual-clue`、`challenge-bai`）和 2 条支线（`find-cat`、`kitchen-supply`）；主线依次消费 NPC 互动、刀谱线索确认和 `battle.won` 事件，支线消费找猫互动与止血草采集，不把支线条件放进主线链。
- 新增小愚村对白图，覆盖老头、王大娘、大黄的猫和白大侠四个稳定 NPC ID；迷惑分支均声明返回节点且不超过两跳，白大侠挑战为严肃二次确认并只写入确认标记，不由对白直接结算战斗。
- 新增 1 组猫与采集点的自然 `SituationCombo`、2 条 3–4 级 `InteractionChain`，首次发现/阶段奖励分别使用 grantKey；新增清淡、标准、加辣本地补充文案，任务逻辑不读取文案或 LocalTextProvider。
- 最后一条主线交付时写入 `ch01_boss_ready`、`ch01_autosave_checkpoint` 和 `ch01_mainline_complete`，为 C303 的 Boss 与章节存档集成提供明确前置状态。
- `content:validate` 额外校验本章对白图、情境组合、互动链和三档补充文案，避免只校验通用章节壳。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（Node `--experimental-loader` 仅输出实验性警告）。
- `pnpm test -- src/systems/quests src/systems/dialogue src/systems/comedy`：通过，9 个文件、33 个测试。
- `pnpm build`：通过，Vite 产出 153 个模块。

## 风险与边界

- C302 只声明第 1 章任务、对白和幽默内容，并通过领域事件/Effect 契约提供白大侠前置；白大侠敌人、实际战斗胜负、奖励原子交付、下一章解锁和章节级 E2E 由 C303 完成。
