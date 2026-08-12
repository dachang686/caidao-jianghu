---
id: C312
title: 第2章 清河县：任务、对白与情境幽默
phase: chapter-content
depends_on: [C311, W202, W203, H221, H222, H224]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

围绕“百晓榜初现”完成第2章 4 个主线任务、2 个手工支线及本章对白和互动幽默。

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

- 新增清河县 `4` 条主线与 `2` 条手工支线，主线依次覆盖榜单初见、账上缺口、河岸路线和证据整理；最后一条只设置 `ch02_boss_ready`、`ch02_autosave_checkpoint`、`ch02_mainline_complete`，不提前写 Boss 结算。
- 新增清河县静态对白图：沈青禾、柳婶、陆掌柜和榜下捕快均有状态化短对白；迷惑分支声明回归节点，最多两步，唯一不可逆交证选项启用二次确认。
- 新增 1 组 SituationCombo 与 1 条四级 InteractionChain；首次发现经验和阶段奖励均使用唯一 grantKey，重复事件/快速重复输入由现有引擎幂等处理。
- 增加清淡/标准/加辣补充文案，现代映射仅 1/7 条，未改变任务条件或奖励逻辑；内容校验脚本开始同时校验 ch01/ch02 的对白、情境、互动和密度数据。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（2 个章节；Node loader 仅输出实验性 warning）。
- `pnpm test -- src/systems/quests src/systems/dialogue src/systems/comedy`：通过，13 个文件、43 个测试。
- `pnpm build`：通过，Vite 转换 176 个模块。

## 边界与风险

- C312 不实现榜下捕快普通敌人、Boss 阶段、装备/采集/锻造系统解锁或下一章；C313 负责消费本章 Boss 前置与自动存档标记。
