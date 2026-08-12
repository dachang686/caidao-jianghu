---
id: W201
title: 实现世界地图、地点状态与区域懒加载
phase: world
depends_on: [F015]
status: done
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

## 执行记录

- 将 `WorldMapScreen`、`LocationScreen` 接入 `ScreenShell`；RootGameStore 成为区域解锁、进入、重试、返回地图和回到当前章节的唯一入口。
- 区域内容经 `WorldRegionLoader` 按需导入。生产构建产出独立 `ch01` 至 `ch08` chunk，未加载章节不在初始 JavaScript chunk。
- V2 存档保存 `worldNavigation` 及地点 UI 状态；刷新后重新校验导航并异步恢复合法地点。锁定区域按钮不可进入且显示解锁原因。
- 验证：`pnpm lint`、`pnpm test -- src/stores/root-store.test.ts src/systems/world`（22 passed）、`pnpm test:e2e -- e2e/game-flow.spec.ts`（23 passed / 1 skipped）、`pnpm build` 均通过。
