---
id: G117
title: 实现背包与装备页面
phase: gameplay-ui
depends_on: [G109, G111, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现筛选、装备对比、穿脱、使用与强化入口。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节装备与第 7 节 ScreenId
- `src/screens/InventoryScreen/`
- `src/components/inventory/`

## 实现范围

- 按物品/装备/材料/食物/关键物品分类。
- 装备对比显示实际属性差；操作调用领域动作。
- 强化确认显示成本和种子化结果规则，不显示可刷新的假概率反馈。

## 验收标准

- 满背包、不可使用和关键物品都有明确禁用说明。
- 手机端可单手操作，无 hover-only 信息。
- UI 操作不会复制物品。

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

- 基线：旧 OverlayPanel 只展示静态背包/装备说明，物品分类、使用和装备切换没有独立 UI。
- 实现：新增背包/装备面板，支持分类筛选、数量、消费品使用、武器装备、六槽概览、实际属性差和种子化强化说明；装备动作连接真实 Demo store，关键物品明确禁用。
- 验证：`pnpm lint`、`pnpm test`（25 files / 72 tests）、`pnpm test:e2e`（8 passed，桌面/移动）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
