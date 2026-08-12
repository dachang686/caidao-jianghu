import { useEffect } from 'react'
import baiSprite from '../assets/characters/bai.webp'
import heroSprite from '../assets/characters/hero.webp'
import { Button, Meter } from '../components/game-ui'
import { useRootGameStore } from '../stores'
import { audioDirector } from '../systems/audio'
import { SKILLS } from '../game/data'
import { coreActiveSkills } from '../content/skills'

export function BattleScreen() {
  const player = useRootGameStore((state) => state.player)!
  const battle = useRootGameStore((state) => state.battle)!
  const useSkill = useRootGameStore((state) => state.useSkill)
  const retryBattle = useRootGameStore((state) => state.retryBattle)
  const leaveBattle = useRootGameStore((state) => state.leaveBattle)
  const lastLog = battle.logs.at(-1)
  useEffect(() => {
    if (!lastLog) return
    if (battle.turn === 'victory') audioDirector.play('victory')
    else if (lastLog.text.includes('风火轮') || lastLog.text.includes('躺')) audioDirector.play('silly')
    else if (lastLog.kind === 'player' || lastLog.kind === 'enemy' || lastLog.kind === 'critical') audioDirector.play('hit')
  }, [battle.turn, lastLog])
  return (
    <main className="battle-screen scenic-surface">
      <header className="battle-top"><span>小愚村 · 悦来客栈擂台</span><Button onClick={leaveBattle}>暂离擂台</Button></header>
      <section className="battle-stage">
        <Combatant name={player.name} hp={player.hp} maxHp={player.maxHp} qi={player.qi} maxQi={player.maxQi} side="player" />
        <div className="versus">VS<small>第 {battle.round} 回合</small></div>
        <Combatant name={battle.enemy.name} hp={battle.enemy.hp} maxHp={battle.enemy.maxHp} qi={battle.enemy.qi} maxQi={battle.enemy.maxQi} side="enemy" phase={battle.enemy.phase} />
      </section>
      <section className="battle-log" aria-live="polite">{battle.logs.map((log) => <p className={`log-${log.kind}`} key={log.id}>{log.text}</p>)}</section>
      {battle.turn === 'victory' && <section className="result-card result-card--victory"><h2>险胜，但挺像那么回事</h2><p>获得经验 42、银两 50、生锈菜刀和称号「菜刀新秀」。</p><Button onClick={leaveBattle}>回到小愚村</Button></section>}
      {battle.turn === 'defeat' && <section className="result-card" data-testid="battle-defeat"><h2>江湖评价：普通韭菜 C-</h2><p>白大侠看了看你的菜刀，说它至少很有勇气。</p><Button className="menu-action--primary" data-testid="battle-retry" onClick={retryBattle}>原地重试</Button><Button onClick={leaveBattle}>先回村歇歇</Button></section>}
      {battle.turn === 'player' && <div className="battle-skills">{player.activeSkills.map((skill) => <BattleSkill key={skill} skill={skill} cooldown={battle.playerCooldowns[skill] ?? 0} onUse={() => useSkill(skill)} />)}</div>}
    </main>
  )
}

function Combatant({ name, hp, maxHp, qi, maxQi, side, phase }: { name: string; hp: number; maxHp: number; qi: number; maxQi: number; side: 'player' | 'enemy'; phase?: 1 | 2 }) {
  return <div className={`combatant combatant--${side}`}><div className="combatant-avatar"><img src={side === 'player' ? heroSprite : baiSprite} alt="" /><span>{side === 'enemy' && phase === 2 ? '💢' : '✦'}</span></div><b>{name}</b><small>{side === 'enemy' && phase === 2 ? '认真了三成' : '蓄势待发'}</small><div>生命 <Meter value={hp} max={maxHp} /></div><div>内力 <Meter value={qi} max={maxQi} tone="blue" /></div></div>
}

function BattleSkill({ skill, cooldown, onUse }: { skill: string; cooldown: number; onUse: () => void }) {
  const item = coreActiveSkills.find((candidate) => String(candidate.id) === skill) ?? SKILLS[skill as keyof typeof SKILLS]
  if (!item) return null
  return <button className="battle-skill" disabled={cooldown > 0} onClick={onUse}><i>{skill === 'basicSlash' ? '〽' : skill === 'cleaverWhirl' ? '✦' : skill === 'mockery' ? '☄' : '☯'}</i><b>{item.name}</b><small>{cooldown ? `冷却 ${cooldown}` : item.qiCost ? `内力 ${item.qiCost}` : '不耗内力'}</small></button>
}
