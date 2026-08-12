import { describe, expect, it } from 'vitest'
import { CombatTurnEngine, CombatTurnError } from './turn-engine'

const setup = {
  player: { id: 'player', name: '侠客', hp: 50, maxHp: 50, qi: 20, maxQi: 20, attack: 10, defense: 5, statuses: [] },
  enemy: { id: 'enemy', name: '木桩', hp: 30, maxHp: 30, qi: 10, maxQi: 10, attack: 5, defense: 2, statuses: [] },
  skills: [{ id: 'slash', qiCost: 2, cooldown: 1 }],
  rng: { seed: 1, state: 1 },
} as const

describe('CombatTurnEngine', () => {
  it('阶段和动作顺序可验证，胜负由引擎状态决定', () => {
    const engine = new CombatTurnEngine(setup)
    expect(engine.getState().phase).toBe('setup')
    engine.start()
    engine.chooseSkill('p-1', 'slash')
    engine.resolvePlayerAction('p-1', { enemy: { hp: 10 } })
    expect(engine.getState().phase).toBe('enemy_turn')
    engine.startEnemyTurn('e-1')
    engine.resolveEnemyAction('e-1')
    expect(engine.getState().phase).toBe('player_turn')
    engine.chooseSkill('p-2', 'slash')
    engine.resolvePlayerAction('p-2', { enemy: { hp: 0 } })
    expect(engine.getState().phase).toBe('victory')
    expect(() => engine.startEnemyTurn('e-2')).toThrow(CombatTurnError)
  })

  it('重复动作、错误阶段和错误技能返回结构化错误', () => {
    const engine = new CombatTurnEngine(setup)
    expect(() => engine.chooseSkill('p-1', 'slash')).toThrow(/需要 player_turn/)
    engine.start()
    engine.chooseSkill('p-1', 'slash')
    expect(() => engine.chooseSkill('p-1', 'slash')).toThrow(/动作已处理/)
    expect(() => engine.resolvePlayerAction('wrong', {})).toThrow(/不匹配/)
    engine.resolvePlayerAction('p-1')
    expect(() => engine.resolvePlayerAction('p-1')).toThrow(CombatTurnError)
  })

  it('战败重试恢复战前战斗快照且不改变引擎外部剧情对象', () => {
    const engine = new CombatTurnEngine(setup)
    engine.start()
    engine.chooseSkill('p-1', 'slash')
    engine.resolvePlayerAction('p-1', { player: { hp: 1 } })
    engine.startEnemyTurn('e-1')
    engine.resolveEnemyAction('e-1', { player: { hp: 0 } })
    expect(engine.getState().phase).toBe('defeat')
    const retried = engine.retry()
    expect(retried).toMatchObject({ phase: 'player_turn', round: 1, player: { hp: 50, qi: 20 }, enemy: { hp: 30 }, processedActionIds: [] })
  })
})
