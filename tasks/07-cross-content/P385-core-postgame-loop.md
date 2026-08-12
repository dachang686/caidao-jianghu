---
id: P385
title: 实现 Core 通关后继续与委托循环
phase: postgame
depends_on: [P384, S244, S245, S246]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现结局后继续原档、普通/精英/传说委托和门派经营反馈。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 5 节通关后循环
- `src/systems/postgame/`
- `src/content/commissions/postgame.ts`
- `src/screens/SectScreen/`

## 实现范围

- 结局后开放难度层级与一次性高价值门人目标。
- 重复委托收益回落，但不会跌到无意义。
- 门派收益继续服务装备、配方、情报和繁荣度。

## 验收标准

- 不需要新周目即可继续经营和挑战。
- 无现实时间、签到或无限最优刷取路径。
- 未安装 Optional 秘境/隐藏 Boss 时 Core 循环仍无悬空入口。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/postgame src/systems/commissions
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。

## 执行记录

- 新增通关后委托包、三类秘境循环和安全退出/重复收益规则；通过结局页继续原档进入，不重置 Core 进度或装备。

## 验证记录

- 通关后引擎单测、存档恢复 E2E、黄金路径结局后继续和全量 E2E 均通过。
