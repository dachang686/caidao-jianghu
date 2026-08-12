# 菜刀闯江湖

一个本地优先、无远程依赖的诙谐武侠小游戏。发布站点与离线包统一使用 `/caidao-jianghu/` 作为访问路径。

## 本地开发

```powershell
pnpm install
pnpm dev
```

开发服务器启动后打开 `http://127.0.0.1:5173/caidao-jianghu/`。

## 验证与构建

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
pnpm assets:audit
pnpm release:package
```

`pnpm build` 会先执行内容校验；构建产物只引用本地资源。`pnpm release:package` 会生成 `output/offline-package/caidao-jianghu/`，可用任意静态文件服务器提供服务：

```powershell
Set-Location output/offline-package
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/caidao-jianghu/`。离线包不需要 API、账号、CDN、远程 AI 或第三方网络请求。

## 发布入口

GitHub Pages 工作流位于 `.github/workflows/deploy.yml`，按 lint → 内容校验 → 单测 → E2E → build → 资源审计 → 离线打包顺序执行。发布前清单见 [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)。

## 计时与验收

自动战斗/进度报告只用于固定种子回归，不代表真人游玩时长。三轮真人黄金路径记录见 [docs/PLAYTEST_REPORT.md](docs/PLAYTEST_REPORT.md)；没有真实记录的项目必须保持 `blocked`，不能用自动点击耗时替代。
