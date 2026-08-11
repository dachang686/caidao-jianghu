# 《菜刀闯江湖》1.0 完整版实施计划


## 1. 产品目标与交付边界

- 将当前 20–40 分钟 Demo 升级为可完整通关、可长期本地保存的中文单机武侠 RPG。
- 主线单周目中位时长目标为 8–12 小时；通关后门派经营、江湖委托和秘境提供 5–8 小时可选内容。
- 保持纯前端架构：无账号、服务器、内购、广告、云存档或联网依赖。
- GitHub Pages 为主要游玩入口；GitHub Release 同步提供可下载的离线网页包。
- 桌面和手机功能完全一致，允许针对屏幕结构使用不同布局。
- 主角保持单人回合制战斗；不加入同伴参战、自由移动、战棋或实时战斗。

### 完成定义

正式版只有同时满足以下条件才算完成：

1. 从创角到四个结局均存在可验证的完整路径，任何迷惑选项都不会锁死主线。
2. Core 内容全部完成且无占位、Demo、敬请期待或不可进入入口。
3. 主线黄金路径实测中位时长为 8–12 小时。
4. 三档难度、三档梗密度、桌面与手机均可完成全流程。
5. Pages 与离线包运行时不请求第三方资源，刷新、断网、导入导出和异常恢复可用。
6. `pnpm lint`、`pnpm content:validate`、`pnpm test`、`pnpm test:e2e`、`pnpm build` 全部通过。

## 2. 范围闸门：Core 与 Optional

完整世界仍以 8 个区域为目标，但功能按发布优先级分级。Optional 只能在 Core 验收通过后实现；时间不足时允许整体移出 1.0，不得以半成品入口占位。

### Core：1.0 发布阻塞项

- 8 个区域骨架与主线场景：小愚村、清河县、黑风寨、青云山、西域驿路、东海镇、京城、武林大会。
- 28 个主线任务、8 场章节 Boss、4 个可达结局。
- 每区至少 2 个有状态 NPC、2 类普通敌人、1 个采集点和 1 条主线外短事件。
- 四系武学的 16 个核心主动技能与 8 个核心被动节点；其余技能为扩展内容。
- 六槽装备、基础掉落、强化 `+5`、12 个核心锻造配方和 8 个核心菜谱。
- 采集、锻造、烹饪、任务、战斗、成长、图鉴基础页和完整存档闭环。
- 第五章解锁门派；四类设施、6 名核心门人、基础派遣与结局属性闭环。
- 清淡/标准/加辣三档梗密度，以及规则、情境、互动、演出四层诙谐玩法；幽默不能只依赖旁白和梗句。
- 四层 Core 内容基线：8 个诙谐规则模块、12 组跨系统情境组合、10 条可重复发现的互动反应链、1 套通用喜剧演出节奏与 8 场 Boss 专属演出节拍。
- 预留统一 `TextProvider` 文本出口，1.0 只启用完全离线的 `LocalTextProvider`；不得因接口预留产生联网请求、AI 占位入口或运行依赖。
- 三档难度、老板键、减少动态效果、键盘操作、移动端完整流程。

### Optional：不阻塞 1.0，可完整延后

- 其余 8 个主动技能、4 个被动节点、进阶配方和高级菜谱。
- 8 个隐藏 Boss、3 处高难秘境、其余 6 名门人。
- 36 条支线/委托的完整目标；Core 先保证 16 条手工支线与 12 个委托模板。
- 80 件装备的完整目标；Core 先保证约 48 件具有明确阶段用途的装备。
- 深度成就、全收集图鉴、稀有称号、更多随机委托变体和隐藏对话。
- 高成本过场、额外漫画演出和纯装饰性交互。

### 砍项与时长规则

- M3 完成前必须进行第一次黄金路径实测；若主线超过 12 小时，先压缩重复战斗、往返和对白，不删除结局必要节点。
- 若低于 8 小时，优先补角色抉择、Boss 机制和区域事件，不用刷怪或材料门槛注水。
- Optional 未达到完整质量时整项关闭，不留下无功能按钮或不可完成任务。
- 同时活跃的普通任务最多 6 个，其中程序化委托最多 3 个；主线始终单独置顶。

## 3. 世界、剧情与内容复用

### 主线结构

- 主线围绕《百味刀谱》展开：玩家发现所谓天下第一刀谱其实也是菜谱，并卷入“百晓榜”操纵名望与门派资源的阴谋。
- 玩家属性在 `moral` 之外加入 `fame`、`wealth` 和 `sectProsperity`。
- 四个结局：菜刀宗师、热榜盟主、开宗立派、归隐掌柜。
- 结局由关键选择与多个属性共同决定，不设置单一数值碾压解法；不可逆选择必须提前明确提示。

| 章节 | 区域 | 核心矛盾 | Core Boss | 系统解锁 |
|---|---|---|---|---|
| 一 | 小愚村 | 菜刀入江湖 | 白大侠 | 对话、基础战斗、背包 |
| 二 | 清河县 | 百晓榜初现 | 榜下捕快 | 装备、采集、锻造 |
| 三 | 黑风寨 | 山寨也要冲榜 | 黑风寨主 | 技能树、烹饪 |
| 四 | 青云山 | 名门的门面工程 | 青云掌门 | 意图进阶、强化 |
| 五 | 西域驿路 | 刀谱物流之谜 | 驿路双煞 | 自建门派、派遣 |
| 六 | 东海镇 | 留影石带货乱象 | 海潮帮主 | 委托进阶、门人事件 |
| 七 | 京城 | 百晓榜幕后交易 | 榜司督主 | 结局路线锁定 |
| 八 | 武林大会 | 刀谱与江湖定义权 | 百晓榜主 | 四结局判定、通关后 |

### NPC、敌人与委托复用策略

- 主要 NPC 目标约 30 名，其中至少 8 名跨区域出现；状态、好感和已知信息随章节延续。
- 普通敌人由“基础行为模板 + 区域皮肤 + 招式组 + 数值曲线”组合，不为 40 类敌人各写一套独立引擎。
- Core 使用 12 个行为模板，组合出至少 24 个可辨认敌人；只有 Boss 使用专属阶段逻辑。
- 委托使用 12 个 Core 手工模板，按目标、区域、敌人、奖励和梗语气做种子化组合；不得生成无上下文的纯数字跑腿。
- 每名 Core 门人有 1–2 个性格标签和专属短对话；性格影响派遣小事件，但不制造不可预测的重大损失。

## 4. 战斗与成长

### 战斗规则

- 最高 30 级，6 个技能槽；核心资源为生命、内力、架势、冷却和短期状态。
- 四系武学：菜刀猛攻、嘴遁控制、苟命反击、江湖杂学。
- 架势被击破后进入 1 回合易伤，所受伤害 `+50%`，随后重置；普通攻击在未破防时仍保持有效输出。
- 普通敌人意图诚实；仅精英和 Boss 使用蓄力、连招或特殊意图。Boss 二阶段最多 `20%` 虚实欺骗概率。
- 剧情/标准/高手难度主要调整数值、资源宽容度和意图诚实度，不额外锁定内容或结局。
- 非战斗状态可免费重置全部技能点，已获得技能点不丢失；不设置洗点材料。

### 成长与数值安全阀

- 固定 RNG 支持批量模拟与可复现问题；强化结果基于存档种子，禁止刷新 S/L 改结果。
- 装备槽为武器、头部、衣服、鞋、饰品、秘籍；Core 约 48 件，完整目标约 80 件。
- 食物增益持续 1–3 场战斗；负面搞笑效果最多两回合，不能在场景中致死。
- 负面食物效果必须同时触发明确状态说明和梗包旁白，不以隐藏惩罚制造挫败。
- 批量模拟目标：标准难度主线同级战斗胜率合理、Boss 破防窗口有价值，但不存在“未破防完全无法输出”的强制解。

## 5. 门派经营与通关后循环

- 第五章解锁练功房、厨房、铁匠铺、情报堂，每项最高三级。
- Core 提供 6 名差异化门人，完整目标 12 名；门人只参与经营与派遣，不进入主角战斗。
- 派遣由战斗场次步长 `Ticks` 推进，不使用现实时间、倒计时、签到或挂机收菜。
- 同时派遣最多 3 队；离开页面不暂停进度，未进行战斗则不凭空增长。
- 经营收益必须回流到至少一项：玩家战力、稀有配方、区域情报、`fame`、`wealth` 或 `sectProsperity`。
- 通关后委托分普通、精英、传说三级；重复模板收益逐步回落，高价值目标以一次性门人剧情、秘境首通和隐藏 Boss 为主。
- Optional 完整后形成约 5–8 小时循环；若秘境/隐藏 Boss 延后，Core 门派仍须能服务结局并完成自身闭环。

## 6. 幽默与现代中文梗

### 内容原则

- 独立 `memePack` 文案层按职场、外卖、直播、热榜、甲方、社交平台、情绪价值和纯江湖笑料分类。
- 现代映射控制在全部幽默内容的约 `40%`，其余以人物反差、武侠规则、自嘲旁白和任务反转构成，避免作品依赖短命热梗。
- 耐久梗可使用打工人、内卷、已读乱回、显眼包、松弛感、先叠甲等语义，但必须转译进世界观。
- 世界观转译示例：直播 → 留影石开播，热搜 → 百晓榜，绩效 → 门派月考，带货 → 镖局荐货。
- 不引用真实人物、现实政治、受保护品牌或针对真实身份群体的笑料；不以低俗辱骂替代幽默。

### 四层诙谐设计总则

- 幽默必须至少来自以下一层：规则产生反差、系统组合产生情境、玩家行为触发回应、视听节奏完成包袱；只更换技能名称或追加一句吐槽不算玩法型幽默。
- 四层共享 `ComedyDirector` 调度，但不改变任务主流程的可达性。单次玩家动作最多触发 1 个主笑点和 2 个轻反应，避免多个系统同时抢戏。
- 所有会影响胜负或资源的笑点必须提前显示实际效果，随机结果使用存档 RNG；不允许未预告的即死、关键物品丢失、永久属性下降或不可逆任务失败。
- 喜剧节拍的阻塞时间单次不超过 `1.2s`；连续两个主笑点至少间隔 20 秒或一个完整战斗回合。重复触发改用短版反馈。
- “清淡/标准/加辣”只控制现代梗文本、补充反应和可选演出频率；诙谐技能、道具与敌人规则属于基础玩法，三档保持完全相同的数值和平衡。

### 第一层：规则幽默

规则幽默让笑点直接参与决策：名称、动画与数值效果必须表达同一个反差，而不是普通技能套搞笑皮肤。

Core 至少实现以下 8 个规则模块：

| 模块 | 实际玩法 | 笑点与安全阀 |
|---|---|---|
| 装死 | 消耗一回合进入“被忽略”，下回合首次行动获得反击加成 | 普通敌人可能停止攻击或上前确认；Boss 只降低本回合伤害，不跳过阶段 |
| 嘴遁 | 根据敌人“自尊”造成架势伤害并施加短期动摇 | 失败进入 1 回合“词穷”，但返还一半内力，不形成资源死锁 |
| 菜刀乱舞 | 多段伤害，末段命中后提高破防收益 | 末段脱手只改变动画；菜刀自动弹回，不需要额外捡取或丢失武器 |
| 铁头功 | 以少量生命换取高额架势反击 | 自伤不超过最大生命 `8%`，且不能把玩家降到 1 点以下 |
| 二锅头 | 两回合攻击提高、命中降低；落空仍造成少量架势伤害 | 失手会劈中场景道具形成反馈，不让整个回合完全无收益 |
| 过期大还丹 | 立即治疗，下一回合技能内力消耗增加 | 负面最多一回合、不可致死，状态栏明确显示“肚中开会” |
| 先叠甲 | 立即获得护盾，但本回合攻击降低 | 角色展开过长免责声明；动画可跳过，实际数值在释放前展示 |
| 借坡下驴 | 低架势时主动后撤，清除一个控制并获得短暂闪避 | Boss 战中不等同逃跑，不重置敌人生命或阶段 |

- 普通敌人的搞笑招式必须保持诚实意图；“裤腰带松了”“先让我热个身”等失误是可读机制，不是隐藏随机跳过回合。
- Boss 每场最多有一个专属反套路规则，例如假蓄力后闪腰、召唤帮手却叫错人；触发前必须有台词、意图图标或场景提示。
- 每个规则模块必须包含实际效果、预览文案、AI 使用限制、动画替代方案和自动化测试，不能只配置名称与描述。

### 第二层：情境幽默

情境幽默由两个以上已存在的状态、物品、人物关系或任务结果组合产生，让玩家感觉笑点是自己“玩出来的”。

- 使用 `SituationComboDefinition` 声明组合条件，不在剧情组件里写一次性判断。Core 至少制作 12 组：战斗 4 组、探索/任务 4 组、门派经营 4 组。
- 战斗示例：“二锅头 + 嘴遁”变成酒后真言，提高嘴遁架势伤害但更容易获得“词穷”；“装死 + 猫在场”时猫会踩醒玩家，提前结束装死并返还行动收益。
- 探索示例：带着任务猫再次拜访鱼摊，商贩误认其为验货官；拿《百味刀谱》去铁匠铺，铁匠按兵器秘籍理解并锻出一口会粘锅的刀。
- 任务示例：玩家同时接取互相矛盾的两个委托时，不强制放弃其中之一，而是开启一条调解或“两边已读乱回”的短解决路径。
- 门派示例：“社恐 + 情报”门人获得更准确情报但不肯汇报，由另一名“显眼包”门人添油加醋转述；奖励仍按可见规则结算。
- 首次发现组合可给予少量银两、称号进度或图鉴记录；重复触发只保留短反馈，不允许通过同一笑点无限刷奖励。
- 组合条件必须由常规游玩自然遇到，不要求像素级热点、精确帧输入或长期携带无用道具；关键组合可通过物品标签、NPC 暗示或图鉴给出线索。

### 第三层：互动幽默

互动幽默响应玩家主动做出的“多余但合理”行为，让界面、NPC 和世界承认玩家的好奇心，而不是用空气墙或无反应按钮拒绝。

- Core 至少制作 10 条 `InteractionChainDefinition`，覆盖 8 个区域；每条 3–5 级反应，达到上限后进入稳定短反馈，不无限膨胀状态。
- NPC 重复点击采用“正常回答 → 察觉 → 烦躁 → 反客为主 → 封口费/称号进度”的递进，但关键 NPC 始终保留推进任务入口。
- 砍价、反复确认、交错物品、战前挑衅、战后补刀询问、连续逃跑等行为均可被事件系统识别，并给出轻量数值或关系反馈。
- 场景热点允许安全试错，例如反复敲钟引来管理员、对水井使用菜刀得到倒影评价；不得扣除关键物品、永久关闭商店或隐藏主线入口。
- 迷惑选项最多绕行两个节点返回推进路径；如果选择改变阵营、结局或稀有奖励，必须脱离笑点语气再次明确确认。
- 所有反应链同时支持鼠标、键盘与触摸；触发不依赖双击速度、悬停或小于 44px 的隐藏点击区。

### 第四层：演出幽默

演出幽默负责“铺垫—停顿—落点—反应”的节奏。领域状态先完成结算，动画和音频只表现结果，绝不能反向决定伤害或任务状态。

- 通用节拍分为：铺垫 `180–300ms`、动作落点、喜剧停顿 `250–500ms`、角色/场景反应；玩家连续输入时可直接进入短版落点。
- 战斗使用可复用的脱手飞回、闪腰、假装无事、尘土、乌鸦飞过、问号/汗滴气泡等轻量演出；同一反应连续两次后自动降级为短动画。
- 8 场章节 Boss 各有一个专属开场或败北节拍，例如气势十足登场后踩到披风；不得通过长过场重复拖慢重试。
- 可使用不超过 `1.2s` 的“胜利……吗？”假结算衔接明确的 Boss 二阶段，但禁止伪造存档损坏、支付、系统崩溃、浏览器警告或删除进度。
- 喜剧音效使用短促木鱼、铜锣、滑音和停顿，遵守并发 SFX 上限；同一夸张音效 30 秒内不重复。
- “减少动态效果”开启时，以静态表情、边框闪烁和短文字替代位移、缩放、镜头震动；静音时笑点仍能通过视觉成立。
- 手机端不使用大幅镜头缩放导致界面漂移；桌面与手机共享节拍定义，只替换具体表现参数。

### 触发与审查

- 清淡/标准/加辣只改变后续旁白和补充对白，不改变任务条件、奖励或当前已显示文本。
- 每条梗记录场景标签、强度、角色语气、冷却组和去重池；同池轮完前不重复。
- 称号、旁白、战斗日志、失败结算、NPC 烦躁和老板键是主要载体，不为塞梗增加无意义点击。
- 四层笑点必须记录所属层级、触发事件、冷却组、首次/重复版本、数值安全阀和无动画替代；未满足字段要求的内容不能进入 Core 清单。
- 每章至少包含 1 个规则笑点、1 个自然情境组合、1 条互动反应链和 1 个 Boss/关键剧情演出节拍，避免幽默只集中在开场村庄。
- M5 前执行一次梗新鲜度审查：删除依赖短期新闻语境、脱离角色口吻或连续出现造成疲劳的文案。
- 内容校验阶段运行敏感词与语境审查清单；命中项必须人工确认，不自动静默替换。

## 7. 架构与接口

### 目录与文件职责

```text
src/
  screens/        # 每个 ScreenId 的页面容器
  components/     # 无领域副作用的通用 UI
  systems/        # Combat、Quest、EventBus、Save、ComedyDirector 等引擎
    providers/    # TextProvider、LocalTextProvider 与未来可选适配器
  content/        # chapters、npcs、enemies、skills、items、recipes、comedy、memes
  stores/         # 按 player、battle、quest、sect 拆分的 Zustand slices
  types/          # 公共领域类型
  validators/     # 构建期内容与存档校验
```

- `ScreenId`：`menu / creation / worldMap / location / battle / skillTree / inventory / crafting / cooking / sect / codex / ending`。
- 继续使用内部状态机，不引入 URL 路由，避免 Pages 子路径刷新问题。
- 组件文件优先低于 300 行；普通代码文件建议不超过 800 行。大型内容配置不受硬上限约束，但必须按章节或系统拆分，如 `content/chapters/ch01.ts`、`content/skills/dao.ts`。
- `DialogueOverlay`、`BattleScene` 等复杂页面必须按展示、交互和领域适配拆子组件，不在单文件堆叠所有逻辑。
- React 组件不得硬编码任务条件、奖励或剧情分支；魔法数字集中配置并附中文说明。

### 声明式内容模型

核心类型包括：

- `ChapterDefinition`、`LocationDefinition`、`NpcDefinition`
- `QuestDefinition`、`DialogueNode`、`ChoiceDefinition`
- `Condition`、`Effect`、`DomainEvent`
- `SkillDefinition`、`ItemDefinition`、`EquipmentDefinition`、`RecipeDefinition`
- `SectState`、`DiscipleDefinition`、`CommissionDefinition`
- `EndingDefinition`、`MemeLine`、`MemePack`、`ContentManifest`
- `ComedyBeatDefinition`、`RuleComedyDefinition`、`SituationComboDefinition`
- `InteractionChainDefinition`、`PresentationCueDefinition`

```ts
type Condition =
  | { type: 'quest_complete'; questId: string }
  | { type: 'has_item'; itemId: string; count?: number }
  | { type: 'stat_gte'; stat: 'moral' | 'fame' | 'wealth' | 'sectProsperity'; value: number }
  | { type: 'flag_equals'; flag: string; value: boolean }
  | { type: 'not'; condition: Condition }
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] };

type Effect =
  | { type: 'give_item'; itemId: string; count?: number; grantKey?: string }
  | { type: 'give_exp'; amount: number; grantKey?: string }
  | { type: 'set_flag'; flag: string; value: boolean }
  | { type: 'unlock_quest'; questId: string }
  | { type: 'change_stat'; stat: 'moral' | 'fame' | 'wealth' | 'sectProsperity'; delta: number }
  | { type: 'trigger_battle'; enemyId: string }
  | { type: 'narrate'; lineId: string };

type ComedyLayer = 'rule' | 'situation' | 'interaction' | 'presentation';

interface ComedyBeatDefinition {
  id: string;
  layer: ComedyLayer;
  scale: 'major' | 'minor';
  triggerEvent: DomainEvent['type'];
  conditions: Condition[];
  cooldownGroup: string;
  firstCueId: string;
  repeatCueId: string;
  maxBlockingMs: number;
  reducedMotionCueId: string;
}

interface RuleComedyDefinition {
  id: string;
  mechanicId: string;
  mechanicType: 'skill' | 'item' | 'enemy_behavior' | 'environment';
  previewStatKeys: string[];
  aiRestrictions: string[];
  presentationCueId: string;
}

interface SituationComboDefinition extends ComedyBeatDefinition {
  requiredTags: string[];
  effects: Effect[];
  firstDiscoveryGrantKey?: string;
}

interface InteractionChainDefinition {
  id: string;
  triggerEvent: DomainEvent['type'];
  stages: Array<{ threshold: number; effects: Effect[]; cueId: string }>;
  stableRepeatCueId: string;
  progressActionId?: string;
}

interface PresentationCueDefinition {
  id: string;
  steps: Array<{ type: 'anticipation' | 'action' | 'pause' | 'reaction'; durationMs: number }>;
  shortCueId: string;
  reducedMotionCueId: string;
  sfxCooldownGroup?: string;
}
```

- 奖励类 Effect 必须支持 `grantKey` 或等价交付记录，保证重复点击、刷新恢复和事件重放不会重复发放关键奖励。
- `ComedyDirector` 只消费稳定的领域事件并选择笑点，不直接计算战斗伤害或修改任务；需要产生数值影响时必须返回可审计的 `Effect[]` 交由对应领域系统执行。
- 规则层的核心数值继续归属 `SkillDefinition`、`ItemDefinition` 或敌人行为配置；`RuleComedyDefinition` 只关联预览、限制和演出，禁止建立第二套平行战斗公式。

### EventBus 规范

- 事件名采用 `domain.action.past_tense`，例如 `battle.enemy_defeated`、`quest.reward_claimed`、`sect.dispatch_completed`。
- EventBus 只在单次领域动作内同步、按注册顺序派发；存档、音频、动画等副作用订阅最终稳定状态，不参与领域计算。
- 事件必须是可序列化的只读数据，至少含 `id`、`type`、`occurredAtTick`、`payload` 和 `sourceActionId`。
- 处理器不得直接发布同类型事件；跨领域派生事件进入队列，在当前事件处理完成后派发。
- 单个 `sourceActionId` 的派生深度设硬上限，开发环境检测循环并抛错，禁止用静默截断掩盖问题。
- 任务、称号、统计、旁白和 `ComedyDirector` 可以订阅事件；React 组件不得直接订阅后修改多个 store。

### AI 增强预留接口（1.0 仅实现本地 Provider）

#### 边界与原则

- **离线基线永远存在**：1.0 只实现 `LocalTextProvider`，由 `memePack`、旁白池和预写模板提供结果；断网环境行为与当前计划完全一致。
- **表现层隔离**：未来 AI 只能生成旁白、补充对白、战报、委托描述、门人汇报、闲置心声和物品风味文本，不得决定 `Condition`、`Effect`、任务解锁、奖励、战斗、RNG 或结局。
- **不阻塞游戏**：领域状态先完成；文本增强超时、取消、格式错误或不可用时立即使用本地结果，不显示加载失败弹窗，也不重试阻塞玩家操作。
- **不替换已显示文本**：调用点先取得本地基线；未来增强结果只有在对应面板尚未展示且仍匹配当前 `requestId` 时才采用，避免对白在玩家阅读中途跳变。
- **上下文最小化**：Provider 只接收白名单快照，不传完整 `PlayerState`、存档、背包明细或原始事件日志；玩家自定义名称等自由文本默认不发送，未来发送前必须明确告知。
- **输出视为不可信数据**：限制为纯文本并做长度、字符和敏感语境校验，通过 DOM `textContent` 渲染；不得解析为 HTML、脚本、ID、条件或效果。

#### 类型预留

建议放在 `src/types/text-provider.ts`，避免以某一家模型厂商命名核心领域接口：

```ts
type MemeDensity = 'mild' | 'standard' | 'spicy';
type TextSource = 'local' | 'enhanced';

interface PlayerTextSnapshot {
  level: number;
  titleIds: string[];
  moralBand: 'low' | 'mid' | 'high';
  fameBand: 'unknown' | 'known' | 'famous';
  recentActionTags: string[];
}

interface NarrationContext {
  requestId: string;
  trigger:
    | 'idle'
    | 'skip_dialogue'
    | 'battle_fail'
    | 'battle_win'
    | 'quest_complete'
    | 'npc_harass'
    | 'title_unlock'
    | 'load'
    | 'custom';
  player: PlayerTextSnapshot;
  locationId?: string;
  battleSummary?: {
    damageTaken: number;
    skillIds: string[];
    turns: number;
    result: 'win' | 'lose';
  };
  memeDensity: MemeDensity;
}

interface DialogueEnrichContext {
  requestId: string;
  nodeId: string;
  npcId: string;
  player: PlayerTextSnapshot;
  authoredOptions: Array<{ optionId: string; semanticTag: string }>;
  memeDensity: MemeDensity;
}

interface DialogueCopyPatch {
  optionId: string;
  label: string;
}

interface TextGenContext {
  requestId: string;
  type: 'battle_report' | 'commission_desc' | 'disciple_report' | 'idle_thought' | 'item_flavor';
  safeData: Record<string, string | number | boolean | string[]>;
  memeDensity: MemeDensity;
  maxLength: number;
}

interface TextResult<T> {
  value: T;
  source: TextSource;
  requestId: string;
}

interface TextProvider {
  getNarration(ctx: NarrationContext, signal?: AbortSignal): TextResult<string> | Promise<TextResult<string>>;
  enrichDialogueCopy?(
    ctx: DialogueEnrichContext,
    signal?: AbortSignal,
  ): TextResult<DialogueCopyPatch[]> | Promise<TextResult<DialogueCopyPatch[]>>;
  generateText?(
    ctx: TextGenContext,
    signal?: AbortSignal,
  ): TextResult<string> | Promise<TextResult<string>>;
}

interface AIProviderConfig {
  enabled: boolean;
  provider: 'none' | 'openai-compatible' | 'anthropic' | 'local-webllm' | 'custom';
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxOutputChars?: number;
  timeoutMs?: number;
}
```

- `enrichDialogueCopy` 只能改写作者已定义的 `optionId` 显示文本，不能增加新选项、改变选项顺序或返回 `Effect`；逻辑语义永远由 `semanticTag` 与原配置决定。
- `AIProviderConfig` 不包含 `apiKey`。凭据属于独立、不可序列化的运行时输入，不得进入 Zustand、GameSaveV2、IndexedDB、localStorage、日志、错误报告或导出 JSON。
- 1.0 的 `GameSettings` 只预留 `aiEnhancement: { enabled: false; provider: 'none' }` 默认值，不显示灰色“即将推出”入口；实际 Provider 上线时再通过存档迁移开放设置 UI。

#### 本地实现与调用流程

- `LocalTextProvider` 同步返回本地旁白池或模板结果，执行现有标签过滤、冷却和去重；任何调用场景都有非空本地结果。
- 所有旁白、补充对白、战报、委托描述、门人汇报、闲置心声和物品风味文本统一经 `TextProvider` 获取；主线作者对白仍直接来自章节内容配置。
- `narrate` 等 EventBus 事件只携带安全 ID 与数值摘要，由监听者构造白名单 Context 后调用 Provider；Provider 返回值不能重新发布领域事件。
- 未来的远程适配器必须由 `ResilientTextProvider` 包装，始终携带 `LocalTextProvider`，支持 `AbortSignal`、截止时间、单次失败回退和连续失败熔断。
- 可选增强结果仅做会话级短缓存，缓存键由内容版本、语境和密度组成；不写入权威存档，不消耗游戏 RNG，也不影响回放与自动化测试。

#### 凭据与未来接入决策

- 纯静态 Pages 无法安全保存开发者远程 API 密钥。[OpenAI 生产环境最佳实践](https://developers.openai.com/api/docs/guides/production-best-practices#api-keys)也要求避免把 API Key 暴露在代码或公开仓库，并建议使用安全的服务端环境或密钥管理方案；因此 1.0 不实现浏览器内远程 OpenAI 调用。
- 后续可优先支持无需远程密钥的本地 WebLLM/本地兼容端点；若接入商业远程 API，应另立里程碑，在“独立受控代理”与“用户自带 Key、仅本次会话内存保存并明确风险”之间重新评审。
- Web Crypto 不能把同源页面必须使用的长期密钥变成真正不可提取的服务端秘密，不能作为静态站安全保存 API Key 的承诺。
- 任何未来远程模式都必须取得用户主动同意，展示实际目标域名、发送的数据类别和可能费用，并提供立即关闭与清空会话凭据的操作。

## 8. 存档、异常恢复与资源管理

### GameSaveV2

- 三个手动档、一个自动档和一个 `sessionStorage` 崩溃恢复临时档。
- 自动档仅在进入新区域、战斗胜利、交付任务后产生；禁止在战斗中和对话分支中途存档。
- 关键节点写自动档前先保留上一份轻量备份；异常面板提供恢复自动档、恢复临时档和导出当前数据。
- 保存章节、任务、物品、武学、配方、门派、委托、结局标记、RNG、schema 版本和内容版本。
- 导入时校验 schema、引用完整性和校验和；覆盖前自动备份当前档。
- Demo 尚未正式上线，因此不承诺 V1 存档迁移；1.0 发布后必须支持所有 1.x 增量迁移。

```ts
interface SaveMigration {
  from: number;
  to: number;
  migrate: (input: unknown) => unknown;
}
```

- 迁移按版本连续注册，不允许跨版本猜测补丁；每个迁移具有有效旧档、缺字段旧档和损坏档测试。

### 资源预算

- 图片统一 WebP；短音效与短循环优先，本地 Web Audio 可补充程序化音色。
- 首屏压缩资源不超过 5 MB，单区域新增资源不超过 5 MB，总发行包目标不超过 40 MB。
- 区域内容动态导入；离开区域后释放不再使用的大图引用、区域音效和临时战斗资源。
- 战斗日志最多 50 条；旁白已读池按章节清理；并发 SFX 最大 6。
- 所有字体、图片、音频和数据随游戏打包，运行时不得请求第三方资源。

## 9. 构建期内容校验

`pnpm content:validate` 失败即阻止构建，至少检查：

- 重复 ID、缺失引用、无效奖励、非法数值范围和循环前置条件。
- 主线节点不可达、对话无出口、所有可见选项都被条件锁死的死胡同。
- 迷惑分支无法回归主线、任务完成后仍指向未完成状态。
- 奖励缺少幂等键、同一关键物品存在多次无条件交付。
- 四个结局条件至少各有一条静态可达路径；优先级明确，条件重叠时结果确定。
- 敏感词候选、未经世界观转译的品牌/平台称呼和缺失梗冷却组。
- 四层笑点缺少触发事件、首次/重复反馈、冷却组、数值预览或减少动态效果替代。
- 演出 `maxBlockingMs` 超过 `1200`、同一动作配置多个主笑点，或笑点 Effect 包含关键物品删除、永久减益等禁用效果。
- 情境首次奖励缺少幂等键、互动链没有稳定重复状态、关键 NPC 反应链覆盖或移除了主线推进动作。
- 每章四层覆盖不足，或 Core 总量低于 8 个规则模块、12 组情境组合和 10 条互动链。
- 任一非主线文本出口没有 `LocalTextProvider` 回退、Provider Context 包含完整存档/PlayerState，或 AI 对话补丁引用不存在的 `optionId`。
- AI 配置或存档 schema 出现 `apiKey`、`secret` 等凭据字段；任何增强结果被配置为 Condition、Effect、RNG、任务或结局输入。
- 内容清单数量与 Core 门槛一致；Optional 关闭时不存在悬空入口。

## 10. 实施里程碑与验收卡点

### M1：核心架构与第一章迁移

- 拆分 Screen、组件、领域系统和 store slices。
- 完成 `ContentManifest`、`Condition/Effect`、EventBus、`ComedyDirector`、`TextProvider`、内容校验器、GameSaveV2 与迁移注册表。
- 实现 `LocalTextProvider` 并迁移旁白、补充对白、战报、委托/门人模板等非主线文本出口；1.0 构建不包含远程适配器或凭据 UI。
- 将当前小愚村 Demo 完整迁移为第一章数据，不改变现有可玩闭环。
- 建立章节模板、敌人模板、对话模板和固定 RNG 测试夹具。
- 在第一章各实现 1 个可验证的规则、情境、互动与演出笑点，作为后续章节模板。

验收：第一章可从创角玩到白大侠胜利；四层示例均由领域事件驱动且关闭动画后仍可理解；所有 Provider 调用在断网和异常模拟下返回本地结果；条件/奖励不写在组件；制造重复 ID、死对话、循环任务、超时演出或重复奖励时校验器会失败；刷新和损坏档恢复可验证。M1 未通过不得批量制作后续章节。

### M2：系统纵向切片与前三章扩展

- 完成意图/架势战斗、核心武学树、六槽装备、采集、锻造和烹饪。
- 完成清河县、黑风寨、青云山的 Core 内容。
- 完成 8 个 Core 诙谐规则模块，并累计至少 6 组情境组合与 5 条互动反应链。
- 固定 RNG 批量模拟三档难度，集中调整架势、内力、敌人意图和 Boss 时长。

验收：同一内容模板可创建新敌人/任务而无需修改引擎；标准难度无主线必败组合；手机和桌面均跑通前三章。

### M3：后半程剧情与四结局

- 完成西域驿路、东海镇、京城、武林大会 Core 内容和百晓榜系统。
- 实现四个结局判定、不可逆提示和章节快照测试。
- 补齐 12 组 Core 情境组合、10 条互动反应链及 8 场 Boss 专属演出节拍，检查各章四层覆盖。
- 执行首次完整黄金路径人工实测并记录各章节耗时、战斗数和失败点。

验收：四结局静态与 E2E 路径均可达；主线中位时长进入 8–12 小时，否则依据砍项规则调整后再进入 M4。

### M4：门派与通关后生态

- 完成四设施、6 名 Core 门人、Tick 派遣、委托池和经营反馈闭环。
- 在 Core 稳定后按产能加入其余门人、秘境和隐藏 Boss。

验收：经营收益能影响战力或结局属性；无真实时间依赖；重复委托不会成为最优的无限刷取路径。

### M5：Polish、梗包与发布

- 完成三档梗包、四层笑点密度与节奏审查、梗新鲜度/敏感语境审查、图鉴、成就、音频、响应式和无障碍打磨。
- 执行内存泄漏检查、包体审计、断网离线包验证和 Pages 子路径验证。
- Optional 逐项验收；未完成项目整体关闭。

验收：全部发布门槛通过，断网包无第三方请求，Pages 全设备路径可玩，无占位内容。

## 11. 测试矩阵

- Vitest：战斗公式、技能组合、Boss 阶段、架势、装备强化、配方、经营收益、Condition/Effect、EventBus 顺序与循环保护、奖励幂等、梗去重、四结局和逐版存档迁移。
- 四层专项测试：规则笑点的预览值与实际值一致；情境组合在固定 RNG 下可复现且首次奖励只发一次；互动链逐级推进后稳定；演出跳过、静音或减少动态效果不改变领域结果。
- 节奏测试：同一动作不出现多个主笑点，重复反馈正确降级，阻塞演出不超过 `1.2s`，冷却不会导致任务所需反馈消失。
- TextProvider：本地结果确定且非空；模拟异步超时、拒绝、取消、非法长度和过期 `requestId` 时均回退且不替换已显示内容。
- AI 隔离：测试 Provider 返回伪造 Effect、HTML、未知 optionId 或超长文本时全部被拒绝；三档 Provider 输出不会改变同一种子下的任务、奖励、战斗和结局快照。
- 凭据防泄漏：序列化 GameSettings、GameSaveV2、导出 JSON、错误日志夹具时不包含 Key；1.0 断网 E2E 断言零 AI/第三方网络请求。
- 内容模拟：固定 RNG 批量运行战斗；静态遍历所有主线、对话和结局路径。
- Playwright 黄金路径：从创角到一个结局的完整流程；其他结局用章节快照覆盖。
- Playwright 作死路径：加辣梗密度、连续迷惑选项、失败重试和跳过已读，仍能到达结局。
- 存档边界：三个档位、自动档、临时恢复、损坏 JSON、版本不符、导入覆盖、空间不足和刷新。
- 视口：360×800、412×915、768×1024、1440×900、1920×1080；无横向溢出、遮挡或小于 44px 的触摸目标。
- 性能：首屏与区域切换记录资源体积和加载时间；长时间跨区域/战斗后检查监听器、大图与音频引用释放。
- 发布：Release 包断网运行；Pages 验证所有资源路径、首次加载、刷新继续和移动端全流程。

## 12. 明确不在 1.0 范围

- 多人、账号、云存档、排行榜、付费、广告和服务器功能。
- 同伴战斗、钓鱼、家园摆放、开放世界自由移动和实时战斗。
- 桌面客户端壳；Release 只提供同版本离线网页包。
- 依赖现实日期、倒计时、在线热点或第三方 API 的内容。
- 真实 AI/大模型请求、远程 Provider、API Key 输入与保存界面、托管代理、模型选择器及 AI 生成任务逻辑；1.0 仅交付接口与本地 Provider。

## 13. 已确认假设

- 8 个区域和四结局是正式版叙事骨架；内容数量目标受 Core/Optional 闸门约束。
- Pages 与下载包均为纯前端版本，存档只在玩家浏览器本地。
- 桌面与移动端同等优先，不通过隐藏系统来规避小屏适配。
- 现代梗采用耐久、分层和江湖化表达；纯江湖内部幽默占多数。
- AI 接口预留不改变纯离线承诺；任何远程 AI 能力都属于 1.0 之后需独立授权、隐私评审和发布决策的新范围。
- 优先完成可复用引擎和第一章验收，再批量生产内容；不得为了数字目标复制低质量任务。
