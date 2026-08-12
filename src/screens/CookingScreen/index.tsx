import { useMemo, useRef, useState } from 'react'
import { RecipeWorkbench } from '../../components/recipes'
import { coreCookingItems, coreCookingRecipes } from '../../content/recipes/cooking'
import { useRootGameStore } from '../../stores'
import { toCookingRecipeViews } from '../recipe-views'

export function CookingScreen() {
  const inventory = useRootGameStore((state) => state.inventoryState)
  const chapter = useRootGameStore((state) => Number(state.world.currentChapter.slice(2)))
  const statusMessage = useRootGameStore((state) => state.workshopMessage)
  const cook = useRootGameStore((state) => state.cookRecipe)
  const close = useRootGameStore((state) => state.closeWorkshop)
  const [selectedRecipeId, setSelectedRecipeId] = useState(String(coreCookingRecipes[0]?.id ?? ''))
  const [submittingRecipeId, setSubmittingRecipeId] = useState<string | null>(null)
  const submitLock = useRef<string | null>(null)
  const recipes = useMemo(() => toCookingRecipeViews(coreCookingRecipes, coreCookingItems, inventory, chapter), [inventory, chapter])

  const submit = (recipeId: string) => {
    if (submitLock.current) return
    submitLock.current = recipeId
    setSubmittingRecipeId(recipeId)
    cook(recipeId)
    window.setTimeout(() => { submitLock.current = null; setSubmittingRecipeId(null) }, 180)
  }

  return <RecipeWorkbench kind="cooking" title="后厨" subtitle={`当前第 ${chapter} 章，食物效果会在有效战斗结算后扣除持续场次。`} recipes={recipes} selectedRecipeId={selectedRecipeId} statusMessage={statusMessage} submittingRecipeId={submittingRecipeId} onSelect={setSelectedRecipeId} onSubmit={submit} onClose={close} />
}
