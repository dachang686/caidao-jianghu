---
id: G101
title: 实现可保存的确定性 RNG
phase: gameplay
depends_on: [F015]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立所有战斗、掉落、强化和委托共用的可序列化 RNG。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节成长安全阀与第 11 节内容模拟
- `src/systems/rng/`
- `src/types/save.ts`

## 实现范围

- 实现 seed/state/nextInt/nextFloat/weightedPick/fork，禁止生产逻辑使用 Math.random。
- 状态能进入 GameSaveV2 并在恢复后继续相同序列。
- 测试不同领域使用独立 fork，避免新增掉落改变战斗序列。

## 验收标准

- 同 seed 和调用序列字节级一致。
- 保存恢复前后后续 100 次结果一致。
- 非法权重与空池显式报错。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/rng
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
