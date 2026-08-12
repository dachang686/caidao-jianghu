---
id: G119
title: 建立固定 RNG 战斗批量模拟器
phase: gameplay
depends_on: [G105, G108, G111, G114]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立无 UI 的批量模拟工具，为章节敌人和 Boss 提供回归基准。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节数值安全阀与第 11 节内容模拟
- `src/systems/combat/simulator.ts`
- `scripts/simulate-battles.*`
- `src/systems/combat/simulator.test.ts`

## 实现范围

- 输入角色构筑、敌人、难度、种子范围，输出胜率/回合/破防/资源统计。
- 提供保守、均衡、激进三种确定性策略，不假装最优 AI。
- 阈值配置与测试夹具分离。

## 验收标准

- 同参数报告稳定。
- 能检测主线必败组合、超长战斗和从不破防。
- 模拟器不导入 DOM/React。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/combat
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 基线：G105/G108/G111/G114 已有敌人 AI、难度、被动/装备构筑与烹饪相关领域；G119 指定的模拟器、CLI 和测试文件均不存在。
- 实现：新增无 UI 的固定 RNG 战斗模拟器，接入主动技能结算、伤害、敌人意图/Boss 阶段、三档难度和架势；输入已解析的角色构筑、敌人、难度与种子范围，输出胜率、回合分布、破防窗口和生命/内力/治疗资源统计。
- 策略：提供 conservative、balanced、aggressive 三种固定启发式，按当前回合可见信息和槽位顺序选招，不搜索未来回合或伪装成最优 AI。
- 检查：报告可标记 guaranteed_loss、long_battle、never_break；阈值集中在 `simulator-thresholds.ts`，测试夹具只存在于 `simulator.test.ts`。新增 `simulate:battles` CLI 支持 JSON 场景和内置基准样本。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/combat` ✅（6 个测试文件、18 个测试）
- `pnpm build` ✅
- `pnpm test` ✅（41 个测试文件、131 个测试）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm simulate:battles -- --demo --start=1 --end=3 --strategy=balanced --difficulty=standard` ✅（输出稳定 JSON 报告）
- 模拟器 UI/DOM 引入扫描 ✅（未发现 React、DOM、window 或 document 引用）

## 风险与边界

- 模拟器接收上游系统已经解析好的角色属性、技能和敌人定义；章节敌人内容与主线黄金路径仍由后续章节任务接入。
- 零胜、超长和从不破防默认作为 warning，传入 `mainline: true` 后提升为 error，避免把非主线平衡探针误当发布阻塞。
