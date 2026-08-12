---
id: S242
title: 实现门人招募、性格与派遣能力
phase: sect
depends_on: [S241, W204]
status: done
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

## 实现记录

- 新增 `src/types/disciple.ts`、`src/systems/sect/disciples.ts` 与 `src/content/sect/disciples.ts`：支持最多 12 名门人、章节/Condition 招募、重复幂等和 1–2 个性格标签。
- 门人仅属于门派名册；`previewDiscipleDispatch` 汇总性格带来的小幅时长/成功率/质量修正，未加入主角战斗队伍。
- `SectState` 与 `GameSaveV2` 记录门人 ID及专属对白已读状态，旧存档通过 Zod 默认值兼容；对白标记操作幂等并拒绝未招募/未知对白。
- 内容校验脚本已接入门人和性格定义校验；当前只登记两名测试门人，后续 Core 内容再扩展。

## 验证记录

- `pnpm lint`：通过。
- `pnpm test -- src/systems/sect`：通过（2 个文件，6 个测试）。
- `pnpm content:validate`：通过（1 个章节；Node 仅输出实验性 loader warning）。
- `pnpm build`：通过。
- `pnpm test -- src/systems/save/schema.test.ts`：通过（含旧存档字段默认值兼容）。

## 风险

- 当前只提供测试门人，不代表计划中的 6 名 Core 门人内容已全部制作；派遣 Tick 结算由后续 S243 负责。
