---
id: F002
title: 建立模块目录骨架与导入边界
phase: foundation
depends_on: [F001]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立 screens/components/systems/content/stores/types/validators 目录与公开入口，不迁移业务行为。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“目录与文件职责”
- `src/screens/`
- `src/components/`
- `src/systems/`
- `src/content/`
- `src/stores/`
- `src/types/`
- `src/validators/`

## 实现范围

- 为每层建立最小 `index.ts` 或明确入口，避免循环导入。
- 写出依赖方向注释或轻量测试：screen 可依赖 system/store，domain system 不依赖 React。
- 不移动现有 App/store；后续任务逐步迁移。

## 验收标准

- TypeScript 可解析所有新入口且无循环运行时初始化。
- 现有 Demo 行为和产物不变。

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
