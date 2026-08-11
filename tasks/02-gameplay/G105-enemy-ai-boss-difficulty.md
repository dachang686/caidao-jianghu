---
id: G105
title: 实现敌人 AI、Boss 阶段与三档难度
phase: gameplay
depends_on: [G104]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立模板化敌人行为、Boss 阶段转换与难度修正。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗规则
- `src/types/enemy.ts`
- `src/systems/combat/enemy-ai.ts`
- `src/systems/combat/difficulty.ts`

## 实现范围

- 普通敌人由行为模板、招式组和数值曲线组合。
- Boss 阶段转换幂等，二阶段虚实欺骗上限 20%。
- 难度只调数值、资源宽容和意图诚实度，不锁剧情。

## 验收标准

- 固定 RNG 下 AI 序列可复现。
- 阶段转换只触发一次，不能跳过胜利判定。
- 三档难度共享奖励和结局输入。

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
