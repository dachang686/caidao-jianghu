---
id: Q402
title: 补齐系统单元与集成测试矩阵
phase: qa
depends_on: [Q401]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

审计所有领域系统并补齐关键边界、失败路径和跨系统集成测试。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 11 节测试矩阵
- `src/**/*.test.ts`

## 实现范围

- 覆盖战斗、技能、物品、任务、EventBus、存档、经营、幽默、Provider 和结局。
- 重点覆盖重复点击、事件重放、固定 RNG、状态到期和错误恢复。
- 删除与实现无关的脆弱快照，不降低现有断言。

## 验收标准

- 每个 systems 子目录至少有直接测试或明确被集成测试覆盖。
- 测试不依赖执行顺序、网络或系统时间。
- 全套测试可重复运行三次结果一致。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test
pnpm test
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。
