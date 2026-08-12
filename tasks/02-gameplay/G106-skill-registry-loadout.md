---
id: G106
title: 实现武学注册表、技能点与六槽配置
phase: gameplay
depends_on: [G103, F007]
status: done
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

## 执行记录

- 基线：已有旧 Demo 技能表与战斗技能类型，但没有声明式注册表、技能点或六槽领域模块。
- 实现：新增 `src/types/skill.ts`、`src/systems/skills/registry.ts`、`src/systems/skills/loadout.ts`；内容校验支持未知前置与前置循环诊断，重置只允许在非战斗状态执行并清空非法装配。
- 验证：`pnpm lint`、`pnpm content:validate`、`pnpm test -- src/systems/skills`（3 tests）、内容校验测试（3 tests）、`pnpm build` 均通过。
- 备注：构建仍提示 `ch01.ts` 同时被静态和动态导入的既有 Vite 分包警告，不影响构建结果。
