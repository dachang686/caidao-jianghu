---
id: C331
title: 第4章 青云山：场景、NPC 与素材
phase: chapter-content
depends_on: [C323, W201, W204, W205, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立第4章“青云山”的可进入场景、状态化 NPC、探索热点和全部本地素材；本任务不编写完整任务线或 Boss 逻辑。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节主线结构、第 8 节资源预算
- `src/content/chapters/ch04/`（若存在）与前一章内容模式

## 实现范围

- 生成青云山门场景、至少 3 名 NPC 与青云掌门/普通敌人本地 WebP。
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

- 新增青云山区域与 `qingyun-gate`、`qingyun-herb-garden`、`qingyun-bell-terrace` 三个地点；入口受 `ch03_mainline_complete` 约束，两个支地点均配置回到山门的安全路径。
- 新增林小门、苏青禾、钟小响 3 名状态化 NPC，5 个桌面/移动端归一化热点和 1 个可重复采集点「云台青蘅草」；本任务保持任务列表为空，不提前放置任务或 Boss 入口。
- 使用 imagegen skill 生成并本地化青云山门背景、3 名 NPC、普通敌人与青云掌门 WebP 素材；所有文字继续由 DOM 内容渲染。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（4 chapters；仅 Node experimental loader warning）。
- `pnpm test -- src/systems/world/ch04-content.test.ts src/systems/exploration/ch04-hotspots.test.ts src/types/content.test.ts --reporter=dot`：3 个文件、7 个测试通过。
- `pnpm build`：通过，204 modules transformed。
- 青云山区域 6 件 WebP 素材合计约 462KB，资产 manifest 与缺失引用校验通过。
