---
id: W205
title: 实现场景热点与探索交互
phase: world
depends_on: [W201, F005, F006]
status: done
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

## 执行记录

- 新增 `src/types/hotspot.ts` 和 `HotspotId`，定义地点归属、桌面/移动端归一化布局、键盘顺序、条件、Effect 与 once/repeat 模式。
- 新增纯领域 `src/systems/exploration/`：条件锁定由引擎计算并提供可读原因；一次性动作、稳定 actionId、Effect `grantKey`、重复事件和探索快照均保持幂等；引擎不依赖 React/Zustand。
- 新增 `src/components/world/Hotspot.tsx`，命中层与场景视觉解耦，使用独立按钮、键盘顺序、ARIA 锁定说明和不小于 44px 的触摸区域；内容可为移动端提供 reflow 坐标。
- 新增第 1 章小愚村热点配置，并把热点引用接入章节内容校验；水井一次性经验奖励和重复 NPC/擂台动作均有稳定规则。
- 内容校验脚本使用显式模块入口，兼容浏览器构建和 Node 内容校验加载器。

## 验证记录

- `pnpm lint` ✅
- `pnpm test -- src/systems/exploration` ✅（4 个测试）
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）
- `pnpm test` ✅（36 个文件，113 个测试）
- `pnpm test:e2e` ✅（8 个桌面/移动场景）
- `pnpm build` ✅

## 风险与边界

- 现有旧版 `JianghuScreen` 仍由旧 Zustand 演示流程承载；本任务提供新世界地点可直接消费的热点领域契约和命中组件，完整 ScreenShell/章节集成由后续世界与章节任务接入。
