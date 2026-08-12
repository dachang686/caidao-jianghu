---
id: G110
title: 实现掉落、银两与阶段经济曲线
phase: gameplay
depends_on: [G101, G109, G105]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现模板化掉落表、奖励结算和 Core 经济阶段配置。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节复用策略与第 4 节装备
- `src/types/loot.ts`
- `src/systems/economy/`
- `src/content/loot/`

## 实现范围

- 掉落使用独立 RNG fork，支持固定、权重和首次奖励。
- 银两、材料、装备与任务关键奖励分开处理。
- 提供章节阶段价格/收益基线，避免无限买卖套利。

## 验收标准

- 固定 seed 掉落可复现。
- 首次奖励幂等，背包满时有明确可恢复结果。
- 同物品买卖不能产生正收益循环。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/economy
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 基线：G109 已提供背包与装备领域，但没有掉落表、首奖幂等、银两阶段价格或市场结算。
- 实现：新增独立 RNG fork 掉落、固定/加权奖励、可恢复待领取队列、银两/材料/装备/任务物品分流及 8 章经济阶段价格配置；卖价严格低于买价。
- 验证：`pnpm lint`、`pnpm content:validate`、`pnpm test -- src/systems/economy`（1 file / 3 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
