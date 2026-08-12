import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const limits = { firstScreenBytes: 5 * 1024 * 1024, regionBytes: 5 * 1024 * 1024, totalBytes: 40 * 1024 * 1024 }

function filesUnder(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

if (!existsSync(dist)) {
  console.error('assets:audit failed: dist 不存在，请先运行 pnpm build')
  process.exit(1)
}

const builtFiles = filesUnder(dist).map((path) => ({ path, bytes: statSync(path).size }))
const totalBytes = builtFiles.reduce((total, file) => total + file.bytes, 0)
const jsFiles = builtFiles.filter((file) => file.path.endsWith('.js')).sort((left, right) => right.bytes - left.bytes)
const regionFiles = builtFiles.filter((file) => /\.(webp|png|jpg|jpeg|avif)$/i.test(file.path)).sort((left, right) => right.bytes - left.bytes)
const violations = []
if (totalBytes > limits.totalBytes) violations.push(`总包 ${formatBytes(totalBytes)} 超过 40 MiB`)
if ((jsFiles[0]?.bytes ?? 0) > limits.firstScreenBytes) violations.push(`首屏最大 JS ${formatBytes(jsFiles[0].bytes)} 超过 5 MiB`)
if ((regionFiles[0]?.bytes ?? 0) > limits.regionBytes) violations.push(`区域最大资源 ${formatBytes(regionFiles[0].bytes)} 超过 5 MiB`)

const sourceFiles = filesUnder(join(root, 'src')).filter((path) => /\.(ts|tsx|css|json)$/.test(path) && !/\.test\.[^.]+$/.test(path))
const remoteReferences = sourceFiles.flatMap((path) => {
  const text = readFileSync(path, 'utf8')
  return /https?:\/\//.test(text) ? [relative(root, path)] : []
})
if (remoteReferences.length > 0) violations.push(`源代码存在远程 URL：${remoteReferences.join(', ')}`)

console.log(`assets:audit ${violations.length === 0 ? 'passed' : 'failed'}`)
console.log(`总包 ${formatBytes(totalBytes)} · 最大 JS ${formatBytes(jsFiles[0]?.bytes ?? 0)} · 最大区域资源 ${formatBytes(regionFiles[0]?.bytes ?? 0)}`)
console.log(`文件数 ${builtFiles.length} · 首屏预算 ${formatBytes(limits.firstScreenBytes)} · 总包预算 ${formatBytes(limits.totalBytes)}`)
if (violations.length > 0) {
  violations.forEach((violation) => console.error(`- ${violation}`))
  process.exit(1)
}
