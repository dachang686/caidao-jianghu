---
id: W209
title: 实现区域资源与音频生命周期
phase: platform
depends_on: [W201, W207]
status: pending
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

- 新增 `src/types/assets.ts` 与 `src/content/assets/core.ts`：登记 6 个 Core 本地 WebP、用途、源文件大小、单资源预算、全局资源和小愚村区域资源预算；ContentManifest 同时登记资源入口与地点引用。
- 新增 `src/systems/assets/`：校验同源/随包资源、拒绝跨域资源，按全局与区域 scope 做引用计数，进入区域预加载，切换/离开/销毁时释放 Image、Audio 引用；重复进入不会重复加载。
- 新增 `src/systems/audio/` 并保留 `src/game/audio.ts` 兼容出口：首次用户手势激活 AudioContext，BGM、普通 SFX、搞笑 SFX 使用独立音量，振荡器引用有生命周期回收，SFX 实际并发上限为 6；无 AudioContext 时静默降级，减少动态效果不削弱日志和状态反馈。
- 将资源服务接入 Foundation/StoreServices/App 应用壳，不把资源判断复制到 Screen；新增设置中的“搞笑音效”音量，并为 V1/V2 存档提供默认迁移值。
- 修正了 Vite 开发态同源资源 URL 被误判为远程的问题；跨域 URL 仍由校验器拒绝。

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
