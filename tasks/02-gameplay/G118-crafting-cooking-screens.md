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
