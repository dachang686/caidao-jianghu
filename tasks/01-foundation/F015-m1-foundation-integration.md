---
id: F015
title: 完成 M1 基础架构集成验收
phase: foundation
depends_on: [F007, F010, F012, F013, F014]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

把新架构接到现有小愚村流程，证明基础引擎可用且行为不退化。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 10 节“M1：核心架构与第一章迁移”
- `src/App.tsx`
- `src/screens/`
- `src/stores/`
- `src/content/`
- `e2e/game-flow.spec.ts`

## 实现范围

- 把当前章节注册到 ContentManifest 并走新 Screen/store/save/text 入口。
- 保留旧剧情和战斗结果，不在本任务新增完整 1.0 系统。
- 移除已经无调用的兼容路径，但不得删除仍被测试覆盖的行为。

## 验收标准

- 创角到白大侠胜利、找猫、刷新继续、战败重试全部通过。
- `pnpm content:validate` 能检查当前章节。
- 断网时所有文本出口使用 LocalTextProvider，零第三方请求。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
