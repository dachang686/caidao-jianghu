---
id: F013
title: 实现 LocalTextProvider 统一文本出口
phase: foundation
depends_on: [F003, F006]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现离线 TextProvider、本地旁白池与模板回退，不加入远程 AI。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“AI 增强预留接口”
- `src/types/text-provider.ts`
- `src/systems/providers/LocalTextProvider.ts`
- `src/systems/providers/*.test.ts`

## 实现范围

- 实现 NarrationContext、DialogueCopyPatch、TextGenContext 与 TextResult。
- 旁白、战报、委托/门人模板等返回同步本地结果并带 requestId/source。
- 上下文仅使用白名单快照；输出纯文本、长度受限且非空。

## 验收标准

- 无网络、超长输入和未知模板类型都有确定本地结果。
- 代码、存档、设置与日志中不存在 apiKey/secret 字段。
- 不创建 AITextProvider、模型选择器或灰色占位开关。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/providers
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。
