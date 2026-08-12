---
id: C313
title: 第2章 清河县：敌人、榜下捕快 与章节集成
phase: chapter-content
depends_on: [C312, G105, G107, G115, G119, H223, H225, G111, G112, G113, G117, G118]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

完成第2章至少 2 类普通敌人、章节 Boss“榜下捕快”、系统解锁“装备、采集与锻造”和章节级集成测试。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗、第 6 节规则/演出幽默、第 10 节里程碑
- 本章场景、任务和现有战斗模板

## 实现范围

- 普通敌人复用行为模板但必须有可辨认招式组和诚实意图。
- 榜下捕快 具有明确阶段、可读意图和最多一个专属反套路规则；失败可原地重试。
- 本章引入或自然使用至少 1 个规则幽默模块，并配置 1 个 Boss 专属开场或败北 PresentationCue。
- Boss 胜利后原子交付奖励、解锁“装备、采集与锻造”、写自动档并开放下一章/结局。
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

- 新增 `src/content/enemies/ch02.ts`，配置榜纸抄手、桥边扒手两类普通敌人和榜下捕快；三者均复用统一敌人行为模板、招式引用和诚实意图字段，Boss 仅配置一个「空白卷宗」反套路规则与双阶段。
- 新增 `CH02_BOSS_REWARD` 与 `settleCh02BossVictory`，把清河榜牌、经验、银两、装备/采集/锻造解锁、下一章/结局门槛和自动档检查点放进同一幂等结算事务；失败重试只恢复本局资源，不丢线索或关键物品。
- 扩展 Demo 状态机支持第 2 章快照入口、调查、榜下捕快战斗、二阶段、规则反馈、Boss 专属败北演出和返回清河县；旧第 1 章入口与存档字段保留默认兼容值。
- 新增 `e2e/ch02-flow.spec.ts`，直接写入章首 IndexedDB 快照，覆盖桌面/手机调查、战斗、自动档刷新和返回场景，不重跑第 1 章剧情；同时更新历史 C311/Manifest 测试中已过期的“仅场景、无任务/敌人”断言。
- 新增 `pnpm simulate:battles -- --ch02-bangsi` 内置标准构筑，作为本章 Boss 的固定种子批量平衡入口。

## 验证结果

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（2 chapters）；Node loader 仅输出 ExperimentalWarning。
- `pnpm test`：通过，60 个文件、193 个测试。
- `pnpm test:e2e -- --workers=1 --retries=0 --reporter=list`：通过，23 passed、1 skipped（既有移动端五档矩阵按项目配置跳过）。其中新增清河县快照流桌面/手机均通过。
- `pnpm simulate:battles -- --ch02-bangsi --start=1 --end=100`：标准难度 100 场胜率 95%，最长 12 回合，平均 8.79 回合，存在破防窗口，无超时、固定必败或 never-break 检查异常。
- `pnpm build`：通过，Vite 转换 182 个模块，并包含清河县背景、NPC/Boss WebP 素材。

## 边界与风险

- 本任务没有提前制作第 3 章内容或 Optional 隐藏 Boss；胜利只写入下一章/结局可达门槛，后续章节任务负责消费该门槛。
- 两类普通敌人已进入第 2 章内容目录、内容校验和模拟器；Demo 可视化入口聚焦清河县主线 Boss，普通敌人暂未另做独立场景入口。
