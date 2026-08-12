import { CH01_BOSS_REWARD } from '../src/content/chapters/ch01-combat'
import { CH02_BOSS_REWARD } from '../src/content/chapters/ch02-combat'
import { CH03_BOSS_REWARD } from '../src/content/chapters/ch03-combat'
import { CH04_BOSS_REWARD } from '../src/content/chapters/ch04-combat'
import { CH05_BOSS_REWARD } from '../src/content/chapters/ch05-combat'
import { CH06_BOSS_REWARD } from '../src/content/chapters/ch06-combat'
import { CH07_BOSS_REWARD } from '../src/content/chapters/ch07-combat'
import { CH08_BOSS_REWARD } from '../src/content/chapters/ch08-combat'
import { CH01_ENEMY_DEFINITIONS, CH02_ENEMY_DEFINITIONS, CH03_ENEMY_DEFINITIONS, CH04_ENEMY_DEFINITIONS, CH05_ENEMY_DEFINITIONS, CH06_ENEMY_DEFINITIONS, CH07_ENEMY_DEFINITIONS, CH08_ENEMY_DEFINITIONS } from '../src/content/enemies'
import { CORE_CHAPTER_PROGRESSION_BUDGETS, CORE_BUILD_PROFILES, type ChapterProgressionBudget } from '../src/content/balance/progression'
import { CORE_EARLY_EQUIPMENT, CORE_LATE_EQUIPMENT } from '../src/content/items/equipment'
import { CORE_ENEMY_VARIANTS } from '../src/content/enemies/regions'
import { coreActiveSkills } from '../src/content/skills'
import { simulateBattles, type BattleSimulationReport, type CombatSimulationRequest } from '../src/systems/combat/simulator'

const rewards = [CH01_BOSS_REWARD, CH02_BOSS_REWARD, CH03_BOSS_REWARD, CH04_BOSS_REWARD, CH05_BOSS_REWARD, CH06_BOSS_REWARD, CH07_BOSS_REWARD, CH08_BOSS_REWARD]
const enemies = [CH01_ENEMY_DEFINITIONS, CH02_ENEMY_DEFINITIONS, CH03_ENEMY_DEFINITIONS, CH04_ENEMY_DEFINITIONS, CH05_ENEMY_DEFINITIONS, CH06_ENEMY_DEFINITIONS, CH07_ENEMY_DEFINITIONS, CH08_ENEMY_DEFINITIONS]

export interface BuildSimulationSummary {
  readonly winRate: number
  readonly p95Rounds: number
  readonly maxRounds: number
  readonly issues: readonly string[]
  readonly pass: boolean
}

export interface ChapterProgressionReport {
  readonly chapter: number
  readonly recommendedLevel: number
  readonly goldenPathBattles: number
  readonly estimatedCombatMinutes: number
  readonly reward: { readonly experience: number; readonly silver: number; readonly itemId: string }
  readonly resourceBreakpoints: readonly string[]
  readonly equipmentChoices: number
  readonly coreEnemyVariants: number
  readonly builds: Readonly<Record<string, BuildSimulationSummary>>
}

export interface ProgressionReport {
  readonly generatedAt: string
  readonly measuredHumanPlaytime: false
  readonly chapters: readonly ChapterProgressionReport[]
  readonly allBuildsPass: boolean
  readonly findings: readonly string[]
}

function buildRequest(chapter: number, buildId: string): CombatSimulationRequest {
  const definition = enemies[chapter - 1]?.find((candidate) => candidate.role === 'boss')
  if (!definition) throw new Error(`第${chapter}章没有 Boss。`)
  const modifiers: Record<string, { hp: number; qi: number; attack: number; defense: number; dodge: number; crit: number }> = {
    balanced: { hp: 0, qi: 0, attack: 0, defense: 0, dodge: 0, crit: 0 },
    aggressive: { hp: -8, qi: 0, attack: 4, defense: -1, dodge: 0, crit: 0.03 },
    guardian: { hp: 16, qi: 4, attack: -2, defense: 3, dodge: -0.01, crit: -0.01 },
    flow: { hp: 2, qi: 10, attack: 1, defense: 0, dodge: 0.04, crit: 0.01 },
  }
  const modifier = modifiers[buildId]!
  return {
    player: {
      id: `build:progression:${buildId}:ch0${chapter}`,
      name: `${buildId} progression build`,
      level: Math.max(1, chapter),
      stats: {
        maxHp: 100 + chapter * 5 + modifier.hp,
        maxQi: 55 + chapter * 3 + modifier.qi,
        attack: 18 + chapter * 1.2 + modifier.attack,
        defense: 9 + chapter * .8 + modifier.defense,
        posture: 100,
        accuracy: .92,
        dodge: .08 + modifier.dodge,
        crit: .1 + modifier.crit,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: .12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy: definition,
    difficulty: 'standard',
    seeds: { start: 1, end: 20 },
    strategy: buildId === 'guardian' ? 'conservative' : buildId === 'aggressive' ? 'aggressive' : 'balanced',
    mainline: false,
  }
}

function summarize(report: BattleSimulationReport): BuildSimulationSummary {
  return { winRate: report.winRate, p95Rounds: report.rounds.p95, maxRounds: report.rounds.maximum, issues: report.issues.map((issue) => issue.code), pass: report.wins > 0 && report.timeouts === 0 && report.issues.every((issue) => issue.code !== 'long_battle' && issue.code !== 'guaranteed_loss') }
}

function breakpointFindings(budget: ChapterProgressionBudget, chapter: number, reward: typeof rewards[number]): string[] {
  const findings: string[] = []
  if (reward.silver > budget.rewardSilver * 1.25) findings.push(`第${chapter}章 Boss 银两高于预算 25%`)
  if (reward.experience > budget.rewardExperience * 1.25) findings.push(`第${chapter}章 Boss 经验高于预算 25%`)
  if (budget.goldenPathBattles > 12) findings.push(`第${chapter}章黄金路径战斗数超过 12，需要压缩往返`)
  if (budget.materialStacks < 2) findings.push(`第${chapter}章材料供给低于安全阀`)
  return findings
}

export function createProgressionReport(): ProgressionReport {
  const chapters = CORE_CHAPTER_PROGRESSION_BUDGETS.map((budget, index) => {
    const reward = rewards[index]!
    const variants = CORE_ENEMY_VARIANTS.filter((variant) => variant.chapterId === `ch0${budget.chapter}`).length
    const builds = Object.fromEntries(CORE_BUILD_PROFILES.map((profile) => [profile.id, summarize(simulateBattles(buildRequest(budget.chapter, profile.id)))]))
    return {
      chapter: budget.chapter,
      recommendedLevel: budget.recommendedLevel,
      goldenPathBattles: budget.goldenPathBattles,
      estimatedCombatMinutes: Number((budget.goldenPathBattles * 1.7).toFixed(1)),
      reward: { experience: reward.experience, silver: reward.silver, itemId: reward.itemId },
      resourceBreakpoints: breakpointFindings(budget, budget.chapter, reward),
      equipmentChoices: [...CORE_EARLY_EQUIPMENT, ...CORE_LATE_EQUIPMENT].filter((equipment) => equipment.chapter === budget.chapter).length,
      coreEnemyVariants: variants,
      builds,
    }
  })
  const findings = chapters.flatMap((chapter) => chapter.resourceBreakpoints)
  const allBuildsPass = chapters.every((chapter) => Object.values(chapter.builds).every((build) => build.pass))
  return { generatedAt: new Date().toISOString(), measuredHumanPlaytime: false, chapters, allBuildsPass, findings }
}

export function formatProgressionReport(report: ProgressionReport): string {
  const lines = [`黄金路径成长报告（自动估算，非真人时长）：${report.allBuildsPass ? '四种构筑均通过固定种子样本' : '存在构筑需要回归审查'}`]
  report.chapters.forEach((chapter) => {
    const buildSummary = Object.entries(chapter.builds).map(([id, build]) => `${id} ${(build.winRate * 100).toFixed(0)}%/p95${build.p95Rounds}`).join(' · ')
    lines.push(`ch0${chapter.chapter} Lv${chapter.recommendedLevel} · 战斗${chapter.goldenPathBattles} · 估算战斗${chapter.estimatedCombatMinutes}min · 装备${chapter.equipmentChoices} · 敌人变体${chapter.coreEnemyVariants} · ${buildSummary}`)
  })
  if (report.findings.length) lines.push(`资源断点：${report.findings.join('；')}`)
  else lines.push('资源断点：未发现超过阈值的奖励或黄金路径战斗量。')
  return lines.join('\n')
}

const report = createProgressionReport()
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
else console.log(formatProgressionReport(report))
