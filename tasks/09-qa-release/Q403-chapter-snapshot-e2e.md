---
id: Q403
title: 建立八章快照 E2E 套件
phase: qa
depends_on: [P386, Q401]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

为每章建立合法起始存档夹具和从章首到 Boss/章末的独立 E2E。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 11 节章节快照
- `e2e/fixtures/`
- `e2e/chapters/`

## 实现范围

- 夹具通过 GameSaveV2 schema 创建，不手写绕过领域状态。
- 每章覆盖主线关键分支、Boss、自动档和下一章解锁。
- 桌面为全量，移动端至少覆盖章首/战斗/章末关键点。

## 验收标准

- 八章可独立定位失败，不需先跑前章。
- 夹具内容版本与迁移测试同步。
- 没有 test-only 生产按钮或隐藏资源奖励。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不通过降低断言、跳过浏览器项目或放宽预算通过验收。
- 不在没有复现证据时做范围外重构。
- 不宣称未实际执行的命令或人工时长已验证。

## 执行记录

- 新增 V2 存档夹具映射、八章快照 E2E 和章节清理/存档辅助；夹具明确记录当前可视壳仍经 legacy adapter 读取，避免把夹具映射误称为运行时 V2 迁移。

## 验证记录

- `e2e/chapter-snapshot.spec.ts` 8 项通过，ch05–ch08 流程 8 项通过；全量 E2E 也通过。
