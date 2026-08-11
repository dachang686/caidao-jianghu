---
id: H225
title: 实现四层幽默覆盖与安全校验
phase: humor
depends_on: [H221, H222, H223, H224]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

扩展 content validator，强制每章四层覆盖和 Core 总量。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节触发审查与第 9 节校验
- `src/validators/content/comedy.ts`
- `src/validators/content/*.test.ts`

## 实现范围

- 检查每章 rule/situation/interaction/presentation 至少各一。
- 检查总量 8/12/10/8 Boss cues、冷却、首次/重复、reducedMotion。
- 拒绝关键物品删除、永久减益、超时演出和多个 major cue。

## 验收标准

- 每一类缺陷都有独立失败夹具和可定位路径。
- Optional 关闭不会被计入 Core 门槛。
- 校验只分析数据，不执行浏览器动画。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/validators
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
