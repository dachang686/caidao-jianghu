---
id: G109
title: 实现背包与六槽装备领域
phase: gameplay
depends_on: [F015]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现物品堆叠、容量策略、六槽装备与属性重算。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节成长与装备
- `src/types/item.ts`
- `src/types/equipment.ts`
- `src/systems/inventory/`
- `src/content/items/`

## 实现范围

- 槽位为武器/头部/衣服/鞋/饰品/秘籍。
- 物品增减、装备/卸下和唯一物品验证均为纯领域动作。
- Core 数据先提供测试装备，不在本任务制作 48 件正式内容。

## 验收标准

- 装备切换不会复制或丢失物品。
- 派生属性从基础与当前装备重算。
- 满容量、堆叠上限和关键物品保护有测试。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/inventory
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
