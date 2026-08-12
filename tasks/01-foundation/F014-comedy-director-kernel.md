---
id: F014
title: 实现 ComedyDirector 调度内核
phase: foundation
depends_on: [F004, F005, F006]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现由领域事件驱动的主/轻笑点选择、冷却、去重与首次/重复版本。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节“四层诙谐设计总则”
- `src/types/comedy.ts`
- `src/systems/comedy/ComedyDirector.ts`
- `src/systems/comedy/*.test.ts`

## 实现范围

- 支持 rule/situation/interaction/presentation 四层元数据。
- 单动作最多 1 个 major 与 2 个 minor；冷却使用游戏 tick/回合，不用真实时间决定逻辑。
- Director 返回 cue/effect 请求，不直接修改 store 或战斗公式。

## 验收标准

- 同一 RNG 与事件序列得到相同选择。
- 重复笑点正确降级，冷却不会吞掉任务必要反馈。
- 循环或非法 Effect 被拒绝。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/comedy
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- 新增四层 Comedy 元数据与 `ComedyDirector`，按事件/tick/RNG 选择最多 1 个主笑点和 2 个轻反应。
- 支持冷却、首次/重复 cue、首次奖励 effect 请求、依赖环检测和 Effect 结构校验；Director 不修改 store 或战斗公式。
- 验证结果：`pnpm lint`、`pnpm test -- src/systems/comedy`、`pnpm build` 均通过。
