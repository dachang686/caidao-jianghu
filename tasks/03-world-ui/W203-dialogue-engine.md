---
id: W203
title: 实现声明式对话引擎
phase: world
depends_on: [F004, F005, F013, W202]
status: done
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

## 实现记录

- 新增 `src/types/dialogue.ts`：声明 DialogueGraph、节点、稳定 optionId、条件、Effect、播放/已读/快照契约。
- 新增 `src/systems/dialogue/engine.ts`：条件选项视图、逐字/立即/Auto/已读推进、Effect 执行、不可逆确认、稳定 actionId 幂等、迷惑分支两节点上限、快照 JSON 化与文案补丁。
- 新增 `src/components/dialogue/DialogueOverlay.tsx`：只负责展示引擎状态、锁定原因、确认交互和键盘推进；不复制领域条件判断。
- 内容 validator 已接入对白图校验；全锁选项输出诊断并令内容校验失败。
- 新增 `src/systems/dialogue/engine.test.ts`，覆盖上述行为、内容校验接入、快照恢复和快速重复输入。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/dialogue`：通过（1 个文件，5 个测试）。
- `pnpm content:validate`：通过（1 个章节；Node 仅输出实验性 loader warning）。
- `pnpm build`：通过。

## 风险

- 当前已登记内容尚未提供实际对白图；引擎和 validator 已完成通用契约，后续章节内容任务再接入具体对白。
