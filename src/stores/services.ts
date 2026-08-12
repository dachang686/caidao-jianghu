import type { EventBus } from '../systems/events'
import type { SaveRepository } from '../systems/save'
import type { TextProvider } from '../types/text-provider'
import type { AssetLifecycleManager } from '../systems/assets'
import type { WorldRegionLoader } from '../types/world'

export interface StoreServices {
  readonly eventBus: EventBus
  readonly saveRepository: SaveRepository
  /** Text provider is injected as a service and never written to Zustand state. */
  readonly textProvider?: TextProvider
  readonly assetManager?: AssetLifecycleManager
  readonly regionLoader?: WorldRegionLoader
}

let services: StoreServices | null = null

export function initializeStoreServices(next: StoreServices): () => void {
  services = next
  return () => {
    if (services === next) services = null
  }
}

export function getStoreServices(): StoreServices | null {
  return services
}
