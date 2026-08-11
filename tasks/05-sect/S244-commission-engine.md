---
id: S244
title: 实现种子化江湖委托引擎
phase: sect
depends_on: [G101, W202, S243]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现 12 个 Core 模板的目标/区域/敌人/奖励组合和活跃数量限制。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节委托复用与第 5 节通关后循环
- `src/types/commission.ts`
- `src/systems/commissions/`
- `src/content/commissions/templates.ts`

## 实现范围

- 普通任务同时最多 6，其中程序委托最多 3。
- 生成使用独立 RNG fork，无现实日期。
- 重复模板收益回落，高价值一次性目标幂等。

## 验收标准

- 同 seed/进度生成相同委托。
- 不存在无上下文纯数字跑腿。
- 任务引用关闭区域时不会生成。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/commissions
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
