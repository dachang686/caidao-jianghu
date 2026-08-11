---
id: C331
title: 第4章 青云山：场景、NPC 与素材
phase: chapter-content
depends_on: [C323, W201, W204, W205, W209]
status: pending
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
