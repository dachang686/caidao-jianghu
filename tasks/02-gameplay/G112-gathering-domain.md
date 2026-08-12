---
id: G112
title: 实现场景采集与节点刷新规则
phase: gameplay
depends_on: [G101, W205]
status: done
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

## 执行记录

- 新增 `src/types/gathering.ts` 与 `src/systems/gathering/`，定义按地点/章节开放、一次性标记、有效战斗场次刷新和采集结果状态。
- 采集使用既有 `addItem` 背包接口；多材料扣发在领域动作内保持原子性，背包满时返回可恢复 `inventory_full`，不标记节点、不吞材料。
- 监听并去重有效 `battle.completed` 事件；失败、逃跑、重试、模拟和重复事件不会推进采集场次，未使用现实时间或隐藏体力。
- 新增小愚村 1 个一次性草药点与 1 个按两场有效战斗刷新的铁屑点，并将节点/材料引用接入内容校验。

## 验证记录

- `pnpm lint` ✅
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm test -- src/systems/gathering` ✅（4 个测试）
- `pnpm build` ✅

## 风险与边界

- 当前采集内容只覆盖已登记的小愚村；后续章节的采集点由对应章节任务配置，不提前生成占位节点。
