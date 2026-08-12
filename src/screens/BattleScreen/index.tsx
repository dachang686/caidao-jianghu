import { useEffect } from 'react'
import baiSprite from '../../assets/characters/bai.webp'
import bangsiSprite from '../../assets/characters/qinghe-bangsi.webp'
import blackwindLeaderSprite from '../../assets/characters/blackwind-leader.webp'
import qingyunMasterSprite from '../../assets/characters/qingyun-master.webp'
import twinBanditsSprite from '../../assets/characters/twin-bandits.webp'
import tideMasterSprite from '../../assets/characters/tide-master.webp'
import rankingGovernorSprite from '../../assets/characters/ranking-governor.webp'
import rankingMasterSprite from '../../assets/characters/ranking-master.webp'
import heroSprite from '../../assets/characters/hero.webp'
import { BattleCombatantCard, BattleIntentPanel, BattleLog, BattleSkillBar } from '../../components/battle'
import { PresentationCue } from '../../components/comedy'
import type { BattleSkillView, BattleStatusView } from '../../components/battle'
import { Button } from '../../components/game-ui'
import { getSkillUnavailableReason } from '../../systems/combat/cooldown'
import { resolveInputAction } from '../../systems/input'
import { useRootGameStore } from '../../stores'
import { audioDirector } from '../../systems/audio'
import { SKILLS } from '../../game/data'
import { CORE_PRESENTATION_CUES } from '../../content/comedy'
import { coreActiveSkills } from '../../content/skills'
import type { BattleState, SkillId } from '../../game/types'

const STATUS_LABELS: Record<string, string> = {
  dazed: '沉思中',
  tipsy: '酒劲上头',
  embarrassed: '有点尴尬',
  feignedDeath: '装死中',
}

const SKILL_ICONS: Record<string, string> = {
  basicSlash: '〽',
  cleaverWhirl: '✦',
  mockery: '☄',
  playDead: '☯',
  'dao:blade-dance': '✦',
  'dao:heavy-chop': '〽',
  'dao:pan-breaker': '▰',
  'dao:finishing-cut': '↯',
  'mouth:verbal-duel': '☄',
  'mouth:rumor': '☍',
  'mouth:counterargument': '↩',
  'mouth:truth-or-dare': '⚑',
  'survival:play-dead': '☯',
  'survival:iron-head': '●',
  'survival:roll-away': '↗',
  'survival:second-wind': '✚',
  'misc:baijiu': '♨',
  'misc:expired-panacea': '◈',
  'misc:armor-disclaimer': '▣',
  'misc:improvise': '※',
}

const CH01_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch01:bai:defeat')!
const CH02_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch02:bangsi:defeat')!
const CH03_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch03:leader:defeat')!
const CH04_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch04:master:defeat')!
const CH05_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch05:twin:defeat')!
const CH06_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch06:tide:defeat')!
const CH07_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch07:governor:defeat')!
const CH08_VICTORY_PRESENTATION_CUE = CORE_PRESENTATION_CUES.find((cue) => cue.id === 'presentation:ch08:master:defeat')!

const NORMAL_ENCOUNTER_CONTEXT: Record<string, { readonly breadcrumb: string; readonly victoryAction: string; readonly retreatAction: string }> = {
  ch01: { breadcrumb: '小愚村 · 路边遭遇', victoryAction: '回到小愚村', retreatAction: '先回村歇歇' },
  ch02: { breadcrumb: '清河县 · 街市遭遇', victoryAction: '回到清河县', retreatAction: '先回街市歇歇' },
  ch03: { breadcrumb: '黑风寨 · 山道遭遇', victoryAction: '回到黑风寨', retreatAction: '先回山寨歇歇' },
  ch04: { breadcrumb: '青云山 · 山门遭遇', victoryAction: '回到青云山', retreatAction: '先回山门歇歇' },
  ch05: { breadcrumb: '西域驿路 · 路边遭遇', victoryAction: '回到西域驿站', retreatAction: '先回驿站歇歇' },
  ch06: { breadcrumb: '东海镇 · 码头遭遇', victoryAction: '回到东海镇', retreatAction: '先回码头歇歇' },
  ch07: { breadcrumb: '京城 · 榜司遭遇', victoryAction: '回到京城', retreatAction: '先回京城歇歇' },
  ch08: { breadcrumb: '武林大会 · 会场遭遇', victoryAction: '回到武林大会', retreatAction: '先回会场歇歇' },
}

function toStatusViews(statuses: readonly { id: string; turns: number }[]): readonly BattleStatusView[] {
  return statuses.map((status) => ({ id: status.id, turns: status.turns, label: STATUS_LABELS[status.id] ?? status.id }))
}

function skillDefinition(skillId: string) {
  const core = coreActiveSkills.find((skill) => String(skill.id) === skillId)
  if (core) return core
  return SKILLS[skillId as SkillId]
}

function getDisabledReason(skillId: string | null, player: NonNullable<ReturnType<typeof useRootGameStore.getState>['player']>, battle: BattleState): string | undefined {
  if (!skillId) return '暂无招式'
  if (battle.turn !== 'player') return '等待战斗结算'
  return getSkillUnavailableReason(battle.playerCooldowns, skillId, skillDefinition(skillId)?.qiCost, player.qi)?.message
}

function createSkillViews(player: NonNullable<ReturnType<typeof useRootGameStore.getState>['player']>, battle: BattleState, useSkill: (skillId: string) => void): readonly BattleSkillView[] {
  return Array.from({ length: 6 }, (_, index) => {
    const skillId = player.activeSkills[index] ?? null
    const definition = skillId ? skillDefinition(skillId) : undefined
    const disabledReason = getDisabledReason(skillId, player, battle)
    return {
      slot: index + 1,
      skillId,
      name: definition?.name ?? '空技能槽',
      description: definition?.description ?? '在技能页配置一招可用武学。',
      icon: skillId ? SKILL_ICONS[skillId] : '·',
      costLabel: definition ? (definition.qiCost ? `内力 ${definition.qiCost} · 冷却 ${definition.cooldown}` : '不耗内力') : '尚未配置',
      disabled: Boolean(disabledReason),
      disabledReason,
      onUse: () => { if (skillId) useSkill(skillId) },
    }
  })
}

export function BattleScreen() {
  const player = useRootGameStore((state) => state.player)!
  const battle = useRootGameStore((state) => state.battle)!
  const useSkill = useRootGameStore((state) => state.useSkill)
  const retryBattle = useRootGameStore((state) => state.retryBattle)
  const leaveBattle = useRootGameStore((state) => state.leaveBattle)
  const settings = useRootGameStore((state) => state.settings)
  const keyBindings = useRootGameStore((state) => state.settings.keyBindings)
  const lastLog = battle.logs.at(-1)
  const phaseTwo = battle.enemy.phase === 2
  const isBangsi = battle.enemy.id === 'bangsi'
  const isBlackwindLeader = battle.enemy.id === 'blackwindLeader'
  const isQingyunMaster = battle.enemy.id === 'qingyunMaster'
  const isTwinBandits = battle.enemy.id === 'twinBandits'
  const isTideMaster = battle.enemy.id === 'tideMaster'
  const isRankingGovernor = battle.enemy.id === 'rankingGovernor'
  const isRankingMaster = battle.enemy.id === 'rankingMaster'
  const isLateBoss = isTwinBandits || isTideMaster || isRankingGovernor || isRankingMaster
  const normalEncounterContext = battle.enemy.normalChapter ? NORMAL_ENCOUNTER_CONTEXT[battle.enemy.normalChapter] : undefined
  const isNormalEncounter = Boolean(normalEncounterContext)
  const enemySprite = isBangsi ? bangsiSprite : isBlackwindLeader ? blackwindLeaderSprite : isQingyunMaster ? qingyunMasterSprite : isTwinBandits ? twinBanditsSprite : isTideMaster ? tideMasterSprite : isRankingGovernor ? rankingGovernorSprite : isRankingMaster ? rankingMasterSprite : baiSprite
  const presentationCue = isNormalEncounter ? null : isBangsi ? CH02_VICTORY_PRESENTATION_CUE : isBlackwindLeader ? CH03_VICTORY_PRESENTATION_CUE : isQingyunMaster ? CH04_VICTORY_PRESENTATION_CUE : isTwinBandits ? CH05_VICTORY_PRESENTATION_CUE : isTideMaster ? CH06_VICTORY_PRESENTATION_CUE : isRankingGovernor ? CH07_VICTORY_PRESENTATION_CUE : isRankingMaster ? CH08_VICTORY_PRESENTATION_CUE : CH01_VICTORY_PRESENTATION_CUE
  const skillViews = createSkillViews(player, battle, useSkill)

  useEffect(() => {
    if (!lastLog) return
    if (battle.turn === 'victory') audioDirector.play('victory')
    else if (lastLog.text.includes('风火轮') || lastLog.text.includes('空白卷宗') || lastLog.text.includes('空旗') || lastLog.text.includes('礼法') || lastLog.text.includes('封条') || lastLog.text.includes('潮') || lastLog.text.includes('榜文') || lastLog.text.includes('定义') || lastLog.text.includes('躺')) audioDirector.play('silly')
    else if (lastLog.kind === 'player' || lastLog.kind === 'enemy' || lastLog.kind === 'critical') audioDirector.play('hit')
  }, [battle.turn, lastLog])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (battle.turn !== 'player') return
      const action = resolveInputAction(event, keyBindings)
      if (!action?.startsWith('skill')) return
      const skill = skillViews[Number(action.slice('skill'.length)) - 1]
      if (!skill.skillId || skill.disabled) return
      event.preventDefault()
      useSkill(skill.skillId)
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [battle.turn, battle.playerCooldowns, player.qi, player.activeSkills, keyBindings, skillViews, useSkill])

  return (
    <main className={`battle-screen battle-screen--complete${phaseTwo ? ' is-phase-two' : ''}`}>
      <header className="battle-top battle-top--complete">
        <div><span className="battle-breadcrumb">{normalEncounterContext?.breadcrumb ?? (isBangsi ? '清河县 · 百晓榜告示台' : isBlackwindLeader ? '黑风寨 · 山寨门' : isQingyunMaster ? '青云山 · 山门石阶' : isTwinBandits ? '西域驿路 · 驼队车场' : isTideMaster ? '东海镇 · 潮声寺' : isRankingGovernor ? '京城 · 百晓榜司' : isRankingMaster ? '武林大会 · 评判台' : '小愚村 · 悦来客栈擂台')}</span><h1>先看意图，再出刀</h1></div>
        <div className="battle-top__actions"><span className="battle-turn-indicator" role="status">{battle.turn === 'player' ? '轮到你出招' : battle.turn === 'victory' ? '战斗胜利' : battle.turn === 'defeat' ? '战斗失败' : '正在结算'}</span><Button onClick={leaveBattle}>暂离擂台</Button></div>
      </header>

      {phaseTwo && <div className="battle-phase-banner" data-testid="battle-phase" role="status" aria-live="assertive"><strong>{isBangsi ? '二阶段：榜下捕快开始反盖' : isBlackwindLeader ? '二阶段：黑风寨主开始反卷' : isQingyunMaster ? '二阶段：青云掌门开始剑谱纠错' : isTwinBandits ? '二阶段：驿路双煞开始一明一暗' : isTideMaster ? '二阶段：海潮帮主开始回流压岸' : isRankingGovernor ? '二阶段：榜司督主开始热榜发布' : isRankingMaster ? '二阶段：百晓榜主开始终局判词' : '二阶段：白大侠认真了三成'}</strong><span>架势与敌方意图继续明示，别被气势吓到。</span></div>}

      <div className="battle-content">
        <section className="battle-arena" aria-label="战斗场景">
          <BattleCombatantCard combatant={{ name: player.name, side: 'player', sprite: heroSprite, hp: player.hp, maxHp: player.maxHp, qi: player.qi, maxQi: player.maxQi, posture: battle.playerPosture, statuses: toStatusViews(battle.playerStatuses), subtitle: '菜刀在手，先稳住架势。' }} />
          <div className="battle-arena__center"><div className="battle-versus" aria-hidden="true">VS</div><span>第 {battle.round} 回合</span><BattleIntentPanel intent={battle.enemyIntent} /></div>
          <BattleCombatantCard combatant={{ name: battle.enemy.name, side: 'enemy', sprite: enemySprite, hp: battle.enemy.hp, maxHp: battle.enemy.maxHp, qi: battle.enemy.qi, maxQi: battle.enemy.maxQi, posture: battle.enemyPosture, statuses: toStatusViews(battle.enemy.statuses), subtitle: isNormalEncounter ? '路边招式也会诚实明示。' : phaseTwo ? (isBangsi ? '反盖一印，仍然会诚实明示。' : isBlackwindLeader ? '反卷山河，仍然会诚实明示。' : isQingyunMaster ? '剑谱纠错，仍然会诚实明示。' : isLateBoss ? '终局动作仍然会诚实明示。' : '三成认真，仍然会诚实出招。') : (isBangsi ? '公文正派，意图暂时不藏。' : isBlackwindLeader ? '山寨冲榜，意图暂时不藏。' : isQingyunMaster ? '门面工程，意图暂时不藏。' : isLateBoss ? '公开验收，意图暂时不藏。' : '名门正派，意图暂时不藏。'), phase: battle.enemy.phase }} />
        </section>
        <BattleLog logs={battle.logs.slice(-50)} />
        <BattleSkillBar skills={skillViews} />
      </div>

      {battle.turn === 'victory' && <section className="battle-outcome battle-outcome--victory" data-testid="battle-victory" role="dialog" aria-labelledby="battle-victory-title"><span className="battle-outcome__eyebrow">结算完成</span><h2 id="battle-victory-title">险胜，但挺像那么回事</h2><p>{isNormalEncounter ? '获得经验 6、银两 6；路边麻烦已解决。' : isBangsi ? '获得经验 58、银两 72 和清河榜牌；装备、采集、锻造已解锁。' : isBlackwindLeader ? '获得经验 72、银两 90 和黑风寨令；技能树、烹饪已解锁。' : isQingyunMaster ? '获得经验 86、银两 110 和青云名帖；意图进阶、装备强化已解锁。' : isTwinBandits ? '获得经验 96、银两 130 和西域封条；自建门派、Tick 派遣已解锁。' : isTideMaster ? '获得经验 108、银两 150 和潮声珠；委托进阶、门人事件已解锁。' : isRankingGovernor ? '获得经验 120、银两 180 和京城公牍；结局路线锁定已解锁。' : isRankingMaster ? '获得经验 150、银两 220 和大会印记；四结局、通关后继续已解锁。' : '获得经验 42、银两 50、生锈菜刀和称号「菜刀新秀」。'}</p><Button onClick={leaveBattle}>{normalEncounterContext?.victoryAction ?? (isBangsi ? '回到清河县' : isBlackwindLeader ? '回到黑风寨' : isQingyunMaster ? '回到青云山' : isTwinBandits ? '回到西域驿站' : isTideMaster ? '回到东海镇' : isRankingGovernor ? '回到京城' : isRankingMaster ? '回到武林大会' : '回到小愚村')}</Button></section>}
      {battle.turn === 'victory' && presentationCue && <PresentationCue definition={presentationCue} actionId={`battle:victory:${lastLog?.id ?? battle.round}`} reducedMotion={settings.reducedMotion} muted={settings.masterMuted || !settings.sillySfxEnabled} label={isBangsi ? '榜下捕快盖章认输，清河榜牌开始记账。' : isBlackwindLeader ? '黑风寨主收起空旗，败北也被登记在榜。' : isQingyunMaster ? '青云掌门收起折扇，承认门面验收通过。' : isLateBoss ? `${battle.enemy.name}收起证据，承认验收通过。` : '白大侠抱拳，擂台木牌开始记账。'} />}
      {battle.turn === 'defeat' && <section className="battle-outcome battle-outcome--defeat" data-testid="battle-defeat" role="dialog" aria-labelledby="battle-defeat-title"><span className="battle-outcome__eyebrow">本局结束</span><h2 id="battle-defeat-title">江湖评价：普通韭菜 C-</h2><p>{isNormalEncounter ? `${battle.enemy.name}收起架势：失败不扣资源，原地重试即可。` : isBangsi ? '榜下捕快把卷宗合上：失败不扣线索，原地重试即可。' : isBlackwindLeader ? '黑风寨主把空旗插回去：失败不扣账榜，原地重试即可。' : isQingyunMaster ? '青云掌门把剑谱合上：失败不扣名帖，原地重试即可。' : isLateBoss ? `${battle.enemy.name}把证据收好：失败不扣章节线索，原地重试即可。` : '白大侠看了看你的菜刀，说它至少很有勇气。资源会在重试时恢复。'}</p><div><Button className="menu-action--primary" data-testid="battle-retry" onClick={retryBattle}>原地重试</Button><Button onClick={leaveBattle}>{normalEncounterContext?.retreatAction ?? (isBangsi ? '先回街市歇歇' : isBlackwindLeader ? '先回山寨歇歇' : isQingyunMaster ? '先回山门歇歇' : isLateBoss ? '先回章节歇歇' : '先回村歇歇')}</Button></div></section>}
    </main>
  )
}
