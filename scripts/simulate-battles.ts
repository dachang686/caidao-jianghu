import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { CH01_ENEMY_DEFINITIONS, CH02_ENEMY_DEFINITIONS, CH03_ENEMY_DEFINITIONS, CH04_ENEMY_DEFINITIONS, CH05_ENEMY_DEFINITIONS, CH06_ENEMY_DEFINITIONS, CH07_ENEMY_DEFINITIONS, CH08_ENEMY_DEFINITIONS } from '../src/content/enemies'
import { coreActiveSkills } from '../src/content/skills/index'
import { simulateBattles, type CombatSimulationRequest, type SimulationStrategy } from '../src/systems/combat/simulator'
import type { CombatEnemyDefinition } from '../src/types/enemy'

function option(args: readonly string[], name: string): string | undefined {
  const prefix = `--${name}=`
  return args.find((argument) => argument.startsWith(prefix))?.slice(prefix.length)
}

function hasFlag(args: readonly string[], name: string): boolean {
  return args.includes(`--${name}`)
}

function numberOption(args: readonly string[], name: string, fallback: number): number {
  const raw = option(args, name)
  if (raw === undefined) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value)) throw new Error(`--${name} 必须是数字`)
  return value
}

function demoRequest(): CombatSimulationRequest {
  const enemy: CombatEnemyDefinition = {
    id: 'enemy:simulator-demo',
    name: '模拟基准山贼',
    behavior: { id: 'behavior:honest', name: '直来直往', moveIds: ['slash', 'guard'], fallbackMoveId: 'slash' },
    moves: [
      { id: 'slash', name: '横着砍', kind: 'aggressive', summary: '预计造成伤害', weight: 2, power: 0.9, posturePower: 5 },
      { id: 'guard', name: '先叠甲', kind: 'defend', summary: '减少下一次受到的伤害', weight: 1, guardRatio: 0.35 },
    ],
    curve: {
      maxHp: { base: 130 },
      maxQi: { base: 30 },
      attack: { base: 15 },
      defense: { base: 8 },
      posture: { base: 42 },
      accuracy: { base: 0.95 },
      dodge: { base: 0.04 },
      crit: { base: 0.05 },
    },
  }
  return {
    player: {
      id: 'build:simulator-demo',
      name: '批量模拟样本构筑',
      level: 3,
      stats: {
        maxHp: 110,
        maxQi: 42,
        attack: 22,
        defense: 10,
        posture: 30,
        accuracy: 0.96,
        dodge: 0.08,
        crit: 0.08,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: 0.12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy,
    difficulty: 'standard',
    seeds: { start: 1, end: 20 },
    strategy: 'balanced',
  }
}

function ch01BaiRequest(): CombatSimulationRequest {
  const enemy = CH01_ENEMY_DEFINITIONS.find((candidate) => candidate.role === 'boss')
  if (!enemy) throw new Error('第 1 章缺少 Boss 定义')
  return {
    player: {
      id: 'build:ch01-mainline',
      name: '第 1 章标准构筑',
      level: 1,
      stats: {
        maxHp: 100,
        maxQi: 55,
        attack: 18,
        defense: 9,
        posture: 100,
        accuracy: 0.9,
        dodge: 0.06,
        crit: 0.08,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: 0.12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy,
    difficulty: 'standard',
    seeds: { start: 1, end: 100 },
    strategy: 'balanced',
    mainline: true,
  }
}

function ch02BangsiRequest(): CombatSimulationRequest {
  const enemy = CH02_ENEMY_DEFINITIONS.find((candidate) => candidate.role === 'boss')
  if (!enemy) throw new Error('第 2 章缺少 Boss 定义')
  return {
    player: {
      id: 'build:ch02-mainline',
      name: '第 2 章标准构筑',
      level: 1,
      stats: {
        maxHp: 105,
        maxQi: 58,
        attack: 20,
        defense: 10,
        posture: 100,
        accuracy: 0.91,
        dodge: 0.07,
        crit: 0.09,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: 0.12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy,
    difficulty: 'standard',
    seeds: { start: 1, end: 100 },
    strategy: 'balanced',
    mainline: true,
  }
}

function ch03BlackwindLeaderRequest(): CombatSimulationRequest {
  const enemy = CH03_ENEMY_DEFINITIONS.find((candidate) => candidate.role === 'boss')
  if (!enemy) throw new Error('第 3 章缺少 Boss 定义')
  return {
    player: {
      id: 'build:ch03-mainline',
      name: '第 3 章标准构筑',
      level: 1,
      stats: {
        maxHp: 110,
        maxQi: 60,
        attack: 21,
        defense: 11,
        posture: 100,
        accuracy: 0.92,
        dodge: 0.08,
        crit: 0.1,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: 0.12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy,
    difficulty: 'standard',
    seeds: { start: 1, end: 100 },
    strategy: 'balanced',
    mainline: true,
  }
}

function ch04QingyunMasterRequest(): CombatSimulationRequest {
  const enemy = CH04_ENEMY_DEFINITIONS.find((candidate) => candidate.role === 'boss')
  if (!enemy) throw new Error('第 4 章缺少 Boss 定义')
  return {
    player: {
      id: 'build:ch04-mainline',
      name: '第 4 章标准构筑',
      level: 1,
      stats: {
        maxHp: 110,
        maxQi: 60,
        attack: 21,
        defense: 12,
        posture: 100,
        accuracy: 0.92,
        dodge: 0.08,
        crit: 0.1,
        qiRecovery: 3,
        healingMultiplier: 1,
        damageWhenPostureBroken: 0.12,
      },
      skills: coreActiveSkills.slice(0, 6),
    },
    enemy,
    difficulty: 'standard',
    seeds: { start: 1, end: 100 },
    strategy: 'balanced',
    mainline: true,
  }
}

function lateBossRequest(chapter: 5 | 6 | 7 | 8): CombatSimulationRequest {
  const definitions = { 5: CH05_ENEMY_DEFINITIONS, 6: CH06_ENEMY_DEFINITIONS, 7: CH07_ENEMY_DEFINITIONS, 8: CH08_ENEMY_DEFINITIONS }[chapter]
  const enemy = definitions.find((candidate) => candidate.role === 'boss')
  if (!enemy) throw new Error(`第 ${chapter} 章缺少 Boss 定义`)
  return { player: { id: `build:ch0${chapter}-mainline`, name: `第 ${chapter} 章标准构筑`, level: chapter - 1, stats: { maxHp: 120 + chapter * 4, maxQi: 64 + chapter * 2, attack: 23 + chapter, defense: 13 + chapter, posture: 100, accuracy: .93, dodge: .08, crit: .1, qiRecovery: 3, healingMultiplier: 1, damageWhenPostureBroken: .12 }, skills: coreActiveSkills.slice(0, 6) }, enemy, difficulty: 'standard', seeds: { start: 1, end: 100 }, strategy: 'balanced', mainline: true }
}

async function loadRequest(args: readonly string[]): Promise<CombatSimulationRequest> {
  const scenarioPath = option(args, 'scenario')
  if (!scenarioPath && !hasFlag(args, 'demo') && !hasFlag(args, 'ch01-bai') && !hasFlag(args, 'ch02-bangsi') && !hasFlag(args, 'ch03-blackwind-leader') && !hasFlag(args, 'ch04-qingyun-master') && !hasFlag(args, 'ch05-twin-bandits') && !hasFlag(args, 'ch06-tide-master') && !hasFlag(args, 'ch07-ranking-governor') && !hasFlag(args, 'ch08-ranking-master')) throw new Error('请提供 --scenario=文件路径，或使用内置章节 Boss 标志运行样本。')
  if (hasFlag(args, 'ch01-bai')) return ch01BaiRequest()
  if (hasFlag(args, 'ch02-bangsi')) return ch02BangsiRequest()
  if (hasFlag(args, 'ch03-blackwind-leader')) return ch03BlackwindLeaderRequest()
  if (hasFlag(args, 'ch04-qingyun-master')) return ch04QingyunMasterRequest()
  if (hasFlag(args, 'ch05-twin-bandits')) return lateBossRequest(5)
  if (hasFlag(args, 'ch06-tide-master')) return lateBossRequest(6)
  if (hasFlag(args, 'ch07-ranking-governor')) return lateBossRequest(7)
  if (hasFlag(args, 'ch08-ranking-master')) return lateBossRequest(8)
  if (!scenarioPath) return demoRequest()
  const raw = await readFile(resolve(scenarioPath), 'utf8')
  return JSON.parse(raw) as CombatSimulationRequest
}

function withCliOptions(request: CombatSimulationRequest, args: readonly string[]): CombatSimulationRequest {
  const hasSeedOption = ['start', 'end', 'step'].some((name) => option(args, name) !== undefined)
  const start = numberOption(args, 'start', 1)
  const end = numberOption(args, 'end', 20)
  const step = numberOption(args, 'step', 1)
  const strategy = option(args, 'strategy') as SimulationStrategy | undefined
  const difficulty = option(args, 'difficulty') as CombatSimulationRequest['difficulty'] | undefined
  return {
    ...request,
    seeds: hasSeedOption ? { start, end, step } : request.seeds,
    strategy: strategy ?? request.strategy,
    difficulty: difficulty ?? request.difficulty,
  }
}

function printUsage(): void {
  console.log('用法：pnpm simulate:battles -- --demo [--start=1 --end=100 --strategy=balanced --difficulty=standard]')
  console.log('第 1 章白大侠：pnpm simulate:battles -- --ch01-bai [--start=1 --end=100]')
  console.log('第 2 章榜下捕快：pnpm simulate:battles -- --ch02-bangsi [--start=1 --end=100]')
  console.log('第 3 章黑风寨主：pnpm simulate:battles -- --ch03-blackwind-leader [--start=1 --end=100]')
  console.log('第 4 章青云掌门：pnpm simulate:battles -- --ch04-qingyun-master [--start=1 --end=100]')
  console.log('第 5 章驿路双煞：pnpm simulate:battles -- --ch05-twin-bandits [--start=1 --end=100]')
  console.log('第 6 章海潮帮主：pnpm simulate:battles -- --ch06-tide-master [--start=1 --end=100]')
  console.log('第 7 章榜司督主：pnpm simulate:battles -- --ch07-ranking-governor [--start=1 --end=100]')
  console.log('第 8 章百晓榜主：pnpm simulate:battles -- --ch08-ranking-master [--start=1 --end=100]')
  console.log('或：pnpm simulate:battles -- --scenario=path/to/scenario.json')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (hasFlag(args, 'help')) {
    printUsage()
    return
  }
  const request = withCliOptions(await loadRequest(args), args)
  const report = simulateBattles(request)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
