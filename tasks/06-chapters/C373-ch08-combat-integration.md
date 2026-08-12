---
id: C373
title: 第8章 武林大会：敌人、百晓榜主 与章节集成
phase: chapter-content
depends_on: [C372, G105, G107, G115, G119, H223, H225, W212]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

完成第8章至少 2 类普通敌人、章节 Boss“百晓榜主”、系统解锁“四结局判定与通关后继续”和章节级集成测试。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗、第 6 节规则/演出幽默、第 10 节里程碑
- 本章场景、任务和现有战斗模板

## 实现范围

- 普通敌人复用行为模板但必须有可辨认招式组和诚实意图。
- 百晓榜主 具有明确阶段、可读意图和最多一个专属反套路规则；失败可原地重试。
- 本章引入或自然使用至少 1 个规则幽默模块，并配置 1 个 Boss 专属开场或败北 PresentationCue。
- Boss 胜利后原子交付奖励、解锁“四结局判定与通关后继续”、写自动档并开放下一章/结局。
- 新增章节 E2E：从章首快照完成关键任务、Boss、存档与返回场景；不重跑此前全部剧情。

## 验收标准

- 标准难度同级合理构筑不存在固定必败，批量模拟无超长回合异常。
- Boss 阶段只转换一次，演出跳过/静音/减少动态不改变结算。
- 本章满足 rule/situation/interaction/presentation 四层覆盖。
- 章节快照、内容校验、桌面与手机关键路径全部通过。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不为 Boss 创建独立平行战斗引擎。
- 不用隐藏随机即死、关键物品损失或永久减益制造笑点。
- 不提前实现下一章或 Optional 隐藏 Boss。

## 执行记录

- 已完成第8章2类普通敌人、百晓榜主双阶段 Boss、规则/情境/互动/演出四层覆盖、奖励结算、系统解锁和章节 E2E。
- 已接入存档、下一章解锁、Boss 重试、战斗 UI 与章节模拟器。

## 验证记录

- `pnpm lint` 通过。
- `pnpm content:validate` 通过。
- `pnpm test -- --reporter=dot` 通过（74 files / 227 tests）。
- `pnpm test:e2e -- e2e/ch05-08-flow.spec.ts --workers=1 --retries=0 --reporter=list` 通过（8 tests）。
- `pnpm simulate:battles -- --ch08-ranking-master --start=1 --end=100` 通过：93胜、7负、0超时、最大13回合、issues为空、阶段最多转换1次。
- `pnpm build` 通过（282 modules transformed）。
