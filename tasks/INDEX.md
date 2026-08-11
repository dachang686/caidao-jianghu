# 《菜刀闯江湖》1.0 任务索引

共 107 个原子任务：97 个 Core/发布任务、10 个 Optional 任务。执行协议见 [README.md](./README.md)，机器可读依赖见 [manifest.json](./manifest.json)。

## 执行规则

- 下表已经按依赖拓扑排序；每次领取第一个依赖均已完成的待办任务。
- 完成验证后，将 ⬜ 改为 ✅，并将任务 frontmatter 的 `status` 改为 `done`。
- 如果某任务阻塞，不得跳到依赖它的任务；可执行其他依赖已满足的并行分支。
- Optional 不阻塞 Core 1.0；实现计划中的完整 5–8 小时通关后目标时再执行 Optional。

## Core / 发布执行队列

| 顺序 | 状态 | 任务 | 依赖 | 类别 |
|---:|:---:|---|---|---|
| 001 | ⬜ | [F001 锁定 Demo 行为基线](./01-foundation/F001-baseline-characterization.md) | — | 基础架构 |
| 002 | ⬜ | [F002 建立模块目录骨架与导入边界](./01-foundation/F002-module-skeleton.md) | F001 | 基础架构 |
| 003 | ⬜ | [F003 定义领域 ID、核心类型与 ContentManifest](./01-foundation/F003-domain-types-content-manifest.md) | F002 | 基础架构 |
| 004 | ⬜ | [F004 实现 Condition 纯函数求值器](./01-foundation/F004-condition-evaluator.md) | F003 | 基础架构 |
| 005 | ⬜ | [F005 实现 Effect 执行器与奖励幂等](./01-foundation/F005-effect-executor.md) | F003、F004 | 基础架构 |
| 006 | ⬜ | [F006 实现同步 Domain EventBus](./01-foundation/F006-domain-event-bus.md) | F003 | 基础架构 |
| 007 | ⬜ | [F007 建立内容加载器与基础校验 CLI](./01-foundation/F007-content-loader-validator-base.md) | F003、F004 | 基础架构 |
| 008 | ⬜ | [F008 定义 GameSaveV2 与运行状态边界](./01-foundation/F008-save-v2-schema.md) | F003 | 基础架构 |
| 009 | ⬜ | [F009 实现多档位存储与安全导入导出](./01-foundation/F009-save-slots-import-export.md) | F008 | 基础架构 |
| 010 | ⬜ | [F010 实现增量迁移与崩溃恢复](./01-foundation/F010-save-migration-session-recovery.md) | F009 | 基础架构 |
| 011 | ⬜ | [F011 拆分 Zustand 领域 slices](./01-foundation/F011-zustand-domain-slices.md) | F005、F006、F008 | 基础架构 |
| 012 | ⬜ | [F012 拆分 Screen 壳与 App 调度](./01-foundation/F012-screen-shell-decomposition.md) | F011 | 基础架构 |
| 013 | ⬜ | [F013 实现 LocalTextProvider 统一文本出口](./01-foundation/F013-local-text-provider.md) | F003、F006 | 基础架构 |
| 014 | ⬜ | [F014 实现 ComedyDirector 调度内核](./01-foundation/F014-comedy-director-kernel.md) | F004、F005、F006 | 基础架构 |
| 015 | ⬜ | [F015 完成 M1 基础架构集成验收](./01-foundation/F015-m1-foundation-integration.md) | F007、F010、F012、F013、F014 | 基础架构 |
| 016 | ⬜ | [G101 实现可保存的确定性 RNG](./02-gameplay/G101-deterministic-rng.md) | F015 | 玩法引擎 |
| 017 | ⬜ | [G102 实现战斗回合状态机](./02-gameplay/G102-combat-turn-state-machine.md) | G101、F005、F006 | 玩法引擎 |
| 018 | ⬜ | [G103 实现伤害、状态与冷却结算](./02-gameplay/G103-damage-status-cooldown.md) | G102 | 玩法引擎 |
| 019 | ⬜ | [G104 实现架势破防与意图模型](./02-gameplay/G104-posture-intent.md) | G103 | 玩法引擎 |
| 020 | ⬜ | [G105 实现敌人 AI、Boss 阶段与三档难度](./02-gameplay/G105-enemy-ai-boss-difficulty.md) | G104 | 玩法引擎 |
| 021 | ⬜ | [G106 实现武学注册表、技能点与六槽配置](./02-gameplay/G106-skill-registry-loadout.md) | G103、F007 | 玩法引擎 |
| 022 | ⬜ | [G107 配置 16 个 Core 主动技能](./02-gameplay/G107-core-active-skills.md) | G106、G104 | 玩法引擎 |
| 023 | ⬜ | [G108 实现 8 个 Core 被动节点](./02-gameplay/G108-core-passive-tree.md) | G106、G107 | 玩法引擎 |
| 024 | ⬜ | [G109 实现背包与六槽装备领域](./02-gameplay/G109-inventory-equipment-domain.md) | F015 | 玩法引擎 |
| 025 | ⬜ | [G110 实现掉落、银两与阶段经济曲线](./02-gameplay/G110-loot-economy.md) | G101、G109、G105 | 玩法引擎 |
| 026 | ⬜ | [G111 实现确定性装备强化 +5](./02-gameplay/G111-seeded-strengthening.md) | G101、G109、G110 | 玩法引擎 |
| 027 | ⬜ | [G116 实现武学树与六槽配置页面](./02-gameplay/G116-skill-tree-screen.md) | G108、F012 | 玩法界面 |
| 028 | ⬜ | [G117 实现背包与装备页面](./02-gameplay/G117-inventory-equipment-screen.md) | G109、G111、F012 | 玩法界面 |
| 029 | ⬜ | [W201 实现世界地图、地点状态与区域懒加载](./03-world-ui/W201-world-location-loader.md) | F015 | 世界系统 |
| 030 | ⬜ | [W202 实现任务状态机与幂等交付](./03-world-ui/W202-quest-engine.md) | F004、F005、F006、F007 | 世界系统 |
| 031 | ⬜ | [S241 实现门派状态与四设施升级](./05-sect/S241-sect-state-facilities.md) | G109、G110、W202 | 门派系统 |
| 032 | ⬜ | [W203 实现声明式对话引擎](./03-world-ui/W203-dialogue-engine.md) | F004、F005、F013、W202 | 世界系统 |
| 033 | ⬜ | [W204 实现跨区域 NPC 状态与关系](./03-world-ui/W204-npc-state-relations.md) | F006、W202、W203 | 世界系统 |
| 034 | ⬜ | [H221 实现跨系统情境组合引擎](./04-humor/H221-situation-combo-engine.md) | F014、G103、W202、W204 | 四层幽默 |
| 035 | ⬜ | [S242 实现门人招募、性格与派遣能力](./05-sect/S242-disciple-recruitment-traits.md) | S241、W204 | 门派系统 |
| 036 | ⬜ | [S243 实现战斗场次 Tick 派遣](./05-sect/S243-sect-tick-dispatch.md) | S242、F006、G101 | 门派系统 |
| 037 | ⬜ | [S244 实现种子化江湖委托引擎](./05-sect/S244-commission-engine.md) | G101、W202、S243 | 门派系统 |
| 038 | ⬜ | [S245 实现门派经营与派遣页面](./05-sect/S245-sect-screen.md) | S241、S243、S244、F012 | 门派界面 |
| 039 | ⬜ | [W205 实现场景热点与探索交互](./03-world-ui/W205-hotspot-exploration.md) | W201、F005、F006 | 世界系统 |
| 040 | ⬜ | [G112 实现场景采集与节点刷新规则](./02-gameplay/G112-gathering-domain.md) | G101、W205 | 玩法引擎 |
| 041 | ⬜ | [G113 实现锻造配方与 12 个 Core 配方](./02-gameplay/G113-forging-domain.md) | G109、G110、G112 | 玩法引擎 |
| 042 | ⬜ | [G114 实现烹饪、食物持续场次与 8 个 Core 菜谱](./02-gameplay/G114-cooking-domain.md) | G103、G112、G113 | 玩法引擎 |
| 043 | ⬜ | [G115 实现完整 Battle Screen](./02-gameplay/G115-battle-screen.md) | G105、G107、G114、F012 | 玩法界面 |
| 044 | ⬜ | [G118 实现锻造与烹饪页面](./02-gameplay/G118-crafting-cooking-screens.md) | G113、G114、F012 | 玩法界面 |
| 045 | ⬜ | [G119 建立固定 RNG 战斗批量模拟器](./02-gameplay/G119-balance-simulator.md) | G105、G108、G111、G114 | 玩法引擎 |
| 046 | ⬜ | [H222 实现递进互动反应链](./04-humor/H222-interaction-chain-engine.md) | F014、W204、W205 | 四层幽默 |
| 047 | ⬜ | [W206 实现图鉴、称号与基础成就框架](./03-world-ui/W206-codex-title-achievement.md) | F004、F006、W204、G106、G109 | 世界系统 |
| 048 | ⬜ | [W207 实现设置、输入映射与无障碍基础](./03-world-ui/W207-settings-input-accessibility.md) | F012、F013 | 体验适配 |
| 049 | ⬜ | [H224 实现 memePack、三档密度与本地文案调度](./04-humor/H224-meme-pack-density.md) | F013、F014、W207 | 四层幽默 |
| 050 | ⬜ | [S246 制作 6 名 Core 门人与经营反馈内容](./05-sect/S246-six-core-disciples.md) | S242、S244、H221、H224 | 门派内容 |
| 051 | ⬜ | [W208 完成五档视口响应式应用壳](./03-world-ui/W208-responsive-app-shell.md) | F012、W201、W207 | 体验适配 |
| 052 | ⬜ | [W209 实现区域资源与音频生命周期](./03-world-ui/W209-asset-audio-lifecycle.md) | W201、W207 | 资源平台 |
| 053 | ⬜ | [C301 第1章 小愚村：场景、NPC 与素材](./06-chapters/C301-ch01-scene-assets.md) | F015、W201、W204、W205、W209 | 章节内容 |
| 054 | ⬜ | [C302 第1章 小愚村：任务、对白与情境幽默](./06-chapters/C302-ch01-quests-dialogue.md) | C301、W202、W203、H221、H222、H224 | 章节内容 |
| 055 | ⬜ | [H223 实现喜剧演出节拍运行时](./04-humor/H223-presentation-cue-runtime.md) | F014、G115、W207、W209 | 四层幽默 |
| 056 | ⬜ | [H225 实现四层幽默覆盖与安全校验](./04-humor/H225-four-layer-coverage-validator.md) | H221、H222、H223、H224 | 四层幽默 |
| 057 | ⬜ | [C303 第1章 小愚村：敌人、白大侠 与章节集成](./06-chapters/C303-ch01-combat-integration.md) | C302、G105、G107、G115、G119、H223、H225、G109、G117 | 章节内容 |
| 058 | ⬜ | [C311 第2章 清河县：场景、NPC 与素材](./06-chapters/C311-ch02-scene-assets.md) | C303、W201、W204、W205、W209 | 章节内容 |
| 059 | ⬜ | [C312 第2章 清河县：任务、对白与情境幽默](./06-chapters/C312-ch02-quests-dialogue.md) | C311、W202、W203、H221、H222、H224 | 章节内容 |
| 060 | ⬜ | [C313 第2章 清河县：敌人、榜下捕快 与章节集成](./06-chapters/C313-ch02-combat-integration.md) | C312、G105、G107、G115、G119、H223、H225、G111、G112、G113、G117、G118 | 章节内容 |
| 061 | ⬜ | [C321 第3章 黑风寨：场景、NPC 与素材](./06-chapters/C321-ch03-scene-assets.md) | C313、W201、W204、W205、W209 | 章节内容 |
| 062 | ⬜ | [C322 第3章 黑风寨：任务、对白与情境幽默](./06-chapters/C322-ch03-quests-dialogue.md) | C321、W202、W203、H221、H222、H224 | 章节内容 |
| 063 | ⬜ | [C323 第3章 黑风寨：敌人、黑风寨主 与章节集成](./06-chapters/C323-ch03-combat-integration.md) | C322、G105、G107、G115、G119、H223、H225、G108、G114、G116、G118 | 章节内容 |
| 064 | ⬜ | [C331 第4章 青云山：场景、NPC 与素材](./06-chapters/C331-ch04-scene-assets.md) | C323、W201、W204、W205、W209 | 章节内容 |
| 065 | ⬜ | [C332 第4章 青云山：任务、对白与情境幽默](./06-chapters/C332-ch04-quests-dialogue.md) | C331、W202、W203、H221、H222、H224 | 章节内容 |
| 066 | ⬜ | [C333 第4章 青云山：敌人、青云掌门 与章节集成](./06-chapters/C333-ch04-combat-integration.md) | C332、G105、G107、G115、G119、H223、H225、G104、G111 | 章节内容 |
| 067 | ⬜ | [C341 第5章 西域驿路：场景、NPC 与素材](./06-chapters/C341-ch05-scene-assets.md) | C333、W201、W204、W205、W209 | 章节内容 |
| 068 | ⬜ | [C342 第5章 西域驿路：任务、对白与情境幽默](./06-chapters/C342-ch05-quests-dialogue.md) | C341、W202、W203、H221、H222、H224 | 章节内容 |
| 069 | ⬜ | [C343 第5章 西域驿路：敌人、驿路双煞 与章节集成](./06-chapters/C343-ch05-combat-integration.md) | C342、G105、G107、G115、G119、H223、H225、S241、S242、S243、S245 | 章节内容 |
| 070 | ⬜ | [C351 第6章 东海镇：场景、NPC 与素材](./06-chapters/C351-ch06-scene-assets.md) | C343、W201、W204、W205、W209 | 章节内容 |
| 071 | ⬜ | [C352 第6章 东海镇：任务、对白与情境幽默](./06-chapters/C352-ch06-quests-dialogue.md) | C351、W202、W203、H221、H222、H224 | 章节内容 |
| 072 | ⬜ | [C353 第6章 东海镇：敌人、海潮帮主 与章节集成](./06-chapters/C353-ch06-combat-integration.md) | C352、G105、G107、G115、G119、H223、H225、S244、S246 | 章节内容 |
| 073 | ⬜ | [C361 第7章 京城：场景、NPC 与素材](./06-chapters/C361-ch07-scene-assets.md) | C353、W201、W204、W205、W209 | 章节内容 |
| 074 | ⬜ | [C362 第7章 京城：任务、对白与情境幽默](./06-chapters/C362-ch07-quests-dialogue.md) | C361、W202、W203、H221、H222、H224 | 章节内容 |
| 075 | ⬜ | [P381 配置前四章 24 件 Core 装备](./07-cross-content/P381-core-equipment-ch1-ch4.md) | C333、G109、G110、G111 | 跨章内容 |
| 076 | ⬜ | [W210 实现全局错误恢复面板](./03-world-ui/W210-error-boundary-recovery-ui.md) | F010、F012 | 体验适配 |
| 077 | ⬜ | [W211 实现老板键暂停与恢复](./03-world-ui/W211-boss-key.md) | F012、W207、W209 | 体验适配 |
| 078 | ⬜ | [W212 实现四结局判定引擎与 Ending Screen](./03-world-ui/W212-ending-engine-screen.md) | F004、F005、W202、F012 | 世界系统 |
| 079 | ⬜ | [C363 第7章 京城：敌人、榜司督主 与章节集成](./06-chapters/C363-ch07-combat-integration.md) | C362、G105、G107、G115、G119、H223、H225、W212 | 章节内容 |
| 080 | ⬜ | [C371 第8章 武林大会：场景、NPC 与素材](./06-chapters/C371-ch08-scene-assets.md) | C363、W201、W204、W205、W209 | 章节内容 |
| 081 | ⬜ | [C372 第8章 武林大会：任务、对白与情境幽默](./06-chapters/C372-ch08-quests-dialogue.md) | C371、W202、W203、H221、H222、H224 | 章节内容 |
| 082 | ⬜ | [C373 第8章 武林大会：敌人、百晓榜主 与章节集成](./06-chapters/C373-ch08-combat-integration.md) | C372、G105、G107、G115、G119、H223、H225、W212 | 章节内容 |
| 083 | ⬜ | [P382 配置后四章 24 件 Core 装备](./07-cross-content/P382-core-equipment-ch5-ch8.md) | C373、P381 | 跨章内容 |
| 084 | ⬜ | [P383 补齐 12 模板与 24 个 Core 敌人变体](./07-cross-content/P383-core-enemy-roster.md) | C373、G105 | 跨章内容 |
| 085 | ⬜ | [P384 完成四结局文本、演出与可达路径](./07-cross-content/P384-four-ending-content.md) | C373、W212、H223、H224 | 跨章内容 |
| 086 | ⬜ | [P385 实现 Core 通关后继续与委托循环](./07-cross-content/P385-core-postgame-loop.md) | P384、S244、S245、S246 | 通关后 |
| 087 | ⬜ | [P386 校准主线成长、经济与时长采样](./07-cross-content/P386-progression-economy-instrumentation.md) | P382、P383、P385、G119 | 跨章内容 |
| 088 | ⬜ | [Q401 完成发布级内容校验器](./09-qa-release/Q401-content-validator-release-gate.md) | P386、H225 | 质量保证 |
| 089 | ⬜ | [Q402 补齐系统单元与集成测试矩阵](./09-qa-release/Q402-unit-integration-test-gate.md) | Q401 | 质量保证 |
| 090 | ⬜ | [Q403 建立八章快照 E2E 套件](./09-qa-release/Q403-chapter-snapshot-e2e.md) | P386、Q401 | 质量保证 |
| 091 | ⬜ | [Q404 实现创角到结局的完整黄金路径 E2E](./09-qa-release/Q404-full-golden-path-e2e.md) | Q402、Q403、P384 | 质量保证 |
| 092 | ⬜ | [Q405 实现加辣梗与全迷惑选项作死路径](./09-qa-release/Q405-chaos-humor-path-e2e.md) | Q404、H225 | 质量保证 |
| 093 | ⬜ | [Q406 完成多档、迁移与异常恢复 E2E](./09-qa-release/Q406-save-recovery-e2e.md) | Q404、F010、W210 | 质量保证 |
| 094 | ⬜ | [Q407 完成五视口与无障碍验收](./09-qa-release/Q407-responsive-accessibility-audit.md) | Q404、W208、W207 | 质量保证 |
| 095 | ⬜ | [Q408 完成包体、加载与内存验收](./09-qa-release/Q408-performance-resource-memory-audit.md) | Q404、W209 | 质量保证 |
| 096 | ⬜ | [Q409 完成离线包与 GitHub Pages 发布流水线](./09-qa-release/Q409-offline-pages-release-pipeline.md) | Q406、Q407、Q408 | 发布 |
| 097 | ⬜ | [Q410 执行 1.0 Core 最终验收](./09-qa-release/Q410-final-core-acceptance.md) | Q405、Q409 | 发布 |

## Optional 扩展队列

| 顺序 | 状态 | 任务 | 依赖 | 类别 |
|---:|:---:|---|---|---|
| 001 | ⬜ | [O601 Optional：补齐 8 主动与 4 被动武学](./08-optional/O601-expanded-skills-passives.md) | Q410 | Optional |
| 002 | ⬜ | [O602 Optional：把装备扩展到约 80 件](./08-optional/O602-expanded-equipment.md) | Q410、O601 | Optional |
| 003 | ⬜ | [O603 Optional：补齐 24 锻造与 16 菜谱](./08-optional/O603-expanded-recipes.md) | Q410、O602 | Optional |
| 004 | ⬜ | [O604 Optional：补齐门人 7–12](./08-optional/O604-expanded-disciples.md) | Q410、S246 | Optional |
| 005 | ⬜ | [O605 Optional：扩展至 36 条支线/委托内容](./08-optional/O605-expanded-side-content.md) | Q410、S244 | Optional |
| 006 | ⬜ | [O606 Optional：制作前四区隐藏 Boss](./08-optional/O606-hidden-bosses-early.md) | Q410、O601、O602 | Optional |
| 007 | ⬜ | [O607 Optional：制作后四区隐藏 Boss](./08-optional/O607-hidden-bosses-late.md) | Q410、O601、O602 | Optional |
| 008 | ⬜ | [O608 Optional：制作三处通关后秘境](./08-optional/O608-three-postgame-dungeons.md) | O606、O607、O603 | Optional |
| 009 | ⬜ | [O609 Optional：完善图鉴、成就与稀有称号](./08-optional/O609-expanded-codex-achievements.md) | O604、O605、O608 | Optional |
| 010 | ⬜ | [O610 Optional：验收 5–8 小时通关后内容](./08-optional/O610-optional-postgame-acceptance.md) | O601、O602、O603、O604、O605、O606、O607、O608、O609 | Optional |

