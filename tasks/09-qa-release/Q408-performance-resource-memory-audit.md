---
id: Q408
title: 完成包体、加载与内存验收
phase: qa
depends_on: [Q404, W209]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

验证首屏 <=5MB、单区域 <=5MB、总包 <=40MB 和跨区域资源释放。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 8 节资源预算与第 11 节性能
- `scripts/audit-assets.*`
- `e2e/performance.spec.ts`
- `vite.config.ts`

## 实现范围

- 脚本报告 chunk、图片、字体和音频体积并在超限失败。
- 自动反复切换区域/战斗，检查监听器、缓存和音频节点趋势。
- 只做有证据的懒加载/压缩修复。

## 验收标准

- 预算全部达标。
- 长时间流程无持续线性增长。
- 首屏不加载未解锁章节大图。

## 验证命令

```powershell
pnpm lint
pnpm build
pnpm test:e2e -- e2e/performance.spec.ts
pnpm assets:audit
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 增加首屏资源、重复面板打开、减少动态效果和包体预算审计；发布包预算为首屏 5 MiB、总包 40 MiB，并检查重复资源与内存泄漏迹象。

## 验证记录

- 性能 E2E 桌面端与移动端通过；`pnpm assets:audit` 通过：总包 4.75 MiB、最大 JS 0.68 MiB、最大区域资源 0.30 MiB、58 文件。
