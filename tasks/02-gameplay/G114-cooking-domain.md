---
id: G114
title: 实现烹饪、食物持续场次与 8 个 Core 菜谱
phase: gameplay
depends_on: [G103, G112, G113]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现菜谱、食物 buff 场次、搞笑短负面和 8 个 Core 菜谱。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 与第 4 节食物规则
- `src/systems/crafting/cooking.ts`
- `src/systems/combat/food-buffs.ts`
- `src/content/recipes/cooking.ts`

## 实现范围

- 增益持续 1–3 场战斗，战斗结算后统一扣场次。
- 负面最多两回合、不可场景致死并有 LocalTextProvider 说明。
- 实现二锅头、过期大还丹等规则模块。

## 验收标准

- 刷新、重试和逃跑不会错误消耗场次。
- 同类食物叠加规则明确。
- 8 个菜谱均可制作且不会形成无限材料循环。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/crafting src/systems/combat
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
