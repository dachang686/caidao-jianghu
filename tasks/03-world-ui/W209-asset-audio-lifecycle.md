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
