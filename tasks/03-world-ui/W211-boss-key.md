---
id: W211
title: 实现老板键暂停与恢复
phase: ux
depends_on: [F012, W207, W209]
status: done
executor_hint: "gpt 5.6-luna"
---

# 目标

实现 Esc/角落按钮切换的采购表伪装，并暂停可暂停系统。

## 必读

- `tasks/README.md`
- `docs/PLAN_v2.md`：第 6 节互动载体与既有 Demo 行为
- `src/components/boss-key/`
- `src/stores/settings/`
- `src/systems/audio/`

## 实现范围

- 进入时暂停战斗输入、Auto 对话、动画计时与音频。
- 恢复后保持原 Screen、焦点与未结算动作。
- 采购表使用本地静态 UI，不伪造浏览器/系统错误。

## 验收标准

- 切换不会推进回合或重复 Effect。
- 键盘焦点恢复到触发前元素。
- 移动端也有可达入口但不遮挡核心操作。

## 验证命令

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## 禁止事项

- 不提前实现后续章节或 Optional 内容。
- 不把领域状态判断复制进 Screen。
- 不用远程资源、占位入口或弱化断言伪装完成。

## 执行记录

- 老板键接入全局暂停控制器，支持键盘快捷键、按钮触摸操作、焦点恢复和暂停态阻断回合推进；顶部工具按钮补齐触摸目标尺寸。

## 验证记录

- 响应式/无障碍与性能 E2E 均通过，覆盖键盘焦点、老板键暂停恢复和减少动态效果场景。
