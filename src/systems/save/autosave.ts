import type { GameSaveV2 } from '../../types/save'
import { SaveRepository } from './repository'

export type AutoSaveTrigger = 'region_entered' | 'battle_won' | 'quest_delivered'
export const AUTO_SAVE_TRIGGERS: readonly AutoSaveTrigger[] = ['region_entered', 'battle_won', 'quest_delivered']

export interface AutoSaveResult {
  readonly saved: boolean
  readonly trigger: string
  readonly reason?: 'not_a_checkpoint' | 'save_failed'
}

export function isAutoSaveTrigger(trigger: string): trigger is AutoSaveTrigger {
  return AUTO_SAVE_TRIGGERS.includes(trigger as AutoSaveTrigger)
}

export class AutoSaveController {
  constructor(private readonly repository: SaveRepository) {}

  async request(trigger: string, save: GameSaveV2): Promise<AutoSaveResult> {
    if (!isAutoSaveTrigger(trigger)) return { saved: false, trigger, reason: 'not_a_checkpoint' }
    try {
      await this.repository.save('auto', save)
      return { saved: true, trigger }
    } catch {
      return { saved: false, trigger, reason: 'save_failed' }
    }
  }
}
