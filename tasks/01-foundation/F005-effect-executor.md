---
id: F005
title: 实现 Effect 执行器与奖励幂等
phase: foundation
depends_on: [F003, F004]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现纯领域 Effect 执行器，并用 grantKey 阻止奖励重复发放。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“声明式内容模型”与第 9 节校验规则
- `src/types/effects.ts`
- `src/systems/effects/`
- `src/systems/effects/*.test.ts`

## 实现范围

- 实现 give_item、give_exp、set_flag、unlock_quest、change_stat、trigger_battle、narrate。
- 执行返回新状态、领域事件和待处理导航，不直接调用 UI/音频/存档。
- 奖励类 effect 记录 grantKey；重复执行保持幂等。

## 验收标准

- Effect 顺序确定且输入不可变。
- 重复交付任务不会重复获得关键物品或经验。
- 未知 ID 与非法负数产生可诊断错误。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/effects
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
