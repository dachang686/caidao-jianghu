# PLAN_v2 任务完成状态审计

审计日期：2026-08-12

## 结论

本次审计不把“存在文件、静态配置、单元测试通过”直接等同于“功能已完成”，而是同时核对任务验收标准、运行时接线、玩家可达性、存档一致性和构建产物。

审计前：`105 done / 0 pending / 2 blocked`。

审计后：`75 done / 30 pending / 2 blocked`。

30 个任务已从 `done` 回退为 `pending`。主要原因不是代码完全不存在，而是领域引擎、内容配置或页面已经写出，却没有接入同一套可保存、可游玩的运行时；此前测试验证了各自的孤立实现或当前 Demo 壳，没有证明 PLAN_v2 的完整 1.0 功能闭环。

## 审计方法

完成状态必须同时满足：

1. 任务定义中的实现范围和验收标准；
2. 依赖的领域系统实际被运行时调用，而不是只被测试或校验器导入；
3. 玩家能通过可见 UI 到达、操作并持久化该功能；
4. E2E 不以固定快照或降级兼容层掩盖未接线功能；
5. 构建、资源和存档结论与产物事实一致。

本次执行的门禁：

- `pnpm lint`：通过；
- `pnpm content:validate`：通过，8 章静态内容校验通过；
- `pnpm test -- --reporter=dot`：通过，80 个文件、240 个测试；
- `pnpm test:e2e -- --retries=0 --reporter=list`：通过，63 passed、1 skipped；
- `pnpm build`：通过，但存在章节同步/动态导入冲突和主 chunk 超过 500 kB 的警告；
- `pnpm assets:audit`：通过，总包 4.75 MiB、最大 JS 0.68 MiB、最大单图 0.30 MiB。

这些结果证明当前代码可构建、当前测试集稳定，但不能消除下述运行时缺口。

## 关键证据

### 1. M1 新架构仍是旁路，权威运行时仍为 Demo V1

- `src/stores/root-store.ts` 直接把 `src/game/store.ts` 导出为 `useRootGameStore`；所谓 slices 仅是 `Pick` 类型，没有拆分后的 Zustand 实现。
- `src/foundation/runtime.ts` 为 V2 `SaveRepository` 注入的是内存存储，并明确保留旧 V1 UI 适配。
- `src/App.tsx` 的实际加载、保存、导入和恢复仍调用 `src/game/save.ts` 的 `GameSaveV1` 单槽实现。
- `Condition/Effect/EventBus/QuestEngine/DialogueEngine` 的多数实现只在单元测试、内容校验器或独立服务容器中出现，没有成为玩家流程的权威状态转换链。

因此 F011、F015 的目标没有完成，后续 UI 也出现“新系统一套、实际游戏状态另一套”的分裂。

### 2. 8 章内容配置存在，但第 2–8 章运行时均被压缩为一次调查

- `src/content/quests/ch02.ts` 至 `ch08.ts` 定义了主线和支线，静态校验数量也满足要求。
- `src/screens/jianghu-screen.tsx` 对每章只提供一个 `chXX-investigate` 聚合按钮。
- `src/game/store.ts` 的 `completeChapterTwoInvestigation` 至 `completeChapterEightInvestigation` 每次点击直接把整章 `MainlineComplete`、`BossReady` 和 `AutosaveCheckpoint` 同时设为真。
- 运行时没有创建或调用 `QuestEngine`；声明式对白、热点、普通敌人和支线没有形成玩家可操作链路。

完整黄金路径 E2E 在约 1.1 分钟内完成八章、结局、通关后继续和三次刷新，说明它覆盖的是当前“一键调查→Boss”流程，不能作为 8–12 小时主线的完成证据。

### 3. 多个页面或系统是孤立实现

- `WorldMapScreen`、`LocationScreen`、`SectScreen` 已实现并导出，但 `ScreenShell` 没有任何对应路由分支。
- `SkillTreePanel` 使用组件本地 `useState` 新建技能进度；关闭或重新打开会重置，且不会改变战斗使用的 `player.activeSkills`。
- 背包装备页只接旧 Demo 物品数组和武器槽；其余五个装备槽与强化入口没有接入权威玩家状态。
- `recipe-store.ts` 固定 `chapter: 2` 并使用硬编码工作台库存；锻造、烹饪与玩家背包、章节进度及主存档彼此独立。
- `PostgameLoopEngine`、门派领域、委托领域和秘境领域没有被玩家运行时导入；结局后的“继续”只返回江湖页。
- Battle Screen 虽可操作并通过 E2E，但战斗动作仍由旧 `src/game/store.ts` 内的平行公式结算，新的 `CombatTurnEngine` 没有接入权威流程。

### 4. 区域懒加载和性能验收结论不成立

- `jianghu-screen.tsx` 顶部静态导入全部 8 个区域背景与主要角色素材，首屏模块因此引用未解锁章节资源。
- `sync-loader.ts` 静态导入 ch02–ch08，同时 loader 又动态导入同一章节；Vite 明确警告这些动态导入不会产生独立 chunk。
- `App.tsx` 的资源生命周期始终以 `xiaoyu-village` 作为区域 ID，切换章节不会进入对应区域资源生命周期。
- `e2e/performance.spec.ts` 只反复打开设置/图鉴，没有切换区域、战斗或验证资源卸载；`audit-assets.mjs` 把“最大单个 JS 文件”当作“首屏总资源”，也没有检查未解锁章节请求。

因此 W201、W209、Q408 不能保持完成状态。

### 5. 多档与迁移 E2E 实际测试的是旧单槽

- `e2e/save-recovery.spec.ts` 直接操作 `caidao-jianghu` / `saves` / `slot-1` 的旧数据库。
- 用例只有损坏单槽恢复和一次导出导入，没有覆盖三个手动档、自动档、V1→V2 迁移链、配额异常浏览器流程，也没有断言战斗/对白中途不写权威自动档。
- `e2e/fixtures/game-save-v2.ts` 会把 V2 fixture 转换成旧格式后再写入运行时数据库。

因此 Q406 的任务目标和验收范围没有被当前 E2E 覆盖。

## 回退为 pending 的任务

| 任务 | 回退原因 |
|---|---|
| F011 | 只有 slice 类型别名；权威 Zustand 仍是单体 legacy store。 |
| F015 | 新 store/save/text/Condition/Effect 入口没有接管小愚村权威流程。 |
| G115 | 页面仍接平行的 Demo 战斗公式，未接统一 `CombatTurnEngine`。 |
| G116 | 技能树为组件本地临时状态，不保存、不影响战斗装配。 |
| G117 | 只接旧武器槽；六槽装备与确定性强化没有形成 UI 闭环。 |
| G118 | 固定章节和硬编码工作台库存，与玩家背包/存档断开。 |
| W201 | 世界/地点页未路由；所有区域素材被静态导入，动态分包失效。 |
| W209 | 资源生命周期始终进入小愚村，没有按当前区域加载/卸载。 |
| S245 | 门派页面无运行时入口，领域状态和玩家存档未接线。 |
| C303、C313、C323、C333、C343、C353、C363、C373 | 章节集成未消费声明式任务/对白/热点/普通敌人；后续章节以一次调查直接开放 Boss，多个“系统解锁”仅写布尔标记。 |
| P385 | 通关后委托、难度和经营循环无玩家入口；继续按钮只返回江湖页。 |
| P386 | 报告基于配置/模拟器，不是当前可玩主线的成长、经济和战斗链，无法据此校准真实流程。 |
| Q406 | E2E 覆盖旧 V1 单槽，不满足 V2 三手动档、自动档、迁移和异常边界。 |
| Q408 | 未验证跨区域释放，首屏仍静态引用全部区域资源，审计脚本口径不足。 |
| O601–O609 | 依赖 Q410，但 Q410 尚未完成，违反任务执行协议；隐藏 Boss、秘境等关键 Optional 内容也没有可玩入口。代码和配置保留，待 Core 验收后重新集成验收。 |

## 保持现状的任务

- 75 个任务暂时保留 `done`：它们的纯类型、纯函数、领域引擎、内容配置、素材、局部 UI、校验器或自动化用例未发现足以单独推翻其任务边界的证据。
- 这里的 `done` 只表示该原子任务自身的交付物仍成立，不代表其功能已经进入最终可玩主流程；需要接线的责任由上述已回退的集成任务承担。
- Q409 保持 `done`，因为离线包和 Pages 流水线本身存在且可构建；但它只能发布当前产物，不能替代 Q410 的产品验收，也不能说明当前产物已达到 1.0。
- Q410 保持 `blocked`，但阻塞原因不再只有“缺少 3 轮真人计时”：必须先完成本报告列出的 Core 接线与验收缺口。
- O610 保持 `blocked`：Optional 前置任务重新打开，且没有 5–8 小时真人通关后记录。

## 重新收口顺序

1. F011 → F015：统一 RootGameStore、GameSaveV2、EventBus、Condition/Effect 和 LocalTextProvider 的权威入口，移除运行时双轨。
2. W201 → W209：把 WorldMap/Location 接入 ScreenShell，按当前区域动态加载并卸载资源。
3. G115–G118：战斗、技能、装备、锻造和烹饪全部改为读写同一玩家状态与存档。
4. S245 → P385：接入门派、派遣、委托与通关后循环。
5. C303/C313…C373：让八章集成真正消费任务、对白、热点、普通敌人和系统解锁，不再用聚合调查按钮跳过章节。
6. P386、Q406、Q408：基于真实运行时重做成长报告、多档迁移 E2E 和跨区域资源验收。
7. Q410：完成三轮真人 8–12 小时黄金路径；随后才允许执行和验收 O601–O610。

## 状态同步

本次已同步修改：

- 30 个任务文件 frontmatter：`done` → `pending`；
- `tasks/INDEX.md`：对应状态改为 `⬜`；
- `tasks/manifest.json`：对应状态改为 `pending`。

三处统计一致：`75 done / 30 pending / 2 blocked`。
