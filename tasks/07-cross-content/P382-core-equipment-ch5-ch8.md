---
id: P382
title: 配置后四章 24 件 Core 装备
phase: cross-content
depends_on: [C373, P381]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

为第 5–8 章配置后续 24 件装备，使 Core 总数达到约 48。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 装备与第 4 节成长
- `src/content/items/equipment/late.ts`
- `src/content/loot/`
- `src/content/vendors/`

## 实现范围

- 延续六槽升级路径，并加入支持四系武学的构筑装备。
- 最终章装备不能让单一属性直接碾压结局/Boss。
- 门派、Boss、委托和锻造来源形成闭环。

## 验收标准

- Core 装备总数达到 48 且全部有可达来源。
- 至少四种终局构筑在模拟器中可通关标准难度。
- 不存在只有 Optional 内容才能填补的核心槽位。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/inventory src/systems/combat
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。

## 执行记录

- 配置后四章 24 件 Core 装备，声明区域/敌人/锻造来源和 0–5 强化曲线，合并到 48 件 Core 装备注册与锻造、商店、掉落体系。

## 验证记录

- `pnpm content:validate`、全量单测连续 3 次和 `pnpm build` 均通过；构建仅保留非阻断的 Vite 分包提示。
