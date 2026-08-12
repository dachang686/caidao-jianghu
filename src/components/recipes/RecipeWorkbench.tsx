import { Button } from '../game-ui'

export interface RecipeMaterialView {
  readonly id: string
  readonly name: string
  readonly required: number
  readonly owned: number
}

export interface RecipeView {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly unlocked: boolean
  readonly unlockReason?: string
  readonly materials: readonly RecipeMaterialView[]
  readonly outputName: string
  readonly outputDescription: string
  readonly outputUse: string
  readonly effectSummary?: string
}

export interface RecipeWorkbenchProps {
  readonly kind: 'forging' | 'cooking'
  readonly title: string
  readonly subtitle: string
  readonly recipes: readonly RecipeView[]
  readonly selectedRecipeId: string
  readonly statusMessage: string
  readonly submittingRecipeId: string | null
  readonly onSelect: (recipeId: string) => void
  readonly onSubmit: (recipeId: string) => void
  readonly onClose: () => void
}

export function RecipeWorkbench({ kind, title, subtitle, recipes, selectedRecipeId, statusMessage, submittingRecipeId, onSelect, onSubmit, onClose }: RecipeWorkbenchProps) {
  const selected = recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0]
  const missing = selected?.materials.some((material) => material.owned < material.required) ?? true
  const disabled = !selected || !selected.unlocked || missing || submittingRecipeId === selected.id
  return (
    <main className={`recipe-screen recipe-screen--${kind}`}>
      <header className="recipe-screen__header">
        <div><span className="recipe-screen__eyebrow">离线工作台 · 第 2 章开放</span><h1>{title}</h1><p>{subtitle}</p></div>
        <Button className="recipe-back" data-testid="recipe-back" onClick={onClose}>返回江湖</Button>
      </header>
      <div className="recipe-status" data-testid="recipe-status" role="status" aria-live="polite">{statusMessage}</div>
      <div className="recipe-layout">
        <nav className="recipe-list" aria-label={`${title}配方列表`}>
          <div className="recipe-list__heading"><h2>配方</h2><span>{recipes.length} 张可查阅</span></div>
          {recipes.map((recipe) => {
            const recipeMissing = recipe.materials.some((material) => material.owned < material.required)
            return <button className={`recipe-list-item${recipe.id === selected?.id ? ' is-selected' : ''}${!recipe.unlocked ? ' is-locked' : ''}`} data-testid={`${kind}-recipe-${recipe.id}`} key={recipe.id} onClick={() => onSelect(recipe.id)} type="button" aria-current={recipe.id === selected?.id ? 'page' : undefined}><span className="recipe-list-item__title"><strong>{recipe.name}</strong><small>{recipe.unlocked ? (recipeMissing ? '缺材料' : '可制作') : '未解锁'}</small></span><span>{recipe.description}</span></button>
          })}
        </nav>
        {selected && <section className="recipe-detail" aria-label={`${selected.name}配方详情`}>
          <div className="recipe-detail__heading"><div><span className="recipe-detail__tag">{selected.unlocked ? '已解锁' : '未解锁'}</span><h2>{selected.name}</h2><p>{selected.description}</p></div><span className="recipe-detail__kind">{kind === 'forging' ? '锻造' : '烹饪'}</span></div>
          {!selected.unlocked && <p className="recipe-lock-note">{selected.unlockReason}</p>}
          <section className="recipe-materials" aria-label="材料缺口"><h3>材料需求</h3>{selected.materials.map((material) => { const enough = material.owned >= material.required; return <div className={`recipe-material${enough ? ' is-enough' : ' is-missing'}`} key={material.id}><span>{material.name}</span><strong>{material.owned}/{material.required}</strong><small>{enough ? '材料足够' : `还缺 ${material.required - material.owned}`}</small></div> })}</section>
          <section className="recipe-output" aria-label="产物预览"><div><span>产物预览</span><h3>{selected.outputName}</h3><p>{selected.outputDescription}</p></div><p className="recipe-output__use"><strong>用途</strong>{selected.outputUse}</p>{selected.effectSummary && <p className="recipe-output__effect"><strong>规则说明</strong>{selected.effectSummary}</p>}</section>
          <div className="recipe-detail__actions"><Button className="recipe-submit" data-testid={`${kind}-submit`} disabled={disabled} onClick={() => onSubmit(selected.id)}>{submittingRecipeId === selected.id ? '正在提交…' : missing ? '材料不足' : !selected.unlocked ? '尚未解锁' : kind === 'forging' ? '提交锻造' : '开始烹饪'}</Button><span>{disabled && selected.unlocked && missing ? '材料不足时不会扣除已有材料。' : '成功提交后，材料与产物会一次性结算。'}</span></div>
        </section>}
      </div>
    </main>
  )
}
