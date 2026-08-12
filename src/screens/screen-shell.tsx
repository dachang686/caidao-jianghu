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
import { SectScreen } from './SectScreen'
import { discipleDefinitions, discipleTraitDefinitions } from '../content/sect/disciples'
import { sectFacilityDefinitions } from '../content/sect/facilities'

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
  const player = useRootGameStore((state) => state.player)
  const world = useRootGameStore((state) => state.world)
  const sect = useRootGameStore((state) => state.sect)
  const dispatch = useRootGameStore((state) => state.dispatch)
  const postgame = useRootGameStore((state) => state.postgame)
  const inventory = useRootGameStore((state) => state.inventoryState)
  const sectMessage = useRootGameStore((state) => state.sectMessage)
  const upgradeSectFacility = useRootGameStore((state) => state.upgradeSectFacility)
  const recruitSectDisciple = useRootGameStore((state) => state.recruitSectDisciple)
  const startSectDispatch = useRootGameStore((state) => state.startSectDispatch)
  const claimSectDispatch = useRootGameStore((state) => state.claimSectDispatch)
  const setPostgameDifficulty = useRootGameStore((state) => state.setPostgameDifficulty)
  const generatePostgameCommission = useRootGameStore((state) => state.generatePostgameCommission)
  const completePostgameCommission = useRootGameStore((state) => state.completePostgameCommission)
  const claimPostgameCommission = useRootGameStore((state) => state.claimPostgameCommission)
  const setScreen = useRootGameStore((state) => state.setScreen)
  if (temporaryMode) return <BossKey />
  if (screen === 'creation') return <CreationScreen />
  if (screen === 'jianghu') return <JianghuScreen />
  if (screen === 'battle') return <BattleScreen />
  if (screen === 'crafting') return <CraftingScreen />
  if (screen === 'cooking') return <CookingScreen />
  if (screen === 'sect') return <SectScreen sect={sect} wealth={player?.silver ?? 0} inventory={inventory} chapter={Number(world.currentChapter.slice(2))} facilityDefinitions={sectFacilityDefinitions} discipleDefinitions={discipleDefinitions} discipleTraits={discipleTraitDefinitions} dispatch={dispatch} commissions={postgame.commission} postgame={postgame} message={sectMessage || undefined} onUpgrade={upgradeSectFacility} onRecruit={recruitSectDisciple} onStartDispatch={startSectDispatch} onClaimDispatch={claimSectDispatch} onSetPostgameDifficulty={setPostgameDifficulty} onGenerateCommission={generatePostgameCommission} onCompleteCommission={completePostgameCommission} onClaimCommission={claimPostgameCommission} onClose={() => setScreen('jianghu')} />
  if (screen === 'worldMap') return <WorldMapScreen regions={getWorldRegions()} onSelectRegion={(regionId) => { void enterWorldRegion(regionId) }} />
  if (screen === 'location') return <LocationScreen location={worldLocation} loadState={worldLocationLoadState === 'idle' ? 'loading' : worldLocationLoadState} error={worldLocationError ?? undefined} onRetry={() => { void retryWorldRegion() }} onReturnToMap={returnToWorldMap} onEnterChapter={resumeWorldChapter} />
  if (screen === 'ending' && endingSelection) return <EndingScreen selection={endingSelection} state={endingRecordState} onRecord={recordEndingChoice} onContinue={continuePostgame} />
  return <MenuScreen />
}
