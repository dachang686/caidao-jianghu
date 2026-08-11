---
id: F003
title: 定义领域 ID、核心类型与 ContentManifest
phase: foundation
depends_on: [F002]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立类型安全的品牌化 ID、ContentManifest 与章节/地点/NPC/任务基础定义。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“声明式内容模型”
- `src/types/ids.ts`
- `src/types/content.ts`
- `src/content/manifest.ts`

## 实现范围

- 定义 Chapter/Location/Npc/Quest/Dialogue/Enemy/Item/Skill 等 ID 与最小公共类型。
- 定义 `ContentManifest` 的版本、章节索引和资源入口，不加入未使用字段。
- 提供构造测试夹具的 helper，避免测试散落类型断言。

## 验收标准

- 错误类型 ID 不能在 TypeScript 中静默混用。
- Manifest 能描述当前小愚村内容且不要求后续章节文件已存在。
- 不复制现有运行状态类型到第二套冲突定义。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
