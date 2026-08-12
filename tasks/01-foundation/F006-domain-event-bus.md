---
id: F006
title: 实现同步 Domain EventBus
phase: foundation
depends_on: [F003]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现可序列化、按序派发且具循环保护的同步 EventBus。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 7 节“EventBus 规范”
- `src/types/events.ts`
- `src/systems/events/`
- `src/systems/events/*.test.ts`

## 实现范围

- 事件包含 id/type/occurredAtTick/payload/sourceActionId。
- 当前事件结束后再处理派生队列；处理器不能直接递归同类型。
- 实现派生深度上限、订阅注销和测试重置。

## 验收标准

- 订阅顺序、派生顺序和注销行为都有测试。
- 循环事件在开发/测试环境抛出含事件链的错误。
- EventBus 不导入 Zustand 或 React。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/events
pnpm build
```

## 禁止事项

- 不提前实现依赖本任务的后续系统。
- 不修改 `docs/PLAN_v2.md` 的产品范围。
- 不用占位、远程资源或弱化测试伪装完成。

## 执行记录

- 新增同步 FIFO EventBus、事件结构校验、注册顺序、派生深度上限、循环链路诊断、注销与 reset。
- 处理器返回的派生事件和处理器内部 `dispatch` 均在当前事件结束后处理；EventBus 不依赖 React/Zustand。
- 验证结果：`pnpm lint`、`pnpm test -- src/systems/events`、`pnpm build` 均通过。
