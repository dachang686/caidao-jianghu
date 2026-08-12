import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores'

export function BossKey() {
  const toggleBossKey = useGameStore((state) => state.toggleBossKey)
  const player = useGameStore((state) => state.player)
  const returnButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    returnButton.current?.focus()
    return () => { previousFocus.current?.focus() }
  }, [])
  return <main className="boss-key-screen" data-testid="boss-key-screen" aria-label="采购表暂停页"><header><b>小愚村第一季度农产品采购表</b><button ref={returnButton} onClick={toggleBossKey}>返回采购现场</button></header><table><caption>本地采购清单</caption><thead><tr><th>品类</th><th>供应商</th><th>数量</th><th>单价</th><th>备注</th></tr></thead><tbody>{[['咸鱼干','大黄猫后勤组','12','8 文','猫不许报销'],['生锈菜刀','悦来客栈','1','50 两','切菜兼防身'],['二锅头','村口杂货铺','4','6 两','严禁上擂台'],['粗布短褂', player?.name ?? '临时工','1','免费','已领用']].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p>提示：按 Esc 可继续处理采购事宜。战斗、对白计时和音频在此页暂停。</p></main>
}
