---
id: G114
title: 实现烹饪、食物持续场次与 8 个 Core 菜谱
phase: gameplay
depends_on: [G103, G112, G113]
status: done
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

## 执行记录

- 新增 `src/types/food.ts` 与 `src/systems/crafting/cooking.ts`，定义烹饪配方、材料原子扣除、章节/条件解锁、稳定 actionId 和快照恢复边界。
- 新增 `src/systems/combat/food-buffs.ts`，实现 replace/extend/ignore 三种同类食物叠加规则；Buff 只在有效 `battle.completed` 结算后扣场次，重试、模拟和预览事件会被忽略。
- 负面效果最多持续两回合，说明通过 `LocalTextProvider` 生成，并将自伤比例限制在最大生命 8% 以内、最低生命保持为 1。
- 新增 `src/content/recipes/cooking.ts`，提供二锅头、过期大还丹、胡椒拌面、药膳汤、铁锅炖菜、玉露茶、猫饭和凝神饺子共 8 个 Core 菜谱；validator 校验食物产物绑定及无产物自循环材料。
- 新增烹饪与食物 Buff 领域测试，覆盖失败回滚、重复提交、即时回复、有效战斗结算、负面回合和安全阀。

## 验证记录

- `pnpm lint` ✅
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm test -- src/systems/crafting src/systems/combat` ✅（7 个测试文件、20 个测试）
- `pnpm build` ✅

## 风险与边界

- 烹饪领域和 8 个 Core 菜谱已完成；锻造/烹饪页面接入由 G118 处理，Battle Screen 的食物操作接入由 G115 处理。
