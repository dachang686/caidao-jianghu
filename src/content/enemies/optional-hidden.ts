import type { ChapterEnemyDefinition } from '../../types/chapter-combat'
import type { PresentationCueDefinition } from '../../types/comedy'
import { asChapterId, asEnemyId } from '../../types/ids'
import { CORE_ASSET_IDS } from '../assets'

export interface OptionalHiddenBossDefinition extends ChapterEnemyDefinition {
  readonly optional: true
  readonly discoveryClue: string
  readonly assetIds: readonly string[]
  readonly firstRewardGrantKey: string
  readonly firstRewardSummary: string
}

const names = ['锅底幽灵', '缺页捕风人', '空旗回声', '门规抄写鬼', '沙井倒影王', '潮声留影兽', '榜外墨客', '无名评判者'] as const
const chapters = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08'] as const
const mechanics = ['反复核对同一条意图', '缺页时降低伤害但提高架势压力', '空旗换位前公开落点', '门规过长时进入可读蓄力', '沙尘只影响命中不改变奖励', '潮声回流前留下声音提示', '榜外批注会被玩家查到', '评判暂停时仍保留安全退出'] as const
const chapterBackgroundAssets = [
  CORE_ASSET_IDS.villageBackground,
  CORE_ASSET_IDS.qingheMarketBackground,
  CORE_ASSET_IDS.blackwindFortressBackground,
  CORE_ASSET_IDS.qingyunMountainBackground,
  CORE_ASSET_IDS.westernRelayBackground,
  CORE_ASSET_IDS.donghaiTownBackground,
  CORE_ASSET_IDS.capitalRankingBackground,
  CORE_ASSET_IDS.martialConventionBackground,
] as const

function bossAt(index: number): OptionalHiddenBossDefinition {
  const chapterId = chapters[index]!
  const enemyId = asEnemyId(`enemy:optional:hidden:${index + 1}`)
  const moveBase = `move:optional:hidden:${index + 1}`
  const attack = 19 + index * 2
  const cueId = `presentation:optional:hidden:${index + 1}`
  return {
    id: enemyId,
    chapterId: asChapterId(chapterId),
    role: 'boss',
    name: names[index]!,
    readableIntent: true,
    behavior: { id: `template:optional:hidden:${index + 1}`, name: '隐藏机制公开模板', moveIds: [`${moveBase}:main`, `${moveBase}:guard`, `${moveBase}:special`], fallbackMoveId: `${moveBase}:main`, tags: ['optional', 'hidden-boss', 'readable-intent'] },
    moves: [
      { id: `${moveBase}:main`, name: '公开出手', kind: 'aggressive', summary: `预计造成可预览伤害，${mechanics[index]}。`, weight: 3, power: 1.05 + index * 0.03, posturePower: 10 + index },
      { id: `${moveBase}:guard`, name: '安全留白', kind: 'defend', summary: '本回合减伤约 30%，不会隐藏下一次意图。', weight: 1, guardRatio: 0.3 },
      { id: `${moveBase}:special`, name: '机制亮牌', kind: 'special', summary: `特殊效果先展示：${mechanics[index]}。`, weight: 1, power: 0, posturePower: 0 },
    ],
    curve: { maxHp: { base: 190 + index * 8 }, maxQi: { base: 58 + index * 2 }, attack: { base: attack }, defense: { base: 13 + index }, posture: { base: 48 + index * 2 }, accuracy: { base: 0.9 }, dodge: { base: 0.06 }, crit: { base: 0.1 } },
    boss: { phases: [{ id: `${moveBase}:phase-one`, phase: 1, hpThresholdRatio: 1, moveIds: [`${moveBase}:main`, `${moveBase}:guard`, `${moveBase}:special`] }, { id: `${moveBase}:phase-two`, phase: 2, hpThresholdRatio: 0.5, moveIds: [`${moveBase}:main`, `${moveBase}:special`, `${moveBase}:guard`], deceptiveChance: 0.12 }] },
    specialRuleIds: [`rule:optional:hidden:${index + 1}`],
    presentationCueIds: [cueId],
    optional: true,
    discoveryClue: `线索 ${index + 1}：${mechanics[index]}，可从正常探索与门派记录自然发现。`,
    assetIds: [chapterBackgroundAssets[index]!],
    firstRewardGrantKey: `reward:optional:hidden-boss:${index + 1}`,
    firstRewardSummary: `首胜获得后期材料与图鉴记录，重复挑战不清除主线装备。`,
  }
}

export const OPTIONAL_HIDDEN_BOSSES: readonly OptionalHiddenBossDefinition[] = Array.from({ length: 8 }, (_, index) => bossAt(index))
export const OPTIONAL_HIDDEN_BOSS_DISCOVERY_CLUES = OPTIONAL_HIDDEN_BOSSES.map((boss) => ({ bossId: String(boss.id), clue: boss.discoveryClue }))
export const OPTIONAL_HIDDEN_BOSS_REWARDS = OPTIONAL_HIDDEN_BOSSES.map((boss) => ({ bossId: String(boss.id), grantKey: boss.firstRewardGrantKey, summary: boss.firstRewardSummary }))
export const OPTIONAL_HIDDEN_BOSS_CUES: readonly PresentationCueDefinition[] = OPTIONAL_HIDDEN_BOSSES.map((boss, index) => ({ id: boss.presentationCueIds![0]!, steps: [{ type: 'anticipation', durationMs: 180 }, { type: 'action', durationMs: 220 }, { type: 'pause', durationMs: 240 }, { type: 'reaction', durationMs: 220 }], shortCueId: `cue:optional:hidden:${index + 1}:short`, reducedMotionCueId: `cue:optional:hidden:${index + 1}:static`, sfxCooldownGroup: `optional-hidden-boss-${index + 1}` }))
