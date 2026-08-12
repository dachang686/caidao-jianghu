---
id: S241
title: 实现门派状态与四设施升级
phase: sect
depends_on: [G109, G110, W202]
status: done
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

## 执行记录

- 基线：仓库没有门派设施类型、升级成本、四项设施内容或门派升级领域动作。
- 实现：新增练功房、厨房、铁匠铺、情报堂四项三级设施配置；升级检查门派解锁、章节、银两、材料和设施前置，收益分别回流战斗属性、菜谱、强化概率、委托质量/区域情报与 fame/sectProsperity。
- 幂等：升级使用稳定 grantKey，成本扣除、Effect executor 和设施收益在同一纯领域结果中原子提交；重复使用同一输入快照不会重复扣费；不依赖现实时间。
- 关联修复：升级测试暴露 G109 `removeItem` 在移除最后一件材料后留下零数量空堆，已修正为按本次移除数量删除空堆。
- 验证：`pnpm lint`、`pnpm test -- src/systems/sect`（1 file / 3 tests）、`pnpm content:validate`、`pnpm build` 均通过。
- 风险：门人招募、Tick 派遣和门派页面留给后续依赖任务，当前未提前实现。
