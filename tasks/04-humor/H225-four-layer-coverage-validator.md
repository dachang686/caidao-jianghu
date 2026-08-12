---
id: H225
title: 实现四层幽默覆盖与安全校验
phase: humor
depends_on: [H221, H222, H223, H224]
status: done
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

## 执行记录

- 新增 `src/types/comedy-coverage.ts`，统一声明 rule、situation、interaction、presentation 四层覆盖条目及 Core 最低量。
- 新增 `src/validators/content/comedy.ts`，校验每章四层覆盖、冷却组、首次/重复/reducedMotion cue、1200ms 演出上限、关键物品与永久减益安全规则、同一触发事件的多个 major，以及可定位的 Core 数量/Boss cue 门禁。
- Optional 条目默认不参与覆盖与 Core 计数；`enforceCoreMinimums` 严格模式用于发布门禁，当前章节内容校验保持数据边界，不提前生成后续章节内容。
- 接入 `scripts/content-validate.ts`，补充第 1 章覆盖数据和 rule 模块，并为每类缺陷增加独立失败夹具。

## 验证结果

- `pnpm lint`：通过。
- `pnpm test -- src/validators`：通过，2 个文件、10 个测试。
- `pnpm content:validate`：通过（1 chapter）；Node `--experimental-loader` 仅输出 ExperimentalWarning。
- `pnpm build`：通过，Vite 转换 163 个模块。

## 边界与风险

- 当前仓库只累计到第 1 章，默认 `content:validate` 验证本章四层与安全约束；8/12/10/8 及 8 个 Boss cue 的严格模式已用完整合成夹具验证，待后续章节内容累计后由发布门禁开启。此处不伪造后续内容数量。
