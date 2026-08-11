---
id: W201
title: 实现世界地图、地点状态与区域懒加载
phase: world
depends_on: [F015]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

建立 8 区域可扩展的世界/地点导航和按区域动态加载契约。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节区域结构、第 7 节 ScreenId 与资源预算
- `src/types/world.ts`
- `src/systems/world/`
- `src/screens/WorldMapScreen/`
- `src/screens/LocationScreen/`

## 实现范围

- 定义区域解锁、当前地点、入口条件与返回路径。
- ContentManifest 按区域动态 import，失败返回可恢复错误。
- 当前先接小愚村，不生成其余区域占位按钮。

## 验收标准

- 锁定地点不可进入且原因可读。
- 页面刷新能从存档恢复当前合法地点。
- 未加载区域资源不进入首屏 chunk。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/world
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。
