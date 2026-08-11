---
id: G106
title: 实现武学注册表、技能点与六槽配置
phase: gameplay
depends_on: [G103, F007]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现数据驱动技能定义、解锁、升级、六槽装配和免费重置。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗与成长
- `src/types/skill.ts`
- `src/content/skills/`
- `src/systems/skills/`

## 实现范围

- 技能定义含系别、消耗、冷却、目标、效果和预览。
- 最高 30 级每级一点；非战斗免费重置且点数不丢。
- 装配验证重复、未解锁和槽位上限。

## 验收标准

- React 不包含技能效果分支。
- 重置后所有已花点返还，装配自动移除未解锁技能。
- 内容校验能发现循环前置与未知技能。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/skills
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。
