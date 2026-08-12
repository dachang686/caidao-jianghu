export type MemeDensity = 'mild' | 'standard' | 'spicy'
export type TextSource = 'local' | 'enhanced'

export interface PlayerTextSnapshot {
  readonly level: number
  readonly titleIds: readonly string[]
  readonly moralBand: 'low' | 'mid' | 'high'
  readonly fameBand: 'unknown' | 'known' | 'famous'
  readonly recentActionTags: readonly string[]
}

export type NarrationTrigger = 'idle' | 'skip_dialogue' | 'battle_fail' | 'battle_win' | 'quest_complete' | 'npc_harass' | 'title_unlock' | 'load' | 'custom'

export interface NarrationContext {
  readonly requestId: string
  readonly trigger: NarrationTrigger
  readonly player: PlayerTextSnapshot
  readonly locationId?: string
  readonly battleSummary?: {
    readonly damageTaken: number
    readonly skillIds: readonly string[]
    readonly turns: number
    readonly result: 'win' | 'lose'
  }
  readonly memeDensity: MemeDensity
}

export interface DialogueEnrichContext {
  readonly requestId: string
  readonly nodeId: string
  readonly npcId: string
  readonly player: PlayerTextSnapshot
  readonly authoredOptions: readonly { optionId: string; semanticTag: string }[]
  readonly memeDensity: MemeDensity
}

export interface DialogueCopyPatch {
  readonly optionId: string
  readonly label: string
}

export type SafeTextValue = string | number | boolean | readonly string[]

export type TextGenerationType = 'battle_report' | 'commission_desc' | 'disciple_report' | 'idle_thought' | 'item_flavor'

export interface TextGenContext {
  readonly requestId: string
  readonly type: TextGenerationType
  readonly safeData: Readonly<Record<string, SafeTextValue>>
  readonly memeDensity: MemeDensity
  readonly maxLength: number
}

export interface TextResult<T> {
  readonly value: T
  readonly source: TextSource
  readonly requestId: string
}

export interface TextProvider {
  getNarration(ctx: NarrationContext, signal?: AbortSignal): TextResult<string> | Promise<TextResult<string>>
  enrichDialogueCopy?(ctx: DialogueEnrichContext, signal?: AbortSignal): TextResult<DialogueCopyPatch[]> | Promise<TextResult<DialogueCopyPatch[]>>
  generateText?(ctx: TextGenContext, signal?: AbortSignal): TextResult<string> | Promise<TextResult<string>>
}

export interface AIProviderConfig {
  readonly enabled: boolean
  readonly provider: 'none' | 'openai-compatible' | 'anthropic' | 'local-webllm' | 'custom'
  readonly baseUrl?: string
  readonly model?: string
  readonly temperature?: number
  readonly maxOutputChars?: number
  readonly timeoutMs?: number
}
