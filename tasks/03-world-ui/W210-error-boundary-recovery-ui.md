---
id: W210
title: 实现全局错误恢复面板
phase: ux
depends_on: [F010, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

捕获渲染异常并提供恢复自动档、临时档和导出数据操作。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节错误恢复与第 8 节存档
- `src/components/errors/`
- `src/systems/save/recovery.ts`
- `src/App.tsx`

## 实现范围

- Error Boundary 显示脱敏错误编号，不展示堆栈给普通玩家。
- 恢复操作先验证档案，失败不清除当前备份。
- 支持导出当前可验证数据和返回主菜单。

## 验收标准

- 故意抛错夹具不会白屏。
- 损坏临时档能回退自动档。
- 错误信息与导出不包含凭据或敏感运行数据。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
