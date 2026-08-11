import { ChangeEvent, type CSSProperties, useEffect, useRef, useState } from 'react'
import menuBackground from './assets/backgrounds/menu-valley.webp'
import villageBackground from './assets/backgrounds/xiaoyu-village.webp'
import heroSprite from './assets/characters/hero.webp'
import elderSprite from './assets/characters/elder.webp'
import baiSprite from './assets/characters/bai.webp'
import catSprite from './assets/characters/cat.webp'
import { ITEMS, QUEST_LABELS, SKILLS, TALENTS, TITLES } from './game/data'
import { audioDirector } from './game/audio'
import { deleteSave, exportSave, loadSave, parseImportedSave, persistSave } from './game/save'
import { useGameStore } from './game/store'
import type { ItemId, SkillId, TalentId } from './game/types'

const navItems = [
  { id: 'guide', icon: '🗺️', label: '江湖故事' },
  { id: 'inventory', icon: '🎒', label: '背包' },
  { id: 'codex', icon: '📜', label: '图鉴' },
  { id: 'settings', icon: '⚙️', label: '设置' },
] as const

function Meter({ value, max, tone = 'red' }: { value: number; max: number; tone?: 'red' | 'blue' | 'green' }) {
  const ratio = Math.max(0, Math.min(100, (value / max) * 100))
  return <span className={`meter meter--${tone}`} aria-label={`${value}/${max}`}><span style={{ width: `${ratio}%` }} /></span>
}

function Button({ className = '', children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ink-button ${className}`} {...props}>{children}</button>
}

function App() {
  const screen = useGameStore((state) => state.screen)
  const player = useGameStore((state) => state.player)
  const quests = useGameStore((state) => state.quests)
  const world = useGameStore((state) => state.world)
  const settings = useGameStore((state) => state.settings)
  const temporaryMode = useGameStore((state) => state.temporaryMode)
  const setSaveStatus = useGameStore((state) => state.setSaveStatus)
  const hydrateSave = useGameStore((state) => state.hydrateSave)
  const makeSave = useGameStore((state) => state.makeSave)
  const toggleBossKey = useGameStore((state) => state.toggleBossKey)
  const ready = useRef(false)

  useEffect(() => {
    let active = true
    loadSave()
      .then((save) => { if (save && active) hydrateSave(save) })
      .catch(() => { if (active) setSaveStatus('temporary') })
      .finally(() => { ready.current = true })
    return () => { active = false }
  }, [hydrateSave, setSaveStatus])

  useEffect(() => {
    if (!ready.current || !player || temporaryMode) return
    const snapshot = makeSave()
    if (!snapshot) return
    const timer = window.setTimeout(() => {
      setSaveStatus('saving')
      persistSave(snapshot).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('temporary'))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [makeSave, player, quests, world, settings, screen, temporaryMode, setSaveStatus])

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion)
    audioDirector.update(settings)
  }, [settings])

  useEffect(() => {
    const activateAudio = () => audioDirector.activate(settings)
    const playTap = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest('button')) audioDirector.play('tap')
    }
    window.addEventListener('pointerdown', activateAudio, { once: true })
    document.addEventListener('click', playTap)
    return () => {
      window.removeEventListener('pointerdown', activateAudio)
      document.removeEventListener('click', playTap)
    }
  }, [settings])

  useEffect(() => {
    audioDirector.setPaused(temporaryMode)
  }, [temporaryMode])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        toggleBossKey()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleBossKey])

  if (temporaryMode) return <BossKey />
  if (screen === 'creation') return <CreationScreen />
  if (screen === 'jianghu') return <JianghuScreen />
  if (screen === 'battle') return <BattleScreen />
  return <MenuScreen />
}

function MenuScreen() {
  const player = useGameStore((state) => state.player)
  const setScreen = useGameStore((state) => state.setScreen)
  const setPanel = useGameStore((state) => state.setPanel)
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)

  return (
    <main className="menu-screen scenic-surface" style={{ '--menu-art': `url(${menuBackground})` } as CSSProperties}>
      <div className="paper-grain" />
      <aside className="menu-rail" aria-label="功能导航">
        <div className="portrait portrait--menu" aria-hidden="true">侠</div>
        <div className="profile-note">
          <strong>{player?.name ?? '无名小侠'}</strong>
          <span>Lv. {player?.level ?? 1}</span>
          <Meter value={player?.hp ?? 0} max={player?.maxHp ?? 100} />
        </div>
        {navItems.map((item) => (
          <button key={item.id} className="rail-action" onClick={() => setPanel(item.id)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </aside>

      <header className="menu-topline">
        <span>一把菜刀也能闯江湖！</span>
        <div><button onClick={() => setPanel('guide')}>⌂ 关于游戏</button><button onClick={() => setPanel('guide')}>? 玩法说明</button></div>
      </header>

      <section className="menu-center">
        <p className="eyebrow">搞笑武侠，轻松江湖</p>
        <h1><span>菜刀</span>闯江湖</h1>
        <p className="brush-strip">单机版</p>
        <div className="menu-actions">
          <Button className="menu-action menu-action--primary" onClick={() => setScreen('creation')}><b>⚔</b><span>开始游戏<small>闯荡江湖，从菜刀起</small></span></Button>
          <Button className="menu-action menu-action--blue" disabled={!player} onClick={() => setScreen('jianghu')}><b>📜</b><span>继续旅程<small>{player ? '上次走到：小愚村' : '还没有江湖旧梦'}</small></span></Button>
          <Button className="menu-action menu-action--green" onClick={() => setPanel('guide')}><b>▤</b><span>新手教程<small>菜刀也能成大虾</small></span></Button>
          <Button className="menu-action menu-action--purple" onClick={() => setPanel('codex')}><b>☯</b><span>更多玩法<small>彩蛋、挑战、成就</small></span></Button>
        </div>
      </section>

      <aside className="menu-sign">
        <b>✓ 单机，无需联网</b><b>✓ 无需注册</b><b>✓ 轻松有趣</b><b>✓ 适合所有年龄</b>
      </aside>
      <div className="menu-hero" aria-hidden="true"><img src={heroSprite} alt="" /><span>小虾米</span></div>
      <div className="menu-cat" aria-hidden="true"><img src={catSprite} alt="" /></div>
      <div className="menu-elder" aria-hidden="true"><img src={elderSprite} alt="" /><q>少侠，你这刀……<br />真是有够霸气的！</q><span>不正经老头</span></div>
      <footer className="menu-footer"><button onClick={() => setSettings({ bgmEnabled: !settings.bgmEnabled })}>🔊 背景音乐：{settings.bgmEnabled ? '开' : '关'}</button><span>⟵ 一个人，也能玩出整个江湖！ ⟶</span><span>江湖虽小，快乐很大</span></footer>
      <OverlayPanel />
    </main>
  )
}

function CreationScreen() {
  const [name, setName] = useState('小虾米')
  const [talent, setTalent] = useState<TalentId>('reckless')
  const startNewGame = useGameStore((state) => state.startNewGame)
  const setScreen = useGameStore((state) => state.setScreen)
  return (
    <main className="creation-screen scenic-surface">
      <section className="creation-scroll">
        <p className="eyebrow">新侠客备案</p>
        <h1>先把名号写上</h1>
        <p>以后挨打、得奖、被猫挠，都会刻在这张江湖账本上。</p>
        <label className="name-field">江湖名号<input value={name} maxLength={12} onChange={(event) => setName(event.target.value)} aria-label="江湖名号" /></label>
        <div className="talent-list" role="radiogroup" aria-label="选择天赋">
          {TALENTS.map((item) => (
            <button key={item.id} className={`talent-choice ${talent === item.id ? 'is-selected' : ''}`} onClick={() => setTalent(item.id)} role="radio" aria-checked={talent === item.id}>
              <b>{item.name}</b><span>{item.shortName}</span><small>{item.description}</small>
            </button>
          ))}
        </div>
        <div className="creation-actions"><Button onClick={() => setScreen('menu')}>回去再想想</Button><Button className="menu-action--primary" onClick={() => startNewGame(name, talent)}>提刀入江湖</Button></div>
      </section>
    </main>
  )
}

function JianghuScreen() {
  const player = useGameStore((state) => state.player)!
  const quests = useGameStore((state) => state.quests)
  const world = useGameStore((state) => state.world)
  const openDialogue = useGameStore((state) => state.openDialogue)
  const recordNpcClick = useGameStore((state) => state.recordNpcClick)
  const setPanel = useGameStore((state) => state.setPanel)
  const toggleBossKey = useGameStore((state) => state.toggleBossKey)
  const activeDialogue = useGameStore((state) => state.activeDialogue)
  const narrator = useGameStore((state) => state.narrator)
  const dismissNarrator = useGameStore((state) => state.dismissNarrator)

  const interact = (npc: 'oldMan' | 'cat' | 'bai') => {
    recordNpcClick(npc)
    if (npc === 'oldMan') openDialogue('oldMan')
    if (npc === 'bai') openDialogue('bai')
    if (npc === 'cat') openDialogue(world.catQuestAccepted ? 'cat' : 'aunt')
  }

  return (
    <main className="jianghu-screen scenic-surface">
      <header className="jianghu-header">
        <div className="game-mark"><span>菜刀</span>闯江湖<small>无厘头武侠单机小游戏</small></div>
        <div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button></div>
      </header>

      <aside className="status-panel paper-panel">
        <div className="status-person"><div className="portrait">侠</div><div><b>{player.name}</b><span className="rank-badge">江湖新秀</span><p>等级：{player.level}</p><p>生命：{player.hp}/{player.maxHp}<Meter value={player.hp} max={player.maxHp} /></p><p>内力：{player.qi}/{player.maxQi}<Meter value={player.qi} max={player.maxQi} tone="blue" /></p><p>经验：{player.experience}/{player.nextLevelExperience}<Meter value={player.experience} max={player.nextLevelExperience} tone="green" /></p></div></div>
        <div className="currency-row">🪙 银两：{player.silver}<span>🏆 {player.titles.length}</span></div>
      </aside>

      <aside className="quest-panel paper-panel">
        <h2>任务</h2>
        {quests.filter((quest) => quest.status !== 'locked').map((quest) => <QuestRow key={quest.id} id={quest.id} status={quest.status} />)}
        {!world.catQuestAccepted && world.oldManMet && <button className="quest-hint" onClick={() => openDialogue('aunt')}>听说王大娘在找猫，去问问？</button>}
      </aside>

      <aside className="rumor-panel paper-panel"><h2>江湖传闻</h2><p>{world.baiDefeated ? '有人说白大侠最近开始研究菜刀。' : '听说镇外擂台有个高手出没，速去一探究竟！'}</p></aside>

      <section className="village-stage" aria-label="小愚村悦来客栈" style={{ '--village-art': `url(${villageBackground})` } as CSSProperties}>
        <div className="inn-building"><span>悦来客栈</span><small>客栈</small></div>
        <button className="npc npc--elder" data-hotspot="old-man" onClick={() => interact('oldMan')}><i><img src={elderSprite} alt="" /></i><b>不正经老头</b><q>{world.oldManMet ? '少侠，别老点我。' : '少年，看你骨骼惊奇，拜我为师？'}</q></button>
        <button className="npc npc--hero" data-hotspot="hero" onClick={() => openDialogue('bai')}><i><img src={heroSprite} alt="" /></i><b>{player.name}</b></button>
        <button className="npc npc--bai" data-hotspot="bai-daxia" onClick={() => interact('bai')}><i><img src={baiSprite} alt="" /></i><b>白大侠（擂主）</b><q>{world.baiDefeated ? '菜刀兄，改日再战！' : '哼，就你也想挑战我？'}</q></button>
        <button className="npc npc--cat" data-hotspot="dahuang" onClick={() => interact('cat')}><i><img src={catSprite} alt="" /></i><b>大黄的猫</b><q>{world.catResolved ? '喵，江湖再见。' : '喵？'}</q></button>
        <div className="village-controls" aria-label="场景移动提示"><span>↑</span><span>←</span><span>→</span><span>↓</span></div>
      </section>

      <div className="scene-actions"><Button className="battle-call" onClick={() => openDialogue('bai')} disabled={!world.oldManMet || world.baiDefeated}>⚔ {world.baiDefeated ? '白大侠服了' : '进入战斗'}</Button><Button onClick={() => setPanel('guide')}>♟ 练功</Button></div>
      <SkillDock />
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')}>📘 武功</Button><Button onClick={() => setPanel('equipment')}>⚔ 装备</Button></nav>
      <button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>

      {activeDialogue && <DialogueOverlay />}
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}
      <OverlayPanel />
    </main>
  )
}

function QuestRow({ id, status }: { id: 'firstSteps' | 'findCat' | 'challengeBai'; status: 'locked' | 'active' | 'complete' }) {
  const item = QUEST_LABELS[id]
  return <div className={`quest-row quest-row--${status}`}><b>{id === 'firstSteps' ? '[主线]' : '[支线]' } {item.title}</b><span>{item.objective}</span><em>{status === 'complete' ? '✓' : '0/1'}</em></div>
}

function SkillDock() {
  const player = useGameStore((state) => state.player)!
  const setPanel = useGameStore((state) => state.setPanel)
  const icons: Record<SkillId, string> = { basicSlash: '〽', cleaverWhirl: '✦', mockery: '☄', playDead: '☯' }
  return <div className="skill-dock">{player.activeSkills.map((skill) => <button key={skill} onClick={() => setPanel('skills')}><i>{icons[skill]}</i><span>{SKILLS[skill].name}</span></button>)}</div>
}

function DialogueOverlay() {
  const activeDialogue = useGameStore((state) => state.activeDialogue)
  const closeDialogue = useGameStore((state) => state.closeDialogue)
  const meetOldMan = useGameStore((state) => state.meetOldMan)
  const acceptCatQuest = useGameStore((state) => state.acceptCatQuest)
  const resolveCatQuest = useGameStore((state) => state.resolveCatQuest)
  const startBattle = useGameStore((state) => state.startBattle)
  const world = useGameStore((state) => state.world)
  const maybeNarrate = useGameStore((state) => state.maybeNarrate)

  const content = {
    oldMan: { name: '不正经老头', text: world.oldManMet ? '江湖路远，别把菜刀当扇子摇。' : '少年，看你骨骼惊奇，不如拜我为师？学费先欠着。', choices: [
      { label: world.oldManMet ? '多谢前辈' : '弟子愿闻其详', action: meetOldMan },
      { label: '我其实想学做菜', action: () => { maybeNarrate('oldman-cook', '说书人：老头沉默良久，决定先教你怎么把菜刀拿正。'); meetOldMan() } },
    ] },
    aunt: { name: '王大娘的传话', text: '王大娘急得团团转：我家大黄不见了！它要是又去客栈蹭鱼，麻烦你劝它回家。', choices: [
      { label: '我帮你找', action: acceptCatQuest },
      { label: '猫还能自己跑丢？', action: () => { maybeNarrate('aunt-sass', '说书人：你这嘴，比菜刀还快。'); acceptCatQuest() } },
    ] },
    cat: { name: '大黄猫', text: '大黄正趴在客栈后厨，眼神写着“我没走丢，我只是有自己的饭局”。', choices: [
      { label: '好言相劝', action: () => resolveCatQuest('coax') },
      { label: '花八两银子贿赂', action: () => resolveCatQuest('bribe') },
      { label: '一把强抱回家', action: () => resolveCatQuest('grab') },
    ] },
    bai: { name: '白大侠', text: world.baiDefeated ? '白大侠抱拳：菜刀兄，山高水长，改日别带菜刀。' : '白大侠把擂台拍得砰砰响：想挑战？先把遗言写在菜谱背面！', choices: [
      { label: world.baiDefeated ? '互道珍重' : '菜刀已饥渴难耐', action: startBattle },
      { label: '我路过买酱油', action: () => { maybeNarrate('bai-soy', '说书人：白大侠表示，擂台旁边确实没有酱油铺。'); closeDialogue() } },
    ] },
  }[activeDialogue!]

  return <div className="dialogue-layer" role="dialog" aria-modal="true" aria-label={`${content.name}对话`}><section className="dialogue-box"><button className="dialogue-close" onClick={closeDialogue}>×</button><b>{content.name}</b><p>{content.text}</p><div>{content.choices.map((choice) => <Button key={choice.label} onClick={choice.action}>{choice.label}</Button>)}</div></section></div>
}

function BattleScreen() {
  const player = useGameStore((state) => state.player)!
  const battle = useGameStore((state) => state.battle)!
  const useSkill = useGameStore((state) => state.useSkill)
  const retryBattle = useGameStore((state) => state.retryBattle)
  const leaveBattle = useGameStore((state) => state.leaveBattle)
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
      {battle.turn === 'defeat' && <section className="result-card"><h2>江湖评价：普通韭菜 C-</h2><p>白大侠看了看你的菜刀，说它至少很有勇气。</p><Button className="menu-action--primary" onClick={retryBattle}>原地重试</Button><Button onClick={leaveBattle}>先回村歇歇</Button></section>}
      {battle.turn === 'player' && <div className="battle-skills">{player.activeSkills.map((skill) => <BattleSkill key={skill} skill={skill} cooldown={battle.playerCooldowns[skill] ?? 0} onUse={() => useSkill(skill)} />)}</div>}
    </main>
  )
}

function Combatant({ name, hp, maxHp, qi, maxQi, side, phase }: { name: string; hp: number; maxHp: number; qi: number; maxQi: number; side: 'player' | 'enemy'; phase?: 1 | 2 }) {
  return <div className={`combatant combatant--${side}`}><div className="combatant-avatar"><img src={side === 'player' ? heroSprite : baiSprite} alt="" /><span>{side === 'enemy' && phase === 2 ? '💢' : '✦'}</span></div><b>{name}</b><small>{side === 'enemy' && phase === 2 ? '认真了三成' : '蓄势待发'}</small><div>生命 <Meter value={hp} max={maxHp} /></div><div>内力 <Meter value={qi} max={maxQi} tone="blue" /></div></div>
}

function BattleSkill({ skill, cooldown, onUse }: { skill: SkillId; cooldown: number; onUse: () => void }) {
  const item = SKILLS[skill]
  return <button className="battle-skill" disabled={cooldown > 0} onClick={onUse}><i>{skill === 'basicSlash' ? '〽' : skill === 'cleaverWhirl' ? '✦' : skill === 'mockery' ? '☄' : '☯'}</i><b>{item.name}</b><small>{cooldown ? `冷却 ${cooldown}` : item.qiCost ? `内力 ${item.qiCost}` : '不耗内力'}</small></button>
}

function OverlayPanel() {
  const activePanel = useGameStore((state) => state.activePanel)
  const setPanel = useGameStore((state) => state.setPanel)
  const player = useGameStore((state) => state.player)
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)
  const makeSave = useGameStore((state) => state.makeSave)
  const importSave = useGameStore((state) => state.importSave)
  const setSaveStatus = useGameStore((state) => state.setSaveStatus)
  const useItem = useGameStore((state) => state.useItem)
  if (!activePanel) return null
  const save = makeSave()
  const downloadSave = () => {
    if (!save) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([exportSave(save)], { type: 'application/json' }))
    link.download = `caidao-jianghu-${save.player.name}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const uploadSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = parseImportedSave(await file.text())
      importSave(imported)
      await persistSave(imported)
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      window.alert(error instanceof Error ? error.message : '导入失败')
    }
  }
  return <div className="panel-layer" role="dialog" aria-modal="true"><section className="overlay-panel"><button className="dialogue-close" onClick={() => setPanel(null)}>×</button>
    {activePanel === 'inventory' && <><h2>背包</h2><p>装得下江湖，也装得下王大娘的唠叨。</p><ItemList items={player?.inventory ?? []} onUse={useItem} /></>}
    {activePanel === 'skills' && <><h2>武功</h2><p>四格招式已装配，先把会的用顺手。</p><div className="detail-list">{(player?.activeSkills ?? []).map((skill) => <div key={skill}><b>{SKILLS[skill].name}</b><span>{SKILLS[skill].description}</span></div>)}</div></>}
    {activePanel === 'equipment' && <><h2>装备</h2><p>武器：{player?.equippedWeapon ? ITEMS[player.equippedWeapon].name : '赤手空拳'}</p><p>衣服：粗布短褂</p><p>饰品：王大娘的白眼</p></>}
    {activePanel === 'codex' && <><h2>小小图鉴</h2><p>遇见的人和惹出的事，都在这里记一笔。</p><div className="detail-list">{(player?.titles ?? []).length ? player!.titles.map((title) => <div key={title}><b>{TITLES[title].name}</b><span>{TITLES[title].description}，{TITLES[title].bonus}</span></div>) : <p>目前还没有称号，先去江湖里丢几次脸。</p>}</div></>}
    {activePanel === 'guide' && <><h2>新手教程</h2><div className="detail-list"><div><b>先点人</b><span>客栈前的老头、白大侠和大黄猫都能互动。</span></div><div><b>再看任务</b><span>完成老头教学后，可挑战白大侠或帮王大娘找猫。</span></div><div><b>最后记账</b><span>关键进度会自动写入浏览器的江湖账本。</span></div></div></>}
    {activePanel === 'settings' && <><h2>掌柜的</h2><label className="setting-row">减少动态效果<input type="checkbox" checked={settings.reducedMotion} onChange={(event) => setSettings({ reducedMotion: event.target.checked })} /></label><label className="setting-row">总静音<input type="checkbox" checked={settings.masterMuted} onChange={(event) => setSettings({ masterMuted: event.target.checked })} /></label><label className="setting-row">背景音乐<input type="checkbox" checked={settings.bgmEnabled} onChange={(event) => setSettings({ bgmEnabled: event.target.checked })} /></label><label className="setting-row">搞笑音效<input type="checkbox" checked={settings.sillySfxEnabled} onChange={(event) => setSettings({ sillySfxEnabled: event.target.checked })} /></label><div className="panel-actions"><Button onClick={downloadSave}>导出存档</Button><label className="ink-button">导入存档<input type="file" accept="application/json" onChange={uploadSave} /></label><Button onClick={() => { deleteSave(); window.location.reload() }}>告老还乡</Button></div></>}
  </section></div>
}

function ItemList({ items, onUse }: { items: ItemId[]; onUse: (itemId: ItemId) => void }) {
  if (!items.length) return <p>背包空空如也，风从里面吹出来。</p>
  return <div className="detail-list">{items.map((item) => <div key={item}><b>{ITEMS[item].name}</b><span>{ITEMS[item].description}</span>{ITEMS[item].category === 'consumable' && <button className="item-use" onClick={() => onUse(item)}>使用</button>}</div>)}</div>
}

function BossKey() {
  const toggleBossKey = useGameStore((state) => state.toggleBossKey)
  const player = useGameStore((state) => state.player)
  return <main className="boss-key-screen"><header><b>小愚村第一季度农产品采购表</b><button onClick={toggleBossKey}>返回采购现场</button></header><table><thead><tr><th>品类</th><th>供应商</th><th>数量</th><th>单价</th><th>备注</th></tr></thead><tbody>{[['咸鱼干','大黄猫后勤组','12','8 文','猫不许报销'],['生锈菜刀','悦来客栈','1','50 两','切菜兼防身'],['二锅头','村口杂货铺','4','6 两','严禁上擂台'],['粗布短褂', player?.name ?? '临时工','1','免费','已领用']].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p>提示：按 Esc 可继续处理采购事宜。</p></main>
}

export { App }
