---
id: P381
title: 配置前四章 24 件 Core 装备
phase: cross-content
depends_on: [C333, G109, G110, G111]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

为第 1–4 章配置 24 件具有阶段用途、掉落/商店/锻造来源的装备。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 装备与第 4 节成长
- `src/content/items/equipment/early.ts`
- `src/content/loot/`
- `src/content/vendors/`

## 实现范围

- 六槽均有升级路径，避免仅名称不同的同属性装备。
- 每件注明来源、章节、售价、强化曲线和风味文本。
- 稀有装备首次奖励幂等，不能通过买卖套利。

## 验收标准

- 前四章每个阶段至少有 2 个可比较构筑选择。
- 24 件均可获得、穿戴、强化和出售/保护。
- 无未知配方/敌人/商店引用。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/inventory src/systems/economy
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。
