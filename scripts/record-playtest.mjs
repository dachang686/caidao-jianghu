import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout } from 'node:process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, 'docs', 'playtest-runs')
const mainlineSegments = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08']
const postgameSegments = ['optional-intro', 'dungeon-1', 'commission-loop-1', 'hidden-boss', 'dungeon-2']

function readOption(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] ?? fallback : fallback
}

function printHelp() {
  console.log(`真人墙钟计时工具

用法：
  pnpm playtest:timer -- --round 1 --player "姓名" --device "设备" --browser "浏览器"
  pnpm playtest:timer -- --mode postgame --round 1 --player "姓名" --device "设备"

参数：
  --round    轮次编号，必填
  --player   真人标识（可使用化名）
  --device   设备与屏幕尺寸
  --browser  浏览器版本
  --mode     mainline（默认，8 章）或 postgame（5 个 Optional 环节）

工具只在真人按回车后记录墙钟时间；不会启动浏览器、点击页面或读取自动化耗时。`)
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelp()
  process.exit(0)
}

const round = readOption('--round')
const mode = readOption('--mode', 'mainline')
const player = readOption('--player', '待填写真人')
const device = readOption('--device', '待填写设备')
const browser = readOption('--browser', '待填写浏览器')
if (!round || !/^\d+$/.test(round)) {
  console.error('缺少有效的 --round，例如 --round 1。')
  process.exit(1)
}
if (mode !== 'mainline' && mode !== 'postgame') {
  console.error('--mode 只能是 mainline 或 postgame。')
  process.exit(1)
}

const segments = mode === 'mainline' ? mainlineSegments : postgameSegments
const readline = createInterface({ input, output: stdout })
const records = []
const sessionStartedAt = new Date().toISOString()
console.log(`\n${mode === 'mainline' ? '主线真人黄金路径' : 'Optional 通关后真人环节'}第 ${round} 轮。`)
console.log('请先打开本地游戏并从对应的空存档/安全节点开始；本工具不会替你操作游戏。\n')

try {
  for (const segment of segments) {
    await readline.question(`[${segment}] 准备好后按 Enter 开始计时：`)
    const startedAt = new Date()
    await readline.question(`[${segment}] 完成该环节后按 Enter 停止计时：`)
    const endedAt = new Date()
    const retries = await readline.question(`[${segment}] 失败/重试次数（没有填 0）：`)
    const notes = await readline.question(`[${segment}] 备注（暂停、加载、异常等；没有可留空）：`)
    records.push({
      segment,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      wallClockMinutes: Math.round((endedAt.getTime() - startedAt.getTime()) / 6000) / 10,
      retries: Number.isInteger(Number(retries)) && Number(retries) >= 0 ? Number(retries) : null,
      notes,
    })
  }
} finally {
  readline.close()
}

const sessionEndedAt = new Date().toISOString()
const totalMinutes = records.reduce((sum, record) => sum + record.wallClockMinutes, 0)
const stamp = sessionEndedAt.replace(/[:.]/g, '-').replace('Z', '')
const output = {
  measuredHumanPlaytime: true,
  mode,
  round: Number(round),
  player,
  device,
  browser,
  sessionStartedAt,
  sessionEndedAt,
  totalWallClockMinutes: Math.round(totalMinutes * 10) / 10,
  segments: records,
  source: '真人按键记录；非 Playwright、模拟器或自动估算',
}
await mkdir(outputDirectory, { recursive: true })
const filePath = path.join(outputDirectory, `${mode}-round-${round}-${stamp}.json`)
await writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
console.log(`\n已保存真人记录：${path.relative(root, filePath)}`)
console.log(`总墙钟时长：${output.totalWallClockMinutes} 分钟；请将章节/环节数据汇总到 docs/PLAYTEST_REPORT.md。`)
