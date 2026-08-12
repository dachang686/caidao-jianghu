import type { ChapterId, ContentKey, EndingId, EnemyId, ItemId, QuestId, RecipeId, SkillId } from './ids'
import type { NpcSnapshot } from './npc'
import type { KeyBindingMap } from './settings'
import type { UnlockableSnapshot } from './unlockable'
import type { WorldNavigationSnapshot } from './world'

export interface SaveTaskState {
  readonly questId: QuestId
  readonly status: 'locked' | 'available' | 'active' | 'ready' | 'completed'
  readonly progress: number
}

export interface SaveItemStack {
  readonly itemId: ItemId
  readonly count: number
}

export interface SaveSkillState {
  readonly unlockedSkillIds: readonly SkillId[]
  readonly activeSkillIds: readonly SkillId[]
  readonly skillPoints: number
}

export interface SaveSectState {
  readonly unlocked: boolean
  readonly facilities: {
    readonly training: number
    readonly kitchen: number
    readonly forge: number
    readonly intel: number
  }
  readonly discipleIds: readonly string[]
  readonly seenDiscipleDialogueIds: readonly string[]
  readonly dispatches: readonly {
    readonly dispatchId: string
    readonly progressTicks: number
  }[]
}

export interface SaveCommissionState {
  readonly activeIds: readonly string[]
  readonly completedIds: readonly string[]
}

export interface SaveEndingState {
  readonly seenIds: readonly EndingId[]
  readonly chosenId: EndingId | null
}

export interface SaveRngState {
  readonly algorithm: 'mulberry32'
  readonly seed: number
  readonly state: number
}

export interface SaveSettings {
  readonly reducedMotion: boolean
  readonly masterMuted: boolean
  readonly bgmEnabled: boolean
  readonly sfxEnabled: boolean
  readonly sillySfxEnabled: boolean
  readonly masterVolume: number
  readonly musicVolume: number
  readonly sfxVolume: number
  readonly sillyVolume: number
  readonly memeDensity: 'mild' | 'standard' | 'spicy'
  readonly textSpeed: 'slow' | 'standard' | 'fast'
  readonly difficulty: 'story' | 'standard' | 'expert'
  readonly keyBindings: KeyBindingMap
  readonly aiEnhancement: {
    readonly enabled: false
    readonly provider: 'none'
  }
}

export interface GameSaveV2 {
  readonly schemaVersion: 2
  readonly contentVersion: number
  readonly savedAt: string
  readonly chapterId: ChapterId
  readonly world: WorldNavigationSnapshot
  readonly npcs: NpcSnapshot
  readonly unlockables: UnlockableSnapshot
  readonly player: {
    readonly level: number
    readonly experience: number
    readonly moral: number
    readonly fame: number
    readonly wealth: number
    readonly sectProsperity: number
  }
  readonly tasks: readonly SaveTaskState[]
  readonly items: readonly SaveItemStack[]
  readonly skills: SaveSkillState
  readonly recipeIds: readonly RecipeId[]
  readonly sect: SaveSectState
  readonly commissions: SaveCommissionState
  readonly endings: SaveEndingState
  readonly flags: Readonly<Record<string, boolean>>
  readonly rng: SaveRngState
  readonly settings: SaveSettings
  readonly contentKeys: readonly ContentKey[]
  readonly defeatedEnemyIds: readonly EnemyId[]
}

export type SaveSlotId = 'manual-1' | 'manual-2' | 'manual-3' | 'auto' | 'backup'
