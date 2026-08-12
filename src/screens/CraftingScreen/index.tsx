import { useMemo, useRef, useState } from 'react'
import { RecipeWorkbench } from '../../components/recipes'
import { coreForgingEquipment, coreForgingItems, coreForgingRecipes } from '../../content/recipes/forging'
import { useRootGameStore } from '../../stores'
import { toForgingRecipeViews } from '../recipe-views'

export function CraftingScreen() {
  const inventory = useRootGameStore((state) => state.inventoryState)
  const equipmentIds = useRootGameStore((state) => state.equipmentIds)
  const chapter = useRootGameStore((state) => Number(state.world.currentChapter.slice(2)))
  const statusMessage = useRootGameStore((state) => state.workshopMessage)
  const craft = useRootGameStore((state) => state.craftRecipe)
  const close = useRootGameStore((state) => state.closeWorkshop)
  const [selectedRecipeId, setSelectedRecipeId] = useState(String(coreForgingRecipes[0]?.id ?? ''))
  const [submittingRecipeId, setSubmittingRecipeId] = useState<string | null>(null)
  const submitLock = useRef<string | null>(null)
  const recipes = useMemo(() => toForgingRecipeViews(coreForgingRecipes, coreForgingItems, coreForgingEquipment, inventory, chapter), [inventory, chapter])

  const submit = (recipeId: string) => {
    if (submitLock.current) return
    submitLock.current = recipeId
    setSubmittingRecipeId(recipeId)
    craft(recipeId)
    window.setTimeout(() => { submitLock.current = null; setSubmittingRecipeId(null) }, 180)
  }

  return <RecipeWorkbench kind="forging" title="铁匠铺" subtitle={`当前第 ${chapter} 章，${equipmentIds.length} 件装备已登记。先看材料缺口，再提交锻造。`} recipes={recipes} selectedRecipeId={selectedRecipeId} statusMessage={statusMessage} submittingRecipeId={submittingRecipeId} onSelect={setSelectedRecipeId} onSubmit={submit} onClose={close} />
}
