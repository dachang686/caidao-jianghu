---
id: W205
title: 实现场景热点与探索交互
phase: world
depends_on: [W201, F005, F006]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现视觉与点击区域解耦的 data-hotspot、条件动作和安全反馈。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节区域内容与第 6 节互动幽默
- `src/types/hotspot.ts`
- `src/systems/exploration/`
- `src/components/world/Hotspot.tsx`

## 实现范围

- 热点定义位置、可用条件、Effect 与键盘顺序。
- 视觉图层不承担命中；点击区 >=44px。
- 一次性与可重复动作由领域状态控制。

## 验收标准

- 桌面 cover 和手机 contain/reflow 下热点仍对准目标。
- 锁定热点原因可读，不靠像素搜索。
- 重复点击不会重复关键奖励。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/exploration
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
