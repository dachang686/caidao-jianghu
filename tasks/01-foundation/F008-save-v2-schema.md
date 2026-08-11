---
id: F008
title: 定义 GameSaveV2 与运行状态边界
phase: foundation
depends_on: [F003]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

用 Zod 定义 GameSaveV2、设置、内容版本和 RNG 状态的可验证 schema。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节“GameSaveV2”
- `src/types/save.ts`
- `src/systems/save/schema.ts`
- `src/systems/save/schema.test.ts`

## 实现范围

- 区分权威游戏状态、UI 临时状态和不可序列化服务。
- 包含章节/任务/物品/武学/门派/结局/RNG/schema/content 版本。
- AI 设置仅保存 enabled:false/provider:none，不允许凭据字段。

## 验收标准

- 有效最小档、完整档、缺字段档和非法档都有测试。
- Battle 中间态、对话中间态、Provider/事件订阅不会进入存档。
- schema 错误包含字段路径。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/save/schema.test.ts
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
