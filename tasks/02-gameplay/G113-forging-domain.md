---
id: G113
title: 实现锻造配方与 12 个 Core 配方
phase: gameplay
depends_on: [G109, G110, G112]
status: done
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

## 执行记录

- 新增 `src/types/recipe.ts` 和 `src/systems/crafting/forging.ts`，定义章节阶段、解锁条件、材料、产物及可选装备登记。
- 锻造先聚合校验材料、章节和产物容量，再在局部状态内原子扣料并入包；材料不足、背包满、唯一产物和重复 action 均不损失资源。
- 新增 `src/content/recipes/forging.ts`，提供 12 个 Core 配方，覆盖武器、头部/衣服/鞋/饰品/秘籍以及淬火钢、灵石粉、磨刀石等强化材料；内容脚本校验材料和装备引用。

## 验证记录

- `pnpm lint` ✅
- `pnpm content:validate` ✅（1 章及锻造配方；Node loader 的实验性 warning 不影响退出码）
- `pnpm test -- src/systems/crafting` ✅（3 个测试）
- `pnpm build` ✅

## 风险与边界

- 旧版背包页面仍只展示演示物品表；锻造领域和 Core 配置已完成，页面接入由 G118 处理。
