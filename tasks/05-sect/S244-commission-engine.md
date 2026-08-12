---
id: S244
title: 实现种子化江湖委托引擎
phase: sect
depends_on: [G101, W202, S243]
status: done
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

## 实现记录

- 新增 `src/types/commission.ts`、`src/systems/commissions/engine.ts` 和 `src/content/commissions/templates.ts`，提供 12 个带区域、目标、敌人/上下文标签和奖励的 Core 模板。
- 生成按章节、已解锁区域和进度筛选，并使用独立 `DeterministicRng.fork` 固定实例；没有现实日期或系统时间依赖。
- 程序委托同时最多 3 个；重复模板的财富/名望奖励按使用次数回落；高价值一次性模板通过模板完成集和 grantKey 幂等关闭。
- 新增模板校验，拒绝缺区域、缺上下文目标的纯数字跑腿、无效奖励与重复 grantKey；内容校验脚本已接入。
- 新增 `src/systems/commissions/engine.test.ts`，覆盖同 seed 复现、关闭区域、上限、收益回落、一次性模板和领取幂等。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/commissions`：通过（1 个文件，3 个测试）。
- `pnpm content:validate`：通过（1 个章节；Node 仅输出实验性 loader warning）。
- `pnpm build`：通过。

## 风险

- 委托目标完成事件与门派页面由后续任务接入；本任务已提供生成、状态、领取和校验领域接口。
