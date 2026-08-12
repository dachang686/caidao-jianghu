import type { ChapterId, ContentKey, EndingId, EnemyId, ItemId, QuestId, RecipeId } from './ids'
import type { NpcSnapshot } from './npc'
import type { KeyBindingMap } from './settings'
import type { UnlockableSnapshot } from './unlockable'
import type { WorldNavigationSnapshot } from './world'
import type { PlayerState, QuestState, ScreenId, WorldState } from '../game/types'
import type { FoodBuffSnapshot } from './food'
import type { StrengtheningAttempt, StrengtheningStatDelta } from './strengthening'
import type { SectDispatchSnapshot } from './dispatch'
import type { EffectState } from './effects'
import type { GatheringSnapshot } from './gathering'
import type { ExplorationSnapshot } from './hotspot'
import type { QuestSnapshot } from './quest'
import type { DialogueSnapshot } from './dialogue'
import type { EndingRecordState } from './ending'
import type { PostgameState } from './postgame'

export interface SaveTaskState {
  readonly questId: QuestId
  readonly status: 'locked' | 'available' | 'active' | 'ready' | 'completed'
  readonly progress: number
}

/** 章节任务、探索与采集的权威运行态；不再由页面临时状态推断。 */
export interface SaveChapterRuntime {
  readonly quests: Readonly<Record<string, QuestSnapshot>>
  readonly explorations: Readonly<Record<string, ExplorationSnapshot>>
  readonly gatherings: Readonly<Record<string, GatheringSnapshot>>
  readonly dialogues: Readonly<Record<string, DialogueSnapshot>>
  readonly effects: EffectState
}

/** 直接随 V2 保存的游戏运行态；不经过旧存档适配。 */
export interface SaveGameplayRuntime {
  readonly screen: Extract<ScreenId, 'menu' | 'creation' | 'jianghu' | 'ending'>
  readonly player: PlayerState
  readonly quests: readonly QuestState[]
  readonly world: WorldState
  readonly ending: EndingRecordState
}

export interface SaveItemStack {
  readonly itemId: ItemId
  readonly count: number
}

export interface SaveSkillState {
  readonly unlockedSkillIds: readonly string[]
  readonly activeSkillIds: readonly string[]
  readonly skillPoints: number
}

export interface SaveEquipmentLoadout {
  readonly weapon: string | null
  readonly head: string | null
  readonly body: string | null
  readonly feet: string | null
  readonly accessory: string | null
  readonly manual: string | null
}

export interface SaveEquipmentStrengthening {
  readonly equipmentId: string
  readonly level: number
  readonly bonus: StrengtheningStatDelta
  readonly attemptCount: number
  readonly history: readonly StrengtheningAttempt[]
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
  readonly benefits: {
    readonly combatAttackBonus: number
    readonly combatDefenseBonus: number
    readonly unlockedRecipeIds: readonly string[]
    readonly strengtheningChanceBonus: number
    readonly revealedRegionIds: readonly string[]
    readonly commissionQualityBonus: number
    readonly fameBonus: number
  }
  readonly claimedUpgradeGrantKeys: readonly string[]
  readonly dispatch: SectDispatchSnapshot
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
  readonly chapterRuntime: SaveChapterRuntime
  readonly items: readonly SaveItemStack[]
  readonly skills: SaveSkillState
  readonly equipmentLoadout: SaveEquipmentLoadout
  readonly equipmentStrengthening: readonly SaveEquipmentStrengthening[]
  readonly foodBuffs: FoodBuffSnapshot
  readonly recipeIds: readonly RecipeId[]
  readonly sect: SaveSectState
  readonly commissions: SaveCommissionState
  readonly postgame: PostgameState
  readonly endings: SaveEndingState
  readonly flags: Readonly<Record<string, boolean>>
  readonly rng: SaveRngState
  readonly settings: SaveSettings
  readonly contentKeys: readonly ContentKey[]
  readonly defeatedEnemyIds: readonly EnemyId[]
  readonly runtime: SaveGameplayRuntime
}

export type SaveSlotId = 'manual-1' | 'manual-2' | 'manual-3' | 'auto' | 'backup'
