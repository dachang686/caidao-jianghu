---
id: H224
title: 实现 memePack、三档密度与本地文案调度
phase: humor
depends_on: [F013, F014, W207]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现清淡/标准/加辣密度、冷却、去重和世界观语境标签。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节内容原则与触发审查
- `src/types/meme.ts`
- `src/content/memes/`
- `src/systems/comedy/MemeDirector.ts`

## 实现范围

- 现代映射目标约 40%，纯江湖幽默为多数。
- 密度只影响后续补充文案/可选反应，不改变数值。
- 同池轮完前不重复，切换密度不替换已显示文本。

## 验收标准

- 三档同 seed 领域快照一致。
- 敏感语境和缺失冷却组进入 validator 报告。
- 所有输出经 LocalTextProvider 纯文本返回。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/comedy src/systems/providers
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
