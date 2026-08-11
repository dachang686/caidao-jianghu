---
id: W203
title: 实现声明式对话引擎
phase: world
depends_on: [F004, F005, F013, W202]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现节点、条件选项、Effect、返回路径和已读状态。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节分支原则、第 7 节文本 Provider
- `src/types/dialogue.ts`
- `src/systems/dialogue/`
- `src/components/dialogue/`

## 实现范围

- 支持逐字/立即、Auto、Skip 已读与键盘推进。
- 选项逻辑由稳定 optionId/semanticTag 驱动，LocalTextProvider 仅改表现文本。
- 关键不可逆选择使用脱离玩笑语气的二次确认。

## 验收标准

- 所有可见选项被锁时显示诊断并在 validator 失败。
- 迷惑分支最多两个节点回主线。
- 快速输入不会重复执行 Effect。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/dialogue
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
