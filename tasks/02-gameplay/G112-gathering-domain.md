---
id: G112
title: 实现场景采集与节点刷新规则
phase: gameplay
depends_on: [G101, W205]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现无体力、无真实时间依赖的采集节点与章节进度刷新。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节采集规则
- `src/types/gathering.ts`
- `src/systems/gathering/`
- `src/content/gathering/`

## 实现范围

- 节点按位置、章节/战斗 tick 和一次性标记配置。
- 采集走领域事件和背包接口。
- 禁止现实倒计时、登录奖励和隐藏体力。

## 验收标准

- 刷新页面不重复领取一次性节点。
- 可重复节点只按明确游戏事件恢复。
- 背包满时不丢材料且提示可恢复。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/gathering
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
