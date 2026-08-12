---
id: G105
title: 实现敌人 AI、Boss 阶段与三档难度
phase: gameplay
depends_on: [G104]
status: done
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

## 执行记录

- 基线：G104 已有架势、意图与确定性 RNG；本任务目标文件尚不存在。
- 实现：新增敌人模板/招式/数值曲线类型，AI 选择与可保存 RNG 快照，Boss 阶段幂等转换和三档难度纯函数。
- 验证：`pnpm lint`、`pnpm test -- src/systems/combat`（4 files / 11 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
