---
id: H221
title: 实现跨系统情境组合引擎
phase: humor
depends_on: [F014, G103, W202, W204]
status: done
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

## 实现记录

- 新增 `src/systems/comedy/situations.ts`：声明式 SituationComboEngine 复用 Condition/Effect，按稳定 requiredTags 和事件匹配，使用确定性 RNG 选择组合。
- 首次发现记录 discoveredComboId 与 firstDiscoveryGrantKey，Effect 经过统一 executor；重复事件/重复发现只返回 repeat cue，不重复奖励；快照支持 JSON 化与恢复。
- 增加组合定义校验：缺失标签返回拒绝结果，非法 Effect、重复 grantKey、缺失依赖和自循环依赖直接拒绝。
- 新增 7 项情境组合测试，覆盖固定序列复现、条件/标签、奖励幂等、快照恢复及非法定义。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/comedy`：通过（2 个文件，7 个测试）。
- `pnpm content:validate`：通过（1 个章节；Node 仅输出实验性 loader warning）。
- `pnpm build`：通过。

## 风险

- 当前只完成通用组合运行时与校验，Core 组合内容数量由后续章节/幽默内容任务按计划接入。
