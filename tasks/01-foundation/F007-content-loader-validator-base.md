---
id: F007
title: 建立内容加载器与基础校验 CLI
phase: foundation
depends_on: [F003, F004]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立章节内容加载入口和 `pnpm content:validate` 基础脚本。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节 ContentManifest、第 9 节构建期内容校验
- `src/content/loader.ts`
- `src/validators/content/`
- `scripts/content-validate.*`
- `package.json`

## 实现范围

- 校验重复 ID、缺失基础引用、非法数值和 Manifest 版本。
- 加载器支持当前章节同步入口与未来章节动态 import 契约。
- CLI 以非零退出码报告结构化错误，输出文件/路径/ID。

## 验收标准

- 故意加入重复 ID 的夹具会使命令失败。
- 当前 Demo 内容可转换为最小 Manifest 夹具并通过。
- 构建脚本可以在 CI 中无交互运行。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- 新增小愚村章节内容夹具、同步加载与动态 import 注册契约，以及重复 ID/缺失引用/非法值/Manifest 版本校验器。
- 新增 `pnpm content:validate` 无交互 CLI；`--fixture=duplicate` 会输出结构化错误并返回非零退出码。
- 验证结果：`pnpm lint`、`pnpm content:validate`、`pnpm test`、`pnpm build` 均通过。
