---
id: H223
title: 实现喜剧演出节拍运行时
phase: humor
depends_on: [F014, G115, W207, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现铺垫/动作/停顿/反应序列、短版和减少动态替代。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节“第四层：演出幽默”
- `src/types/comedy.ts`
- `src/systems/comedy/presentation.ts`
- `src/components/comedy/`

## 实现范围

- 领域结算先完成，cue 只表现结果。
- 单次阻塞 <=1200ms，可取消且重复时降级短版。
- 静音/减少动态使用静态 cue，不改变状态。

## 验收标准

- 跳过、卸载组件和页面切换会清理计时器。
- 同动作最多一个 major cue。
- 假结算不伪造系统、支付或存档错误。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/comedy
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。

## 执行记录

- 新增 `PresentationCueRuntime` 与定义校验：阶段按铺垫、动作、停顿、反应顺序推进，单次总时长上限 1200ms；`skip`、`cancel`、`dispose` 均清理计时器。
- 同一 `actionId` 只允许一次完整 major cue，重复请求降级为 `shortCueId`；静音或减少动态直接返回 `reducedMotionCueId`，不启动计时器，也不执行领域 Effect。
- 新增 `PresentationCue` 展示组件，提供可读阶段状态和 44px 跳过按钮；战斗胜利页仅在领域状态已经结算为 `victory` 后挂载演出，未伪造支付、存档或系统故障。
- 新增 Core 胜利/失败演出 cue 定义，内容校验纳入演出阶段、时长和 ID 检查；组件使用产品 register 的克制信息层级、静态反馈和减少动态约束。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/comedy`：通过，6 个文件、20 个测试。
- `pnpm test:e2e`：通过，21 个通过、1 个按项目配置跳过；新增胜利演出跳过与结算不变断言。
- `pnpm build`：通过，Vite 产出 160 个模块。

## 风险与边界

- 当前 Core UI 在战斗胜利路径接入一个实际演出 cue；更完整的四层 cue 覆盖、跨场景注册审计和演出清单治理由后续 H225 处理，运行时本身已保持可注入。
