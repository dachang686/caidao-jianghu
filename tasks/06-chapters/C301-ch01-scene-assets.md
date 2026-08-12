---
id: C301
title: 第1章 小愚村：场景、NPC 与素材
phase: chapter-content
depends_on: [F015, W201, W204, W205, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

建立第1章“小愚村”的可进入场景、状态化 NPC、探索热点和全部本地素材；本任务不编写完整任务线或 Boss 逻辑。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节主线结构、第 8 节资源预算
- `src/content/chapters/ch01/`（若存在）与前一章内容模式

## 实现范围

- 复用并登记现有小愚村、主角、老头、猫和白大侠 WebP；只补齐缺失的王大娘/第二支线必要素材，不重生成已验收资产。
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

- 复用现有小愚村 WebP 背景、主角、老头、猫和白大侠，扩展 `src/content/assets/core.ts` 的区域资源清单与地点引用；区域 7 张 WebP 总估算 846610 bytes，低于 900000 bytes 区域预算和 5MB 任务上限。
- 使用内置 `image_gen` 生成王大娘单角色立绘，采用纯色抠像后处理为 RGBA WebP：`src/assets/characters/aunt.webp`，1024×1536、105412 bytes，四角 alpha 为 0；素材无文字、UI、水印、阴影和其他 NPC。
- 将王大娘注册到小愚村区域资产、场景按钮和热点，状态气泡随找猫进度变化；保留现有 4 名 NPC、2 个采集节点、4 个热点和单地点安全返回结构，不提前加入任务线或 Boss 内容。
- 内容校验新增未使用资源与地点/区域资源引用检查，所有场景文字继续由 DOM 渲染。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（Node `--experimental-loader` 仅输出实验性警告）。
- `pnpm test -- src/systems/world src/systems/exploration`：通过，3 个文件、10 个测试。
- `pnpm test -- src/systems/assets`：通过，1 个文件、3 个测试。
- `pnpm build`：通过，Vite 产出 152 个模块并包含 aunt WebP。
- `pnpm test:e2e`：通过，21 个通过、1 个按项目配置跳过（移动端不重复执行五档矩阵）。

## 风险与边界

- C301 只负责场景、NPC、热点和素材；本章完整任务对白、战斗集成与 Boss 逻辑仍由后续 C302/C303 处理，当前没有新增未完成入口。
