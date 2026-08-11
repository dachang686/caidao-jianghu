---
id: G103
title: 实现伤害、状态与冷却结算
phase: gameplay
depends_on: [G102]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现伤害公式、内力消耗、冷却和短期状态生命周期。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗规则与安全阀
- `src/systems/combat/damage.ts`
- `src/systems/combat/status.ts`
- `src/systems/combat/cooldown.ts`

## 实现范围

- 集中定义攻击/防御/暴击/命中公式和数值上下限。
- 状态明确 tick 时点、叠加规则、互斥与解除。
- 技能不可用原因可供 UI 展示。

## 验收标准

- 零/负防御、极端属性、命中边界和状态到期均有测试。
- 搞笑自伤与场景伤害遵守不可降到 1 以下的安全阀。
- 冷却不会因刷新或重试多减一回合。

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
