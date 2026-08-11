---
id: F009
title: 实现多档位存储与安全导入导出
phase: foundation
depends_on: [F008]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现三个手动档、自动档、覆盖前备份和 JSON 导入导出。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节“GameSaveV2”
- `src/systems/save/repository.ts`
- `src/systems/save/import-export.ts`
- `src/systems/save/*.test.ts`

## 实现范围

- 封装 IndexedDB，不让 screen 直接操作数据库。
- 导入先做 schema/内容版本/校验和检查，失败不覆盖当前档。
- 覆盖前保存最近一份备份；导出排除凭据和运行时服务。

## 验收标准

- 档位互不污染，列表能返回摘要而非加载全部大状态。
- 损坏 JSON、版本不符、空间异常均返回可展示错误。
- 导入失败后原档字节与摘要不变。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/save
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
