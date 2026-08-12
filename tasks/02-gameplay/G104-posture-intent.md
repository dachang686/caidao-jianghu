---
id: G104
title: 实现架势破防与意图模型
phase: gameplay
depends_on: [G103]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现架势条、破防窗口和可读敌人意图。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节架势与意图规则
- `src/systems/combat/posture.ts`
- `src/types/enemy-intent.ts`
- `src/systems/combat/*.test.ts`

## 实现范围

- 破防触发一回合易伤 +50%，之后按规则重置。
- 定义猛攻/蓄力/防御/特殊意图及 UI 安全摘要。
- 普通攻击在未破防时仍造成有效伤害。

## 验收标准

- 破防前后伤害、重置时点和多段攻击边界有测试。
- 普通敌人意图不欺骗。
- 意图数据足够 UI 无需反推 AI 内部状态。

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

## 执行记录

- 新增架势状态、破防窗口、1.5 倍易伤和明确重置时点；多段攻击在同一窗口内不会重复触发破防。
- 新增猛攻/蓄力/防御/特殊意图契约与安全摘要转换，普通敌人可标记为 honest，UI 无需反推 AI 内部状态。
- 验证结果：`pnpm lint`、`pnpm test -- src/systems/combat`、`pnpm build` 均通过。
