---
id: W206
title: 实现图鉴、称号与基础成就框架
phase: world
depends_on: [F004, F006, W204, G106, G109]
status: done
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

## 执行记录

- 新增 `src/types/unlockable.ts` 与 `src/systems/unlocks/`，统一 NPC、敌人、技能、称号和成就的事件匹配、条件检查、幂等事件去重、可保存快照、内容删除诊断和安全线索视图。
- 称号奖励通过 `calculateTitleBonuses`/`deriveTitleCombatStats` 从基础战斗属性派生；重复标题 ID 不会累加，Demo 旧存档和新事件均通过同一快照承载。
- 新增 `src/content/unlockables.ts` 的当前 Core 图鉴目录，并接入 `content:validate`；未解锁条目只显示轮廓、通用名称和线索，没有隐藏结局文案。
- V1/V2 存档均增加向后兼容的 `unlockables` 快照；旧存档缺字段时由 schema 初始化空快照，已删除内容通过 `getDiagnostics()` 报告。
- 新增 `src/screens/CodexScreen/` 并替换旧面板，提供五类分类、触摸安全按钮、ARIA tab/listbox、键盘聚焦/Enter 浏览和移动端重排。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/unlocks` ✅（1 个测试文件，4 个测试）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm test` ✅（43 个文件，139 个测试）
- `pnpm test:e2e -- --project=mobile --grep "图鉴|创角后可以完成老头教学|江湖页会在宽屏与手机视口"` ✅（3 个移动端场景）
- `pnpm build` ✅（140 个模块）

## 风险与边界

- 当前图鉴目录只覆盖 Demo 已存在的 Core 人物、敌手、技能、称号和基础成就；后续章节内容需追加内容定义与事件，不在本任务提前实现。
- 旧版 Demo 状态仍作为兼容 UI 入口，但解锁状态已经独立存档并通过统一解锁引擎派生，后续 Screen 可直接消费 V2 快照。
