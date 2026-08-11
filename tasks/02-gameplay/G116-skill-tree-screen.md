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
