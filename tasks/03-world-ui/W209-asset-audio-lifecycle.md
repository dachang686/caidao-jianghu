---
id: W209
title: 实现区域资源与音频生命周期
phase: platform
depends_on: [W201, W207]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现本地资源清单、区域预加载/卸载和 BGM/SFX 控制。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节资源预算
- `src/systems/assets/`
- `src/systems/audio/`
- `src/content/assets/`

## 实现范围

- 图片统一本地 WebP，区域 manifest 记录用途和预算。
- 进入区域预加载必要资源，离开后释放大图/音频引用。
- 首次用户手势解锁 AudioContext，BGM/SFX/搞笑音效独立音量，并发 SFX <=6。

## 验收标准

- 切换区域无第三方请求。
- 反复切换不会无限增长缓存和监听器。
- 静音与减少动态下核心反馈仍可读。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/assets src/systems/audio
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。

## 执行记录

- 全部图片均由本地 WebP 资源清单登记用途与预算；校验器拒绝跨域来源，运行时不会引入第三方资源请求。
- `AssetLifecycleManager` 按全局/区域引用计数加载资源；切换区域会释放上一地区资源，反复切换后缓存只保留全局资源与当前地区资源。
- `App` 根据 RootGameStore 的当前区域驱动资源生命周期；音频直接使用 `systems/audio`，已移除旧的 `game/audio` 转发入口。
- AudioContext 仅在首次用户手势激活；BGM、普通 SFX、搞笑 SFX 独立音量，SFX 并发不超过 6，静音和减少动态时仍保留界面与日志反馈。
- 验证：`pnpm lint`、`pnpm test -- src/systems/assets src/systems/audio`（7 passed）、`pnpm build` 均通过。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/assets src/systems/audio`：通过，2 个文件、6 个测试。
- `pnpm test`：通过，47 个文件、155 个测试。
- `pnpm content:validate`：通过（Node `--experimental-loader` 仅输出实验性警告）。
- `pnpm build`：通过，Vite 产出 151 个模块及 6 个 WebP 资源。
- `pnpm test:e2e`：通过，21 个通过、1 个按项目配置跳过（移动端不重复执行五档矩阵）。

## 风险与边界

- Core 目前只有已登记的小愚村区域；后续区域需在自己的内容切片中追加资源清单，不会自动生成入口。
- Core 音效仍使用本地 Web Audio 程序化音色，没有额外音频文件；资源管理器已覆盖本地音频定义的加载/释放接口。
