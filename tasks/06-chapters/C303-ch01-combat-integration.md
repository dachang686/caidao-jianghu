---
id: C303
title: 第1章 小愚村：敌人、白大侠 与章节集成
phase: chapter-content
depends_on: [C302, G105, G107, G115, G119, H223, H225, G109, G117]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

完成第1章至少 2 类普通敌人、章节 Boss“白大侠”、系统解锁“对话、基础战斗与背包”和章节级集成测试。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗、第 6 节规则/演出幽默、第 10 节里程碑
- 本章场景、任务和现有战斗模板

## 实现范围

- 普通敌人复用行为模板但必须有可辨认招式组和诚实意图。
- 白大侠 具有明确阶段、可读意图和最多一个专属反套路规则；失败可原地重试。
- 本章引入或自然使用至少 1 个规则幽默模块，并配置 1 个 Boss 专属开场或败北 PresentationCue。
- Boss 胜利后原子交付奖励、解锁“对话、基础战斗与背包”、写自动档并开放下一章/结局。
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

- 新增 `src/content/enemies/ch01.ts`，配置河边醉汉、后厨扒手两类普通敌人和白大侠；普通敌人复用模板化 AI，招式组与诚实意图均有明确说明。
- 白大侠配置双阶段、单次阶段转换、二阶段最高 20% 虚实欺骗和一个可读的「无敌风火轮」专属规则；专属败北节拍控制在 980ms，并接入 Battle Screen，跳过/静态演出不改变结算。
- 新增章节敌人内容校验与失败夹具，检查普通敌人数量、招式引用、Boss 阶段、20% 欺骗上限、专属规则数量和演出 cue 引用字段。
- 新增 `settleCh01BossVictory` 原子胜利事务：幂等发放经验、银两、生锈菜刀和称号，完成任务，设置对话/基础战斗/背包解锁、下一章/结局门槛和自动档检查点；现有 App 存档副作用在状态变更后写入账本。
- 新增第 1 章标准构筑固定 RNG 批量模拟入口 `pnpm simulate:battles -- --ch01-bai`，并补充桌面/手机章节战斗返回场景 E2E。

## 验证结果

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（1 chapter）；Node loader 仅输出 ExperimentalWarning。
- `pnpm test`：通过，54 个文件、178 个测试。
- `pnpm test:e2e -- e2e/game-flow.spec.ts --workers=1 --retries=0 --reporter=list`：通过，21 passed、1 skipped（项目配置跳过移动端五档矩阵重复执行）。
- `pnpm simulate:battles -- --ch01-bai --start=1 --end=100`：标准难度 100 场胜率 89%，最长 13 回合，破防窗口存在，Boss 阶段转换均不超过 1 次，无超时。
- `pnpm build`：通过，Vite 转换 168 个模块。

## 边界与风险

- 下一章内容与 Optional 隐藏 Boss 未提前制作；本任务只写入下一章/结局可达门槛，后续章节任务负责消费该门槛。普通敌人已进入第 1 章内容目录、校验和模拟器，当前 Demo 场景仍以白大侠主线擂台作为可视化入口。
