import { BossKey } from '../components/BossKey'
import { useGameStore } from '../stores'
import { BattleScreen } from './BattleScreen'
import { CraftingScreen } from './CraftingScreen'
import { CookingScreen } from './CookingScreen'
import { CreationScreen } from './creation-screen'
import { JianghuScreen } from './jianghu-screen'
import { MenuScreen } from './menu-screen'
import { EndingScreen } from './EndingScreen'

export function ScreenShell() {
  const screen = useGameStore((state) => state.screen)
  const temporaryMode = useGameStore((state) => state.temporaryMode)
  const endingSelection = useGameStore((state) => state.endingSelection)
  const endingRecordState = useGameStore((state) => state.endingRecordState)
  const recordEndingChoice = useGameStore((state) => state.recordEndingChoice)
  const continuePostgame = useGameStore((state) => state.continuePostgame)
  if (temporaryMode) return <BossKey />
  if (screen === 'creation') return <CreationScreen />
  if (screen === 'jianghu') return <JianghuScreen />
  if (screen === 'battle') return <BattleScreen />
  if (screen === 'crafting') return <CraftingScreen />
  if (screen === 'cooking') return <CookingScreen />
  if (screen === 'ending' && endingSelection) return <EndingScreen selection={endingSelection} state={endingRecordState} onRecord={recordEndingChoice} onContinue={continuePostgame} />
  return <MenuScreen />
}
