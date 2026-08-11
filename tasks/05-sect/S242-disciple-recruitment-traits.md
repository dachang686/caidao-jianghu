---
id: S242
title: 实现门人招募、性格与派遣能力
phase: sect
depends_on: [S241, W204]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现最多 12 门人的定义、招募条件、1–2 性格标签与能力计算。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 5 节门人差异化
- `src/types/disciple.ts`
- `src/systems/sect/disciples.ts`
- `src/content/sect/disciples.ts`

## 实现范围

- Core 接口支持 12，当前先用测试门人。
- 性格只造成可预览的小事件修正，不产生重大隐藏损失。
- 招募幂等并记录专属短对白状态。

## 验收标准

- 重复招募、容量满和条件变化均安全。
- 性格修正可在派遣前预览。
- 门人不进入主角战斗队伍。

## 验证命令

```powershell
pnpm lint
pnpm test -- src/systems/sect
pnpm content:validate
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。
