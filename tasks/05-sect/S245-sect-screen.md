---
id: S245
title: 实现门派经营与派遣页面
phase: sect-ui
depends_on: [S241, S243, S244, F012]
status: pending
executor_hint: "gpt 5.6-luna"
---

# 目标

实现设施、门人、派遣队列和经营收益的完整 UI。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 5 节门派经营与第 7 节 sect ScreenId
- `src/screens/SectScreen/`
- `src/components/sect/`

## 实现范围

- 展示升级成本/收益、门人性格、剩余战斗场次和最多三队。
- 不显示真实倒计时或挂机文案。
- 所有操作调用领域动作并防重复提交。

## 验收标准

- 桌面/手机功能一致。
- 玩家能看出经营如何影响战力或结局属性。
- 键盘/触摸可完成升级、派遣和领取。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前制作后续章节或 Optional 数量扩展。
- 不让幽默/经营表现绕过领域系统直接改状态。
- 不使用现实时间、远程请求或不可恢复惩罚。

## 实现记录

- 新增 `src/screens/SectScreen/`，组合设施升级、门人名册、派遣队列和委托领取四类经营视图。
- 新增 `src/components/sect/` 下的设施卡、门人名册和派遣队列组件，展示升级成本/收益、门人特性、有效战斗剩余场次和最多三队限制。
- 页面通过回调调用既有领域动作；使用本轮提交锁避免升级、招募、派遣和领取的同 tick 重复提交，不引入现实时间倒计时或挂机收益。
- 在 `src/styles.css` 增加桌面/移动端布局、键盘 focus-visible 样式和触控安全点击尺寸；创建 `PRODUCT.md` 作为界面设计上下文。

## 验证记录

- `pnpm lint` ✅
- `pnpm test` ✅（35 个文件，109 个测试）
- `pnpm test:e2e` ✅（8 个场景，桌面/移动端）
- `pnpm build` ✅

## 风险与边界

- 当前页面以领域回调作为集成边界，未改动旧版 `ScreenId` 路由和既有江湖运行时；后续章节集成任务负责把它接入实际流程。
