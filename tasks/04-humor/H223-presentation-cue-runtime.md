---
id: H223
title: 实现喜剧演出节拍运行时
phase: humor
depends_on: [F014, G115, W207, W209]
status: pending
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
