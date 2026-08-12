---
id: C311
title: 第2章 清河县：场景、NPC 与素材
phase: chapter-content
depends_on: [C303, W201, W204, W205, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立第2章“清河县”的可进入场景、状态化 NPC、探索热点和全部本地素材；本任务不编写完整任务线或 Boss 逻辑。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节主线结构、第 8 节资源预算
- `src/content/chapters/ch02/`（若存在）与前一章内容模式

## 实现范围

- 生成清河县街市背景、至少 3 名 NPC 与榜下捕快/普通敌人本地 WebP。
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

- 使用内置 `imagegen` 生成清河县街市背景与沈青禾、柳婶、陆掌柜、榜下捕快四张角色图；角色图经本地 chroma-key 后处理为带 alpha 的 WebP，最终资源均保存于 `src/assets/backgrounds/` 与 `src/assets/characters/`，图片不含中文文字、UI 或水印。
- 新增清河县区域 manifest、两处地点、四名有关系上下限和互动效果的 NPC、四个可访问热点与河岸重复采集点；街市到码头使用 `returnToLocationId` 保持安全返回，任务和 Boss 数组保持为空，未提前生成半成品入口。
- 接入 `ch02` 动态/同步章节加载、章节/区域资源入口和静态 `new URL` 资源引用，确保 Vite 离线产物实际包含新 WebP；清河县资源估算总量 701158 bytes，低于 5MB 上限和 1000000 bytes 区域预算。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（2 个章节；Node loader 仅输出实验性 warning）。
- `pnpm test -- src/systems/world src/systems/exploration`：通过，5 个文件、15 个测试。
- `pnpm build`：通过，Vite 转换 173 个模块，产物包含清河背景及 4 张角色 WebP。

## 边界与风险

- C311 只负责清河县场景、NPC、热点、采集点和素材；本章 4 个主线、2 个支线、对白、普通敌人战斗与榜下捕快 Boss 由 C312/C313 接续，当前不会出现任务或 Boss 占位入口。
