---
id: S246
title: 制作 6 名 Core 门人与经营反馈内容
phase: sect-content
depends_on: [S242, S244, H221, H224]
status: done
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

## 执行记录

- 新增 6 名 Core 门人内容：沈算盘、陆显眼、唐铁衣、灶边小满、叶听风、顾全账；保留第五章解锁和可由主线/支线 flag 满足的招募条件，每人配置 1–2 个性格标签、经营倾向和专属派遣事件。
- 新增情报、锻造、烹饪、经营四类倾向校验；派遣事件只声明经过领域 EffectExecutor 的小额正向反馈，不直接改 UI/store，不触发不可预警的战斗或损失。
- 新增 `src/content/dialogues/disciples/` 下 12 个招募/短对白节点，并导出 Core 门人对白；新增 4 组 `sect.dispatch_completed` 门派情境组合，分别配置冷却、减少动态效果 cue 和唯一 `firstDiscoveryGrantKey`，重复触发只保留短反馈。
- 扩展内容校验与 Sect/Comedy 测试，覆盖六人招募、专属事件绑定、四类倾向、对白图合法性和首次奖励幂等。

## 验证记录

- `pnpm lint`：通过。
- `pnpm content:validate`：通过（Node 仅输出实验性 loader warning）。
- `pnpm test -- src/systems/sect src/systems/comedy`：通过（7 个文件，25 个测试）。
- `pnpm build`：通过（146 modules）。

## 风险与边界

- 当前任务交付 Core 内容定义与领域校验；第五章实际剧情调用方需要在正常主线/支线完成时设置对应招募 flag，再把定义传入现有 Sect 页面/派遣领域动作。
- 本任务未增加 Optional 门人、后续章节资源或现实时间收益机制。
