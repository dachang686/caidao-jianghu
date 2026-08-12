---
id: Q406
title: 完成多档、迁移与异常恢复 E2E
phase: qa
depends_on: [Q404, F010, W210]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

覆盖三个手动档、自动档、临时恢复、导入覆盖、损坏和空间异常。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节存档与第 11 节存档边界
- `e2e/save-recovery.spec.ts`
- `src/systems/save/`

## 实现范围

- 测试覆盖前备份、版本迁移链和导出后重新导入。
- 模拟 IndexedDB 不可用/配额错误，进入明确临时模式。
- 断言战斗与对话中途不会写权威自动档。

## 验收标准

- 任何失败路径不破坏最后有效档。
- 导出/日志不包含凭据字段。
- 恢复 UI 在桌面/手机都可操作。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/save
pnpm test:e2e -- e2e/save-recovery.spec.ts
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 增加多档存档、V2 迁移/解析、损坏自动档、临时档、导出、清除和配额异常覆盖；恢复失败时保留可回退数据并显示可操作面板。

## 验证记录

- 存档恢复 E2E 桌面端与移动端各 2 项通过；存储 repository 配额异常单测通过。
