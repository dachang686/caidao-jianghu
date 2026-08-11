---
id: G113
title: 实现锻造配方与 12 个 Core 配方
phase: gameplay
depends_on: [G109, G110, G112]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现锻造检查、材料原子扣除、产物交付和 12 个 Core 配方。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 与第 4 节锻造
- `src/types/recipe.ts`
- `src/systems/crafting/forging.ts`
- `src/content/recipes/forging.ts`

## 实现范围

- 配方有解锁条件、材料、产物和章节阶段。
- 扣料与发放同一事务式领域动作，失败不部分扣除。
- 12 个配方覆盖武器、防具、饰品或强化材料。

## 验收标准

- 材料不足、背包满和重复提交不损失资源。
- 配方引用与阶段可由 validator 检查。
- 产物能进入装备/经济系统。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/crafting
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
