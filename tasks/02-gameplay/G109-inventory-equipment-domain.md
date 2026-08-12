---
id: G109
title: 实现背包与六槽装备领域
phase: gameplay
depends_on: [F015]
status: done
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

## 执行记录

- 基线：已有旧 Demo 的数组物品状态，但没有堆叠/容量、关键物品保护、六槽装备或领域属性重算。
- 实现：新增物品/装备公共类型、不可变背包操作、六槽装备替换/卸下与从基础值重算的装备修正；未生产正式 48 件内容，仅使用测试夹具。
- 验证：`pnpm lint`、`pnpm test -- src/systems/inventory`（1 file / 3 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
