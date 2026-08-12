---
id: G108
title: 实现 8 个 Core 被动节点
phase: gameplay
depends_on: [G106, G107]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立四系被动节点、前置关系和重置后的派生属性重算。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 与第 4 节成长
- `src/content/skills/passives.ts`
- `src/systems/skills/passive-tree.ts`

## 实现范围

- 每系至少 2 个被动，避免纯线性数值堆叠。
- 派生属性每次从基础状态重算，不累计重复加成。
- 前置与互斥使用数据配置。

## 验收标准

- 8 个节点均有可感知但不过度的效果。
- 多次加点/重置不会漂移属性。
- 循环前置被 content validator 拒绝。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/skills
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 基线：G106/G107 已有主动技能注册与结算，但没有被动节点、派生属性重算或互斥校验。
- 实现：新增四系 8 个 Core 被动、被动树前置/互斥操作、从基础属性重算的条件派生效果，并把被动循环诊断接入内容校验器。
- 验证：`pnpm lint`、`pnpm content:validate`、`pnpm test -- src/systems/skills`（3 files / 9 tests；另含内容校验 4 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
