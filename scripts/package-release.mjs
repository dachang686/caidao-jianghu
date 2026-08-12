import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const output = join(root, 'output', 'offline-package')
if (!existsSync(dist)) {
  console.error('release:package failed: dist 不存在，请先运行 pnpm build')
  process.exit(1)
}

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
const packageRoot = join(output, 'caidao-jianghu')
cpSync(dist, packageRoot, { recursive: true })
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
writeFileSync(join(output, 'OFFLINE-README.md'), `# 菜刀闯江湖离线包\n\n版本：${packageJson.version}\n\n在本目录运行任意静态文件服务器后打开 \/caidao-jianghu\/；不要直接双击 index.html，以便浏览器正确处理模块资源。\n\n示例：\n\n\`\`\`powershell\npython -m http.server 4173\n\`\`\`\n\n然后访问 http:\/\/127.0.0.1:4173\/caidao-jianghu\/。该包只包含本地构建资源，不依赖 CDN、远程 AI 或第三方请求。\n`)
writeFileSync(join(output, 'VERSION'), `${packageJson.version}\n`)
console.log(`release:package passed: ${output}`)
