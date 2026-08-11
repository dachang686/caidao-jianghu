---
id: G119
title: 建立固定 RNG 战斗批量模拟器
phase: gameplay
depends_on: [G105, G108, G111, G114]
status: pending
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
