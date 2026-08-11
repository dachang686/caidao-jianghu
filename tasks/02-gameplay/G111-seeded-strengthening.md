---
id: G111
title: 实现确定性装备强化 +5
phase: gameplay
depends_on: [G101, G109, G110]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现最高 +5 的种子化强化、成本与失败保护。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节装备强化
- `src/systems/equipment/strengthening.ts`
- `src/content/balance/strengthening.ts`

## 实现范围

- 结果由存档 seed、装备实例和尝试序号决定。
- 刷新不能改变结果；失败不销毁装备。
- 每级成本、成功率和属性增量集中配置。

## 验收标准

- 相同存档反复加载的下一次结果一致。
- 强化上限、材料不足和重复点击均安全。
- 三档难度不改变强化结果。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/equipment
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
