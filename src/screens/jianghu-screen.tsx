import type { CSSProperties } from 'react'
import { OverlayPanel } from '../components/OverlayPanel'
import { Button, Meter } from '../components/game-ui'
import { useRootGameStore } from '../stores'
import { QUEST_LABELS } from '../game/data'
import { CORE_ASSET_IDS, CORE_ASSETS } from '../content/assets'
import type { AssetId } from '../types/ids'

const assetSources = new Map(CORE_ASSETS.map((asset) => [asset.id, asset.src]))

function assetSrc(id: AssetId): string {
  const src = assetSources.get(id)
  if (!src) throw new Error(`资源清单缺少「${id}」。`)
  return src
}

const villageBackground = assetSrc(CORE_ASSET_IDS.villageBackground)
const heroSprite = assetSrc(CORE_ASSET_IDS.hero)
const elderSprite = assetSrc(CORE_ASSET_IDS.elder)
const baiSprite = assetSrc(CORE_ASSET_IDS.bai)
const catSprite = assetSrc(CORE_ASSET_IDS.cat)
const auntSprite = assetSrc(CORE_ASSET_IDS.aunt)
const qingheMarketBackground = assetSrc(CORE_ASSET_IDS.qingheMarketBackground)
const bangsiSprite = assetSrc(CORE_ASSET_IDS.qingheBangsi)
const blackwindFortressBackground = assetSrc(CORE_ASSET_IDS.blackwindFortressBackground)
const blackwindLedgerKeeperSprite = assetSrc(CORE_ASSET_IDS.blackwindLedgerKeeper)
const blackwindRunnerSprite = assetSrc(CORE_ASSET_IDS.blackwindRunner)
const blackwindCookSprite = assetSrc(CORE_ASSET_IDS.blackwindCook)
const blackwindLeaderSprite = assetSrc(CORE_ASSET_IDS.blackwindLeader)
const qingyunMountainBackground = assetSrc(CORE_ASSET_IDS.qingyunMountainBackground)
const qingyunDiscipleSprite = assetSrc(CORE_ASSET_IDS.qingyunDisciple)
const qingyunHerbalistSprite = assetSrc(CORE_ASSET_IDS.qingyunHerbalist)
const qingyunBellKeeperSprite = assetSrc(CORE_ASSET_IDS.qingyunBellKeeper)
const qingyunMasterSprite = assetSrc(CORE_ASSET_IDS.qingyunMaster)
const westernRelayBackground = assetSrc(CORE_ASSET_IDS.westernRelayBackground)
const westernCourierSprite = assetSrc(CORE_ASSET_IDS.westernCourier)
const westernTeaKeeperSprite = assetSrc(CORE_ASSET_IDS.westernTeaKeeper)
const westernGuardSprite = assetSrc(CORE_ASSET_IDS.westernGuard)
const twinBanditsSprite = assetSrc(CORE_ASSET_IDS.twinBandits)
const donghaiTownBackground = assetSrc(CORE_ASSET_IDS.donghaiTownBackground)
const donghaiBoatwomanSprite = assetSrc(CORE_ASSET_IDS.donghaiBoatwoman)
const shellVendorSprite = assetSrc(CORE_ASSET_IDS.shellVendor)
const tideBellKeeperSprite = assetSrc(CORE_ASSET_IDS.tideBellKeeper)
const tideMasterSprite = assetSrc(CORE_ASSET_IDS.tideMaster)
const capitalRankingBackground = assetSrc(CORE_ASSET_IDS.capitalRankingBackground)
const capitalClerkSprite = assetSrc(CORE_ASSET_IDS.capitalClerk)
const capitalRegistrarSprite = assetSrc(CORE_ASSET_IDS.capitalRegistrar)
const capitalStorytellerSprite = assetSrc(CORE_ASSET_IDS.capitalStoryteller)
const rankingGovernorSprite = assetSrc(CORE_ASSET_IDS.rankingGovernor)
const martialConventionBackground = assetSrc(CORE_ASSET_IDS.martialConventionBackground)
const conventionUsherSprite = assetSrc(CORE_ASSET_IDS.conventionUsher)
const sectRepresentativeSprite = assetSrc(CORE_ASSET_IDS.sectRepresentative)
const noodleVendorSprite = assetSrc(CORE_ASSET_IDS.noodleVendor)
const conventionJudgeSprite = assetSrc(CORE_ASSET_IDS.conventionJudge)
const rankingMasterSprite = assetSrc(CORE_ASSET_IDS.rankingMaster)

export function JianghuScreen() {
  const player = useRootGameStore((state) => state.player)!
  const quests = useRootGameStore((state) => state.quests)
  const world = useRootGameStore((state) => state.world)
  const openDialogue = useRootGameStore((state) => state.openDialogue)
  const recordNpcClick = useRootGameStore((state) => state.recordNpcClick)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const activeDialogue = useRootGameStore((state) => state.activeDialogue)
  const narrator = useRootGameStore((state) => state.narrator)
  const dismissNarrator = useRootGameStore((state) => state.dismissNarrator)
  const openCrafting = useRootGameStore((state) => state.openCrafting)
  const openCooking = useRootGameStore((state) => state.openCooking)
  const startChapterTwo = useRootGameStore((state) => state.startChapterTwo)

  if (world.currentChapter === 'ch02') return <QingheScreen />
  if (world.currentChapter === 'ch03') return <BlackwindScreen />
  if (world.currentChapter === 'ch04') return <QingyunScreen />
  if (world.currentChapter === 'ch05' || world.currentChapter === 'ch06' || world.currentChapter === 'ch07' || world.currentChapter === 'ch08') return <LaterChapterScreen chapter={world.currentChapter} />

  const interact = (npc: 'oldMan' | 'aunt' | 'cat' | 'bai') => {
    recordNpcClick(npc)
    if (npc === 'oldMan') openDialogue('oldMan')
    if (npc === 'aunt') openDialogue('aunt')
    if (npc === 'bai') openDialogue('bai')
    if (npc === 'cat') openDialogue(world.catQuestAccepted ? 'cat' : 'aunt')
  }

  return (
    <main className="jianghu-screen scenic-surface" style={{ '--village-art': `url(${villageBackground})` } as CSSProperties}>
      <header className="jianghu-header">
        <div className="game-mark"><span>菜刀</span>闯江湖<small>无厘头武侠单机小游戏</small></div>
        <div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button><button data-testid="open-world-map" onClick={() => useRootGameStore.getState().openWorldMap()}>🗺<span>地图</span></button></div>
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

      <section className="village-stage" aria-label="小愚村悦来客栈">
        <div className="inn-building"><span>悦来客栈</span><small>客栈</small></div>
        <button className="npc npc--elder" data-hotspot="old-man" onClick={() => interact('oldMan')}><i><img src={elderSprite} alt="" /></i><b>不正经老头</b><q>{world.oldManMet ? '少侠，别老点我。' : '少年，看你骨骼惊奇，拜我为师？'}</q></button>
        <button className="npc npc--aunt" data-hotspot="aunt" onClick={() => interact('aunt')}><i><img src={auntSprite} alt="" /></i><b>王大娘</b><q>{world.catResolved ? '回来就好，鱼干别再顺走。' : world.catQuestAccepted ? '找到大黄了吗？' : '我的猫又去蹭饭了！'}</q></button>
        <button className="npc npc--hero" data-hotspot="hero" onClick={() => openDialogue('bai')}><i><img src={heroSprite} alt="" /></i><b>{player.name}</b></button>
        <button className="npc npc--bai" data-hotspot="bai-daxia" onClick={() => interact('bai')}><i><img src={baiSprite} alt="" /></i><b>白大侠（擂主）</b><q>{world.baiDefeated ? '菜刀兄，改日再战！' : '哼，就你也想挑战我？'}</q></button>
        <button className="npc npc--cat" data-hotspot="dahuang" onClick={() => interact('cat')}><i><img src={catSprite} alt="" /></i><b>大黄的猫</b><q>{world.catResolved ? '喵，江湖再见。' : '喵？'}</q></button>
        <div className="village-controls" aria-label="场景移动提示"><span>↑</span><span>←</span><span>→</span><span>↓</span></div>
      </section>

      <div className="scene-actions"><Button className="battle-call" onClick={() => openDialogue('bai')} disabled={!world.oldManMet || world.baiDefeated}>⚔ {world.baiDefeated ? '白大侠服了' : '进入战斗'}</Button>{world.baiDefeated && <Button data-testid="open-ch02" onClick={startChapterTwo}>→ 前往清河县</Button>}<Button data-testid="open-crafting" onClick={openCrafting}>🔨 铁匠铺</Button><Button data-testid="open-cooking" onClick={openCooking}>🍲 后厨</Button></div>
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')}>📘 武功</Button><Button onClick={() => setPanel('equipment')}>⚔ 装备</Button></nav>
      <button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>

      {activeDialogue && <DialogueOverlay />}
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}
      <OverlayPanel />
    </main>
  )
}

function QingheScreen() {
  const player = useRootGameStore((state) => state.player)!
  const world = useRootGameStore((state) => state.world)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const narrator = useRootGameStore((state) => state.narrator)
  const dismissNarrator = useRootGameStore((state) => state.dismissNarrator)
  const completeInvestigation = useRootGameStore((state) => state.completeChapterTwoInvestigation)
  const startBattle = useRootGameStore((state) => state.startBattle)
  const openCrafting = useRootGameStore((state) => state.openCrafting)
  const openCooking = useRootGameStore((state) => state.openCooking)
  const startChapterThree = useRootGameStore((state) => state.startChapterThree)

  return (
    <main className="jianghu-screen scenic-surface qinghe-screen" style={{ '--village-art': `url(${qingheMarketBackground})` } as CSSProperties}>
      <header className="jianghu-header">
        <div className="game-mark"><span>菜刀</span>闯江湖<small>第二章 · 清河县</small></div>
        <div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button><button data-testid="open-world-map" onClick={() => useRootGameStore.getState().openWorldMap()}>🗺<span>地图</span></button></div>
      </header>
      <aside className="status-panel paper-panel"><div className="status-person"><div className="portrait">侠</div><div><b>{player.name}</b><span className="rank-badge">清河访客</span><p>等级：{player.level}</p><p>生命：{player.hp}/{player.maxHp}<Meter value={player.hp} max={player.maxHp} /></p><p>内力：{player.qi}/{player.maxQi}<Meter value={player.qi} max={player.maxQi} tone="blue" /></p></div></div><div className="currency-row">🪙 银两：{player.silver}<span>🏆 {player.titles.length}</span></div></aside>
      <aside className="quest-panel paper-panel"><h2>清河县主线</h2><div className={`quest-row quest-row--${world.ch02MainlineComplete ? 'complete' : 'active'}`}><b>[主线] 百晓榜缺页</b><span>{world.ch02MainlineComplete ? '线索已经对上，准备接受核验' : '调查榜单、茶摊和河边药篮'}</span><em>{world.ch02MainlineComplete ? '✓' : '0/1'}</em></div></aside>
      <aside className="rumor-panel paper-panel"><h2>县城传闻</h2><p>{world.ch02BangsiDefeated ? '榜下捕快已经盖章：这位菜刀客暂时可以上榜。' : '榜下捕快正在街口等人，把每一条线索都要盖章。'}</p></aside>
      <section className="village-stage" aria-label="清河县百晓榜街市">
        <div className="inn-building"><span>清河县街市</span><small>百晓榜告示台</small></div>
        <button className="npc npc--elder" data-hotspot="qinghe-board" onClick={completeInvestigation}><i><span aria-hidden="true">榜</span></i><b>百晓榜告示台</b><q>{world.ch02MainlineComplete ? '线索已齐，去找榜下捕快。' : '缺页一张，谁看谁补。'}</q></button>
        <button className="npc npc--bai" data-hotspot="qinghe-bangsi" onClick={() => startBattle('ch02')} disabled={!world.ch02BossReady || world.ch02BangsiDefeated}><i><img src={bangsiSprite} alt="" /></i><b>榜下捕快</b><q>{world.ch02BangsiDefeated ? '已核验，暂不复查。' : world.ch02BossReady ? '出示线索，接受核验！' : '先把线索整理齐。'}</q></button>
        <div className="village-controls" aria-label="街市移动提示"><span>↑</span><span>←</span><span>→</span><span>↓</span></div>
      </section>
      <div className="scene-actions"><Button className="battle-call" data-testid="ch02-investigate" onClick={completeInvestigation} disabled={world.ch02MainlineComplete}>🔎 调查百晓榜</Button><Button data-testid="ch02-battle-call" onClick={() => startBattle('ch02')} disabled={!world.ch02BossReady || world.ch02BangsiDefeated}>⚔ {world.ch02BangsiDefeated ? '榜下捕快服了' : '挑战榜下捕快'}</Button>{world.ch02BangsiDefeated && <Button data-testid="open-ch03" onClick={startChapterThree}>→ 前往黑风寨</Button>}<Button data-testid="open-crafting" onClick={openCrafting}>🔨 铁匠铺</Button><Button data-testid="open-cooking" onClick={openCooking}>🍲 后厨</Button></div>
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')}>📘 武功</Button><Button onClick={() => setPanel('equipment')} disabled={!world.systemUnlocks.equipment}>⚔ 装备</Button></nav>
      <button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}
      <OverlayPanel />
    </main>
  )
}

function BlackwindScreen() {
  const player = useRootGameStore((state) => state.player)!
  const world = useRootGameStore((state) => state.world)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const narrator = useRootGameStore((state) => state.narrator)
  const dismissNarrator = useRootGameStore((state) => state.dismissNarrator)
  const completeInvestigation = useRootGameStore((state) => state.completeChapterThreeInvestigation)
  const startBattle = useRootGameStore((state) => state.startBattle)
  const openCrafting = useRootGameStore((state) => state.openCrafting)
  const openCooking = useRootGameStore((state) => state.openCooking)
  const startChapterFour = useRootGameStore((state) => state.startChapterFour)

  return (
    <main className="jianghu-screen scenic-surface blackwind-screen" style={{ '--village-art': `url(${blackwindFortressBackground})` } as CSSProperties}>
      <header className="jianghu-header">
        <div className="game-mark"><span>菜刀</span>闯江湖<small>第三章 · 黑风寨</small></div>
        <div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button><button data-testid="open-world-map" onClick={() => useRootGameStore.getState().openWorldMap()}>🗺<span>地图</span></button></div>
      </header>
      <aside className="status-panel paper-panel"><div className="status-person"><div className="portrait">侠</div><div><b>{player.name}</b><span className="rank-badge">黑风来客</span><p>等级：{player.level}</p><p>生命：{player.hp}/{player.maxHp}<Meter value={player.hp} max={player.maxHp} /></p><p>内力：{player.qi}/{player.maxQi}<Meter value={player.qi} max={player.maxQi} tone="blue" /></p></div></div><div className="currency-row">🪙 银两：{player.silver}<span>🏆 {player.titles.length}</span></div></aside>
      <aside className="quest-panel paper-panel"><h2>黑风寨主线</h2><div className={`quest-row quest-row--${world.ch03MainlineComplete ? 'complete' : 'active'}`}><b>[主线] 山寨也要冲榜</b><span>{world.ch03MainlineComplete ? '账榜、百味刀谱与传令已经对齐' : '调查账榜、灶房和瞭望台'}</span><em>{world.ch03MainlineComplete ? '✓' : '0/1'}</em></div></aside>
      <aside className="rumor-panel paper-panel"><h2>山寨传闻</h2><p>{world.ch03BlackwindLeaderDefeated ? '黑风寨主宣布：败北归山风，技能树与烹饪归你。' : '山寨空旗正在冲榜，黑风寨主等着最后一声鼓。'}</p></aside>
      <section className="village-stage" aria-label="黑风寨山寨门">
        <div className="inn-building"><span>黑风寨</span><small>山寨账榜</small></div>
        <button className="npc npc--elder" data-hotspot="blackwind-ledger" onClick={completeInvestigation}><i><img src={blackwindLedgerKeeperSprite} alt="" /></i><b>曹掌柜</b><q>{world.ch03MainlineComplete ? '账榜已齐，去找寨主验收。' : '先登记，再谈冲榜。'}</q></button>
        <button className="npc npc--aunt" data-hotspot="blackwind-cook" onClick={completeInvestigation}><i><img src={blackwindCookSprite} alt="" /></i><b>胡大勺</b><q>{world.ch03MainlineComplete ? '火候和前置都齐了。' : '山椒先别自己跳进锅。'}</q></button>
        <button className="npc npc--bai" data-hotspot="blackwind-runner" onClick={completeInvestigation}><i><img src={blackwindRunnerSprite} alt="" /></i><b>小顺</b><q>{world.ch03MainlineComplete ? '最后一声鼓，寨主听见了。' : '三条路，我都跑过。'}</q></button>
        <button className="npc npc--hero" data-hotspot="blackwind-leader" onClick={() => startBattle('ch03')} disabled={!world.ch03BossReady || world.ch03BlackwindLeaderDefeated}><i><img src={blackwindLeaderSprite} alt="" /></i><b>黑风寨主</b><q>{world.ch03BlackwindLeaderDefeated ? '空旗收好，败北有效。' : world.ch03BossReady ? '来验收你的冲榜方案！' : '先把账榜和刀谱对齐。'}</q></button>
        <div className="village-controls" aria-label="山寨移动提示"><span>↑</span><span>←</span><span>→</span><span>↓</span></div>
      </section>
      <div className="scene-actions"><Button className="battle-call" data-testid="ch03-investigate" onClick={completeInvestigation} disabled={world.ch03MainlineComplete}>🔎 调查黑风寨账榜</Button><Button data-testid="ch03-battle-call" onClick={() => startBattle('ch03')} disabled={!world.ch03BossReady || world.ch03BlackwindLeaderDefeated}>⚔ {world.ch03BlackwindLeaderDefeated ? '黑风寨主服了' : '挑战黑风寨主'}</Button>{world.ch03BlackwindLeaderDefeated && <Button data-testid="open-ch04" onClick={startChapterFour}>→ 前往青云山</Button>}<Button data-testid="open-crafting" onClick={openCrafting}>🔨 铁匠铺</Button><Button data-testid="open-cooking" onClick={openCooking}>🍲 后厨</Button></div>
      {world.ch03BlackwindLeaderDefeated && <div className="paper-panel" data-testid="ch03-unlocks"><strong>技能树、烹饪已解锁</strong><span>{world.nextChapterUnlocked ? '下一章与结局资格已开放。' : '自动存档点已写入。'}</span></div>}
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')} disabled={!world.systemUnlocks.skillTree}>📘 武功</Button><Button onClick={() => setPanel('equipment')} disabled={!world.systemUnlocks.equipment}>⚔ 装备</Button></nav>
      <button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}
      <OverlayPanel />
    </main>
  )
}

function QingyunScreen() {
  const player = useRootGameStore((state) => state.player)!
  const world = useRootGameStore((state) => state.world)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const narrator = useRootGameStore((state) => state.narrator)
  const dismissNarrator = useRootGameStore((state) => state.dismissNarrator)
  const completeInvestigation = useRootGameStore((state) => state.completeChapterFourInvestigation)
  const startBattle = useRootGameStore((state) => state.startBattle)
  const startChapterFive = useRootGameStore((state) => state.startChapterFive)
  const openCrafting = useRootGameStore((state) => state.openCrafting)
  const openCooking = useRootGameStore((state) => state.openCooking)

  return (
    <main className="jianghu-screen scenic-surface qingyun-screen" style={{ '--village-art': `url(${qingyunMountainBackground})` } as CSSProperties}>
      <header className="jianghu-header">
        <div className="game-mark"><span>菜刀</span>闯江湖<small>第四章 · 青云山</small></div>
        <div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button><button data-testid="open-world-map" onClick={() => useRootGameStore.getState().openWorldMap()}>🗺<span>地图</span></button></div>
      </header>
      <aside className="status-panel paper-panel"><div className="status-person"><div className="portrait">侠</div><div><b>{player.name}</b><span className="rank-badge">青云访客</span><p>等级：{player.level}</p><p>生命：{player.hp}/{player.maxHp}<Meter value={player.hp} max={player.maxHp} /></p><p>内力：{player.qi}/{player.maxQi}<Meter value={player.qi} max={player.maxQi} tone="blue" /></p></div></div><div className="currency-row">🪙 银两：{player.silver}<span>🏆 {player.titles.length}</span></div></aside>
      <aside className="quest-panel paper-panel"><h2>青云山主线</h2><div className={`quest-row quest-row--${world.ch04MainlineComplete ? 'complete' : 'active'}`}><b>[主线] 门规也要讲证据</b><span>{world.ch04MainlineComplete ? '名册、药圃与听云钟已经对齐' : '调查山门、云台药圃和听云台'}</span><em>{world.ch04MainlineComplete ? '✓' : '0/1'}</em></div></aside>
      <aside className="rumor-panel paper-panel"><h2>青云传闻</h2><p>{world.ch04QingyunMasterDefeated ? '青云掌门承认：门面验收通过，规则终于写短了。' : '青云山的门规有三尺厚，掌门正等人来补最后一页。'}</p></aside>
      <section className="village-stage" aria-label="青云山门石阶">
        <div className="inn-building"><span>青云山门</span><small>门规验收处</small></div>
        <button className="npc npc--elder" data-hotspot="qingyun-disciple" onClick={completeInvestigation}><i><img src={qingyunDiscipleSprite} alt="" /></i><b>林小门</b><q>{world.ch04MainlineComplete ? '名册已齐，去找掌门验收。' : '先登记，再谈上山。'}</q></button>
        <button className="npc npc--aunt" data-hotspot="qingyun-herbalist" onClick={completeInvestigation}><i><img src={qingyunHerbalistSprite} alt="" /></i><b>苏青禾</b><q>{world.ch04MainlineComplete ? '药圃也盖章了。' : '青蘅草别拿去当门簪。'}</q></button>
        <button className="npc npc--bai" data-hotspot="qingyun-bell-keeper" onClick={completeInvestigation}><i><img src={qingyunBellKeeperSprite} alt="" /></i><b>钟小响</b><q>{world.ch04MainlineComplete ? '回声已经作证。' : '钟响三次，门规才算听见。'}</q></button>
        <button className="npc npc--hero" data-hotspot="qingyun-master" onClick={() => startBattle('ch04')} disabled={!world.ch04BossReady || world.ch04QingyunMasterDefeated}><i><img src={qingyunMasterSprite} alt="" /></i><b>青云掌门</b><q>{world.ch04QingyunMasterDefeated ? '名帖留下，规则写短。' : world.ch04BossReady ? '来验收最后一条门规！' : '先把山门证据对齐。'}</q></button>
        <div className="village-controls" aria-label="山门移动提示"><span>↑</span><span>←</span><span>→</span><span>↓</span></div>
      </section>
      <div className="scene-actions"><Button className="battle-call" data-testid="ch04-investigate" onClick={completeInvestigation} disabled={world.ch04MainlineComplete}>🔎 调查青云山门规</Button><Button data-testid="ch04-battle-call" onClick={() => startBattle('ch04')} disabled={!world.ch04BossReady || world.ch04QingyunMasterDefeated}>⚔ {world.ch04QingyunMasterDefeated ? '青云掌门服了' : '挑战青云掌门'}</Button>{world.ch04QingyunMasterDefeated && <Button data-testid="open-ch05" onClick={startChapterFive}>→ 前往西域驿路</Button>}<Button data-testid="open-crafting" onClick={openCrafting}>🔨 铁匠铺</Button><Button data-testid="open-cooking" onClick={openCooking}>🍲 后厨</Button></div>
      {world.ch04QingyunMasterDefeated && <div className="paper-panel" data-testid="ch04-unlocks"><strong>意图进阶、装备强化已解锁</strong><span>{world.nextChapterUnlocked ? '下一章与结局资格已开放。' : '自动存档点已写入。'}</span></div>}
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')} disabled={!world.systemUnlocks.skillTree}>📘 武功</Button><Button onClick={() => setPanel('equipment')} disabled={!world.systemUnlocks.equipmentStrengthening}>⚔ 装备强化</Button></nav>
      <button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}
      <OverlayPanel />
    </main>
  )
}

type LaterChapterId = 'ch05' | 'ch06' | 'ch07' | 'ch08'
const LATER_CHAPTER_CONFIG = {
  ch05: { title: '西域驿路', subtitle: '第五章 · 刀谱物流之谜', rank: '驿路来客', art: westernRelayBackground, npcNames: ['洛小铃', '白沙姑', '驼背老关'], npcSprites: [westernCourierSprite, westernTeaKeeperSprite, westernGuardSprite], bossName: '驿路双煞', bossSprite: twinBanditsSprite, investigation: '调查货单、补给路线与封条', unlocks: '自建门派、Tick 派遣', mainlineKey: 'ch05MainlineComplete', readyKey: 'ch05BossReady', defeatedKey: 'ch05TwinBanditsDefeated', startBattleChapter: 'ch05' },
  ch06: { title: '东海镇', subtitle: '第六章 · 留影石带货乱象', rank: '东海访客', art: donghaiTownBackground, npcNames: ['海棠', '贝小满', '潮生'], npcSprites: [donghaiBoatwomanSprite, shellVendorSprite, tideBellKeeperSprite], bossName: '海潮帮主', bossSprite: tideMasterSprite, investigation: '调查船单、贝壳市场与潮汐记录', unlocks: '委托进阶、门人事件', mainlineKey: 'ch06MainlineComplete', readyKey: 'ch06BossReady', defeatedKey: 'ch06TideMasterDefeated', startBattleChapter: 'ch06' },
  ch07: { title: '京城', subtitle: '第七章 · 百晓榜幕后交易', rank: '京城查榜客', art: capitalRankingBackground, npcNames: ['小吏阿文', '冯榜', '阿墨'], npcSprites: [capitalClerkSprite, capitalRegistrarSprite, capitalStorytellerSprite], bossName: '榜司督主', bossSprite: rankingGovernorSprite, investigation: '调查入场牌、交易账与原始墨迹', unlocks: '结局路线锁定', mainlineKey: 'ch07MainlineComplete', readyKey: 'ch07BossReady', defeatedKey: 'ch07RankingGovernorDefeated', startBattleChapter: 'ch07' },
  ch08: { title: '武林大会', subtitle: '第八章 · 刀谱与江湖定义权', rank: '大会记录员', art: martialConventionBackground, npcNames: ['顾门牌', '叶青锋', '面摊小周', '司空秤'], npcSprites: [conventionUsherSprite, sectRepresentativeSprite, noodleVendorSprite, conventionJudgeSprite], bossName: '百晓榜主', bossSprite: rankingMasterSprite, investigation: '调查登记、评判台、门派说法与厨房秩序', unlocks: '四结局、通关后继续', mainlineKey: 'ch08MainlineComplete', readyKey: 'ch08BossReady', defeatedKey: 'ch08RankingMasterDefeated', startBattleChapter: 'ch08' },
} as const

function LaterChapterScreen({ chapter }: { chapter: LaterChapterId }) {
  const player = useRootGameStore((state) => state.player)!
  const world = useRootGameStore((state) => state.world)
  const setPanel = useRootGameStore((state) => state.setPanel)
  const toggleBossKey = useRootGameStore((state) => state.toggleBossKey)
  const narrator = useRootGameStore((state) => state.narrator)
  const dismissNarrator = useRootGameStore((state) => state.dismissNarrator)
  const startBattle = useRootGameStore((state) => state.startBattle)
  const completeFive = useRootGameStore((state) => state.completeChapterFiveInvestigation)
  const completeSix = useRootGameStore((state) => state.completeChapterSixInvestigation)
  const completeSeven = useRootGameStore((state) => state.completeChapterSevenInvestigation)
  const completeEight = useRootGameStore((state) => state.completeChapterEightInvestigation)
  const startSix = useRootGameStore((state) => state.startChapterSix)
  const startSeven = useRootGameStore((state) => state.startChapterSeven)
  const startEight = useRootGameStore((state) => state.startChapterEight)
  const config = LATER_CHAPTER_CONFIG[chapter]
  const mainlineComplete = world[config.mainlineKey]
  const ready = world[config.readyKey]
  const defeated = world[config.defeatedKey]
  const completeInvestigation = chapter === 'ch05' ? completeFive : chapter === 'ch06' ? completeSix : chapter === 'ch07' ? completeSeven : completeEight
  const openNext = chapter === 'ch05' ? startSix : chapter === 'ch06' ? startSeven : chapter === 'ch07' ? startEight : undefined
  return (
    <main className={`jianghu-screen scenic-surface later-chapter-screen later-${chapter}`} style={{ '--village-art': `url(${config.art})` } as CSSProperties}>
      <header className="jianghu-header"><div className="game-mark"><span>菜刀</span>闯江湖<small>{config.subtitle}</small></div><div className="header-tools"><button onClick={() => setPanel('codex')}>🏆<span>成就</span></button><button onClick={() => setPanel('codex')}>📚<span>图鉴</span></button><button onClick={() => setPanel('settings')}>⚙<span>设置</span></button><button onClick={() => setPanel('guide')}>?<span>帮助</span></button><button data-testid="open-world-map" onClick={() => useRootGameStore.getState().openWorldMap()}>🗺<span>地图</span></button></div></header>
      <aside className="status-panel paper-panel"><div className="status-person"><div className="portrait">侠</div><div><b>{player.name}</b><span className="rank-badge">{config.rank}</span><p>等级：{player.level}</p><p>生命：{player.hp}/{player.maxHp}<Meter value={player.hp} max={player.maxHp} /></p><p>内力：{player.qi}/{player.maxQi}<Meter value={player.qi} max={player.maxQi} tone="blue" /></p></div></div><div className="currency-row">🪙 银两：{player.silver}<span>🏆 {player.titles.length}</span></div></aside>
      <aside className="quest-panel paper-panel"><h2>{config.title}主线</h2><div className={`quest-row quest-row--${mainlineComplete ? 'complete' : 'active'}`}><b>[主线] {config.subtitle.replace(/^第[五六七八]章 · /, '')}</b><span>{mainlineComplete ? '证据已经对齐，准备接受 Boss 验收' : config.investigation}</span><em>{mainlineComplete ? '✓' : '0/1'}</em></div></aside>
      <aside className="rumor-panel paper-panel"><h2>章节传闻</h2><p>{defeated ? `${config.bossName}已经承认：${config.unlocks}可以正式落地。` : `${config.bossName}正在等你把最后一条证据写进刀谱。`}</p></aside>
      <section className="village-stage later-chapter-stage" aria-label={`${config.title}场景`}><div className="inn-building"><span>{config.title}</span><small>{config.investigation}</small></div>{config.npcNames.map((name, index) => <button className={`npc npc--${index === 0 ? 'elder' : index === 1 ? 'aunt' : 'bai'}`} key={name} data-hotspot={`${chapter}-${index}`} onClick={completeInvestigation}><i><img src={config.npcSprites[index]} alt="" /></i><b>{name}</b><q>{mainlineComplete ? '证据已齐，去找 Boss 验收。' : '这条线索还需要你的菜刀。'}</q></button>)}<button className="npc npc--hero later-boss" data-hotspot={`${chapter}-boss`} onClick={() => startBattle(config.startBattleChapter)} disabled={!ready || defeated}><i><img src={config.bossSprite} alt="" /></i><b>{config.bossName}</b><q>{defeated ? '验收完毕，继续写下一页。' : ready ? '来公开验收最后一条规则！' : '先把章节证据对齐。'}</q></button></section>
      <div className="scene-actions"><Button className="battle-call" data-testid={`${chapter}-investigate`} onClick={completeInvestigation} disabled={mainlineComplete}>🔎 {config.investigation}</Button><Button data-testid={`${chapter}-battle-call`} onClick={() => startBattle(config.startBattleChapter)} disabled={!ready || defeated}>⚔ {defeated ? `${config.bossName}服了` : `挑战${config.bossName}`}</Button>{defeated && openNext && <Button data-testid={`open-${chapter === 'ch05' ? 'ch06' : chapter === 'ch06' ? 'ch07' : 'ch08'}`} onClick={openNext}>→ 前往下一章</Button>}</div>
      {defeated && <div className="paper-panel" data-testid={`${chapter}-unlocks`}><strong>{config.unlocks}已解锁</strong><span>{world.nextChapterUnlocked ? '自动存档点已写入，下一章入口开放。' : '自动存档点已写入。'}</span></div>}
      <nav className="action-stack"><Button onClick={() => setPanel('inventory')}>🎒 背包</Button><Button onClick={() => setPanel('skills')} disabled={!world.systemUnlocks.skillTree}>📘 武功</Button><Button onClick={() => setPanel('equipment')} disabled={!world.systemUnlocks.equipmentStrengthening}>⚔ 装备强化</Button></nav><button className="boss-key-button" aria-label="老板键" onClick={toggleBossKey}>▦</button>
      {narrator && <button className="narrator-toast" onClick={dismissNarrator} aria-label="关闭旁白">{narrator}<small>点此收起</small></button>}<OverlayPanel />
    </main>
  )
}

function QuestRow({ id, status }: { id: 'firstSteps' | 'findCat' | 'challengeBai'; status: 'locked' | 'active' | 'complete' }) {
  const item = QUEST_LABELS[id]
  return <div className={`quest-row quest-row--${status}`}><b>{id === 'firstSteps' ? '[主线]' : '[支线]' } {item.title}</b><span>{item.objective}</span><em>{status === 'complete' ? '✓' : '0/1'}</em></div>
}

function DialogueOverlay() {
  const activeDialogue = useRootGameStore((state) => state.activeDialogue)
  const closeDialogue = useRootGameStore((state) => state.closeDialogue)
  const meetOldMan = useRootGameStore((state) => state.meetOldMan)
  const acceptCatQuest = useRootGameStore((state) => state.acceptCatQuest)
  const resolveCatQuest = useRootGameStore((state) => state.resolveCatQuest)
  const startBattle = useRootGameStore((state) => state.startBattle)
  const world = useRootGameStore((state) => state.world)
  const maybeNarrate = useRootGameStore((state) => state.maybeNarrate)

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
      { label: world.baiDefeated ? '互道珍重' : '菜刀已饥渴难耐', action: () => startBattle() },
      { label: '我路过买酱油', action: () => { maybeNarrate('bai-soy', '说书人：白大侠表示，擂台旁边确实没有酱油铺。'); closeDialogue() } },
    ] },
  }[activeDialogue!]

  return <div className="dialogue-layer" role="dialog" aria-modal="true" aria-label={`${content.name}对话`}><section className="dialogue-box"><button className="dialogue-close" onClick={closeDialogue}>×</button><b>{content.name}</b><p>{content.text}</p><div>{content.choices.map((choice) => <Button key={choice.label} onClick={choice.action}>{choice.label}</Button>)}</div></section></div>
}
