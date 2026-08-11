---
id: W206
title: 实现图鉴、称号与基础成就框架
phase: world
depends_on: [F004, F006, W204, G106, G109]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

用统一条件/事件框架实现 NPC、敌人、技能、称号和基础成就解锁。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 图鉴与第 6 节幽默载体
- `src/types/unlockable.ts`
- `src/systems/unlocks/`
- `src/screens/CodexScreen/`

## 实现范围

- 首次遇见/获得/达成触发幂等解锁。
- 称号微量属性奖励通过派生计算，不重复累加。
- 未知条目显示轮廓与线索，不泄露隐藏结局。

## 验收标准

- 重复事件不重复发奖励。
- 解锁状态可保存且内容删除时可诊断。
- 移动端图鉴可键盘/触摸浏览。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/unlocks
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
