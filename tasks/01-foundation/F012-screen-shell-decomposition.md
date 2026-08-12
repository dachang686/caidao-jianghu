---
id: F012
title: 拆分 Screen 壳与 App 调度
phase: foundation
depends_on: [F011]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

将 App.tsx 拆为 Screen 状态机和独立页面容器，不改变现有视觉与流程。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节 ScreenId 与目录职责
- `src/App.tsx`
- `src/screens/`
- `src/components/`

## 实现范围

- 建立 menu/creation/worldMap/location/battle 等 ScreenId 调度壳。
- 抽出对话层、状态表、技能栏等现有组件，领域动作仍由 store 提供。
- 不引入 React Router；Pages 子路径刷新行为保持。

## 验收标准

- App.tsx 只承担组合与全局覆盖层，不再包含完整页面实现。
- 现有桌面/移动 E2E 通过且截图无结构性退化。
- 键盘焦点和老板键入口仍存在。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- `App.tsx` 已缩减为全局存档/音频/老板键副作用与 `ScreenShell` 调度；Menu、Creation、Jianghu、Battle 页面和 Overlay/BossKey 已分别落位。
- 未引入 React Router，仍使用 Zustand 内部 ScreenId；对话、状态表、技能栏和既有语义化热点行为保持不变。
- 验证结果：`pnpm lint`、`pnpm test`、`pnpm test:e2e`、`pnpm build` 均通过。
