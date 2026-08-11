---
id: T000
title: 任务标题
phase: phase-name
depends_on: []
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

用一句话描述唯一目标。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md` 的相关章节
- 现有相关源码与测试

## 实现范围

- 明确要新增或修改的能力。
- 明确数据、接口与调用边界。

## 验收标准

- 可观察、可重复验证的结果。
- 失败和边缘条件也必须列出。

## 验证命令

```powershell
pnpm lint
pnpm test
```

## 禁止事项

- 不提前实现依赖本任务的后续功能。
- 不扩大到未列出的系统或内容。
- 不用占位、远程资源或静默 fallback 伪装完成。
