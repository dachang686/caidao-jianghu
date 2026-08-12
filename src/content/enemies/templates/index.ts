import type { CoreEnemyBehaviorTemplate } from '../../../types/enemy'

export const CORE_ENEMY_BEHAVIOR_TEMPLATES: readonly CoreEnemyBehaviorTemplate[] = [
  { id: 'template:core:straight', name: '直来直往', description: '先出手再讲道理，攻击意图稳定可读。', moveIds: ['aggressive', 'defend'], fallbackMoveId: 'aggressive', tags: ['honest', 'pressure'], readableIntent: true, resourcePressure: ['hp'] },
  { id: 'template:core:skirmisher', name: '绕侧试探', description: '先削架势，再寻找低风险出手窗口。', moveIds: ['aggressive', 'charge', 'defend'], fallbackMoveId: 'aggressive', tags: ['honest', 'mobile'], readableIntent: true, resourcePressure: ['posture'] },
  { id: 'template:core:guard', name: '守门三式', description: '防守后反击，蓄力不会隐藏。', moveIds: ['defend', 'aggressive', 'charge'], fallbackMoveId: 'defend', tags: ['honest', 'guard'], readableIntent: true, resourcePressure: ['turns'] },
  { id: 'template:core:charger', name: '亮牌蓄力', description: '预告一次重击，玩家有明确的应对回合。', moveIds: ['charge', 'aggressive'], fallbackMoveId: 'aggressive', tags: ['honest', 'burst'], readableIntent: true, resourcePressure: ['qi'] },
  { id: 'template:core:trickster', name: '小伎俩', description: '用低伤干扰和短暂防守换取位置。', moveIds: ['special', 'aggressive', 'defend'], fallbackMoveId: 'aggressive', tags: ['honest', 'utility'], readableIntent: true, resourcePressure: ['accuracy'] },
  { id: 'template:core:posture-breaker', name: '专拆架势', description: '伤害一般，但会稳定消耗架势。', moveIds: ['posture', 'aggressive', 'defend'], fallbackMoveId: 'posture', tags: ['honest', 'posture'], readableIntent: true, resourcePressure: ['posture'] },
  { id: 'template:core:qi-drainer', name: '耗气缠斗', description: '以中等攻击换取内力压力，不制造隐藏即死。', moveIds: ['qi-drain', 'aggressive', 'defend'], fallbackMoveId: 'aggressive', tags: ['honest', 'qi'], readableIntent: true, resourcePressure: ['qi'] },
  { id: 'template:core:counter', name: '借力还力', description: '看见防守提示后再反击，节奏可预测。', moveIds: ['defend', 'counter', 'aggressive'], fallbackMoveId: 'defend', tags: ['honest', 'counter'], readableIntent: true, resourcePressure: ['turns'] },
  { id: 'template:core:ranged', name: '隔席投掷', description: '命中稳定但防御偏低，逼玩家主动接近。', moveIds: ['ranged', 'charge', 'defend'], fallbackMoveId: 'ranged', tags: ['honest', 'ranged'], readableIntent: true, resourcePressure: ['hp'] },
  { id: 'template:core:support', name: '同伴照应', description: '单体战中表现为自我恢复，数值有上限。', moveIds: ['support', 'defend', 'aggressive'], fallbackMoveId: 'aggressive', tags: ['honest', 'sustain'], readableIntent: true, resourcePressure: ['turns'] },
  { id: 'template:core:swarm', name: '人多势众', description: '单次攻击较轻，以连续小动作形成压力。', moveIds: ['aggressive', 'posture', 'special'], fallbackMoveId: 'aggressive', tags: ['honest', 'swarm'], readableIntent: true, resourcePressure: ['hp', 'posture'] },
  { id: 'template:core:formal', name: '先礼后兵', description: '先展示规则，再进行一轮明确的重击。', moveIds: ['special', 'charge', 'aggressive'], fallbackMoveId: 'aggressive', tags: ['honest', 'formal'], readableIntent: true, resourcePressure: ['qi', 'turns'] },
]

export const CORE_ENEMY_TEMPLATES = CORE_ENEMY_BEHAVIOR_TEMPLATES

export const coreEnemyBehaviorTemplates = CORE_ENEMY_BEHAVIOR_TEMPLATES
