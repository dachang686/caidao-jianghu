---
id: H221
title: 实现跨系统情境组合引擎
phase: humor
depends_on: [F014, G103, W202, W204]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现由标签、状态和事件组合触发的 SituationComboDefinition。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节“第二层：情境幽默”
- `src/types/comedy.ts`
- `src/systems/comedy/situations.ts`
- `src/systems/comedy/situations.test.ts`

## 实现范围

- 条件复用 Condition，requiredTags 来自稳定领域标签。
- 首次发现可发幂等奖励，重复只返回短 cue。
- 组合不得依赖像素、精确帧或未保存的 UI 状态。

## 验收标准

- 固定事件序列触发结果可复现。
- 首次 grantKey 只发一次。
- 缺失标签、非法 Effect 和自循环组合被拒绝。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/comedy
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
