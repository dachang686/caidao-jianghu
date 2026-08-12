---
id: W208
title: 完成五档视口响应式应用壳
phase: ux
depends_on: [F012, W201, W207]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立可供所有 Screen 复用的桌面和移动布局规则。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 1 节桌面/手机同等支持与第 11 节视口矩阵
- `src/components/layout/`
- `src/styles/`
- `src/styles.css`

## 实现范围

- 断点覆盖 360x800、412x915、768x1024、1440x900、1920x1080。
- 场景背景与 UI 面板分层，避免固定画框和页面横向溢出。
- 统一 safe-area、滚动区、底部操作区和 44px 触摸目标。

## 验收标准

- 现有菜单/地点/战斗/设置在五档视口无遮挡。
- 桌面背景 cover、移动场景合理裁切或重排。
- 减少动态不改变布局尺寸。

## 验证命令

```powershell
pnpm lint
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。

## 执行记录

- 在 `src/styles.css` 增加统一响应式壳规则：safe-area 变量、`100svh` 稳定视口、滚动面板、44px 触摸目标、移动底部操作区偏移和横向溢出隔离。
- 桌面布局保持场景背景 cover 与 UI 面板分层，移动端沿用场景单列、信息面板重排和固定操作区；补齐 `LocationScreen`/`WorldMapScreen` 的可复用窄屏基础布局，不复制领域状态判断。
- 补充五档视口 E2E，覆盖菜单、江湖场景、设置滚动面板和战斗区域；增加减少动态效果前后面板尺寸不变的断言。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test:e2e`：通过（21 passed，1 skipped；新增五档视口矩阵在 desktop 执行）。
- `pnpm build`：通过（146 modules）。

## 风险与边界

- 移动端底部操作区使用固定安全区偏移，内容仍由页面滚动区承载；未引入真实时间、远程资源或后续章节入口。
- `LocationScreen` 与 `WorldMapScreen` 当前仍由上层导航按需接入，W208 只提供其共用的可视布局和触控规则。
