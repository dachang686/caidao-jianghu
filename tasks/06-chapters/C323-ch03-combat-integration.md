---
id: C323
title: 第3章 黑风寨：敌人、黑风寨主 与章节集成
phase: chapter-content
depends_on: [C322, G105, G107, G115, G119, H223, H225, G108, G114, G116, G118]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

完成第3章至少 2 类普通敌人、章节 Boss“黑风寨主”、系统解锁“技能树与烹饪”和章节级集成测试。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗、第 6 节规则/演出幽默、第 10 节里程碑
- 本章场景、任务和现有战斗模板

## 实现范围

- 普通敌人复用行为模板但必须有可辨认招式组和诚实意图。
- 黑风寨主 具有明确阶段、可读意图和最多一个专属反套路规则；失败可原地重试。
- 本章引入或自然使用至少 1 个规则幽默模块，并配置 1 个 Boss 专属开场或败北 PresentationCue。
- Boss 胜利后原子交付奖励、解锁“技能树与烹饪”、写自动档并开放下一章/结局。
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

- 新增黑风寨两类普通敌人「山寨巡哨」「抢锅客」与 Boss「黑风寨主」，复用统一敌人 AI/回合引擎；Boss 配置两阶段、诚实意图、一次「空旗反卷」规则和败北 PresentationCue。
- 新增黑风寨主胜利原子结算：奖励黑风寨令、经验与银两，幂等写入自动档，解锁技能树与烹饪并开放后续章节/结局资格；场景、战斗 UI、失败重试和刷新恢复已接入。
- 新增黑风寨章节快照 E2E，覆盖桌面与手机视口；补齐 rule/situation/interaction/presentation 四层幽默覆盖、敌人内容和结算单测；新增黑风寨本地 WebP 背景与角色素材。

## 验证记录

- 2026-08-12：黑风寨声明式任务、热点、对白、两类普通敌人和 Boss 均由同一章节运行时驱动；`e2e/ch03-flow.spec.ts` 桌面/手机关键路径通过。
- `pnpm lint`：通过。
- `pnpm content:validate`：通过（3 chapters；仅 Node experimental loader warning）。
- `pnpm test -- --reporter=dot`：67 个测试文件、210 个测试通过。
- `pnpm test:e2e -- --workers=1 --retries=0 --reporter=list`：25 通过、1 个既有移动端视口用例跳过；C323 桌面/手机快照均通过。
- `pnpm build`：通过，199 modules transformed。
- `pnpm simulate:battles -- --ch03-blackwind-leader --start=1 --end=100`：100 局，78 胜、22 负、0 超时、最大 13 回合、无检查问题；每局 Boss 阶段最多转换一次。
