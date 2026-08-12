import { describe, expect, it } from 'vitest'
import { CH01_DENSITY_COPY, CH01_DIALOGUE_GRAPH } from '../../content/dialogues/ch01'
import { ch01NpcDefinitions } from '../../content/npcs/ch01'
import { createDialogueEngine, validateDialogueGraph } from './engine'

describe('C302 第 1 章对白内容', () => {
  it('对白图可达、迷惑分支最多两跳，并覆盖至少三名状态 NPC', () => {
    const validation = validateDialogueGraph(CH01_DIALOGUE_GRAPH)
    expect(validation).toEqual({ valid: true, issues: [] })
    const speakerIds = new Set(CH01_DIALOGUE_GRAPH.nodes.map((node) => node.speakerNpcId).filter(Boolean))
    expect(speakerIds.size).toBeGreaterThanOrEqual(3)
    expect(ch01NpcDefinitions.filter((npc) => (npc.dialogueIds?.length ?? 0) > 0 && npc.interactionEffects).length).toBeGreaterThanOrEqual(3)
    const nodes = new Map(CH01_DIALOGUE_GRAPH.nodes.map((node) => [node.id, node]))
    const reachable = new Set([CH01_DIALOGUE_GRAPH.startNodeId])
    const queue = [CH01_DIALOGUE_GRAPH.startNodeId]
    while (queue.length > 0) {
      const node = nodes.get(queue.shift()!)
      node?.choices.forEach((choice) => {
        const next = choice.nextNodeId ?? choice.returnToNodeId
        if (next && !reachable.has(next)) {
          reachable.add(next)
          queue.push(next)
        }
      })
    }
    expect(reachable.size).toBe(CH01_DIALOGUE_GRAPH.nodes.length)
    const confusingChoices = CH01_DIALOGUE_GRAPH.nodes.flatMap((node) => node.choices.filter((choice) => choice.branch === 'confusing'))
    expect(confusingChoices.length).toBeGreaterThan(0)
    expect(confusingChoices.every((choice) => choice.returnToNodeId !== undefined)).toBe(true)
    const irreversible = CH01_DIALOGUE_GRAPH.nodes.flatMap((node) => node.choices.filter((choice) => choice.irreversible))
    expect(irreversible.length).toBe(1)
    expect(irreversible[0]?.requiresConfirmation).toBe(true)
  })

  it('不可逆挑战先二次确认，三档补充文案均为本地非空稿', () => {
    const engine = createDialogueEngine(CH01_DIALOGUE_GRAPH)
    engine.choose('choice:ch01:hub-bai' as never, { actionId: 'ch01:hub-bai' })
    const challengeChoice = engine.getView().choices.find((view) => view.choice.irreversible)?.optionId
    expect(challengeChoice).toBeDefined()
    expect(engine.choose(challengeChoice!, { actionId: 'ch01:bai-challenge' }).status).toBe('requires_confirmation')
    expect(engine.choose(challengeChoice!, { actionId: 'ch01:bai-challenge', confirm: true }).status).toBe('advanced')
    expect((['mild', 'standard', 'spicy'] as const).every((density) => CH01_DENSITY_COPY[density].length > 0 && CH01_DENSITY_COPY[density].every((line) => line.trim()))).toBe(true)
  })
})
