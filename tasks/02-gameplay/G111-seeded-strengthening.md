---
id: G111
title: 实现确定性装备强化 +5
phase: gameplay
depends_on: [G101, G109, G110]
status: done
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

## 执行记录

- 基线：G109/G110 已有装备与经济领域，但没有强化等级、成本、成功率或存档种子结果边界。
- 实现：新增集中式 +1～+5 配置和强化状态机；结果由保存 seed、装备实例 ID、尝试序号派生，失败只扣本次成本且不销毁/降级装备，重复结果幂等。
- 验证：`pnpm lint`、`pnpm test -- src/systems/equipment`（1 file / 2 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
