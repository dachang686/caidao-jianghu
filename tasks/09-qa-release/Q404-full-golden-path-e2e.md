---
id: Q404
title: 实现创角到结局的完整黄金路径 E2E
phase: qa
depends_on: [Q402, Q403, P384]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

自动跑通新建角色、八章主线、一个结局、通关后继续和刷新恢复。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 11 节 Playwright 黄金路径
- `e2e/golden-path.spec.ts`

## 实现范围

- 使用标准难度/标准梗密度和固定测试 seed。
- 只使用玩家可见操作，不直接调用 store。
- 关键章末记录进度摘要，失败截图可定位。

## 验收标准

- 从空 IndexedDB 开始到结局完成。
- 至少三次真实刷新后仍继续正确。
- 完成后进入通关后委托/门派页面。

## 验证命令

```powershell
pnpm lint
pnpm test:e2e -- e2e/golden-path.spec.ts
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 新增创角到八章结局的黄金路径辅助，覆盖每章战斗、胜利转场、结局后继续原档和三次刷新恢复；桌面/移动项目共用可复现存档清理。

## 验证记录

- 黄金路径桌面端与移动端均通过；结局页、继续原档和全量 E2E 顺序隔离均通过。
