---
id: P386
title: 校准主线成长、经济与时长采样
phase: cross-content
depends_on: [P382, P383, P385, G119]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立章节进度报告并校准等级、银两、材料、装备与战斗数量。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节时长规则、第 4 节数值安全阀
- `src/content/balance/`
- `scripts/report-progression.*`
- `src/systems/combat/simulator.test.ts`

## 实现范围

- 报告黄金路径每章节经验、银两、材料、战斗数和预计回合。
- 标准难度无需刷怪即可达到推荐等级/装备。
- 超 12 小时先压缩重复战斗/往返，低于 8 小时不以材料墙注水。

## 验收标准

- 四种终局构筑在固定种子组可完成主线。
- 报告能指出资源断点和超量奖励。
- 数值调整不改变任务/结局条件语义。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。
