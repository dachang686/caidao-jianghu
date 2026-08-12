---
id: G118
title: 实现锻造与烹饪页面
phase: gameplay-ui
depends_on: [G113, G114, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现配方列表、材料缺口、结果预览与原子提交 UI。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节 crafting/cooking ScreenId
- `src/screens/CraftingScreen/`
- `src/screens/CookingScreen/`
- `src/components/recipes/`

## 实现范围

- 显示已解锁/未解锁原因、持有数量和产物用途。
- 连续点击提交只执行一次。
- 烹饪显示 buff 场次与负面安全说明。

## 验收标准

- 材料不足不进入部分完成态。
- 桌面/手机均能完成制作并返回原页面。
- 错误状态通过 aria-live 简短播报。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 新增 `src/screens/CraftingScreen/` 与 `src/screens/CookingScreen/`，并把 `crafting/cooking` 纳入内部 ScreenId 状态机；江湖页提供铁匠铺、后厨入口，制作完成后可返回原页面。
- 新增 `src/components/recipes/RecipeWorkbench.tsx`，统一渲染配方列表、章节解锁原因、材料持有/缺口、产物用途、提交状态和 `aria-live` 错误/结果播报。
- 新增 `src/stores/recipe-store.ts`，以实际 G113/G114 配方和 Inventory/锻造/烹饪引擎作为提交边界；材料不足、背包失败和重复快速提交不会进入部分完成态。
- 烹饪预览明确展示持续场次、同类叠加策略、负面回合和生命安全阀；锻造预览展示装备用途与当前登记数量。
- 新增 360px 桌面/移动 E2E，覆盖 8 个烹饪菜谱、12 个锻造配方、双击提交、材料扣除和返回江湖。

## 验证记录

- `pnpm lint` ✅
- `pnpm test` ✅（40 个测试文件、127 个测试）
- `pnpm test:e2e` ✅（16 个桌面/移动 E2E）
- `pnpm build` ✅

## 风险与边界

- 当前仓库仍保留旧 Demo 的 V1 玩家物品数组；工作台使用 G113/G114 的 canonical InventoryState 作为本地工作台库存，页面制作链路已闭环，跨 V1 玩家数组与 GameSaveV2 的统一迁移不在本任务范围内。
