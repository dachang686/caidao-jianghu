---
id: W207
title: 实现设置、输入映射与无障碍基础
phase: ux
depends_on: [F012, F013]
status: done
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

## 执行记录

- 新增 `src/types/settings.ts`，统一音量、梗密度、文本速度、难度、减少动态效果、按键映射和离线 AI 预留字段；V1/V2 存档 schema 为旧存档补默认值并严格保持 `enabled:false/provider:none`。
- 新增 `src/systems/input/`，提供 Space/Enter、Esc、Tab、1–6 的标准映射、冲突消解、可读按键标签和表单/编辑目标保护；战斗快捷键改用该解析器，Tab 不阻止浏览器焦点移动。
- 新增 `src/screens/SettingsScreen/`，提供即时生效的音量、开关、梗密度、文本速度、难度和改键界面；战斗中难度由 store 与界面双重锁定，设置更新不触碰领域快照。
- 音频增益接入总音量/音乐/音效音量，减少动态效果同步到 `data-reduced-motion`；战斗日志关闭实时播报，只保留回合、阶段等关键状态播报。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/input` ✅（1 个测试文件，3 个测试）
- `pnpm test` ✅（44 个文件，143 个测试）
- `pnpm test:e2e` ✅（20 个桌面/移动场景，含设置改键和表单保护相关流程）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm build` ✅（143 个模块）

## 风险与边界

- 当前 Demo 的战斗数值仍由既有战斗域决定，难度设置已完成保存、即时显示和战斗锁定，后续战斗平衡任务再消费该设置调整数值。
- AI 只保留不可编辑的离线配置字段，没有设置入口、远程调用或凭据字段。
