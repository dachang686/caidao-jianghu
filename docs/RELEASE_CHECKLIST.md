# Release Checklist

## 构建前

- [x] `pnpm install --frozen-lockfile`
- [x] 不读取或提交 `.env*`、凭据、Cookie、私钥或运行日志中的敏感内容。
- [x] Core 数量与 Optional 悬空引用审计通过。
- [x] 四个结局均有静态可达性、演出引用和幂等记录检查。
- [x] `Demo`、`敬请期待`、`TODO`、占位文案与远程 URL 搜索结果已逐项处理或证明不面向玩家；源码命中仅为测试夹具/注释，发布 bundle 无玩家占位入口，外部 URL 仅为 React 内置错误帮助链接。

## 自动门禁

按以下顺序执行；任一步失败都不得继续发布：

```powershell
pnpm lint
pnpm content:validate
pnpm test
pnpm test:e2e
pnpm build
pnpm assets:audit
pnpm release:package
```

当前实现还要求：

- `pnpm build` 内置 `pnpm content:validate`，校验失败会中止 TypeScript/Vite 构建。
- 总资源包不超过 40 MiB，单个 JS/区域资源不超过 5 MiB。
- 离线包位于 `output/offline-package/caidao-jianghu/`，版本文件与 `package.json` 一致。
- Pages 入口使用 `/caidao-jianghu/`，工作流见 `.github/workflows/deploy.yml`。

## 人工门禁

- [ ] 桌面端完整黄金路径至少 3 轮，记录每章与总时长。
- [ ] 手机端关键断点检查：360×800、412×915。
- [ ] 键盘、老板键、减少动态效果、恢复面板和存档导入/导出均已操作验证。
- [ ] 首次奖励、失败重试、刷新恢复和结局重复记录没有重复发放。

人工计时不得用 Playwright 点击耗时、模拟器耗时或自动估算代替。若没有真人记录，本清单的人工时长项保持未完成，最终验收标记为 `blocked`。

## 最近一次已执行结果

以下结果是本工作区本轮实际命令结果，Node 的 ExperimentalWarning 不影响退出码：

- `pnpm lint`：通过。
- `pnpm content:validate`：通过，8 个章节。
- Optional/Core validator 定向测试：通过，14 tests。
- `pnpm build`：通过，323 modules transformed；仅有非阻断的 Vite 分包提示。
- `pnpm assets:audit`：通过，总包 4.75 MiB、最大 JS 0.68 MiB、最大区域资源 0.30 MiB、58 文件。
- `pnpm release:package`：通过，已生成 `output/offline-package`。
- 受最后技能树/委托修订影响的浏览器回归：桌面端与移动端 4/4 通过；此前全量 E2E 为 63 passed、1 个既有移动矩阵 skip。
- 真人记录工具自检：`pnpm playtest:timer -- --help` 通过；尚未生成真人数据文件，因此人工门禁仍保持未完成。

## 失败处理

保留失败命令、首个可复现错误、对应任务 ID 和修复后的重跑命令。不得通过跳过浏览器项目、降低断言或放宽预算来消除失败。
