---
id: S241
title: 实现门派状态与四设施升级
phase: sect
depends_on: [G109, G110, W202]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现练功房、厨房、铁匠铺、情报堂各三级和成本/收益闭环。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 5 节门派经营
- `src/types/sect.ts`
- `src/systems/sect/facilities.ts`
- `src/content/sect/facilities.ts`

## 实现范围

- 升级检查章节、材料、银两和前置等级。
- 收益明确回流技能/配方/情报/fame/wealth/sectProsperity。
- 升级 Effect 原子执行且幂等。

## 验收标准

- 重复点击不重复扣费。
- 每项设施至少影响一个非经营系统。
- 无真实时间或登录奖励。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/sect
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
