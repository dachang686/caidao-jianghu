---
id: G102
title: 实现战斗回合状态机
phase: gameplay
depends_on: [G101, F005, F006]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现不依赖 UI 的单主角回合状态机与合法动作校验。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节“战斗规则”
- `src/types/combat.ts`
- `src/systems/combat/turn-engine.ts`
- `src/systems/combat/*.test.ts`

## 实现范围

- 定义 setup/player_turn/resolving/enemy_turn/victory/defeat 状态。
- 实现开始、选择技能、结算、敌方行动、回合结束与重试动作。
- 非法阶段动作返回结构化错误，不静默忽略。

## 验收标准

- 胜负只由引擎状态决定，组件不能直接改 HP。
- 同一动作不能重复结算。
- 战败重试恢复战前快照且不回滚剧情。

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

- 新增独立 `CombatTurnEngine` 与 combat 类型，覆盖 setup/player_turn/resolving/enemy_turn/victory/defeat、合法动作、动作幂等和战前快照重试。
- HP/内力/状态变化只能通过引擎结算结果进入状态，非法阶段/技能/动作返回结构化错误；未在本任务提前实现伤害公式。
- 验证结果：`pnpm lint`、`pnpm test -- src/systems/combat`、`pnpm build` 均通过。
