---
id: Q410
title: 执行 1.0 Core 最终验收
phase: release
depends_on: [Q405, Q409]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

执行全量发布门槛、人工黄金路径时长验证和无占位内容审计。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 1 节完成定义、第 10–12 节
- `docs/RELEASE_CHECKLIST.md`
- `docs/PLAYTEST_REPORT.md`
- `tasks/INDEX.md`

## 实现范围

- 提供章节计时记录工具，并收集至少 3 轮独立完整人工黄金路径的章节耗时与总时长；无法取得真实游玩数据时必须标记 blocked，不得用自动化点击耗时冒充玩家时长。
- 审计 28 主线、16 支线、8 Boss、4 结局、48 装备、16 主动、8 被动、12 锻造、8 菜谱、6 门人、12 委托模板。
- 搜索 Demo/敬请期待/TODO/占位/远程 URL，并逐项处理或证明不面向玩家。

## 验收标准

- 主线中位目标 8–12 小时有实际记录，不用估算代替。
- 所有 Core 任务状态 done，四结局均可达。
- 全量命令通过且 Release/Pages 产物同版本。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
pnpm assets:audit
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。
