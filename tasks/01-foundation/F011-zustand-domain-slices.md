---
id: F011
title: 拆分 Zustand 领域 slices
phase: foundation
depends_on: [F005, F006, F008]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

把单体 store 拆为 player/quest/battle/world/settings 等 slice，同时保持外部行为兼容。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“目录与文件职责”
- `src/stores/`
- `src/game/store.ts`
- `src/game/store.test.ts`

## 实现范围

- 定义 RootGameStore 组合入口与领域动作边界。
- 先通过兼容适配层保留现有 UI 调用，禁止一次性重写全部 App。
- Provider、EventBus 和存档仓库通过初始化注入，不写入可序列化 state。

## 验收标准

- 现有 store 特征测试无回归。
- slice 之间只能经根动作或事件协作，不能互相导入并直接突变。
- 旧 store 文件只保留明确兼容出口。

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

## 执行记录

- 新增 `RootGameStore` 兼容根入口及 player/quest/battle/world/settings/shell slice 类型边界，App 已切换到 `src/stores` 公开入口。
- EventBus、SaveRepository、TextProvider 通过独立服务注入容器管理，不写入 Zustand 状态；旧 `src/game/store` 保留为现有 Demo 的兼容实现。
- 验证结果：`pnpm lint`、`pnpm test`、`pnpm build` 均通过。
