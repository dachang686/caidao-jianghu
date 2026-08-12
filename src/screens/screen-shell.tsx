import { BossKey } from '../components/BossKey'
import { useRootGameStore } from '../stores'
import { BattleScreen } from './BattleScreen'
import { CraftingScreen } from './CraftingScreen'
import { CookingScreen } from './CookingScreen'
import { CreationScreen } from './creation-screen'
import { JianghuScreen } from './jianghu-screen'
import { MenuScreen } from './menu-screen'
import { EndingScreen } from './EndingScreen'
import { WorldMapScreen } from './WorldMapScreen'
import { LocationScreen } from './LocationScreen'

export function ScreenShell() {
  const screen = useRootGameStore((state) => state.screen)
  const temporaryMode = useRootGameStore((state) => state.temporaryMode)
  const endingSelection = useRootGameStore((state) => state.endingSelection)
  const endingRecordState = useRootGameStore((state) => state.endingRecordState)
  const recordEndingChoice = useRootGameStore((state) => state.recordEndingChoice)
  const continuePostgame = useRootGameStore((state) => state.continuePostgame)
  const worldNavigation = useRootGameStore((state) => state.worldNavigation)
  const worldLocation = useRootGameStore((state) => state.worldLocation)
  const worldLocationLoadState = useRootGameStore((state) => state.worldLocationLoadState)
  const worldLocationError = useRootGameStore((state) => state.worldLocationError)
  const enterWorldRegion = useRootGameStore((state) => state.enterWorldRegion)
  const retryWorldRegion = useRootGameStore((state) => state.retryWorldRegion)
  const returnToWorldMap = useRootGameStore((state) => state.returnToWorldMap)
  const resumeWorldChapter = useRootGameStore((state) => state.resumeWorldChapter)
  const getWorldRegions = useRootGameStore((state) => state.getWorldRegions)
  if (temporaryMode) return <BossKey />
  if (screen === 'creation') return <CreationScreen />
  if (screen === 'jianghu') return <JianghuScreen />
  if (screen === 'battle') return <BattleScreen />
  if (screen === 'crafting') return <CraftingScreen />
  if (screen === 'cooking') return <CookingScreen />
  if (screen === 'worldMap') return <WorldMapScreen regions={getWorldRegions()} onSelectRegion={(regionId) => { void enterWorldRegion(regionId) }} />
  if (screen === 'location') return <LocationScreen location={worldLocation} loadState={worldLocationLoadState === 'idle' ? 'loading' : worldLocationLoadState} error={worldLocationError ?? undefined} onRetry={() => { void retryWorldRegion() }} onReturnToMap={returnToWorldMap} onEnterChapter={resumeWorldChapter} />
  if (screen === 'ending' && endingSelection) return <EndingScreen selection={endingSelection} state={endingRecordState} onRecord={recordEndingChoice} onContinue={continuePostgame} />
  return <MenuScreen />
}
