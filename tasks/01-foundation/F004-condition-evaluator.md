---
id: F004
title: 实现 Condition 纯函数求值器
phase: foundation
depends_on: [F003]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现不依赖 React/Zustand 的 Condition 递归求值器。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“声明式内容模型”
- `src/types/conditions.ts`
- `src/systems/conditions/`
- `src/systems/conditions/*.test.ts`

## 实现范围

- 实现 quest_complete、has_item、stat_gte、flag_equals、not、all、any。
- 上下文只读；缺失引用返回带路径的显式错误，不按 false 静默吞掉。
- 覆盖嵌套、空 all/any、数量边界和错误引用测试。

## 验收标准

- 同一上下文重复求值结果确定。
- 求值器不修改输入，不读取 store 单例。
- 所有 Condition 联合成员都有穷尽检查。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/conditions
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
