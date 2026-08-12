---
id: Q401
title: 完成发布级内容校验器
phase: qa
depends_on: [P386, H225]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

把全部结构、可达性、幂等、四层幽默和 Core 数量检查接入构建。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 9 节构建期内容校验
- `src/validators/content/`
- `scripts/content-validate.*`
- `package.json`

## 实现范围

- 覆盖重复/缺失引用、死对话、锁死选项、循环任务、不可达主线/结局。
- 覆盖奖励幂等、AI 隔离、幽默安全、Core 数量和 Optional 悬空入口。
- `pnpm build` 在 validate 失败时必须停止。

## 验收标准

- 每类规则有一个失败夹具和可定位错误。
- 全量正式内容零 warning；允许列表必须有理由和到期任务。
- 校验器运行时间适合每次 CI。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/validators
pnpm content:validate
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 发布校验器统一检查 Core/Optional 数量、ID 命名空间、来源、前置、Boss 阶段、配方引用、图鉴规则和资源入口；`pnpm build` 前置执行内容校验。

## 验证记录

- `pnpm content:validate` 通过：8 章内容、Core 与 Optional 门禁均无错误；`pnpm lint`、全量单测和构建均通过。
