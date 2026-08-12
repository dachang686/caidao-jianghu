import { useState } from 'react'
import { Button } from '../components/game-ui'
import { useRootGameStore } from '../stores'
import { TALENTS } from '../game/data'
import type { TalentId } from '../game/types'

export function CreationScreen() {
  const [name, setName] = useState('小虾米')
  const [talent, setTalent] = useState<TalentId>('reckless')
  const startNewGame = useRootGameStore((state) => state.startNewGame)
  const setScreen = useRootGameStore((state) => state.setScreen)
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
