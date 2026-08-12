---
id: Q407
title: 完成五视口与无障碍验收
phase: qa
depends_on: [Q404, W208, W207]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

逐页验证五档视口、键盘、焦点、aria-live 和减少动态效果。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 11 节视口矩阵
- `e2e/responsive-accessibility.spec.ts`
- `src/styles/`
- `src/components/`

## 实现范围

- 覆盖所有 ScreenId，不只菜单和地点。
- 检测横向溢出、遮挡、触摸目标和焦点陷阱。
- 修复范围仅限可复现问题，不顺带重设计视觉。

## 验收标准

- 360x800 到 1920x1080 全部核心页面可用。
- 全键盘可完成主流程，焦点样式可见。
- 减少动态/静音下战斗和幽默信息不丢。

## 验证命令

```powershell
pnpm lint
pnpm test:e2e -- e2e/responsive-accessibility.spec.ts
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 建立五档视口、触摸目标、键盘焦点、老板键、减少动态效果和底部操作区覆盖；对顶部工具与老板键补齐至少 44px 操作目标。

## 验证记录

- 响应式/无障碍 E2E 桌面端与移动端均通过五档视口检查；全量 E2E 保留项目原有的 1 个移动矩阵 skip 并单独报告。
