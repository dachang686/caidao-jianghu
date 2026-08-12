---
id: C321
title: 第3章 黑风寨：场景、NPC 与素材
phase: chapter-content
depends_on: [C313, W201, W204, W205, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立第3章“黑风寨”的可进入场景、状态化 NPC、探索热点和全部本地素材；本任务不编写完整任务线或 Boss 逻辑。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节主线结构、第 8 节资源预算
- `src/content/chapters/ch03/`（若存在）与前一章内容模式

## 实现范围

- 生成山寨场景、至少 3 名 NPC 与黑风寨主/普通敌人本地 WebP。
- 所有新图遵循水墨 Q 版、无文字/无 UI/无水印；优先 WebP，单区域新增资源总量 <=5MB。
- 定义区域/地点、至少 3 个有状态 NPC（第 7–8 章至少 4 个）、至少 1 个采集点和安全返回路径。
- 设置章节入口条件、场景热点、NPC 初始状态和资产 manifest；文字全部由 DOM 渲染。
- 若执行环境没有图像生成能力，标记本任务 blocked；不得使用远程 URL、重复其他区域背景或占位色块。

## 验收标准

- 区域仅在上一章完成后解锁，刷新能恢复合法位置。
- 桌面 cover 与手机重排下热点命中正确、无固定透明画框。
- 资产预算、缺失引用和未使用大图通过 content validator。
- 场景可浏览但不会出现未完成任务/Boss 的占位入口。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/world src/systems/exploration
pnpm build
```

## 禁止事项

- 不在图片中烘焙中文文字。
- 不提前实现本章任务、Boss 或下一章内容。
- 不用外链素材或“稍后补图”占位。

## 执行记录

- 已用 ImageGen 生成黑风寨场景背景、曹掌柜/小顺/胡大勺三个 NPC、山寨巡哨普通敌人和黑风寨主本地素材，并转为 `src/assets/**/*.webp`；素材不含文字、UI 或水印，黑风寨区域资源合计约 359KB。
- 已新增 `blackwind-fortress` 区域及山寨门、灶房、瞭望台三个地点；入口由 `ch02_mainline_complete` 条件锁定，灶房和瞭望台均有返回山寨门的安全路径。
- 已接入 3 个带关系边界/互动效果的状态化 NPC、5 个桌面/移动热点和 1 个可刷新采集点；任务与敌人字段保持为空/未声明，未提前生成 Boss 入口。
- 已更新动态/同步章节加载器、内容 manifest、区域资源预算和采集物目录，并补充 C321 世界导航与热点测试。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过，3 个章节；Node loader 输出 ExperimentalWarning，不影响退出码。
- `pnpm test -- src/systems/world src/systems/exploration --reporter=dot`：通过，7 个测试文件、20/20 测试通过。
- `pnpm build`：通过，Vite 转换 187 个模块，黑风寨章节 chunk 与全部新增 WebP 均进入构建产物。

## 边界

- C321 只完成场景、NPC、热点、采集和本地素材；第 3 章任务/对白/情境幽默与普通敌人、Boss 行为留给 C322/C323，当前没有未完成入口。
