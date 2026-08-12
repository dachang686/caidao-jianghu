import { useMemo, useState } from 'react'
import { allActiveSkills, allPassiveSkills, coreActiveSkills, CORE_PASSIVE_SKILLS } from '../../content/skills'
import type { SkillSchool, SkillProgressState } from '../../types/skill'
import {
  SkillLoadoutError,
  SkillRegistry,
  createSkillProgressState,
  equipSkill,
  reorderSkillSlots,
  resetSkillPoints,
  unlockSkill,
  unequipSkill,
} from '../../systems/skills'
import { Button } from '../game-ui'

const schoolLabels: Record<SkillSchool, string> = { dao: '菜刀猛攻', mouth: '嘴遁控制', survival: '苟命反击', misc: '江湖杂学' }
const icons: Record<SkillSchool, string> = { dao: '✦', mouth: '☄', survival: '☯', misc: '卦' }

export function SkillTreePanel({ playerLevel, optionalEnabled = false, onClose }: { playerLevel: number; optionalEnabled?: boolean; onClose: () => void }) {
  const activeSkills = optionalEnabled ? allActiveSkills : coreActiveSkills
  const passiveSkills = optionalEnabled ? allPassiveSkills : CORE_PASSIVE_SKILLS
  const registry = useMemo(() => new SkillRegistry(activeSkills), [activeSkills])
  const [state, setState] = useState<SkillProgressState>(() => createSkillProgressState(Math.max(1, Math.min(30, playerLevel))))
  const [filter, setFilter] = useState<SkillSchool | 'all'>('all')
  const [message, setMessage] = useState('技能点每级获得 1 点；前置和六槽限制由领域规则检查。')
  const visibleSkills = activeSkills.filter((skill) => filter === 'all' || skill.school === filter)
  const availablePoints = state.earnedSkillPoints - state.spentSkillPoints
  const freeSlot = state.loadout.findIndex((slot) => slot === null)

  const run = (action: () => SkillProgressState) => {
    try {
      setState(action())
      setMessage('操作成功：派生属性会从基础状态重新计算。')
    } catch (error) {
      setMessage(error instanceof SkillLoadoutError ? error.message : '技能操作失败')
    }
  }

  const reset = () => {
    if (!window.confirm('确认免费重置全部技能点？已获得技能点不会丢失。')) return
    run(() => resetSkillPoints(state))
  }

  return <div className="skill-tree-panel" data-testid="skill-tree-panel">
    <div className="skill-tree-heading"><div><h2>武学树与六槽</h2><p>等级 {state.level} · 可用技能点 <b>{availablePoints}</b></p></div></div>
    <p className="skill-tree-message" role="status">{message}</p>
    <div className="skill-school-tabs" role="tablist" aria-label="武学系别">
      <button className={filter === 'all' ? 'is-selected' : ''} onClick={() => setFilter('all')}>全部</button>
      {(Object.keys(schoolLabels) as SkillSchool[]).map((school) => <button key={school} className={filter === school ? 'is-selected' : ''} onClick={() => setFilter(school)}>{icons[school]} {schoolLabels[school]}</button>)}
    </div>
    <div className="skill-slot-strip" aria-label="六个技能槽">
      {state.loadout.map((skillId, slot) => <div className="skill-slot" key={`${slot}-${skillId ?? 'empty'}`}><small>槽位 {slot + 1}</small><b>{skillId ? registry.get(skillId).name : '空'}</b><div><button disabled={!skillId} onClick={() => run(() => unequipSkill(state, slot))}>卸下</button>{slot > 0 && <button onClick={() => run(() => reorderSkillSlots(state, slot, slot - 1))} aria-label={`槽位 ${slot + 1} 前移`}>←</button>}</div></div>)}
    </div>
    <div className="skill-card-grid">
      {visibleSkills.map((skill) => {
        const unlocked = state.unlockedSkillIds.includes(String(skill.id))
        const equippedSlot = state.loadout.findIndex((skillId) => skillId === String(skill.id))
        const prerequisites = skill.prerequisiteIds?.join('、') ?? '无'
        return <article className={`skill-card ${unlocked ? 'is-unlocked' : ''}`} key={skill.id}>
          <div className="skill-card-top"><span className={`skill-card-icon skill-card-icon--${skill.school}`}>{icons[skill.school]}</span><div><h3>{skill.name}</h3><small>{schoolLabels[skill.school]} · 内力 {skill.qiCost} · 冷却 {skill.cooldown}</small></div></div>
          <p>{skill.description}</p><p className="skill-preview">预览：{skill.preview.summary}</p><small>前置：{prerequisites}</small>
          {skill.statusNotes?.map((note) => <small key={note}>说明：{note}</small>)}
          <div className="skill-card-actions"><Button disabled={unlocked || availablePoints < 1} onClick={() => run(() => unlockSkill(state, registry, String(skill.id)))}>{unlocked ? '已解锁' : '解锁（1点）'}</Button>{unlocked && <Button disabled={equippedSlot >= 0 || freeSlot < 0} onClick={() => run(() => equipSkill(state, registry, String(skill.id), freeSlot))}>{equippedSlot >= 0 ? `已装配 · 槽 ${equippedSlot + 1}` : freeSlot < 0 ? '六槽已满' : '装配'}</Button>}</div>
        </article>
      })}
    </div>
    <section className="skill-passive-preview" aria-labelledby="skill-passive-preview-title" data-testid="skill-passive-preview">
      <div className="skill-tree-section-heading"><div><h3 id="skill-passive-preview-title">被动武学预览</h3><p>共 {passiveSkills.length} 个节点；解锁前置与派生属性由被动树领域统一计算。</p></div><span className="content-badge">{optionalEnabled ? 'Core + Optional' : 'Core'}</span></div>
      <div className="skill-card-grid skill-card-grid--passive">
        {passiveSkills.filter((skill) => filter === 'all' || skill.school === filter).map((skill) => <article className="skill-card skill-card--passive" key={skill.id}><div className="skill-card-top"><span className={`skill-card-icon skill-card-icon--${skill.school}`}>{icons[skill.school]}</span><div><h4>{skill.name}</h4><small>{schoolLabels[skill.school]}</small></div></div><p>{skill.description}</p><p className="skill-preview">预览：{skill.preview.summary}</p><small>前置：{skill.prerequisiteIds?.join('、') ?? '无'}</small></article>)}
      </div>
    </section>
    <div className="panel-actions"><Button onClick={reset}>免费重置</Button><Button onClick={onClose}>完成</Button></div>
  </div>
}
