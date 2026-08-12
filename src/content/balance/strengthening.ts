import type { StrengtheningLevelConfig } from '../../types/strengthening'

export const strengtheningBalance: readonly StrengtheningLevelConfig[] = [
  { fromLevel: 0, toLevel: 1, cost: { silver: 20, materialId: 'item:iron-scrap', materialCount: 1 }, successChance: 0.95, statDelta: { attack: 2, defense: 1 } },
  { fromLevel: 1, toLevel: 2, cost: { silver: 35, materialId: 'item:iron-scrap', materialCount: 2 }, successChance: 0.88, statDelta: { attack: 2, defense: 1 } },
  { fromLevel: 2, toLevel: 3, cost: { silver: 55, materialId: 'item:iron-scrap', materialCount: 3 }, successChance: 0.78, statDelta: { attack: 3, maxHp: 5 } },
  { fromLevel: 3, toLevel: 4, cost: { silver: 80, materialId: 'item:tempered-steel', materialCount: 1 }, successChance: 0.66, statDelta: { attack: 3, defense: 2, posture: 2 } },
  { fromLevel: 4, toLevel: 5, cost: { silver: 120, materialId: 'item:tempered-steel', materialCount: 2 }, successChance: 0.55, statDelta: { attack: 4, crit: 0.02 } },
]

export const STRENGTHENING_BALANCE = strengtheningBalance

