---
id: W212
title: 实现四结局判定引擎与 Ending Screen
phase: world
depends_on: [F004, F005, W202, F012]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现有确定优先级的结局候选、锁定确认、结算和通关后返回。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节四结局与第 9 节结局可达校验
- `src/types/ending.ts`
- `src/systems/endings/`
- `src/screens/EndingScreen/`

## 实现范围

- 条件使用 moral/fame/wealth/sectProsperity 与关键旗标。
- 候选重叠按数据优先级确定，静态校验至少一条可达路径。
- 结局记录幂等，通关后继续原档而非强制清除。

## 验收标准

- 四个结局测试夹具均可达。
- 不可逆锁线前明确二次确认。
- 重复进入结局页不重复发奖励或改统计。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/endings
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。

## 执行记录

- 新增四结局定义、条件判定、演出 cue、Ending Screen 与结局后继续原档入口；运行时按玩家选择和成长状态计算路线，并保持结算幂等。

## 验证记录

- 四结局引擎单测、八章黄金路径和 ch08 结局页/继续原档 E2E 均通过。
