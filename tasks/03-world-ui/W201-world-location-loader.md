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

## 执行记录

- 基线：Manifest 只有章节索引，运行时同步读取 `ch01`，没有区域解锁、当前位置、返回栈或世界/地点页面契约；Vite 提示同一章节被静态和动态导入。
- 实现：新增区域索引、世界导航状态、条件解锁、可读锁定原因、进入/返回与非法存档回退；V2 存档保存世界导航快照；新增 WorldMap/Location 页面容器和区域加载器，失败返回可重试错误并缓存成功内容。
- 分包：同步读取隔离到仅供构建校验/旧测试使用的 `src/content/sync-loader.ts`，foundation 启动改为异步加载；构建产出独立 `ch01-*.js` chunk，去除静态/动态导入冲突警告。
- 验证：`pnpm lint`、`pnpm content:validate`、`pnpm test -- src/systems/world`、`pnpm test`（27 files / 78 tests）、`pnpm test:e2e`（8 passed，桌面/移动）、`pnpm build` 均通过。
- 风险：当前 Manifest 只登记小愚村，其他区域没有入口，符合本任务禁止提前生成占位区域的约束。
