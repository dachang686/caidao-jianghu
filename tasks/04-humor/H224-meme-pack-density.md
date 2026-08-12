---
id: H224
title: 实现 memePack、三档密度与本地文案调度
phase: humor
depends_on: [F013, F014, W207]
status: done
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

## 执行记录

- 新增 `src/types/meme.ts`、`src/content/memes/` 和 `src/systems/comedy/MemeDirector.ts`，以冷却组、语境标签、最小密度和固定 seed 选择补充梗文案；同池轮换前不会重复，重复事件可诊断。
- Core memePack 当前包含 10 条世界观转译文案，其中 4 条声明现代映射，validator 检查现代映射比例、敏感语境、重复 ID、空字段和缺失冷却组。
- `LocalTextProvider` 接入可注入 memePack，foundation runtime 使用 Core pack；输出仍经纯文本清洗和长度限制，未增加远程请求或 AI 入口。
- Settings 的 `memeDensity` 与 Provider 使用同一 `mild/standard/spicy` 语义；选择密度只生成补充文案，不修改任务、奖励、战斗和 RNG 领域状态。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/comedy src/systems/providers` ✅（5 个测试文件，18 个测试）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm build` ✅（146 个模块）

## 风险与边界

- 当前 memePack 只覆盖已存在的 Core Demo 触发事件；后续章节需通过同一内容/validator 接口追加，不在本任务提前扩展 Optional 梗库。
- Provider 目前只返回本地模板与 memePack 文案，未实现远程增强；重复事件不会替换调用方已经显示的文本。
