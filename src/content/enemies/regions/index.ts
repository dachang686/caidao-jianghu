import type { CoreEnemyEncounterTable, CoreEnemyVariant } from '../../../types/enemy'

const variant = (chapter: number, slug: string, name: string, templateId: string, moveSet: readonly string[], stats: CoreEnemyVariant['statProfile'], tags: readonly string[]): CoreEnemyVariant => ({
  id: `enemy:core:ch0${chapter}:${slug}`,
  chapterId: `ch0${chapter}`,
  role: 'normal',
  name,
  templateId,
  moveSet,
  statProfile: stats,
  readableIntent: true,
  encounterIds: [`encounter:core:ch0${chapter}:roster`],
  commissionIds: [`commission:core:enemy:ch0${chapter}:${slug}`],
  tags: [...tags, `chapter:${chapter}`],
})

export const CORE_ENEMY_VARIANTS: readonly CoreEnemyVariant[] = [
  variant(1, 'river-fisher', '河滩鱼叉客', 'template:core:straight', ['突刺', '抱竿'], { maxHp: 70, attack: 10, defense: 4, posture: 30 }, ['river', 'physical']),
  variant(1, 'pantry-runner', '后厨跑堂', 'template:core:skirmisher', ['锅铲闪身', '端盘蓄力'], { maxHp: 64, attack: 11, defense: 3, posture: 27 }, ['village', 'mobile']),
  variant(1, 'hill-medicine-thief', '山路药贩', 'template:core:support', ['药包', '短棍'], { maxHp: 76, attack: 9, defense: 5, posture: 33 }, ['hill', 'sustain']),
  variant(2, 'market-scale-runner', '市秤脚夫', 'template:core:guard', ['扁担横扫', '秤砣护身'], { maxHp: 86, attack: 12, defense: 6, posture: 35 }, ['market', 'guard']),
  variant(2, 'river-ferry-thief', '渡口偷船客', 'template:core:ranged', ['绳镖', '水花掩护'], { maxHp: 78, attack: 13, defense: 4, posture: 29 }, ['river', 'ranged']),
  variant(2, 'badge-imitator', '仿牌小吏', 'template:core:trickster', ['假章晃眼', '短刃'], { maxHp: 82, attack: 12, defense: 5, posture: 31 }, ['qinghe', 'utility']),
  variant(3, 'fortress-scout', '黑风哨探', 'template:core:charger', ['抬旗蓄势', '旗杆砸地'], { maxHp: 94, attack: 15, defense: 6, posture: 38 }, ['fortress', 'burst']),
  variant(3, 'ledger-thug', '账房打手', 'template:core:qi-drainer', ['撕账耗气', '木棍'], { maxHp: 98, attack: 14, defense: 7, posture: 36 }, ['fortress', 'qi']),
  variant(3, 'windmill-runner', '风车跑腿', 'template:core:swarm', ['连环抡臂', '绕后'], { maxHp: 88, attack: 13, defense: 5, posture: 34 }, ['fortress', 'swarm']),
  variant(4, 'mist-gate-clerk', '雾门执簿', 'template:core:formal', ['门规宣读', '石阶蓄力'], { maxHp: 104, attack: 16, defense: 8, posture: 41 }, ['qingyun', 'formal']),
  variant(4, 'mountain-herb-guard', '山腰药卫', 'template:core:posture-breaker', ['药杵破势', '药篓挡身'], { maxHp: 108, attack: 15, defense: 9, posture: 44 }, ['qingyun', 'posture']),
  variant(4, 'bell-tower-sparrer', '钟楼试剑童', 'template:core:counter', ['听钟借力', '回身剑'], { maxHp: 100, attack: 17, defense: 7, posture: 39 }, ['qingyun', 'counter']),
  variant(5, 'relay-inspector', '驿站验货员', 'template:core:guard', ['封条核验', '驼铃护身'], { maxHp: 116, attack: 17, defense: 9, posture: 45 }, ['western', 'guard']),
  variant(5, 'dune-smuggler', '沙丘走私客', 'template:core:trickster', ['沙尘扰眼', '短弯刀'], { maxHp: 110, attack: 18, defense: 7, posture: 40 }, ['western', 'utility']),
  variant(5, 'caravan-escort', '商队护路人', 'template:core:straight', ['护车劈', '车板叠甲'], { maxHp: 122, attack: 16, defense: 10, posture: 48 }, ['western', 'escort']),
  variant(6, 'dock-hookhand', '码头钩手', 'template:core:posture-breaker', ['钩索破势', '潮衣护身'], { maxHp: 128, attack: 19, defense: 10, posture: 50 }, ['donghai', 'posture']),
  variant(6, 'shell-market-scrapper', '贝市争价客', 'template:core:swarm', ['贝壳连掷', '讨价还价'], { maxHp: 120, attack: 18, defense: 8, posture: 46 }, ['donghai', 'swarm']),
  variant(6, 'tide-temple-keeper', '潮庙守香人', 'template:core:support', ['潮息调息', '香炉推'], { maxHp: 134, attack: 17, defense: 11, posture: 52 }, ['donghai', 'sustain']),
  variant(7, 'capital-archive-runner', '京卷传递人', 'template:core:ranged', ['墨签投掷', '翻卷蓄力'], { maxHp: 140, attack: 20, defense: 9, posture: 48 }, ['capital', 'ranged']),
  variant(7, 'ranking-office-clerk', '榜司抄录吏', 'template:core:formal', ['格式宣读', '印泥蓄力'], { maxHp: 146, attack: 19, defense: 12, posture: 55 }, ['capital', 'formal']),
  variant(7, 'street-rhyme-guard', '街谣护场人', 'template:core:counter', ['接句借力', '回身挡'], { maxHp: 138, attack: 21, defense: 10, posture: 51 }, ['capital', 'counter']),
  variant(8, 'convention-usher', '大会引位员', 'template:core:guard', ['叫号挡步', '牌位护身'], { maxHp: 154, attack: 21, defense: 13, posture: 58 }, ['convention', 'guard']),
  variant(8, 'sect-scorekeeper', '门派记分手', 'template:core:qi-drainer', ['记分耗气', '竹简横扫'], { maxHp: 150, attack: 22, defense: 11, posture: 54 }, ['convention', 'qi']),
  variant(8, 'kitchen-challenger', '厨房挑战客', 'template:core:charger', ['椒香蓄力', '锅盖重击'], { maxHp: 160, attack: 23, defense: 12, posture: 60 }, ['convention', 'burst']),
]

export const CORE_ENEMY_ENCOUNTERS: readonly CoreEnemyEncounterTable[] = Array.from({ length: 8 }, (_, index) => {
  const chapterId = `ch0${index + 1}`
  return {
    id: `encounter:core:${chapterId}:roster`,
    chapterId,
    enemyIds: CORE_ENEMY_VARIANTS.filter((enemy) => enemy.chapterId === chapterId).map((enemy) => enemy.id),
    contextTags: [`chapter:${index + 1}`, 'core', 'standard'],
  }
})

export const CORE_ENEMY_REGION_ROSTERS = CORE_ENEMY_ENCOUNTERS
export const coreEnemyVariants = CORE_ENEMY_VARIANTS
