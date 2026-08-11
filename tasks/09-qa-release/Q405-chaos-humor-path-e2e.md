---
id: Q405
title: 实现加辣梗与全迷惑选项作死路径
phase: qa
depends_on: [Q404, H225]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

验证连续迷惑选项、互动链、失败重试和幽默密度不会锁死主线。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 11 节 Playwright 作死路径
- `e2e/chaos-humor-path.spec.ts`

## 实现范围

- 设置加辣，优先选择 humorDetour，重复点击可互动 NPC。
- 至少触发一次四层幽默、战败重试和老板键。
- 使用章节快照缩短执行，但覆盖八章分支出口。

## 验收标准

- 最终仍可达到合法结局。
- 首次奖励不重复，interaction 达稳定反馈。
- 三档梗密度下领域状态对比一致。

## 验证命令

```powershell
pnpm lint
pnpm test:e2e -- e2e/chaos-humor-path.spec.ts
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。
