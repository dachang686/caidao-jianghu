---
id: P384
title: 完成四结局文本、演出与可达路径
phase: cross-content
depends_on: [C373, W212, H223, H224]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

完成菜刀宗师、热榜盟主、开宗立派、归隐掌柜四个结局内容。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 3 节四结局与第 11 节验收
- `src/content/endings/`
- `src/content/dialogues/endings/`
- `src/content/comedy/endings/`

## 实现范围

- 每个结局有明确条件、最终选择、结算摘要和通关后状态。
- 结局演出支持减少动态与静音，不依赖远程/AI 文案。
- 重叠条件使用已定义优先级，玩家能理解为何得到该结局。

## 验收标准

- 四条静态可达路径与章节快照均通过。
- 结局不由单一数值碾压决定。
- 重复观看不重复奖励，通关后可继续。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/endings
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不补 Optional 数量来掩盖 Core 缺口。
- 不通过刷怪、等待或经济墙延长时长。
- 不改变已确认的纯离线和单主角边界。
