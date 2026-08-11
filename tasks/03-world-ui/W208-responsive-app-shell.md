---
id: W208
title: 完成五档视口响应式应用壳
phase: ux
depends_on: [F012, W201, W207]
status: pending
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
