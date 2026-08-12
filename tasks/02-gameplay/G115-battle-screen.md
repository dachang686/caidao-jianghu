---
id: G115
title: 实现完整 Battle Screen
phase: gameplay-ui
depends_on: [G105, G107, G114, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

将战斗引擎接入可键盘/触摸操作的完整战斗页面。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 4 节战斗规则与第 11 节视口矩阵
- `src/screens/BattleScreen/`
- `src/components/battle/`
- `src/styles/`

## 实现范围

- 显示生命/内力/架势、敌方意图、6 技能槽、冷却、状态和 50 条日志上限。
- 支持 1–6 快捷键、禁用原因、阶段演出和战败原地重试。
- 组件只派发动作并渲染 selector，不重算伤害。

## 验收标准

- 桌面与 360px 手机无横向溢出，触摸目标 >=44px。
- 减少动态效果后仍可读破防、意图和命中结果。
- 战斗 E2E 覆盖胜利、失败、阶段转换。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续任务或 Optional 内容。
- 不在 React 组件中复制领域公式。
- 不用占位数据、远程资源或跳过测试伪装完成。

## 执行记录

- 新增 `src/screens/BattleScreen/index.tsx`，将战斗状态选择、快捷键和动作派发集中在页面适配层；`ScreenShell` 与 `screens/index.ts` 已切换到新页面入口。
- 新增 `src/components/battle/` 下的战斗单位、敌方意图、战斗日志和 6 槽技能栏组件。组件只消费 selector 视图并派发 `useSkill`、`retryBattle`、`leaveBattle`，伤害与架势结算仍由 store/领域适配层负责。
- 扩展战斗状态以展示架势、诚实敌方意图和阶段反馈；日志上限从 8 条提升为 50 条，快捷键 1–6 与按钮禁用原因共享同一冷却/内力判断。
- 新增完整桌面/移动响应式样式，360px 无横向溢出，技能与操作目标保持可触摸尺寸；减少动态效果时保留文本、边框和颜色静态反馈。
- 补充胜利、战败重试、二阶段、键盘快捷键和移动端流程 E2E。另修正采集 validator 的可选材料目录兼容传递，使 foundation 与旧校验调用均保持正确边界。

## 验证记录

- `pnpm lint` ✅
- `pnpm test` ✅（40 个测试文件、127 个测试）
- `pnpm test:e2e` ✅（14 个桌面/移动 E2E）
- `pnpm build` ✅
- `pnpm content:validate` ✅（1 章；Node loader 的实验性 warning 不影响退出码）

## 风险与边界

- 当前页面接入的是仓库已有的 Demo Zustand 战斗状态；后续章节 Boss、完整 16 技能内容和食物领域在其对应任务接入，页面不自行复制领域公式。
