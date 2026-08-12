---
id: G116
title: 实现武学树与六槽配置页面
phase: gameplay-ui
depends_on: [G108, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现四系技能树、加点预览、免费重置和六槽装配 UI。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节技能点与第 7 节 ScreenId
- `src/screens/SkillTreeScreen/`
- `src/components/skills/`

## 实现范围

- 显示可用点、前置、效果预览和当前装配。
- 重置需确认但不消耗资源。
- 键盘和触摸均可完成加点、卸下和排序。

## 验收标准

- UI 不允许超额、循环或未解锁装配。
- 重置前后派生属性与领域测试一致。
- 移动端不依赖悬停查看说明。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 基线：F012 已有通用 OverlayPanel，但“武功”面板只展示旧 Demo 四格文本。
- 实现：新增四系技能树面板，接入 16 个 Core 技能和 G106/G108 领域动作，支持系别筛选、前置/预览/状态说明、六槽装配/卸下/前移和免费重置确认；触摸与键盘均使用可聚焦按钮，无 hover-only 信息。
- 验证：`pnpm lint`、`pnpm test`（25 files / 72 tests）、`pnpm test:e2e`（8 passed）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
