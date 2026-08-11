---
id: G107
title: 配置 16 个 Core 主动技能
phase: gameplay
depends_on: [G106, G104]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

为四系各实现 4 个有独立战术用途的 Core 主动技能。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core 与第 4 节四系武学
- `src/content/skills/dao.ts`
- `src/content/skills/mouth.ts`
- `src/content/skills/survival.ts`
- `src/content/skills/misc.ts`

## 实现范围

- 包含菜刀乱舞、嘴遁、装死、铁头功等规则幽默模块。
- 每个技能提供效果预览、AI 限制、状态说明和安全阀。
- 避免仅改名称的同公式技能；每系至少覆盖输出/防御/控制或资源之一。

## 验收标准

- 16 个技能均可装配和结算。
- 预览值与实际固定 RNG 结果一致。
- 不存在无限内力、无限回合或自伤致死组合。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/skills src/systems/combat
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
