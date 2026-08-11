---
id: G115
title: 实现完整 Battle Screen
phase: gameplay-ui
depends_on: [G105, G107, G114, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

将战斗引擎接入可键盘/触摸操作的完整战斗页面。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗规则与第 11 节视口矩阵
- `src/screens/BattleScreen/`
- `src/components/battle/`
- `src/styles/`

## 实现范围

- 显示生命/内力/架势、敌方意图、6 技能槽、冷却、状态和 50 条日志上限。
- 支持 1–6 快捷键、禁用原因、阶段演出和战败原地重试。
- 组件只派发动作并渲染 selector，不重算伤害。

## 验收标准

- 桌面与 360px 手机无横向溢出，触摸目标 >=44px。
- 减少动态效果后仍可读破防、意图和命中结果。
- 战斗 E2E 覆盖胜利、失败、阶段转换。

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
