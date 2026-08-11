---
id: P383
title: 补齐 12 模板与 24 个 Core 敌人变体
phase: cross-content
depends_on: [C373, G105]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

审计并补齐 12 个行为模板和至少 24 个可辨认普通敌人变体。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节敌人模板化复用
- `src/content/enemies/templates/`
- `src/content/enemies/regions/`

## 实现范围

- 模板负责行为，变体负责区域招式、数值和表现标签。
- 普通敌人意图诚实，只有精英可使用有限特殊意图。
- 复用不得变成纯换色；招式组或资源压力必须可辨。

## 验收标准

- 每区至少 2 类，合计至少 24 个 Core 变体。
- 所有变体进入至少一张遭遇/委托表。
- 模拟器无必败、无限防御或超长组合。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/combat
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。
