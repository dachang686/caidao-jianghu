---
id: S246
title: 制作 6 名 Core 门人与经营反馈内容
phase: sect-content
depends_on: [S242, S244, H221, H224]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

配置 6 名具有性格、招募路径、短对话和派遣事件的核心门人。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 2 节 Core、第 5 节门人差异化
- `src/content/sect/disciples/`
- `src/content/dialogues/disciples/`

## 实现范围

- 每人 1–2 性格标签和至少一段专属事件。
- 至少覆盖情报、锻造、烹饪和经营四种倾向。
- 加入 4 组门派情境幽默，首次奖励幂等。

## 验收标准

- 6 人均可通过正常主线/支线招募。
- 不存在纯数值换皮门人。
- 事件不会造成不可预警的重大损失。

## 验证命令

```powershell
pnpm lint
pnpm content:validate
pnpm test -- src/systems/sect src/systems/comedy
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
