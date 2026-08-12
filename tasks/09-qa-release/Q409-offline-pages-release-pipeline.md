---
id: Q409
title: 完成离线包与 GitHub Pages 发布流水线
phase: release
depends_on: [Q406, Q407, Q408]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

构建同版本 Pages 产物和可下载离线网页包，并在 CI 跑全部门槛。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 1 节交付边界与第 11 节发布
- `.github/workflows/`
- `vite.config.ts`
- `scripts/package-release.*`
- `README.md`

## 实现范围

- 保持 `/caidao-jianghu/` base，所有资源使用构建 URL。
- 离线包不依赖 CDN/服务端路由；提供本地启动说明。
- CI 顺序执行 lint/content/test/e2e/build/audit，失败不部署。

## 验收标准

- 断网打开本地服务可完成加载、存档和继续。
- Pages 子路径刷新与资源均无 404。
- 产物不含源凭据、远程 AI 或第三方请求。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
pnpm assets:audit
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 接入内容校验、TypeScript/Vite 构建、静态资源审计、GitHub Pages base path、离线包复制与 CI workflow；补齐 README、发布清单和离线产物说明。

## 验证记录

- `pnpm build`、`pnpm assets:audit`、`pnpm release:package` 均通过；产物位于 `output/offline-package`。Vite 仅输出非阻断分包大小/动态导入提示。
