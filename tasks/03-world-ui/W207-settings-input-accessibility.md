---
id: W207
title: 实现设置、输入映射与无障碍基础
phase: ux
depends_on: [F012, F013]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现音量、梗密度、文本速度、减少动态、难度和键盘映射。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节 UX、第 11 节视口与无障碍
- `src/types/settings.ts`
- `src/systems/input/`
- `src/screens/SettingsScreen/`

## 实现范围

- 设置即时生效并保存，战斗中禁止切难度。
- Space/Enter、1–6、Tab、Esc 有冲突解析和焦点保护。
- aria-live 仅播报关键状态，避免日志刷屏。

## 验收标准

- 表单输入时快捷键不误触游戏。
- 清淡/标准/加辣不改变领域快照。
- AI 预留保持隐藏且 enabled:false/provider:none。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/input
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
